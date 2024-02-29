
class NickFade {
    static UI = class {
        static docReady(fn) {
            // see if DOM is already available
            if (document.readyState === "complete" || document.readyState === "interactive") {
                // call on next available tick
                setTimeout(fn, 1);
            } else {
                document.addEventListener("DOMContentLoaded", fn);
            }
        }

        /**
         * @param {HTMLElement|Document} parent
         * @returns {Element[]}
         */
        static getColorBoxes = (parent=document) => Array.from(parent.getElementsByClassName('i'));
        static getSections = () => Array.from(document.getElementsByTagName('li'));
        static getText = (li)=>Array.from((li.getElementsByClassName('input')[0].value || ''));
        static getTextStr = (li)=>(li.getElementsByClassName('input')[0].value || '');
        static clearColors(){ this.getColorBoxes().forEach(i => i.value = '#ffffff'); }
        static debugColors(){  this.getColorBoxes().forEach(span => {console.log(span.value)}); }
        /** @param {HTMLElement|Document} parent */
        static getColors = (parent=document) => this.getColorBoxes(parent)
            .map(colorbox => colorbox.value.substring(1)).map(hex => NickFade.Util.toRGB(hex));
        static getColorsHex = (parent=document) => this.getColorBoxes(parent)
            .map(colorbox => colorbox.value);

        static getFlags(){
            let flags=[];
            let checkFlags =['italic','underline','bold','strikethrough'];
            for(let check of checkFlags){
                let state = document.getElementById(check).checked || false;
                if(state) flags.push(check);
            }
            return flags;
        }
        static getCommandType(){
            return document.getElementById('command-type').value || 'essentials';
        }

        static copyCommand(){
            let command = document.getElementById('command');
            //command.select();
            //command.setSelectionRange(0,999999);//mobile
            navigator.clipboard.writeText(command.innerText);
            alert("Copied text!");
        }
        static isContinuous(){
            return document.getElementById('continuouscolor').checked ?? true;
        }
        static applyContinuousColorMode(){
            let state = this.isContinuous();
            let boxes = this.getColorBoxes();
            //console.log(state);
            let lastvalue = null;
            let iFirstEmptyText = this.getLastNonEmptyTextIndex();
            let nLines = boxes.length/2;
            //console.log((boxes.length-1),(iFirstEmptyText-1))
            for(let i=boxes.length-1;i>=0;i--){
                let iTextLine = Math.floor(i/2);
                if(i%2===1){
                    if(state && i!==(boxes.length-1) && (iTextLine<0 || iTextLine<(iFirstEmptyText))){
                        boxes[i].classList.add('disabled');
                        if(lastvalue!==null) boxes[i].value = lastvalue;
                    }
                    else boxes[i].classList.remove('disabled');
                }
                lastvalue = boxes[i].value || "";
            }
            for(let box of boxes){

            }
        }
        static getTexts(){
            return this.getSections().map(li=>this.getTextStr(li))
        }
        static getLastNonEmptyTextIndex(){
            let sections = this.getSections();
            for(let i=sections.length-1;i>=0;i--){
                let str = this.getTextStr(sections[i]);
                //console.log(i,str,str!=="")
                if(str!=="") return i;
            }
            return -1;
        }

        static getState(){
            return {
                colors: this.getColorsHex(),
                texts: this.getTexts(),
                continuouscolor: this.isContinuous()?1:0,
                flags: this.getFlags(),
                commandType: this.getCommandType()
            }
        }
        static setState(state){
            let boxes = this.getColorBoxes();
            let sections = this.getSections();
            for(let i=0;i<boxes.length;i++){
                boxes[i].value = state.colors[i]??'';
            }
            for(let i=0;i<sections.length;i++){
                sections[i].getElementsByTagName('input').value=state.texts[i];
            }
            document.getElementById('continuouscolor').checked = !!(state.continuouscolor??0);
            document.getElementById('command-type').value = state.commandType??"essentials";
            let checkFlags =['italic','underline','bold','strikethrough'];
            for(let check of checkFlags){
                document.getElementById(check).checked = (state.flags??[]).includes(check);
            }

        }

        static exportState(){
            let state=this.getState();
            let json = JSON.stringify(state);
            let datauri = 'data:application/json;base64,'+btoa(json);
            let link = document.createElement('a');

            let time = (new Date()).toISOString().substring(0,19);"2024-02-29T04:41:15"
            time = time.replaceAll(':','-').replace('T','_');

            link.href=datauri;
            link.download=encodeURIComponent(this.getTexts().join(''))+"_"+time+".nickfade";
            link.click();
        }
        static importStateJSON(json){
            let state = JSON.parse(json);
            this.setState(state);
        }
        static importState(){
            let input = document.createElement('input');
            input.type="file";
            input.accept=".nickfade"

            input.onchange=function(event){
                if(event.target.files.length===0) return;
                var fr=new FileReader();
                fr.onload=function(){
                    NickFade.UI.importStateJSON(fr.result);
                };
                fr.readAsText(event.target.files[0]);
            }

            input.click();
        }

        static promptHexColorForInput(input,evt){
            let hex = prompt("Please input a hex color code (6 digits A-F). Example: FF00FF");
            if(hex===null || hex===false || hex===undefined || hex==="") return;
            if(!/^[0-9a-fA-F]{6}$/.test(hex)){
                alert("Invalid hex color!");
                return;
            }
            input.value = "#"+hex;
        }
    }
    static Util = class {
        static blend = ([a1, a2], r) => a1.map((p, i) => Math.round(p * (1 - r) + a2[i] * r));
        static toHex = rgb => rgb.map(n => n.toString(16).padStart(2, '0')).join('');
        static toRGB = hex => hex.match(/([0-9a-fA-F]{2})/g).map(hexbyte => Number.parseInt(hexbyte, 16));
    }

