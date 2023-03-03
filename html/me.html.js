<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>test</title>

    <link rel="icon" href="data:,">
    <link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/gh/xiaozhushou-app/static@main/css/look_great.css">
</head>
<body>
    <h2>hello world</h2>

    <div id="userInfo"></div>



    <form id="exchange_premium_code" method="POST" action="/app/exchange-premium-code" enctype="multipart/form-data" onsubmit="exchange(event)">
        <label for="premium_code">激活码：</label><br>
        <input type="text" id="premium_code" name="premium_code" required placeholder="请输入激活码">
        <input type="text" id="uuid" name="uuid" hidden="true" required placeholder="">
        <br>
        <input type="submit" class="button" value="提交">
    </form>

    <!-- <button onclick="dismiss()">关闭页面</button> -->

    <script type="text/javascript">
        function dismiss() {
            if (window.app) app.dismiss()
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
                return await Promise.reject(await res.text())
            })
            .then(res => {
                console.log(`exchange response data:`, res)
                // errcode
                // errmsg
                // jwt
                // user_info
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
                theButton.classList.toggle("button--loading")
                console.error('Error:', e)

                if (!window.app) return;
                app.log(`Error: ${e}`)
                app.alert(`Error: ${e}`)
            })
        }

        window.onload = function() {
            if (!window.app) return;
            // app.dismiss()
            // app.log()
            // app.getUserInfo()
            // app.setUserInfo()
            // app.setJwt()
            // app.getJwt()
            // app.toast()
            // app.alert()

            let userInfo = JSON.parse(app.getUserInfo())
            window.userInfo = userInfo

            document.querySelector('#uuid').value = userInfo.uuid

            let container = document.querySelector('#userInfo')
            container.innerHTML = ""

            for (let o in userInfo) {
                let p = document.createElement('p')
                let label = document.createElement('label')
                let div = document.createElement('div')
                label.innerHTML = o + ':'
                div.innerHTML = userInfo[o]
                p.appendChild(label)
                p.appendChild(div)

                container.appendChild(p)
            }
            // userInfo.uuid
            // userInfo.email
            // userInfo.phone
            // userInfo.freetrial_until
            // userInfo.premium_until
            // userInfo.comment
            // userInfo.version
            // userInfo.created_at
        }
    </script>
</body>
</html>
