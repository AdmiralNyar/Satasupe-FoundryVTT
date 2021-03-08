import { EntitySheetHelper } from "./helper.js";
import { SatasupeInventrySheet } from "./item/sheets/inventry.js";
import { SatasupeChatpaletteSheet} from "./item/sheets/chatpalette.js";
import { SATASUPE } from "./config.js";
/**
 * Extend the basic ActorSheet with some very Satasupe modifications
 * @extends {ActorSheet}
 */
export class SatasupeActorSheet extends ActorSheet {

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["satasupe", "sheet", "actor", "character"],
      template: "systems/satasupe/templates/actor-sheet.html",
      width: 800,
      height: 623,
      dragDrop: [{dragSelector: '.item', dropSelector: null}],
			tabs: [{navSelector: '.sheet-tabs', contentSelector: '.sheet-body', initial: 'chatpalette'}]
    });
  }



  /* -------------------------------------------- */

  /** @override */
  getData() {
    const data = super.getData();
    data.dtypes = ["String", "Number", "Boolean"];
    for (let attr of Object.values(data.data.attributes)) {
      attr.isCheckbox = attr.dtype === "Boolean";
    }
    if (this.actor.data.type == 'character') {
      this._prepareCharacterItems(data);
    }

    if(!data.data.circumstance){
      data.data.circumstance={
        crime:{value:1,max:null,short:"CRIME",label:"CRIME",folmula:null,variable:null,substitution:false},
        life:{value:1,max:null,short:"LIFE",label:"LIFE",folmula:null,variable:null,substitution:false},
        love:{value:1,max:null,short:"LOVE",label:"LOVE",folmula:null,variable:null,substitution:false},
        cluture:{value:1,max:null,short:"CULTURE",label:"CULTURE",folmula:null,variable:null,substitution:false},
        combat:{value:1,max:null,short:"CIRCUMSTANCE.COMBAT",label:"CIRCUMSTANCE.COMBAT",folmula:null,variable:null,substitution:false}
      }
    }

    if(!data.data.combat){
      data.data.combat ={
        reflex:{value:1,max:9,short:"REFLEX",label:"REFLEX",folmula:null,variable:null,substitution:false},
        arms:{value:1,max:9,short:"ARMS",label:"ARMS",folmula:null,variable:null,substitution:false},
        damage:{value:1,max:9,short:"DAMAGE",label:"DAMAGE",folmula:null,variable:null,substitution:false}
      };
    }

    if(!data.data.status){
      data.data.status ={
        bpmajorWounds:{type:"Boolean",value:false},
        mpmajorWounds:{type:"Boolean",value:false},
        majorWoundsOffset:{value:0,max:2,short:"Major Wounds", label:"Major Wounds Offset",folmula:null,auto:true,variable:null,substitution:false},
        death:{type:"Boolean",value:false},
        uncoscious:{type:"Boolean",value:false},
        sleep:{value:null,max:null,explain:"not sleep turn",label:"sleep",auto:true},
        fumble:{value:1,max:6,explain:"fumble number",label:"fumble",auto:true,variable:null,substitution:false},
        turn:{type:"Boolean",value:false},
        alert:{type:"Boolean",value:false},
        trauma:{value:0,max:null,explain:"trauma number",label:"trauma",auto:true,variable:null,substitution:false},
        allonoff:{type:"Boolean",value:false}
      };
    }

    if(!data.data.attribs){
      data.data.attribs = {
        alignment:{value: null, max:null,short: "align",label:"ALIGNMENT",auto:true,variable:null,substitution:false},
        bp:{value:null,max:null,short: "bp",label:"BODY POINTS",auto:true,variable:null,substitution:false},
        mp:{value:null,max:null,short: "mp",label:"MIND POINTS",auto:true,variable:null,substitution:false},
        wallet:{value:null,max:null,short: "WP",label:"WALLET POINTS",auto:true,variable:null,substitution:false},
        drp:{value:null,max:null,short: "DRP",label:"Damage Reduction POINTS",auto:true,variable:null,substitution:false}
      };
    }
    if(!data.data.exp){
      data.data.exp ={
        combatpower:{value: null, max:null,short: "CP",label:"COMBAT POWER","folmula": null,auto:true},
        expgain:{value: null, max:null,short: "expgain",label:"EXP GAIN","folmula": null,auto:true},
        upkeep:{value: null, max:null,short: "upkeep",label:"UPKEEP","folmula": null,auto:true},
        mythos:{value: null, max:null,short: "mythos",label:"Cthulhu Mythos","folmula": null,auto:true},
        san:{value: null, max:null,short: "SAN",label:"SANITY POINT","folmula": null,auto:true}
      }
    }

    if(data.data.attribs.bp.value <= 5){
      if(data.data.attribs.bp.value <= 0){
        if(!data.data.status.unconscious.value) data.data.status.unconscious.value = true;
      }else if(data.data.attribs.mp.value > 0){data.data.status.unconscious.value = false;}
      if(data.data.attribs.mp.value <= 5){
        if(data.data.attribs.mp.value <= 0){
          if(!data.data.status.unconscious.value) data.data.status.unconscious.value = true;
        }else if(data.data.attribs.bp.value > 0){data.data.status.unconscious.value = false;}
        if(!data.data.status.mpmajorWounds.value) data.data.status.mpmajorWounds.value = true;
        if(!data.data.status.bpmajorWounds.value) data.data.status.bpmajorWounds.value = true;
        data.data.status.majorWoundsOffset = 2;
      }else{
        if(!data.data.status.bpmajorWounds.value) data.data.status.bpmajorWounds.value = true;
        if(data.data.status.mpmajorWounds.value) data.data.status.mpmajorWounds.value = false;
        data.data.status.majorWoundsOffset.value = 1;
      }
    }else{
      if(data.data.attribs.mp.value <= 5){
        if(data.data.attribs.mp.value <= 0){
          if(!data.data.status.unconscious.value) data.data.status.unconscious.value = true;
        }else if(data.data.attribs.bp.value > 0){data.data.status.unconscious.value = false;}
        if(!data.data.status.mpmajorWounds.value) data.data.status.mpmajorWounds.value = true;
        if(data.data.status.bpmajorWounds.value) data.data.status.bpmajorWounds.value = false;
        data.data.status.majorWoundsOffset.value = 1;
      }else{
        data.data.status.majorWoundsOffset.value = 0;
      }
    }
    if(data.data.status.trauma.value > 0 || data.data.status.trauma.value){
      data.data.attribs.mp.max = data.data.attribs.mp.max? (Number(data.data.attribs.mp.max) - Number(data.data.status.trauma.value)) : (10 -Number(data.data.status.trauma.value));
    }

    data.actor.karmaSortable = game.settings.get("satasupe", "karmaSortable");
    if(data.data.attribs.wallet.value == null && data.data.circumstance.life.value != null) data.data.attribs.wallet.value=data.data.circumstance.life.value;
    data.data.exp.combatpower.value = (Number(data.data.circumstance.combat.value) * 2) + Number(data.data.aptitude.body.value);
    if(Number(data.data.exp.combatpower.value) < (Number(data.data.combat.reflex.value)+Number(data.data.combat.arms.value)+Number(data.data.combat.damage.value))){
      if(!data.data.status.alert.value) ui.notifications.error("Total combat point looks wrong!");
    }
    if(!data.data.combat.reflex.value || !data.data.combat.arms.value || !data.data.combat.damage.value){
      if(!data.data.status.alert.value) ui.notifications.error("The minimum combat attributes point is 1!");
    }

    if((data.data.aptitude.body.value < 3) || (data.data.aptitude.mind.value < 3) || !data.data.aptitude.mind.value || !data.data.aptitude.body.value){
      if(!data.data.status.alert.value) ui.notifications.error("The minimum attributes point is 3!");
    }
    
    data.data.usedexp = {};
    data.data.usedexp.value = 0;
    for (let [key, circumstance]of Object.entries(data.data.circumstance)){
      if(circumstance.value == 1 || circumstance.value == null){
      }else if(circumstance.value == 2){
      data.data.usedexp.value += 1;
      }else if(circumstance.value == 3){
        data.data.usedexp.value += 2;
      }else if(circumstance.value == 4){
        data.data.usedexp.value += 4;
      }else if(circumstance.value ==5){
        data.data.usedexp.value += 6;
      }else if(circumstance.value == 6){
        data.data.usedexp.value += 9;
      }else if(circumstance.value == 7){
        data.data.usedexp.value += 13;
      }else if(circumstance.value == 8){
        data.data.usedexp.value += 18;
      }else{}
    } 
    for (let [key, aptitude]of Object.entries(data.data.aptitude)){
      if(aptitude.value <= 3 || aptitude.value == null){
      }else if(aptitude.value == 4){
      data.data.usedexp.value += 1;
      }else if(aptitude.value == 5){
        data.data.usedexp.value += 2;
      }else if(aptitude.value == 6){
        data.data.usedexp.value += 4;
      }else if(aptitude.value ==7){
        data.data.usedexp.value += 10;
      }else if(aptitude.value == 8){
        data.data.usedexp.value += 18;
      }else{}
    } 

    data.data.usedexp.unused = 13 - data.data.usedexp.value + Number(data.data.exp.expgain.value) - Number(data.data.exp.upkeep.value);
    if(data.data.usedexp.unused < 0){
      if(!data.data.status.alert.value) ui.notifications.error("You're spending too much EXP!");
    }
    return data;
  }

  /* -------------------------------------------- */

  _prepareCharacterItems(sheetData){

    const actorData = sheetData.actor;
    const karma = [];
    const gear = [];
    const inventry = [];
    const chatpalette = [];
    for(let i of sheetData.items){
      let item = i.data;
      i.img = i.img || DEFAULT_TOKEN;
      if(i.type ==="item"){
        gear.push(i);
      }
      else if(i.type ==="karma"){
        karma.push(i);
      }
      else if(i.type ==="inventry"){
        inventry.push(i);
      }
      else if(i.type ==="chatpalette"){
        chatpalette.push(i);
      }
    }
    actorData.gear = gear;
    actorData.karma = karma; 
    actorData.inventry = inventry;
    actorData.chatpalette = chatpalette;
  }


  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Everything below here is only needed if the sheet is editable
    if ( !this.options.editable ) return;

    // Handle rollable items and attributes
    html.find(".items .rollable").on("click", this._onItemRoll.bind(this));
    html.find(".attributes").on("click", "a.attribute-roll", EntitySheetHelper.onAttributeRoll.bind(this));

    // Update Inventory Item
    html.find('.item-edit').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.getOwnedItem(li.attr("data-item-id"));
      item.sheet.render(true);
    });

    html.find('.add-item').click(ev => {
      switch(ev.currentTarget.dataset.type){
        case 'karma':
          this.actor.createEmptyKarma( ev);
          break;
        case 'chatpalette':
          this.actor.createEmptyChatpalette( ev);
          break;
        }

    });

    html.find('.all-on-off-button').click(ev =>{
      const nowonoff = this.actor.data.data.status.allonoff.value;
      this._allonoffToggle(nowonoff);
    });
    html.find('a.table-show-hide').on("click", this._tableshowblind.bind(this));
    /*
      const li = $(ev.currentTarget).parents("table").children('tbody.chatpalette-tbody');
      this._tableshowblind(ev,li);
    });*/


    html.find('.favorite-button').click( ev => {this.createFavorite(ev);});

    html.find('.add-new-prisoner').click( () => {this.actor.createPrisonerSection();});
    html.find('.add-new-addiction').click( () => {this.actor.createAddictionSection();});
    html.find('.add-new-scenario').click( () => {this.actor.createScenarioSection();});
    html.find('.delete-section').click( ev => {
      const index = parseInt(ev.currentTarget.closest('.prisoner-section').dataset.index);
      this.actor.deletePrisonerSection( index);
    });

    html.find('.delete-addic-section').click( ev => {
      const index = parseInt(ev.currentTarget.closest('.addiction-section').dataset.index);
      this.actor.deleteAddictionSection( index);
    });

    html.find('.delete-scenario-section').click( ev => {
      const index = parseInt(ev.currentTarget.closest('.scenario-section').dataset.index);
      this.actor.deleteScenarioSection( index);
    });

    html.find(".sort-table-up").on("click", this._onTableSort.bind(this));
    html.find(".sort-table-down").on("click", this._onTableSort.bind(this));
    html.find(".sort-table-before").on("click", this._onTableSort.bind(this));

    html.find(".show-detail").on("click", this._onItemSummary.bind(this));
    html.find(".close-detail").on("click", this._offItemSummary.bind(this));
    html.find(".hobby-button").click( this._onButtonToggle.bind(this));

    // Delete Inventory Item
    html.find('.item-delete').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      this.actor.deleteOwnedItem(li.attr("data-item-id"));
      li.slideUp(200, () => this.render(false));
    });

    html.find('.delete-chatpalette-section').click( ev => {
      const li = $(ev.currentTarget).parents(".item");
      const index = parseInt(ev.currentTarget.closest('.chatpalette-section').dataset.index);
      const ind = parseInt(ev.currentTarget.closest('.chatpalette-section').dataset.ind);
      const id = li.attr("data-item-id");
      this.actor.deleteActorChatSection( index, ind, id);
      li.slideUp(200, () => this.render(false));
    });

    html.find('.chatsend-button').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      const index = parseInt(ev.currentTarget.closest('.chatpalette-section').dataset.ind);
      const id = li.attr("data-item-id");
      this._sendMessage(ev, index, id);
    });

    // Add draggable for macros.
    html.find(".attributes a.attribute-roll").each((i, a) => {
      a.setAttribute("draggable", true);
      a.addEventListener("dragstart", ev => {
        let dragData = ev.currentTarget.dataset;
        ev.dataTransfer.setData('text/plain', JSON.stringify(dragData));
      }, false);
    });

    // Add or Remove Attribute
    html.find(".attributes").on("click", ".attribute-control", EntitySheetHelper.onClickAttributeControl.bind(this));

    // Add attribute groups.
    html.find(".groups").on("click", ".group-control", EntitySheetHelper.onClickAttributeGroupControl.bind(this));

  }

  _allonoffToggle(nowonoff){
    const actor = this.actor.data;
    const circumstance = actor.data.circumstance;
    const aptitude = actor.data.aptitude;
    const attribs = actor.data.attribs;
    const combat = actor.data.combat;
    const status = actor.data.status;
    if(!nowonoff){
      circumstance.crime.substitution = circumstance.life.substitution = circumstance.cluture.substitution = circumstance.love.substitution = circumstance.combat.substitution = true;
      aptitude.body.substitution = aptitude.mind.substitution = true;
      attribs.alignment.substitution = attribs.bp.substitution = attribs.mp.substitution = attribs.wallet.substitution = attribs.drp.substitution = true;
      combat.reflex.substitution = combat.arms.substitution = combat.damage.substitution = true;
      status.majorWoundsOffset.substitution = status.fumble.substitution = status.trauma.substitution = true;
    }else{
      circumstance.crime.substitution = circumstance.life.substitution = circumstance.cluture.substitution = circumstance.love.substitution = circumstance.combat.substitution = false;
      aptitude.body.substitution = aptitude.mind.substitution = false;
      attribs.alignment.substitution = attribs.bp.substitution = attribs.mp.substitution = attribs.wallet.substitution = attribs.drp.substitution = false;
      combat.reflex.substitution = combat.arms.substitution = combat.damage.substitution = false;
      status.majorWoundsOffset.substitution = status.fumble.substitution = status.trauma.substitution = false;
    }
    const updated = {_id:actor.id, data:actor.data};
    game.actors.get(actor._id).update(updated);
  }

  _onTableSort(event){
    let button = $(event.currentTarget);
    let sortItem = button.parent().attr('id');
    let sortFlag = button.parent().attr('sort-type');
    $(button).hide();
    if(sortFlag == "desc"){
      $(button).prev().show();
    }else if(sortFlag == "asc"){
      $(button).next().show();
    }else{
      $(button).parent().parent().find('.sort-table-before').css('display', "");
      $(button).parent().parent().find('.sort-table-up').css('display', "none");
      $(button).parent().parent().find('.sort-table-down').css('display', "none");
      $(button).hide();
      $(button).next().show();
    }
    $('th').removeAttr('sort-type');
    if(sortFlag == "asc"){
      sortFlag = "desc";
      button.parent().attr('sort-type', "desc");
    }else{
      sortFlag = "asc";
      button.parent().attr('sort-type', "asc");
    }
    this._sortTable(sortItem, sortFlag);  
  }

  _sortTable(sortItem, sortFlag){
    let arr = $('table tbody .karma-row').sort(function(a, b){
      if($.isNumeric($(a).find('.karma-list').find('td').eq(sortItem).text())){
        let aNum = Number($(a).find('.karma-list').find('td').eq(sortItem).text());
        let bNum = Number($(b).find('.karma-list').find('td').eq(sortItem).text());
        if(sortFlag == "asc"){
          return aNum - bNum;
        }else{
          return bNum - aNum;
        }
      }else{
        let lang = game.i18n.lang;
        let aText = $(a).find('.karma-list').find('td').eq(sortItem).text().replace(new RegExp('[.\\\\+*/;,@&%#~?\"\'\`\\[\\^\\]$(){}=!<>|:\\' + '-]', 'g'), '');
        let bText = $(b).find('.karma-list').find('td').eq(sortItem).text().replace(new RegExp('[.\\\\+*/;,@&%#~?\"\'\`\\[\\^\\]$(){}=!<>|:\\' + '-]', 'g'), '');
        let sortNum = new Intl.Collator(lang).compare(aText, bText);
        if(sortFlag == "desc"){
          sortNum *= (-1);
        }
        return sortNum;
      }
    });
    $('.karma-table .main-body').append(arr);
  }

  _tableshowblind(event){
    const actor = this.actor.data;
    actor.data.status.allonoff.variableonoff = !actor.data.status.allonoff.variableonoff;
    console.log(actor.data.status.allonoff.variableonoff);
    const updated = {_id:actor.id, data:actor.data};
    game.actors.get(actor._id).update(updated);
  }

  async _onButtonToggle(event){
    event.preventDefault();
    if(event.currentTarget.dataset.hobby && event.currentTarget.dataset.family){
      await this.actor.toggleHobby( event.currentTarget.dataset.hobby, event.currentTarget.dataset.family);
    }
  }

  /* -------------------------------------------- */

  /**
   * Listen for roll buttons on items.
   * @param {MouseEvent} event    The originating left click event
   */
  _onItemRoll(event) {
    let button = $(event.currentTarget);
    let r = new Roll(button.data('roll'), this.actor.getRollData());
    const li = button.parents(".item");
    const item = this.actor.getOwnedItem(li.data("itemId"));
    r.roll().toMessage({
      user: game.user._id,
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      flavor: `<h2>${item.name}</h2><h3>${button.text()}</h3>`
    });
  }

  /* -------------------------------------------- */

  /** @override */
  async _updateObject(event, formData) {
    if( event.currentTarget){
      if(event.currentTarget.classList){
        if(event.currentTarget.classList.contains('prisoner-name-input')){
          const index = parseInt(event.currentTarget.closest('.prisoner-section').dataset.index);
          this.actor.updatePrisonerName( index, event.currentTarget.value);
        }
        if(event.currentTarget.classList.contains('prisoner-bool')){
          const index = parseInt(event.currentTarget.closest('.prisoner-section').dataset.index);
          const key = event.currentTarget.closest('.boolkey').dataset.boolkey;
          this.actor.updatePrisonerBool( index, key);
        }
        if(event.currentTarget.classList.contains('addiction-name-input')){
          const index = parseInt(event.currentTarget.closest('.addiction-section').dataset.index);
          this.actor.updateAddictionName( index, event.currentTarget.value);
        }
        if(event.currentTarget.classList.contains('addiction-bool')){
          const index = parseInt(event.currentTarget.closest('.addiction-section').dataset.index);
          const key = event.currentTarget.closest('.boolkey').dataset.boolkey;
          this.actor.updateAddictionBool( index, key);
        }
        if(event.currentTarget.classList.contains('section-input')){
          const index = parseInt(event.currentTarget.closest('.scenario-section').dataset.index);
          const key = event.currentTarget.closest('.section-key').dataset.sectionkey;
          this.actor.updateScenarioSection( index, event.currentTarget.value, key);
        }
        if(event.currentTarget.classList.contains('chat-section-input')){
          const li = $(event.currentTarget).parents(".item");
          const index = parseInt(event.currentTarget.closest('.chatpalette-section').dataset.ind);
          const key = event.currentTarget.closest('.section-key').dataset.sectionkey;
          const id = li.attr("data-item-id");
          this.actor.updateActorChatSection( index, event.currentTarget.value, key , id);
        }
      }
    }
    formData = EntitySheetHelper.updateAttributes(formData, this);
    formData = EntitySheetHelper.updateGroups(formData, this);
    return this.object.update(formData);
  }

  _onItemSummary(event){
    let button = $(event.currentTarget);
    button.parent('.item-controls').parent('.karma-list').next('.item-detail').children('.item-hide').toggle();
    $(button).hide();
    $(button).next().show();
  }

  _offItemSummary(event){
    let button = $(event.currentTarget);
    button.parent('.item-controls').parent('.karma-list').next('.item-detail').children('.item-hide').toggle();
    $(button).hide();
    $(button).prev().show();
  }

  createFavorite(event){
    event.preventDefault();
    const actor = this.actor.data;
    var text = "NPCT"
    var request = new XMLHttpRequest();
    var param = "command=" + text;
    var server = game.settings.get("satasupe", "BCDice");
    var url = server + "/game_system/Satasupe/roll?" + param;
    request.open("GET",url,true);
    request.responseType = 'json';
    request.onload = function(){
        var data = this.response;
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
        var belowtext = "<section class=\"tooltip-part\">";
        for(let [k, v] of Object.entries(dicen)){
            let sumv = v.value.reduce(function(sum,element){return sum+element},0); 
            belowtext += "<div class=\"dice\"><span class=\"part-formula part-header flexrow\">"
            belowtext += `${v.number}d${k}`
            belowtext += "<div class=\"flex1\"></div><span class=\"part-total flex0\">"
            belowtext +=  `${sumv}</span></span><ol class=\"dice-rolls\">`
            for(let dice of v.value){
                belowtext += `<li class=\"roll die d${k}\">${dice}</li>`
            }
            belowtext += "</ol></div></section>"
        }
        var halftext = data.text.replace(/[！-～]/g, function(s) {
          return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);});
        var favoriteText = halftext.replace(/.*?\):/g,"")
        var contenthtml = "<div><div>" + favoriteText + "</div><div class=\"dice-roll\"><div class=\"dice-result\"><div class=\"dice-formula\">" + "FAVORITE TABLE" + "</div><div class=\"dice-tooltip\" style=\"display:none;\">"+ belowtext + "</section></div></div>"; 
        ChatMessage.create({user:game.user._id,speaker:ChatMessage.getSpeaker(),content:contenthtml},{});
        actor.data.infos.favorite = favoriteText;
        const updated = {_id:actor.id, data:actor.data};
        game.actors.get(actor._id).update(updated);
    };
    request.send();
  }

  _Item(event){
    event.preventDefault();
    let li = $(event.currentTarget).parents('.item'),
        item = this.actor.getOwnedItem(li.data('item-id')),
        chatData = item.data;
    if(li.hasClass('expanded')){
      let summary = li.children('.item-summary');
      summary.slideUp(200, () => summary.remove());
    }else{
			let div = $(`<div class="item-summary">${chatData.effect}</div>`);
			let props = $('<div class="item-properties"></div>');
			// chatData.properties.forEach(p => props.append(`<span class="tag">${p}</span>`));
			div.append(props);
			li.append(div.hide());
			div.slideDown(200);
		}
		li.toggleClass('expanded');
  }

  _sendMessage(event,index, id){
    event.preventDefault();
    let actor = this.actor.data.data;
    let item = this.actor.data.items;
    //console.log(this.item.data.data.chatpalette.chat[index]);
    for(let i = 0; i < item.length ; i++){
      if(item[i]._id !== id){
      }else{
        let text = item[i].data.chatpalette.chat[index].text ? item[i].data.chatpalette.chat[index].text : "";
        let message = item[i].data.chatpalette.chat[index].message ? item[i].data.chatpalette.chat[index].message : "";
        text = text.replace(/[！-～]/g, function(s) {
            return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);});
        text = text.replace(/　/g," ");
        text = text.replace(/\s+/g, ""); 
        let repal = text.match(/(?<=\{).*?(?=\})/g);
        const re = /\{.*?\}/;
        if(repal){
          for (let i = 0 ; i < repal.length ; i++){
            for(let[key, value] of Object.entries(SATASUPE['referenceable'])){
              if((actor.circumstance[key].variable == repal[i]) && actor.circumstance[key]?.substitution){
                  text = text.replace(re,actor.circumstance[key].value);
                  break;
              }else if((actor.aptitude[key].variable == repal[i]) && actor.aptitude[key]?.substitution){
                text = text.replace(re,actor.aptitude[key].value);
                break;
              }else if((actor.attribs[key].variable == repal[i]) && actor.attribs[key]?.substitution){
                text = text.replace(re,actor.attribs[key].value);
                break;
              }else if((actor.combat[key].variable == repal[i]) && actor.combat[key]?.substitution){
                text = text.replace(re,actor.combat[key].value);
                break;
              }else if((actor.status[key].variable == repal[i]) && actor.status[key]?.substitution){
                text = text.replace(re,actor.status[key].value);
                break;
              }
            }
          }
          if(text.match(/\{.*?\}/g)){
            text = text.replace(/\{.*?\}/g, '0');
            ui.notifications.error("Your variable text coudn't  replace {},but insted, replace 0!");
          }
        }
        console.log(`your send text is ${text}.`);
        var request = new XMLHttpRequest();
        var param = "command=" + text;
        var server = game.settings.get("satasupe", "BCDice");
        var url = server + "/game_system/Satasupe/roll?" + param;
        console.log(url);
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
            console.log(data);
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
  }
}
