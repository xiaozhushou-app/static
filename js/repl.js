// <div class="repl-it"></div>

(()=> {
  let div = document.querySelector('div[class="repl-it"]')
  if (!div) return;

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
  writer.readonly = true
  reader.rows = 1
  reader.onkeypress = event => {
      let target = event.target
      if (event.charCode == 13) {
          let s = target.value.trim()
          if (s == '') return;

          target.value = ''
          event.preventDefault()

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
})();
