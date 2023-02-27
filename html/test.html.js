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
    <button onclick="dismiss()">dismiss</button>

    <script type="text/javascript">
        function dismiss() {
            if (!window.app) {
                return
            }
            app.dismiss();
        }
    </script>
</body>
</html>
