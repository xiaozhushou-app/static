function detectOS() {
    const agent = navigator.userAgent

    let os = 'Unknown OS'
    if (agent.indexOf('Win') != -1) os = 'Windows OS';
    if (agent.indexOf('X11') != -1) os = 'UNIX';
    if (agent.indexOf('Mac') != -1) os = 'Macintosh';
    if (agent.indexOf('Linux') != -1) os = 'Linux OS';
    if (agent.indexOf('Android') != -1) os = 'Android OS';
    if (agent.indexOf('like Mac') != -1) os = 'iOS';
    if (navigator.maxTouchPoints === 5
            && navigator.plugins.length === 0
            && navigator.platform !== "iPhone") os = 'iPadOS';
    return os
}
function checkCookies() {
    return navigator.cookieEnabled == true
}
function getUrlHash() {
    return window.location.hash // new URL(document.URL).hash
}
//  JavaScript compression
// https://nodeca.github.io/pako/
// https://cdn.jsdelivr.net/gh/nodeca/pako@2.1.0/dist/pako.min.js
function compress(data) {
    pako.deflate(data)
}
function uncompress(compressed) {
    pako.inflate(compressed, {to: 'string'})
}
