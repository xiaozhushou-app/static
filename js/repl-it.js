// <div class="repl-it"></div>

(() => {
  const simulate_arrow_keys = (reader, dokeyupdown) => {
    let identifier = null
    let touchTarget = null
    let touchStartX = null
    let touchStartY = null
    let touchNowX = null
    let touchNowY = null
    let touchTimestamp = null
    let intervalID = null

    reader.ontouchstart = event=> {
      if (identifier != null) return;

      let touch = event.targetTouches[0]
      identifier = touch.identifier
      touchTarget = touch.target
      touchStartX = touch.clientX
      touchStartY = touch.clientY
      touchNowX = touchStartX
      touchNowY = touchStartY
      touchTimestamp = new Date().getTime()

      if (intervalID) clearInterval(intervalID);
      intervalID = setInterval(()=>{
          if (identifier == null) {
              if (intervalID) clearInterval(intervalID);
              intervalID = null
          }
          const x = touchNowX > touchStartX ? 'right' : 'left'
          const y = touchNowY > touchStartY ? 'down' : 'up'
          dokeyupdown(touchTarget, y == 'up')
      }, 200)
    }
    reader.ontouchmove = event=> {
      if (identifier == null) return;
      event.preventDefault()

      let touch = null
      for (let i=0; i < event.changedTouches.length; i++) {
        if (event.changedTouches.item(i).identifier == identifier) {
          touch = event.changedTouches.item(i)
          break
        }
      }
      if (!touch) return;

      touchNowX = touch.clientX
      touchNowY = touch.clientY
    }
    reader.ontouchend = event=> {
      if (identifier == null) return;

      for (let i=0; i < event.changedTouches.length; i++) {
        if (event.changedTouches.item(i).identifier == identifier) {
          identifier = null
          return
        }
      }
    }
  }


  let localStorage = window.localStorage || {getItem(){return []}, setItem(){}}
  let history = JSON.parse(localStorage.getItem('repl-history') || '[]')
  window.addEventListener('beforeunload', event => localStorage.setItem('repl-history', JSON.stringify(history)))

  const KEY_LEFT = 37
  const KEY_UP = 38
  const KEY_RIGHT = 39
  const KEY_DOWN = 40
  const KEY_ENTER = 13

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

  const initRepl = () => {
    let div = document.querySelector('div.repl-it')
    if (!div) return;
    if (div['repl-inited'] == true) return; // alreay inited
    div['repl-inited'] = true

    let his_idx = null
    let cmp_cache = ''

    let writer = document.createElement('textarea')
    let reader = document.createElement('textarea')

    writer.style.display = 'none'
    writer.readOnly = true
    reader.rows = 1
    reader.placeholder = 'repl'
    const dokeyupdown = (target, isup) => {
      if (history.length == 0) return;
      if (isup){
        if(his_idx == null) {
          his_idx = -1
          cmp_cache = target.value
        } else {
          if(his_idx <= - history.length) return true;
          his_idx -= 1
        }
      }else{
        if(his_idx == null) return true;
        his_idx += 1;
        if(his_idx > -1) his_idx = null;
      }

      if (his_idx == null) {
          target.value = cmp_cache
          return;
      }
      const idx = history.length + his_idx

      target.value = history[idx]
    }

    simulate_arrow_keys(reader, dokeyupdown)

    reader.onkeydown = event => {
      let target = event.target
      keyCode = event.keyCode

      if (keyCode == KEY_ENTER) {
        cmp_cache = '';
        his_idx=null;
        return
      }
      if (keyCode != KEY_UP && keyCode != KEY_DOWN) return;
      event.preventDefault()

      dokeyupdown(target, keyCode == KEY_UP)
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
