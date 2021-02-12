function docReady(fn) {
    // see if DOM is already available
    if (document.readyState === "complete" || document.readyState === "interactive") {
        // call on next available tick
        setTimeout(fn, 1);
    } else {
        document.addEventListener("DOMContentLoaded", fn);
    }
}

docReady(function () {


    const reg = {
        '000000': '0',
        '0000AA': '1',
        '00AA00': '2',
        '00AAAA': '3',
        'AA0000': '4',
        'AA00AA': '5',
        'FFAA00': '6',
        'AAAAAA': '7',
        '555555': '8',
        '5555FF': '9',
        '55FF55': 'a',
        '55FFFF': 'b',
        'FF5555': 'c',
        'FF55FF': 'd',
        'FFFF55': 'e',
        'FFFFFF': 'f'
    };
    const blend = ([a1, a2], r) => a1.map((p, i) => Math.round(p * (1 - r) + a2[i] * r));
    const toHex = rgb => rgb.map(n => n.toString(16).padStart(2, '0')).join('');
    const toRGB = hex => hex.match(/([0-9a-fA-F]{2})/g).map(hexbyte => Number.parseInt(hexbyte, 16));
    Array.from(document.getElementsByClassName('i')).forEach(i => i.value = '#ffffff');
    setInterval(() => {
        let command = '', preview = '', last;
        Array.from(document.getElementsByTagName('li')).forEach(li => {
            const colors = Array.from(li.getElementsByClassName('i'))
                    .map(span => span.value.substring(1)).map(hex => toRGB(hex));
            /*.map(rgb => Array.from(rgb.matchAll(/\d+/g)).map(([c]) => Number.parseInt(c)));*/
            const text = (li.getElementsByClassName('input')[0].value || '').trim().split('');
            const italic = document.getElementsByClassName('italic')[0].checked;
            const styl = (italic)?"&o":"";
            const fstyl = (italic)?"italic":"normal";
            
            
            const coloredText = text.map((c, idx) => {
                const pct = idx / Math.max(1, text.length - 1);
                return {c, rgb: blend(colors, pct)};
            });
            command += coloredText.map(o => {
                const hex = toHex(o.rgb).toLowerCase()
                const curr = reg[hex] || '#' + hex;
                const ret = curr == last ? o.c : `&${curr}${styl}${o.c}`;
                last = curr;
                return ret;
            }).join('');

            preview += coloredText.map(o => `<span style="color:#${toHex(o.rgb)}; font-style:${fstyl};">${o.c}</span>`).join('');
        });
        if (document.getElementById('command').innerText !== command) {
            document.getElementById('command').innerText = command;
            document.getElementById('preview').innerHTML = preview;
        }
    }, 1000)

});



function debugColors() {

    Array.from(document.getElementsByTagName('li')).forEach(li => {
        const colors = Array.from(li.getElementsByClassName('i'))
                .forEach(span => {
                    console.log(span.value)
                });
    });

}