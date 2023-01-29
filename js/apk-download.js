function download(app, cb_progress) {
    const base_url = "https://cdn.jsdelivr.net/gh/xiaozhushou-app/static@latest/"
    const metadata_url = `${base_url}apps/${app}/apk/release/output-metadata.json`


    fetch(metadata_url)
        .then(res => res.json())
        .then(json => {
            console.log("res: ", json)
            let outputFile = json.elements[0].outputFile
            const fileSize = json.elements[0].apkFileSizeCalculatedByHangj
            console.log('outputFile: ', outputFile)
            console.log('fileSize:', fileSize)


            const apk_url = `${base_url}apps/${app}/apk/release/${outputFile}.js`

            do_download(app, apk_url, outputFile, fileSize, cb_progress)
        })
        .catch(err => {
            console.error(err)
            alert(err)
        })
}


let is_donwloading = {}

async function do_download(app, url, outputFile, fileSize, cb_progress) {
    if (is_donwloading[url]) {
        return
    }
    is_donwloading[url] = true

    // fetch(url)
    //     .then(res => res.blob())
    //     .then(blob => {
    //         var a = document.createElement('a')
    //         a.href = window.URL.createObjectURL(blob)
    //         a.download = outputFile
    //         a.click()
    //         window.URL.revokeObjectURL(url)
    //     })
    //     .catch(err => {
    //         console.error(err)
    //         alert(err)
    //     })
    //     .finally(() => {
    //         is_donwloading[url] = false
    //     })

    // return

    fetch(url)
        .then(res => {
            const reader = res.body.getReader()

            const contentLen = response.headers.get('Content-Length') // compressed file size
            const contentEncoding = response.headers.get('Content-Encoding') // gzip

            let receivedLen = 0
            let chunks = []

            while (true) {
                // 从流中获取的数据是一个 Uint8Array
                const {done, value} = await reader.read()

                if (done) {
                    break
                }
                chunks.push(value)
                receivedLen += value.length

                // console.log(`received ${receivedLen} of ${fileSize} ${receivedLen / fileSize * 100}%`)
                if (cb_progress) {
                    cb_progress(app, url, fileSize, receivedLen)
                }
            }

            var a = document.createElement('a')
            a.href = window.URL.createObjectURL(new Blob(chunks, {type: 'application/octet-stream'}))
            a.download = outputFile
            a.click()
            window.URL.revokeObjectURL(url)
        })
        .catch(err => {
            console.error(err)
            alert(err)
        })
        .finally(() => {
            is_donwloading[url] = false
        })
}
