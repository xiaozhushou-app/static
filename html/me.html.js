<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>我</title>

    <link rel="icon" href="data:,">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/water.css@2/out/water.min.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/xiaozhushou-app/static@main/css/look_great.css">

    <script src="https://cdn.jsdelivr.net/gh/xiaozhushou-app/static@main/js/log.js" async defer></script>
</head>
<body>
    <div id="userInfo">
        <label for="email">邮箱：</label><span id="email"></span><br>
        <label for="phone">手机号：</label><span id="phone"></span><br>
        <label for="freetrial_until">试用到期时间：</label><span id="freetrial_until"></span><br>
        <label for="premium_until">会员到期时间：</label><span id="premium_until"></span><br>
        <label for="created_at">账号创建时间：</label><span id="created_at"></span><br>
    </div>


    <details open>
        <summary style="display:none;"></summary>
        <div>
            <span>朋友圈文案过滤</span>
            <label class="toggle">
                <input type="checkbox" id="pyq_title_filter_toggle" onclick="onPyqTitleFilterClick(event)">
                <span class="slider round"></span>
            </label>
        </div>

        <form style="display:none;" id="pyq-filter-rules" onsubmit="savePyqFilterRules(event)">
            <textarea name="pyq-filter-rules" required placeholder="过滤规则"></textarea>
            <button type="submit" class="button">
                <span class="button__text">保存</span>
            </button>
        </form>
    </details>


    <details>
        <summary>会员时长兑换</summary>
        <form id="exchange_premium_code" method="POST" action="/app/exchange-premium-code" enctype="multipart/form-data" onsubmit="exchange(event)">
            <textarea name="premium_code" required placeholder="请输入激活码"></textarea>
            <input type="hidden" id="uuid" name="uuid" required>
            <button type="submit" class="button">
                <span class="button__text">兑换</span>
            </button>
        </form>
    </details>

    <details>
        <summary>test script</summary>
        <form onsubmit="testScript(event)">
            <textarea name="script" required placeholder="input script here"></textarea>
            <button type="submit" class="button">
                <span class="button__text">run</span>
            </button>
        </form>
    </details>

    <!-- <button onclick="dismiss()">关闭页面</button> -->

    <script type="text/javascript">
        function dismiss() {
            if (window.app) app.dismiss()
        }

        function testScript(event) {
            event.preventDefault()
            const form = event.target
            const formData = new FormData(form)
            const script = formData.get('script')

            try{eval(script)}catch(e){alert(e)}
        }

        function exchange(event) {
            event.preventDefault();
            const form = event.target

            const method = form.method
            const action = form.action
            const formData = new FormData(form)

            const theButton = form.querySelector('[type="submit"]')
            if (theButton.classList.contains('button--loading')) {
                return;
            }
            theButton.classList.toggle("button--loading")

            fetch(action, {
                method: method,
                body: formData,
            })
            .then(async res => {
                if (res.ok) {
                    return await res.json()
                }
                if (window.app) app.log(`${method} ${action} res is not ok, status: ${res.status} ${res.statusText}`)
                return await Promise.reject(await res.text())
            })
            .then(res => {
                console.log(`exchange response data:`, res)
                // errcode
                // errmsg
                // jwt
                if (!window.app) return;


                app.log(`exchange response data: ` + JSON.stringify(res))
                if (res.errcode != 0) {
                    app.alert('error', res.errmsg)
                    return
                }
                app.setJwt(res.jwt)
                // app.setUserInfo(JSON.stringify(res.user_info))
                // app.toast(app.getJwt())
                // app.dismiss()
                window.onload() // refresh page
            })
            .catch(e => {
                console.error('Error:', e)

                if (!window.app) return;
                app.log(`Error: ${e}`)
                app.alert(`Error: ${e}`)
            })
            .finally(() => theButton.classList.toggle("button--loading"))
        }

        // YYYY-MM-DD hh:mm:ss
        function formatDateTime(date = new Date()) {
          const year = date.toLocaleString('default', {year: 'numeric'});
          const month = date.toLocaleString('default', {month: '2-digit'});
          const day = date.toLocaleString('default', {day: '2-digit'});

          return [year, month, day].join('-') + ' ' + [date.getHours(), date.getMinutes(), date.getSeconds()].join(':');
        }

        function onPyqTitleFilterClick(event) {
            let filter_rules = document.querySelector('#pyq-filter-rules')
            filter_rules.style.display = event.target.checked ? 'block' : 'none'

            if (!window.app) return;
            app.setFilterToggle(event.target.checked)
        }

        function savePyqFilterRules(event) {
            event.preventDefault()
            const form = event.target

            const formData = new FormData(form)
            const rules = formData.get('pyq-filter-rules')

            if (!window.app) return;
            app.setFilterTitleRules(rules)
            if (app.getFilterTitleRules() == rules) {
                app.toast("保存成功")
            }
            // let objData = Object.fromEntries(formData.entries())
            // console.log('objData:', objData)
        }

        window.onload = function() {
            if (!window.app) return;
            // app.dismiss()
            // app.log()
            // app.setUrl()
            // app.getUserInfo()
            // app.setJwt()
            // app.getJwt()
            // app.toast()
            // app.alert()
            // app.getFilterToggle()
            // app.setFilterToggle()
            // app.filterTitle()
            // app.getFilterTitleRules()
            // app.setFilterTitleRules()

            let userInfo = JSON.parse(app.getUserInfo())
            window.userInfo = userInfo

            document.querySelector('#uuid').value = userInfo.uuid
            document.querySelector('#pyq_title_filter_toggle').checked = app.getFilterToggle()
            document.querySelector('[name="pyq-filter-rules"]').value = app.getFilterTitleRules()

            let container = document.querySelector('#userInfo')

            for (let o in userInfo) {
                if (o.endsWith('until') || o == 'created_at') {
                    userInfo[o] = formatDateTime(new Date(userInfo[o]))
                }
                let tag = container.querySelector(`#${o}`)
                if (tag) {
                    tag.innerHTML = userInfo[o]
                }
            }
            // userInfo.uuid
            // userInfo.email
            // userInfo.phone
            // userInfo.freetrial_until  // "2023-03-01 08:13:50.450563+00:00" or "2023-03-01T08:13:50.450563+00:00";
            // userInfo.premium_until
            // userInfo.comment
            // userInfo.version
            // userInfo.created_at
        }
    </script>
</body>
</html>
