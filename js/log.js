// intercept log
// https://snippets.bentasker.co.uk/page-1910131202-Intercept-Console-Messages-in-Javascript-Javascript.html
(function(){
    const oldLog = console.log
    const oldTrace = console.trace
    const oldWarn = console.warn
    const oldInfo = console.info
    const oldError = console.error

    const getCircularReplacer = () => {
      const seen = new WeakSet();
      return (key, value) => {
        if (typeof value === 'object' && value !== null) {
          if (seen.has(value)) {
            return;
          }
          seen.add(value);
        }
        return value;
      };
    };

    const args2str = (args) => {
        return Array.from(args).map(v => JSON.stringify(v, getCircularReplacer())).join(' ')
    }

    const doLog = (priority, message) => {
        if (!window.app || !app.println) return;
        app.println(priority, message)
    }

    console.log = function() {
        doLog('i', args2str(arguments))
        oldLog.apply(console, arguments)
    };

    console.warn = function() {
        doLog('w', args2str(arguments))
        oldWarn.apply(console, arguments)
    };

    console.info = function() {
        doLog('i', args2str(arguments))
        oldInfo.apply(console, arguments)
    };

    console.error = function() {
        doLog('e', args2str(arguments))
        oldError.apply(console, arguments)
    };

    console.trace = function() {
        doLog('v', args2str(arguments))
        oldTrace(console, arguments)
    };

    console.toast = message => {
        if (window.app && app.toast) app.toast(message)
    };
    console.alert = (title, message) => {
        if (window.app && app.alert) app.alert(message)
    };

})();
