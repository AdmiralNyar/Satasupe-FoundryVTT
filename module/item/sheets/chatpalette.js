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

    _sendMessage(event,index){
        event.preventDefault();
        let text = this.item.data.data.chatpalette.chat[index].text ? this.item.data.data.chatpalette.chat[index].text : "";
        let message = this.item.data.data.chatpalette.chat[index].message ? this.item.data.data.chatpalette.chat[index].message : "";
        text = text.replace(/[！-～]/g, function(s) {
            return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);});
        text = text.replace(/　/g," ");
        text = text.replace(/\s+/g, ""); 
        let add = text.match(/(?<=\().*?(?=\))/g);
        if(add){
          for(let j = 0; j < add.length; j++){
            let dev = add[j].match(/(\/|\*|\(|\)|\,)/g);
            if(!dev){
              var small = add[j].match(/(?:(?:[\+\-]+)?\d+)/g);
              let math =  0;
              for(let k=0; k < small.length; k++){
                math += parseInt(small[k], 10);
              }
              text=text.replace(new RegExp('\\(' + add[j].replace(/(\+|\-)/g,'\\$&') + '\\)', 'g'),math);
            }
          }
        }
        var request = new XMLHttpRequest();
        var param = "command=" + text;
        var server = game.settings.get("satasupe", "BCDice");
        var url = server + "/game_system/Satasupe/roll?" + param;
        request.open("GET",url,true);
        request.responseType = 'json';
        request.onload = function(){
            if(request.status==200){
                var data = this.response;
                if(!data.ok){
                    ui.notifications.error(game.i18n.localize("ALERTMESSAGE.DiceFormulaUnread"));
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
                    if( game.modules.get('dice-so-nice')?.active){
                        game.dice3d.show(dicedata);
                    }
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
                            successtext = "<div class=\"dice-total success critical\">";
                            successtext += game.i18n.localize("SATASUPE.CRITICAL");
                            successtext += "</div>";
                        }else{
                            successtext = "<div class=\"dice-total success\">";
                            successtext += game.i18n.localize("SATASUPE.SUCCESS");
                            successtext += "</div>";
                        }
                    }else if(!data.fumble){
                        successtext = "<div class=\"dice-total failure\">";
                        successtext += game.i18n.localize("SATASUPE.FAILURE");
                        successtext += "</div>";
                        }else{
                        successtext = "<div class=\"dice-total failure fumble\">";
                        successtext += game.i18n.localize("SATASUPE.FUMBLE");
                        successtext += "</div>";
                    }
                }
                var text_line = data.text.replace(/\r?\n/g,"<br>");
                var contenthtml = "<div><div>" + "<br>"+ text_line + "</div><div class=\"dice-roll\"><div class=\"dice-result\"><div class=\"dice-formula\">" + text + "</div><div class=\"dice-tooltip\" style=\"display:none;\">"+ belowtext + successtext + "</div></div></div>"; 
                ChatMessage.create({user:game.user._id,speaker:ChatMessage.getSpeaker(),content:contenthtml,flavor:message},{});
            }
        };
        request.send();

        request.onerror=function(){
            console.log("Server1 connect error");
            var request2 = new XMLHttpRequest();
        var param2 = "command=" + text;
        var server2 = game.settings.get("satasupe", "BCDice2");
        var url2 = server2 + "/game_system/Satasupe/roll?" + param2;
        request2.open("GET",url2,true);
        request2.responseType = 'json';
        request2.onload = function(){
            if(request2.status==200){
                var data2 = this.response;
                if(!data2.ok){
                    ui.notifications.error(game.i18n.localize("ALERTMESSAGE.DiceFormulaUnread"));
                }
                let rands = data2.rands;
                if (data2.rands){
                    let dicedata = {throws:[{dice:[]}]};
                    for(let i = 0; i < rands.length ; i++){
                        let typenum = rands[i].sides;
                        let bcresult = rands[i].value;
                        var addData = {result:bcresult,resultLabel:bcresult,type: `d${typenum}`,vecors:[],options:{}};
                        dicedata.throws[0].dice[i]=addData;
                    }
                    var dicen = {};
                    data2.rands.forEach(elm => {
                        if(dicen[elm.sides]){
                            dicen[`${elm.sides}`].number += 1;
                            dicen[`${elm.sides}`].value.push(elm.value);
                        }else{
                            dicen[`${elm.sides}`] = {};
                            dicen[`${elm.sides}`]['number'] = 1;
                            dicen[`${elm.sides}`]['value'] = [elm.value];
                        }
                    })
                    if( game.modules.get('dice-so-nice')?.active){
                        game.dice3d.show(dicedata);
                    }
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
                if(data2.success || data2.failure || data2.critical || data2.fumble){
                    if(data2.success){
                        if(data2.critical){
                            successtext = "<div class=\"dice-total success critical\">";
                            successtext += game.i18n.localize("SATASUPE.CRITICAL");
                            successtext += "</div>";
                        }else{
                            successtext = "<div class=\"dice-total success\">";
                            successtext += game.i18n.localize("SATASUPE.SUCCESS");
                            successtext += "</div>";
                        }
                    }else if(!data2.fumble){
                        successtext = "<div class=\"dice-total failure\">";
                        successtext += game.i18n.localize("SATASUPE.FAILURE");
                        successtext += "</div>";
                    }else{
                        successtext = "<div class=\"dice-total failure fumble\">";
                        successtext += game.i18n.localize("SATASUPE.FUMBLE");
                        successtext += "</div>";
                    }
                }
                var text_line2 = data2.text.replace(/\r?\n/g,"<br>");
                var contenthtml = "<div><div>" + "<br>"+ text_line2 + "</div><div class=\"dice-roll\"><div class=\"dice-result\"><div class=\"dice-formula\">" + text + "</div><div class=\"dice-tooltip\" style=\"display:none;\">"+ belowtext + successtext + "</div></div></div>"; 
                ChatMessage.create({user:game.user._id,speaker:ChatMessage.getSpeaker(),content:contenthtml,flavor:message},{});
            }
        };
        request2.send();
        }
    }
}

  