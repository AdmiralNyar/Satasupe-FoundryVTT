import {SatasupeItem} from '../item.js'
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
        if(event.currentTarget.classList.contains('variable-section-input')){
          const index = parseInt(event.currentTarget.closest('.variable-section').dataset.index);
          const key = event.currentTarget.closest('.section-key').dataset.sectionkey;
          this.item.updateVariableItemSection( index, event.currentTarget.value, key);
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
  async getData() {
    const context = await super.getData();
    const itemData = context.item;
    context.system = itemData.system;
    var list = game.settings.get("satasupe", "bcdicelist");
    context.system.bcdicelist = list.game_system;
    return context;
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

    html.find('.all-on-off-button').click(ev =>{
      const nowonoff = this.item.system.status.allonoff.value;
      this._allonoffToggle(nowonoff);
    });
    html.find('.chatsend-button').click(ev => {
        const index = parseInt(ev.currentTarget.closest('.chatpalette-section').dataset.index);
        const system = $(ev.currentTarget).parent().parent().parent().parent().parent().parent().prev('div.bcdicesystem').children('.bcdicetable').val();
        this._sendMessage(ev, index, system);
      });
    html.find('a.table-show-hide').on("click", this._tableshowblind.bind(this));
    html.find('a.infomation').on("click", this._titleinfomation.bind(this));
    html.find('.add-new-chat').click( () => {this.item.createChatSection();});
    html.find('.add-new-variable').click( () => {this.item.createVariableItemSection();});
    html.find('.delete-chatpalette-section').click( ev => {
      const index = parseInt(ev.currentTarget.closest('.chatpalette-section').dataset.index);
      this.item.deleteChatSection( index);
    });
    html.find('.delete-vatiable-section').click( ev => {
      const index = parseInt(ev.currentTarget.closest('.variable-section').dataset.index);
      this.item.deleteVariableItemSection( index);
    });
  }
  
    /* -------------------------------------------- */

  async _allonoffToggle(nowonoff){
    let chat = duplicate(this.object.system.chatpalette);
    if(!nowonoff){
      for(let i=0 ; i < chat.variable?.length ; i++){
        chat.variable[i].substitution = true;
      }
    }else{
      for(let j=0 ; j < chat.variable?.length ; j++){
        chat.variable[j].substitution = false;
      }
    }
    await this.object.update({'system.chatpalette':chat});
  }

  async _tableshowblind(event){
    let data = duplicate(this.object.system);
    data.status.allonoff.variableonoff = !data.status.allonoff.variableonoff;
    await this.object.update({'system': data});
  }

  _titleinfomation(event){
    event.preventDefault();
    const li = $(event.currentTarget);
    let system = li.prev('.bcdicetable').val();
    var request = new XMLHttpRequest();
    var server = game.settings.get("satasupe", "BCDice");
    var url = server + "/game_system/"+system;
    request.open("GET",url,true);
    request.responseType = 'json';
    request.onload = function(){
      if(request.status == 200){
        var data = this.response;
        var text = data.help_message.replace(/\r?\n/g,"<br>");
        const dlg = new Dialog({
          title: game.i18n.localize("SATASUPE.CommandList"),
          content: text,
          buttons:{
            ok: {
              icon: '<i class="fas fa-check"></i>',
              label: game.i18n.localize("SATASUPE.Close"),
            }
          },
          default: "ok",
          close: () => {return console.log("Command list Dialog closed");},
        },{
        template: "systems/satasupe/templates/apps/dialog.html",
        classes: ["dialog"],
        width: 600,
        jQuery: true});
        dlg.render(true);
        return;
      }
    };
    request.send();
    request.onerror=function(){
      console.log("Server 1 connect error");
      var request2 = new XMLHttpRequest();
      var server2 = game.settings.get("satasupe", "BCDice2");
      var url2 = server2 + "/game_system/Satasupe";
      request2.open("GET",url2,true);
      request2.responseType = 'json';
      request2.onload = function(){
        if(request2.status == 200){
          var data2 = this.response;
          var text2 = data2.help_message.replace(/\r?\n/g,"<br>");
          const dlg2 = new Dialog({
            title: game.i18n.localize("SATASUPE.CommandList"),
            content: text2,
            buttons:{
              ok: {
                icon: '<i class="fas fa-check"></i>',
                label: game.i18n.localize("SATASUPE.Close"),
              }
            },
            default: "ok",
            close: () => {return console.log("Command list Dialog closed");},
          },{
          template: "systems/satasupe/templates/apps/dialog.html",
          classes: ["dialog"],
          width: 600,
          jQuery: true});
          dlg2.render(true);
          return;
        }
      };
      request2.send();
    }
  }

  _sendMessage(event, index, system){
    event.preventDefault();
    let item = this.item;
    let text = this.item.system.chatpalette.chat[index].text ? this.item.system.chatpalette.chat[index].text : "";
    let message = this.item.system.chatpalette.chat[index].message ? this.item.system.chatpalette.chat[index].message : "";
    const user = this.item.user ? this.item.user : game.user;
    text = text.replace(/[！-～]/g, function(s) {
        return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);});
    text = text.replace(/　/g," ");
    let repal = text.match(/(?<=\{).*?(?=\})/g);
    const re = /\{.*?\}/;
    if(repal){
      for (let i = 0 ; i < repal.length ; i++){
        if(!item.system.chatpalette.variable) item.system.chatpalette.variable = [];
        for(let j = 0; j < item.system.chatpalette.variable.length ; j++){
          if((item.system.chatpalette.variable[j].variable == repal[i]) && item.system.chatpalette.variable[j].substitution){
            text = text.replace(re,Number(item.system.chatpalette.variable[j].title));
            break;
          }
        }
      }
      if(text.match(/\{.*?\}/g)){
        text = text.replace(/\{.*?\}/g, '0');
        ui.notifications.error(game.i18n.localize("ALERTMESSAGE.ReplaceUnread"));
      }
    }
    let add = text.match(/(?<=\().*?(?=\))/g);
    if(add){
      for(let j = 0; j < add.length; j++){
        let dev = add[j].match(/(\/|\*|\(|\)|\,)/g);
        if(!dev){
          var small = add[j].match(/(?:(?:[\+\-]+)?\d+)/g);
          let math =  0;
          for(let k=0; k < small.length; k++){
            if(small[k].match(/\-\-\d+/gi)){
              math += parseInt(small[k].match(/\d+/gi),10);
            }else if(small[k].match(/\-\+\d+|\+\-\d+/gi)){
              math -= parseInt(small[k].match(/\d+/gi),10);
            }else{
              math += parseInt(small[k], 10);
            }
          }
          text=text.replace(new RegExp('\\(' + add[j].replace(/(\+|\-)/g,'\\$&') + '\\)', 'g'),math);
        }
      }
    }
    console.log(`your send text is ${text}.`);
    let sendtext = encodeURIComponent(text);
    var request = new XMLHttpRequest();
    var param = "command=" + sendtext;
    var server = game.settings.get("satasupe", "BCDice");
    var url = server + "/game_system/"+system+"/roll?" + param;
    request.open("GET",url,true);
    request.responseType = 'json';
    request.onload = async function(){
        if(request.status==200){
            var data = this.response;
            let rands = data.rands;
            const secret = data.secret;
            let whisper = null;
            let blind = false;
            if(secret){
              whisper = [game.user.id];
            }else{
              let rollMode = game.settings.get("core", "rollMode");
              if (["gmroll", "blindroll"].includes(rollMode)) whisper = ChatMessage.getWhisperRecipients("GM");
              if (rollMode === "selfroll") whisper = [game.user.id];
              if (rollMode === "blindroll") blind = true;
            }
            if (data.rands){
                let dicedata = {throws:[{dice:[]}]};
                for(let i = 0; i < rands.length ; i++){
                  let typenum ="";
                  let bcresult = "";
                  var addData = "";
                  var addData2 = "";
                  if(rands[i].sides == "100"){
                    let d100resu = rands[i].value;
                    bcresult =Math.floor(rands[i].value / 10);
                    let bcresult2 = rands[i].value % 10;
                    addData = {result:bcresult,resultLabel:bcresult*10,d100Result:d100resu,type: `d100`,vecors:[],options:{}};
                    addData2 = {result:bcresult2,resultLabel:bcresult2,d100Result:d100resu,type: `d10`,vecors:[],options:{}};
                    dicedata.throws[0].dice[i]=addData;
                    dicedata.throws[0].dice[rands.length+i]=addData2;
                  }else if(rands[i].kind == "tens_d10"){
                    typenum = rands[i].sides;
                    bcresult = rands[i].value;
                    addData =  {result:Math.floor(bcresult/10),resultLabel:bcresult,d100Result:bcresult,type: `d100`,vecors:[],options:{}};
                    dicedata.throws[0].dice[i]=addData;
                  }else{
                    typenum = rands[i].sides;
                    bcresult = rands[i].value;
                    addData = {result:bcresult,resultLabel:bcresult,type: `d${typenum}`,vecors:[],options:{}};
                    dicedata.throws[0].dice[i]=addData;
                  }
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
                    game.dice3d.show(dicedata, game.user, true, whisper, blind);
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
            var contenthtml = "<div><div style=\"word-break : break-all;\">" + "<br>"+ text_line + "</div><div class=\"dice-roll\"><div class=\"dice-result\"><div class=\"dice-formula\">" + text + "</div><div class=\"dice-tooltip\" style=\"display:none;\">"+ belowtext + successtext + "</div></div></div>"; 
            ChatMessage.create({user:user.id,speaker:ChatMessage.getSpeaker(),whisper:whisper,blind:blind,content:contenthtml,flavor:message},{});
            if(secret){
              let count = 0;
              for(let [o, l]of Object.entries(dicen)){
                count += l.number;
              }
              if(count == 0) count = 1;
              let roll = new Roll(`${count}d20`);
              await roll.roll();
              roll.dice[0].options.hidden = true;
              roll.dice[0].options.colorset = "unseen_black";
              if(game.modules.get('dice-so-nice')?.active){
                game.dice3d.showForRoll(roll, game.user, true, null, false);
              }
              ChatMessage.create({roll:roll,user:user.id,speaker:ChatMessage.getSpeaker(),blind:true,whisper:null,content:`Secret Dice are cast by ${game.user.name}!`})
            }
        }else if((request.status==400)&&message){
          if(text){
            ui.notifications.error(game.i18n.format("ALERTMESSAGE.DiceFormulaUnread",{text:text}));
          }
          let chatMessage ={
            user:user.id,
            speaker:ChatMessage.getSpeaker(),
            blind:false,
            whisper:null,
            content:`<p>${message}</p>`
          }
          ChatMessage.create(chatMessage);
        }
    };
    request.send();

    request.onerror=function(){
        console.log("Server1 connect error");
        var request2 = new XMLHttpRequest();
    var param2 = "command=" + sendtext;
    var server2 = game.settings.get("satasupe", "BCDice2");
    var url2 = server2 + "/game_system/"+system+"/roll?" + param2;
    request2.open("GET",url2,true);
    request2.responseType = 'json';
    request2.onload = async function(){
        if(request2.status==200){
          var data2 = this.response;
          if(!data2.ok){
              ui.notifications.error(game.i18n.localize("ALERTMESSAGE.DiceFormulaUnread"));
          }
          let rands = data2.rands;
          const secret = data2.secret;
          let whisper = null;
          let blind = false;
          if(secret){
            whisper = [game.user.id];
          }else{
            let rollMode = game.settings.get("core", "rollMode");
            if (["gmroll", "blindroll"].includes(rollMode)) whisper = ChatMessage.getWhisperRecipients("GM");
            if (rollMode === "selfroll") whisper = [game.user.id];
            if (rollMode === "blindroll") blind = true;
          }
          if (data2.rands){
              let dicedata = {throws:[{dice:[]}]};
              for(let i = 0; i < rands.length ; i++){
                let typenum ="";
                let bcresult = "";
                var addData = "";
                var addData2 = "";
                if(rands[i].sides == "100"){
                  let d100resu = rands[i].value;
                  bcresult =Math.floor(rands[i].value / 10);
                  let bcresult2 = rands[i].value % 10;
                  addData = {result:bcresult,resultLabel:bcresult*10,d100Result:d100resu,type: `d100`,vecors:[],options:{}};
                  addData2 = {result:bcresult2,resultLabel:bcresult2,d100Result:d100resu,type: `d10`,vecors:[],options:{}};
                  dicedata.throws[0].dice[i]=addData;
                  dicedata.throws[0].dice[rands.length+i]=addData2;
                }else if(rands[i].kind == "tens_d10"){
                  typenum = rands[i].sides;
                  bcresult = rands[i].value;
                  addData =  {result:Math.floor(bcresult/10),resultLabel:bcresult,d100Result:bcresult,type: `d100`,vecors:[],options:{}};
                  dicedata.throws[0].dice[i]=addData;
                }else{
                  typenum = rands[i].sides;
                  bcresult = rands[i].value;
                  addData = {result:bcresult,resultLabel:bcresult,type: `d${typenum}`,vecors:[],options:{}};
                  dicedata.throws[0].dice[i]=addData;
                }
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
                  game.dice3d.show(dicedata, game.user, true, whisper, blind);
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
          var contenthtml = "<div><div style=\"word-break : break-all;\">" + "<br>"+ text_line2 + "</div><div class=\"dice-roll\"><div class=\"dice-result\"><div class=\"dice-formula\">" + text + "</div><div class=\"dice-tooltip\" style=\"display:none;\">"+ belowtext + successtext + "</div></div></div>"; 
          ChatMessage.create({user:user.id,speaker:ChatMessage.getSpeaker(),whisper:whisper,blind:blind,content:contenthtml,flavor:message},{});
          if(secret){
            let count = 0;
            for(let [o, l]of Object.entries(dicen)){
              count += l.number;
            }
            if(count == 0) count = 1;
            let roll = new Roll(`${count}d20`);
            await roll.roll();
            roll.dice[0].options.hidden = true;
            roll.dice[0].options.colorset = "unseen_black";
            if(game.modules.get('dice-so-nice')?.active){
              game.dice3d.showForRoll(roll, game.user, true, null, false);
            }
            ChatMessage.create({roll:roll,user:user.id,speaker:ChatMessage.getSpeaker(),blind:true,whisper:null,content:`Secret Dice are cast by ${game.user.name}!`})
          }
        }else if((request.status==400)&&message){
          if(text){
            ui.notifications.error(game.i18n.format("ALERTMESSAGE.DiceFormulaUnread",{text:text}));
          }
          let chatMessage ={
            user:user.id,
            speaker:ChatMessage.getSpeaker({actor:speaker}),
            blind:false,
            whisper:null,
            content:`<p>${message}</p>`
          }
          ChatMessage.create(chatMessage);
        }
    };
    request2.send();
    }
  }
}

  