    static Formats = class {
        static vanillaColors = {
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
        static vanillaFormats={
            'obfuscated':'k',
            'bold':'l',
            'strikethrough':'m',
            'underline':'n',
            'italic':'o',
            'reset':'r',
        };
        static flagsToEssentials(flags,prefixChar='&'){
            let formats = "";
            for(let flag of flags) formats += `${prefixChar}${this.vanillaFormats[flag]}`;
            return formats;
        }
        static flagsToCSS(flags){
            let fontweight="normal"
            let textdecoration=[];
            let fontstyle="normal";
            if(flags.includes('bold')) fontweight="bold";
            if(flags.includes('strikethrough')) textdecoration.push("line-through");
            if(flags.includes('underline')) textdecoration.push("underline");
            if(flags.includes('italic')) fontstyle="italic";
            textdecoration=textdecoration.join(' ');
            return `font-weight:${fontweight}; text-decoration:${textdecoration}; font-style:${fontstyle};`
        }
        static fromString(text, blendColors, flags){
            return text.map((c, idx) => {
                const pct = idx / Math.max(1, text.length - 1);
                return {c, rgb: NickFade.Util.blend(blendColors, pct), flags : flags};
            });
        }

        static toEssentialsColor(hexcolor,prefixChar='&',expandedForm=false,forceHex=false){
            let vanillaCode = this.vanillaColors[hexcolor.toUpperCase()] ?? null;
            if(forceHex || vanillaCode===null){
                if(expandedForm){
                    let nibbles = Array.from(hexcolor);
                    let code = `${prefixChar}x`
                    for(let nibble of nibbles){
                        code += `${prefixChar}${nibble}`;
                    }
                    return code;
                }else{
                    return `${prefixChar}#${hexcolor}`
                }
            }else{
                return `${prefixChar}${vanillaCode}`
            }
        }
        static toEssentials(formats, prefixChar='&',expandedForm=false,forceHex=false){
            let lastColor = null;
            let lastStyle = null;
            return formats.map(o => {
                const hex = NickFade.Util.toHex(o.rgb);
                let essStyle = NickFade.Formats.flagsToEssentials(o.flags,prefixChar);
                let essColor = this.toEssentialsColor(hex,prefixChar,expandedForm,forceHex);

                let colorChanged = lastColor!==essColor
                let styleChanged = lastStyle!==essStyle;
                lastColor=essColor;
                lastStyle=essStyle;
                //console.log(colorChanged,lastColor,essColor,(!colorChanged && !styleChanged),(!colorChanged && styleChanged))
                if(!colorChanged && !styleChanged){ essColor=""; essStyle=""; }//if nothing changed, use no formatting
                else if(!colorChanged && styleChanged){ essColor=""; essStyle=`${prefixChar}r`+essStyle; }//if only the style changed, just reapply the style
                //if the color changed, then we have to reapply everything because colors reset formatting in MC.
                return `${essColor}${essStyle}${o.c}`;
            }).join('');
        }

        static toCommand(formats,type){
            switch(type){
                case 'essentials-raw': return this.toEssentials(formats,"\xA7",true);
                case 'lorehand': return this.toEssentials(formats,'&',false).replaceAll(' ','_');

                case 'essentials': return this.toEssentials(formats,'&',false);
                case 'nick': return this.toEssentials(formats,'&',false);
                case 'itemname': return this.toEssentials(formats,'&',false);
                case 'itemlore': return this.toEssentials(formats,'&',false);
            }
        }
        static getCommandPrefix(type){
            switch(type){
                case 'nick': return "/nick ";
                case 'itemname': return "/iname ";
                case 'itemlore': return "/ilore ";
                case 'lorehand': return "/lore ";
            }
            return "";
        }

        static toPreview(formats){
            return formats.map(o =>{
                let css = this.flagsToCSS(o.flags);
                return `<span style="color:#${NickFade.Util.toHex(o.rgb)}; ${css}">${o.c}</span>`
            }).join('');
        }
    }





    static process(){
        let command = '', preview = '', last;
        this.UI.applyContinuousColorMode();
        const commandType = this.UI.getCommandType();
        const flags = this.UI.getFlags();

        const prefix = this.Formats.getCommandPrefix(commandType);

        this.UI.getSections().forEach(li => {
            const colors = this.UI.getColors(li);
            /*.map(rgb => Array.from(rgb.matchAll(/\d+/g)).map(([c]) => Number.parseInt(c)));*/
            const text = this.UI.getText(li);
            //console.log('flags',flags)


            const coloredText = this.Formats.fromString(text,colors,flags);
            command += this.Formats.toCommand(coloredText,commandType);
            preview += this.Formats.toPreview(coloredText);
        });

        command = prefix + command;

        if (document.getElementById('command').innerText !== command) {
            document.getElementById('command').innerText = command;
            document.getElementById('preview').innerHTML = preview;
        }
    }
    static init(){
        this.UI.docReady( ()=>{
            this.UI.clearColors();
            document.getElementById('copy').onclick = this.UI.copyCommand.bind(this.UI);
            document.getElementById('export').onclick = this.UI.exportState.bind(this.UI);
            document.getElementById('import').onclick = this.UI.importState.bind(this.UI);
            this.UI.getColorBoxes().forEach(box=>{
                box.onclick=function(e){
                    if (e.shiftKey || e.altKey){
                        e.preventDefault();
                        NickFade.UI.promptHexColorForInput(this,e);
                    }
                    if(e.ctrlKey){
                        e.preventDefault();
                        navigator.clipboard.writeText((this.value??"#").substring(1));
                        alert("Copied Hex Code!");
                    }
                }
            });

            this.process();
            setInterval(this.process.bind(this), 1000)
        });
    }
}


NickFade.init();