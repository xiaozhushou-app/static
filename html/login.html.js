<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="stylesheet" href="data:,">
    <link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/gh/xiaozhushou-app/static@main/css/look_great.css">

    <title>Try Turnstile</title>

    <script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>

</head>
<body>

    <div>
        <!-- <label for="email">邮箱:</label><br> -->
        <input
            type="email"
            id="email"
            name="email"
            maxlength="64"
            required
            pattern=/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
            oninput="onEmailInput()"
            onchange="onEmailChange()"
            placeholder="请输入邮箱地址"
        />

        <div>
            <div class="cf-turnstile" data-sitekey="0x4AAAAAAACigkvuNg3f6TQg" data-callback="onTokenGenerated"></div>
            <button id="fetchVerificationCode" disabled="true" onclick="fetchVerificationCode()">发送验证码</button>
        </div>

        <!-- <label for="verify-code">验证码:</label> -->
        <input type="text" id="verify-code" disabled="true" oninput="onVerifyCodeInput()" name="code" placeholder="请输入验证码"/>

        <button id="login" disabled="true" onclick="login()">登录</button>
    </div>

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
                document.querySelector("#fetchVerificationCode").disabled = false
            }
        }
        function onEmailInput() {
            let email = document.querySelector('#email')
            let valid = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email.value)
            console.log(`email valid: ${valid}`)

            document.querySelector("#fetchVerificationCode").disabled = !(valid && window.token)
        }
        function onEmailChange() {
            let email = document.querySelector('#email')
            let valid = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email.value)
            if (!valid) email.reportValidity()
        }
        function onVerifyCodeInput() {
            let code = document.querySelector('#verify-code').value
            document.querySelector("#login").disabled = code.length == 0
        }
        function fetchVerificationCode() {
            let btn = document.querySelector("#fetchVerificationCode")
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
                    if (window.app) app.log('res: ' + JSON.stringify(res))
                }
            }).catch(error => {
                console.error('Error:', error)
                if (window.app) app.log(JSON.stringify(error))
            })
        }
        function login() {
            let data = {
                email: document.querySelector('#email').value,
                code: document.querySelector('#verify-code').value,
            }
            fetch('/app/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json' // 'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: JSON.stringify(data) // body data type must match "Content-Type" header
            })
            .then(res => res.json())
            .then(res => {
                console.log(`login data:`, res)
                // errcode
                // errmsg
                // jwt
                // user_info
                if (!window.app) return;


                app.log(`login data: ` + JSON.stringify(res))
                if (res.errcode != 0) {
                    app.alert('error', res.errmsg)
                    return
                }
                app.setJwt(res.jwt)
                app.setUserInfo(JSON.stringify(res.user_info))
                app.toast(app.getJwt())
                app.dismiss()
            })
        }
    </script>

</body>
</html>
