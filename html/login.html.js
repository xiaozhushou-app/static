<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="stylesheet" href="data:,">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/water.css@2/out/water.min.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/xiaozhushou-app/static@main/css/look_great.css">

    <title>Try Turnstile</title>

    <script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>
    <script src="https://cdn.jsdelivr.net/gh/xiaozhushou-app/static@main/js/log.js" async defer></script>

</head>
<body>

    <form action="/app/login" method="POST" onsubmit="doLogin(event)">
        <input
            type="email"
            id="email"
            name="email"
            maxlength="64"
            required
            oninput="onEmailInput(event)"
            placeholder="请输入邮箱地址"
        />

        <div>
            <div class="cf-turnstile" data-sitekey="0x4AAAAAAACigkvuNg3f6TQg" data-callback="onTokenGenerated"></div>
            <button id="fetch-verification-code" onclick="fetchVerificationCode(event)">发送验证码</button>
        </div>

        <input type="text" name="code" id="verify-code" disabled="true" oninput="onVerifyCodeInput(event)" required placeholder="请输入验证码"/>

        <button type="submit" class="button" id="login" disabled="true">
            <span class="button__text">登录</span>
        </button>
    </form>

    <script type="text/javascript">
        function onTokenGenerated(token) {
            console.log(`onTokenGenerated: ${token}`)
            window.token = token

            onEmailInput()
        }
        function onPhoneChange() {
            let phone = document.querySelector('#phone')
            let valid = /^\d{10}$/.test(phone.value)
            if (valid && window.token) {
                document.querySelector("#fetch-verification-code").disabled = false
            }
        }
        function onEmailInput(event) {
            let email = document.querySelector('#email')
            let valid = email.checkValidity()
            console.log(`email valid: ${valid}`)

            document.querySelector("#fetch-verification-code").disabled = !(valid && window.token)
        }
        function onVerifyCodeInput(event) {
            let code = event.target.value
            document.querySelector("#login").disabled = code.length == 0
        }
        function fetchVerificationCode(event) {
            if (!document.querySelector('#email').checkValidity() || !window.token) {
                return
            }
            event.preventDefault()
            let btn = event.target
            btn.disabled = true
            let i=60

            btn.innerHTML = `${i}s后重新获取`
            let idInterval = setInterval(() => {
                i -= 1

                if (i == 0) {
                    btn.innerHTML = `发送验证码`
                    btn.disabled = false
                    clearInterval(idInterval)
                } else {
                    btn.innerHTML = `${i}s后重新获取`
                }
            }, 1000)

            let data = {
                email: document.querySelector('#email').value,
                token: window.token,
            }
            fetch('/app/get-verification-code', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json' // 'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: JSON.stringify(data) // body data type must match "Content-Type" header
            })
            .then(res => {
                document.querySelector('#verify-code').disabled = !res.ok
                if (res.ok) {
                    console.log(`get-verification-code success`)
                } else {
                    console.error(`get-verification-code failed:`, res)
                    if (window.app) console.log('res: ', res)
                }
            }).catch(error => {
                console.error('Error:', error)
                if (window.app) {
                    console.log(error)
                    app.alert(`Error`,`${error}`)
                }
            })
        }
        function doLogin(event) {
            event.preventDefault()
            const form = event.target

            const method = form.method
            const action = form.action
            const formData = new FormData(form)
            let data = Object.fromEntries(formData.entries())
            data = {
                email: data.email,
                code: data.code,
            }

            const theButton = form.querySelector('[type="submit"]')
            if (theButton.classList.contains('button--loading')) {
                return;
            }
            theButton.classList.toggle("button--loading")


            fetch(action, {
                method: method,
                headers: {
                    'Content-Type': 'application/json' // 'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: JSON.stringify(data) // body data type must match "Content-Type" header
            })
            .then(async res => {
                if (res.ok) {
                    return await res.json()
                }
                return await Promise.reject(await res.text())
            })
            .then(res => {
                console.log(`login data:`, res)
                // errcode
                // errmsg
                // jwt
                if (!window.app) return;


                console.log(`login data: `, res)
                if (res.errcode != 0) {
                    app.alert('error', res.errmsg)
                    return
                }
                app.setJwt(res.jwt)
                if (app.getUserInfo() == "") {
                    return
                }
                // app.setUserInfo(JSON.stringify(res.user_info))
                // app.toast(app.getJwt())
                app.dismiss()
            })
            .catch(e => {
                console.error('Error:', e)

                if (!window.app) return;
                console.log(`Error:`, e)
                app.alert(`Error:`, `${e}`)
            })
            .finally(() => theButton.classList.toggle("button--loading"))
        }
    </script>

</body>
</html>
