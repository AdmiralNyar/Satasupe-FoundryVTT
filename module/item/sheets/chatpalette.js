/**
 * Satasupe system cooperation with BCDice.
 * @extends {ItemSheet}
 */
export class SatasupeChatpaletteSheet extends ItemSheet {

    /** @override */
    static get defaultOptions() {
      return mergeObject(super.defaultOptions, {
        classes: ["satasupe", "sheet", "item","chatpalette"],
        width: 520,
        height: 480,
        tabs: [{navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "description"}],
      });
    }

    async _updateObject(event, formData) {
        if( event.currentTarget){
          if(event.currentTarget.classList){
            if(event.currentTarget.classList.contains('section-input')){
              const index = parseInt(event.currentTarget.closest('.chatpalette-section').dataset.index);
              const key = event.currentTarget.closest('.section-key').dataset.sectionkey;
              this.item.updateChatSection( index, event.currentTarget.value, key);
            }
          }
        }
        return this.object.update(formData);
      }

    get template() {
      const path = 'systems/satasupe/templates/item'
      return `${path}/chatpalette-sheet.html`;
    }
  
      /** @override */
    getData() {
      const data = super.getData();
      return data;
    }
  
    /** @override */
    setPosition(options={}) {
      const position = super.setPosition(options);
      const sheetBody = this.element.find(".sheet-body");
      const bodyHeight = position.height - 192;
      sheetBody.css("height", bodyHeight);
      return position;
    }
  
    /** @override */
      activateListeners(html) {
      super.activateListeners(html);
  
      // Everything below here is only needed if the sheet is editable
      if (!this.options.editable) return;

      html.find('.chatsend-button').click(ev => {
          const index = parseInt(ev.currentTarget.closest('.chatpalette-section').dataset.index)
          this._sendMessage(ev, index);
        });
      html.find('.add-new-chat').click( () => {this.item.createChatSection();});
      html.find('.delete-chatpalette-section').click( ev => {
        const index = parseInt(ev.currentTarget.closest('.chatpalette-section').dataset.index);
        this.item.deleteChatSection( index);
      });
    }
  
    /* -------------------------------------------- */

    showDiceRoll(rands){
        if (rands){
            let data = {};
            for(let i = 0; i < rands.length ; i++){
                let typenum = rands[i].sides;
                let bcresult = rands[i].value;
                var addData = {throws:[{dice:[{result:bcresult,resultLabel:bcresult,type: `d${typenum}`,vecors:[],options:{}}]}]};
                data.push(addData);
            }
            game.dice3d.show(data);
        }else{
            return null;
        }
    }

    
    static _getbcdice(tex){
        var request = new XMLHttpRequest();
        var param = "command=" + tex;
        var url = "https://bcdice.onlinesession.app/v2/game_system/Satasupe/roll?" + param;
        request.open("GET",url,true);
        request.onload = function(){
            var data = this.response;
        };
        request.send();
        /*
        $.getJSON('https://bcdice.onlinesession.app/v2/game_system/Satasupe/roll?',
            {                
                command: "1D20"
            },
            function(json){
                new ChatMessage(json.text)
            }
        )
        .done(function(data){
            console.log(data);
            if(data){
                new ChatMessage(data.text)
            }else{
                console.log(tex);
            }
        }
        )*/
    }

    _sendMessage(event,index){
        event.preventDefault();
        let text = this.item.data.data.chatpalette.chat[index].text ? this.item.data.data.chatpalette.chat[index].text : "";
        let message = this.item.data.data.chatpalette.chat[index].message ? this.item.data.data.chatpalette.chat[index].message : "";
        text = text.replace(/[！-～]/g, function(s) {
            return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);});
        text = text.replace(/　/g," ");
        text = text.replace(/\s+/g, ""); 
        var request = new XMLHttpRequest();
        var param = "command=" + text;
        var server = game.settings.get("satasupe", "BCDice");
        var url = server + "/game_system/Satasupe/roll?" + param;
        request.open("GET",url,true);
        request.responseType = 'json';
        request.onload = function(){
            var data = this.response;
            if(!data.ok){
                ui.notifications.error('This Dice formula is not function! Please spell-check.');
            }
            let rands = data.rands;
            if (data.rands){
                let dicedata = {throws:[{dice:[]}]};
                for(let i = 0; i < rands.length ; i++){
                    let typenum = rands[i].sides;
                    let bcresult = rands[i].value;
                    var addData = {result:bcresult,resultLabel:bcresult,type: `d${typenum}`,vecors:[],options:{}};
                    dicedata.throws[0].dice[i]=addData;
                }
                var dicen = {};
                data.rands.forEach(elm => {
                    if(dicen[elm.sides]){
                        dicen[`${elm.sides}`].number += 1;
                        dicen[`${elm.sides}`].value.push(elm.value);
                    }else{
                        dicen[`${elm.sides}`] = {};
                        dicen[`${elm.sides}`]['number'] = 1;
                        dicen[`${elm.sides}`]['value'] = [elm.value];
                    }
                })
                game.dice3d.show(dicedata);
            }else{
                return null;
            }
            var belowtext = "";
            for(let [k, v] of Object.entries(dicen)){
                let sumv = v.value.reduce(function(sum,element){return sum+element},0); 
                belowtext += "<section class=\"tooltip-part\"><div class=\"dice\"><span class=\"part-formula part-header flexrow\">"
                belowtext += `${v.number}d${k}`
                belowtext += "<div class=\"flex1\"></div><span class=\"part-total flex0\">"
                belowtext +=  `${sumv}</span></span><ol class=\"dice-rolls\">`
                for(let dice of v.value){
                    belowtext += `<li class=\"roll die d${k}\">${dice}</li>`
                }
                belowtext += "</ol></div></section></div>"
            }
            var successtext = ""
            if(data.success || data.failure || data.critical || data.fumble){
                if(data.success){
                    if(data.critical){
                        successtext = "<div class=\"dice-total success critical\">CRITICAL SUCCESS!!</div>";
                    }else{
                        successtext = "<div class=\"dice-total success\">SUCCESS!</div>";
                    }
                }else if(!data.fumble){
                    successtext = "<div class=\"dice-total failure\">FAILURE</div>";
                }else{
                    successtext = "<div class=\"dice-total failure fumble\">FUMBLE</div>";
                }
            }
            var contenthtml = "<div><div>" + message + "<br>"+ data.text + "</div><div class=\"dice-roll\"><div class=\"dice-result\"><div class=\"dice-formula\">" + text + "</div><div class=\"dice-tooltip\" style=\"display:none;\">"+ belowtext + successtext + "</div></div></div>"; 
            ChatMessage.create({user:game.user._id,speaker:ChatMessage.getSpeaker(),content:contenthtml},{});
        };
        request.send();
    }
}
        /*
        let repl = text.match(/(?<=\().*?(?=\))/g);
        const re = /\{.*?\}/;
        if(repl){
            for (let i = 0 ; i < repl.length ; i++){
                console.log(repl[i]);
                for(let[key, value] of Object.entries(SATASUPE['replace'])){
                    if(key == repl[i]){
                        text = text.replace(re,value);
                    }
                }
            }
        }

        console.log(text);
        new ChatMessage(data.text)

        //this.showDiceRoll(rolled.rands);
        //new ChatMessage(data.text)
        //this.showDiceRoll();
        //this.getBCDice(); \{.*?\}
    }
  }*/
  