function download(app) {
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

            do_download(apk_url, outputFile, fileSize)
        })
}

async function do_download(url, outputFile, fileSize) {
    fetch(url)
        .then(res => res.blob())
        .then(blob => {
            var a = document.createElement('a')
            a.href = window.URL.createObjectURL(blob)
            a.download = outputFile
            a.click()
            window.URL.revokeObjectURL(url)
        })
        .catch(err => {
            console.error(err)
        })
}
