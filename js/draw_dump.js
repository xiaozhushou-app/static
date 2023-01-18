function draw_dump() {
    const secret = window.location.pathname.split('/')[1];
    const repl = '/' + secret + '/repl';
    console.log("repl:", repl);
    let value = "api.dumpCurrentHierarchy()";
    fetch(repl, {
            method: "POST",
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
            },
            body: encodeURIComponent("source") + "=" + encodeURIComponent(value)
        }).then(res => {
            return res.text();
        }).then(text => {
            console.log(text);

            const data = new DOMParser().parseFromString(text, 'text/xml');
            const root = data.getRootNode();
            const hierarchy = root.children[0];

            let node_queue = [];
            node_queue.push(hierarchy);

            document.body.style.fontSize = '10px';
            let parent = document.body;

            let node = node_queue.shift();
            while(node) {
                gen_node_breadth_first(node, parent, node_queue);
                node = node_queue.shift();
            }

            // gen_node_depth_first(node, parent);
        });
}

function gen_node_breadth_first(node, parent, node_queue) {
    for (let i=0; i < node.childElementCount; i++)
        node_queue.push(node.children[i]);

    // node.attributes.getBoundsInScreen; // "Rect(left, top - right, bottom)"
    const bounds = node.attributes.getBoundsInScreen;
    if (!bounds)
        return;
    // console.log(bounds); // "Rect(0, 0 - 1080, 2400)"
    const arr = /Rect\((-?\d+),\s(-?\d+),?\s-\s(-?\d+),\s(-?\d+)\)/.exec(bounds.value)
    // console.log('arr:', arr);
    const left = parseInt(arr[1]) / 2;
    const top = parseInt(arr[2]) / 2;
    const right = parseInt(arr[3]) / 2;
    const bottom = parseInt(arr[4]) / 2;
    const width = right - left;
    const height = bottom - top;
    if (width <= 0 || height <= 0)
        return;

    if (node.attributes.isVisibleToUser && node.attributes.isVisibleToUser.value != 'true')
        return;

    let div = document.createElement("div");
    div.style.left = left + 'px';
    div.style.top = top + 'px';
    div.style.width = width + 'px';
    div.style.height = height + 'px';
    div.style.position = 'absolute';

    let valid = false;

    if (node.attributes.getContentDescription) {
        let p = document.createElement('p');
        p.innerText = 'contentDescription: ' + node.attributes.getContentDescription.value;
        div.append(p);
        valid = true;
    }
    if (node.attributes.getText) {
        let p = document.createElement('p');
        p.innerText = 'text: ' + node.attributes.getText.value;
        div.append(p);
        valid = true;
    }
    if (node.attributes.getHintText) {
        let p = document.createElement('p');
        p.innerText = 'hintText: ' + node.attributes.getHintText.value;
        div.append(p);
        valid = true;
    }
    if (node.attributes.isClickable && node.attributes.isClickable.value == 'true') {
        let p = document.createElement('p');
        p.innerText = 'clickable';
        div.append(p);
        valid = true;
    }

    div.style.backgroundColor = cal_color_from_WH(width, height, valid ? 0.1 : 0.03);
    parent.append(div);
}


function cal_color_from_WH(w, h, a) {
    let r = w % 255
    let g = h % 255
    let b = Math.max(w, h) % 255
    return `rgba(${r},${g},${b},${a})`
}


window.onload = draw_dump;

