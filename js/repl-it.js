// <div class="repl-it"></div>

(() => {
  const initRepl = () => {
    let div = document.querySelector('div.repl-it')
    if (!div) return;
    if (div['repl-inited'] == true) return; // alreay inited
    div['repl-inited'] = true

    const KEY_LEFT = 37
    const KEY_UP = 38
    const KEY_RIGHT = 39
    const KEY_DOWN = 40
    const KEY_ENTER = 13

    let localStorage = window.localStorage || {getItem(){return []}, setItem(){}}
    let history = JSON.parse(localStorage.getItem('repl-history') || '[]')
    window.onbeforeunload = ()=>localStorage.setItem('repl-history', JSON.stringify(history))

    let his_idx = null
    let cmp_cache = ''

    const get_ts = () => {
        const date = new Date()
        return [date.getHours(), date.getMinutes(), date.getSeconds()].map(v=>v.toString().padStart(2, '0')).join(':') + '.' + date.getMilliseconds()
    }
    const getCircularReplacer = () => {
      const seen = new WeakSet()
      return (key, value) => {
        if (typeof value === 'object' && value !== null) {
          if (seen.has(value)) return;
          seen.add(value)
        }
        return value;
      }
    }
    const appenLine = (textarea, line) => {
        if (textarea.style.display != '') {
            textarea.style.display = ''
        } else {
            textarea.value += '\n'
        }
        textarea.value += get_ts() + ' ' + line
        let rows = textarea.value.split('\n').length
        if (rows > 10) rows = 10;
        textarea.rows = rows;
        textarea.scrollBy(0, textarea.scrollHeight)
    }

    let writer = document.createElement('textarea')
    let reader = document.createElement('textarea')

    writer.style.display = 'none'
    writer.readOnly = true
    reader.rows = 1
    reader.placeholder = 'repl'
    reader.onkeydown = event => {
      if (history.length == 0) return;
      switch (event.keyCode) {
      case KEY_UP: {
        if(his_idx == null) {
          his_idx = -1
          cmp_cache = event.target.value
        } else {
          if(his_idx <= - history.length) return;
          his_idx -= 1
        }
        break;
      }
      case KEY_DOWN: {
        if(his_idx == null) return;
        his_idx += 1;
        if(his_idx > -1) his_idx = null;
        break;
      }
      case KEY_ENTER: cmp_cache = ''; his_idx=null; return;
      default: return;
      }
      event.preventDefault()

      if (his_idx == null) {
          event.target.value = cmp_cache
          return;
      }
      const idx = history.length + his_idx

      event.target.value = history[idx]

    }
    reader.onkeypress = event => {
      let target = event.target
      if (event.keyCode == 13) {
          let s = target.value.trim()

          target.value = ''
          event.preventDefault()
          if (s == '') return;

          history = history.concat(s)
          appenLine(writer, s)

          let res = ''
          try {
              res = eval(s)
          } catch(error) {
              res = error
          }

          appenLine(writer, res)
      }
    }

    div.appendChild(writer)
    div.appendChild(reader)

    const console_log = window.console.log
    window.console.log = (...args) => {
        console_log(...args)
        appenLine(writer, Array.from(args).map(v => JSON.stringify(v, getCircularReplacer())).join(' '))
    }
  }

  initRepl()
  new MutationObserver((record, observer) => initRepl()).observe(document.body, {subtree:true, childList:true})
})()
