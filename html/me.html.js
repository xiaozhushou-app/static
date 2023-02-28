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

    <div id="userInfo">
    </div>

    <button onclick="dismiss()">dismiss</button>

    <script type="text/javascript">
        function dismiss() {
            if (!window.app) {
                return
            }
            app.dismiss();
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
            let container = document.querySelector('#userInfo')
            for (let o in userInfo) {
                let p = document.createElement('p')
                let label = document.createElement('label')
                let div = document.createElement('div')
                label.innerHTML = o + ':'
                div.innerHTML = o
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
