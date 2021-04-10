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
      width: 820,
      height: 660,
      dragDrop: [{dragSelector: '.item', dropSelector: null}],
			tabs: [{navSelector: '.sheet-tabs', contentSelector: '.sheet-body', initial: 'chatpalette'}]
    });
  }

  /** @override */
  get template() {
    if(this.actor.data.type === "npc"){
      if ( !game.user.isGM && this.actor.limited ) return "systems/satasupe/templates/npclimit-sheet.html";
      return `systems/satasupe/templates/npc-sheet.html`;
    }else{
      return `systems/satasupe/templates/actor-sheet.html`;
    }
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
    if (this.actor.data.type == 'npc') {
      this._prepareCharacterItems(data);
    }

    if(!data.data.circumstance){
      data.data.circumstance={
        crime:{value:1,max:null,short:"CIRCUMSTANCE.CRIME",label:"CIRCUMSTANCE.CRIME",folmula:null,variable:null,substitution:false},
        life:{value:1,max:null,short:"CIRCUMSTANCE.LIFE",label:"CIRCUMSTANCE.LIFE",folmula:null,variable:null,substitution:false},
        love:{value:1,max:null,short:"CIRCUMSTANCE.LOVE",label:"CIRCUMSTANCE.LOVE",folmula:null,variable:null,substitution:false},
        cluture:{value:1,max:null,short:"CIRCUMSTANCE.CULTURE",label:"CIRCUMSTANCE.CULTURE",folmula:null,variable:null,substitution:false},
        combat:{value:1,max:null,short:"CIRCUMSTANCE.COMBAT",label:"CIRCUMSTANCE.COMBAT",folmula:null,variable:null,substitution:false}
      }
    }

    if(!data.data.combat){
      data.data.combat ={
        reflex:{value:1,max:9,short:"COMBAT.REFLEX",label:"COMBAT.REFLEX",folmula:null,variable:null,substitution:false},
        arms:{value:1,max:9,short:"COMBAT.ARMS",label:"COMBAT.ARMS",folmula:null,variable:null,substitution:false},
        damage:{value:1,max:9,short:"COMBAT.DAMAGE",label:"COMBAT.DAMAGE",folmula:null,variable:null,substitution:false}
      };
    }

    if(!data.data.status){
      data.data.status ={
        bpmajorWounds:{type:"Boolean",value:false},
        mpmajorWounds:{type:"Boolean",value:false},
        majorWoundsOffset:{value:0,max:2,short:"STATUS.MajorWoundesOffsetS", label:"STATUS.MajorWoundesOffsetL",folmula:null,auto:true,variable:null,substitution:false},
        death:{type:"Boolean",value:false},
        uncoscious:{type:"Boolean",value:false},
        sleep:{value:null,max:null,explain:"STATUS.SleepL",label:"STATUS.SleepS",auto:true},
        fumble:{value:1,max:6,explain:"STATUS.FumbleL",label:"STATUS.FumbleS",auto:true,variable:null,substitution:false},
        turn:{type:"Boolean",value:false},
        alert:{type:"Boolean",value:false},
        trauma:{value:0,max:null,explain:"STATUS.TraumaL",label:"STATUS.TraumaS",auto:true,variable:null,substitution:false},
        allonoff:{type:"Boolean",value:false}
      };
    }

    if(!data.data.attribs){
      data.data.attribs = {
        alignment:{value: null, max:null,short: "ATTRIBS.ALIGNMENTS",label:"ATTRIBS.ALIGNMENTL",auto:true,variable:null,substitution:false},
        bp:{value:null,max:null,short: "ATTRIBS.BPS",label:"ATTRIBS.BPL",auto:true,variable:null,substitution:false},
        mp:{value:null,max:null,short: "ATTRIBS.MPS",label:"ATTRIBS.MPL",auto:true,variable:null,substitution:false},
        wallet:{value:null,max:null,short: "ATTRIBS.WPS",label:"ATTRIBS.WPL",auto:true,variable:null,substitution:false},
        drp:{value:null,max:null,short: "ATTRIBS.DRPS",label:"ATTRIBS.DRPL",auto:true,variable:null,substitution:false}
      };
    }
    if(!data.data.exp){
      data.data.exp ={
        combatpower:{value: null, max:null,short: "EXP.COMBATPOWERS",label:"EXP.COMBATPOWERS",folmula: null,auto:true},
        expgain:{value: null, max:null,short: "EXP.EXPGAINS",label:"EXP.EXPGAINL",folmula: null,auto:true},
        upkeep:{value: null, max:null,short: "EXP.UPKEEPS",label:"EXP.UPKEEPL",folmula: null,auto:true},
        mythos:{value: null, max:null,short: "EXP.MYTHOSS",label:"EXP.MYTHOSL",folmula: null,auto:true},
        san:{value: null, max:null,short: "EXP.SANS",label:"EXP.SANL",folmula: null,auto:true}
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
      }else{
        if(!data.data.status.bpmajorWounds.value) data.data.status.bpmajorWounds.value = true;
        if(data.data.status.mpmajorWounds.value) data.data.status.mpmajorWounds.value = false;
      }
    }else{
      if(data.data.attribs.mp.value <= 5){
        if(data.data.attribs.mp.value <= 0){
          if(!data.data.status.unconscious.value) data.data.status.unconscious.value = true;
        }else if(data.data.attribs.bp.value > 0){data.data.status.unconscious.value = false;}
        if(!data.data.status.mpmajorWounds.value) data.data.status.mpmajorWounds.value = true;
        if(data.data.status.bpmajorWounds.value) data.data.status.bpmajorWounds.value = false;
      }else{
        if(data.data.status.bpmajorWounds.value) data.data.status.bpmajorWounds.value = false;
        if(data.data.status.mpmajorWounds.value) data.data.status.mpmajorWounds.value = false;
        if(data.data.status.unconscious.value) data.data.status.unconscious.value = false;
      }
    }

    if(data.data.status.trauma.value > 0 || data.data.status.trauma.value){
      data.data.attribs.mp.max = data.data.attribs.mp.max? (Number(data.data.attribs.mp.max) - Number(data.data.status.trauma.value)) : (10 -Number(data.data.status.trauma.value));
    }

    data.actor.karmaSortable = game.settings.get("satasupe", "karmaSortable");
    if(data.data.attribs.wallet.value == null && data.data.circumstance.life.value != null) data.data.attribs.wallet.value=data.data.circumstance.life.value;
    data.data.exp.combatpower.value = (Number(data.data.circumstance.combat.value) * 2) + Number(data.data.aptitude.body.value);
    if(Number(data.data.exp.combatpower.value) < (Number(data.data.combat.reflex.value)+Number(data.data.combat.arms.value)+Number(data.data.combat.damage.value))){
      if(!data.data.status.alert.value) ui.notifications.error(game.i18n.localize("ALERTMESSAGE.CombatPoints"));
    }
    if(!data.data.combat.reflex.value || !data.data.combat.arms.value || !data.data.combat.damage.value){
      if(!data.data.status.alert.value) ui.notifications.error(game.i18n.localize("ALERTMESSAGE.CombatAttributes"));
    }

    if((data.data.aptitude.body.value < 3) || (data.data.aptitude.mind.value < 3) || !data.data.aptitude.mind.value || !data.data.aptitude.body.value){
      if(!data.data.status.alert.value) ui.notifications.error(game.i18n.localize("ALERTMESSAGE.AptitudePoints"));
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
      if(!data.data.status.alert.value) ui.notifications.error(game.i18n.localize("ALERTMESSAGE.EXPPoints"));
    }

    data.data.equipmentcapacity={};
    data.data.equipmentplace={};
    data.data.addcapacity={};
    data.data.hobbychoicenumber=0;
    data.data.equipmentcapacity.normal = Number(data.data.circumstance.crime.value) + Number(data.data.aptitude.body.value);
    data.data.equipmentcapacity.haven = 10;
    data.data.equipmentcapacity.haven2 = 10;
    data.data.equipmentcapacity.vehicle = 0;
    data.data.equipmentcapacity.comfort=10;
    data.data.equipmentcapacity.comfort2=10;
    data.data.equipmentcapacity.add = 0;
    data.data.equipmentplace.normal = 0;
    data.data.equipmentplace.vehicle = 0;
    data.data.equipmentplace.add = 0;
    data.data.equipmentplace.haven = 0;
    data.data.equipmentplace.haven2 = 0;
    data.data.equipmentplace.other = 0;
    data.data.equipmentattribs={};
    data.data.equipmentattribs.security = 0;
    data.data.equipmentattribs.securityadd = 0;
    data.data.equipmentattribs.upkeep = 0;
    data.data.equipmentattribs.placeorder = 0;
    data.data.equipmentattribs.security2 = 0;
    data.data.equipmentattribs.securityadd2 = 0;
    data.data.equipmentattribs.placeorder2 = 0;
    data.data.equipmentattribs.vehiclehave = false;
    data.data.equipmentattribs.habitable = false;
    data.data.hobbynumerror = false;
    for(let i = 0; i < data.items.length ; i++){
      if(data.items[i].type == 'item'){
        if(data.items[i].data.typev&&Number(data.items[i].data.vehicle.capacity)){
          data.data.equipmentcapacity.vehicle = data.items[i].data.vehicle.capacity;
          data.data.equipmentattribs.habitable = data.items[i].data.vehicle.special.habitable.value || data.data.equipmentattribs.habitable;
        }
        if((Number(data.items[i].data.props.addcapacity) && data.items[i].data.typep) || (Number(data.items[i].data.gadjet.addcapacity) && data.items[i].data.typep)){
          data.data.equipmentcapacity.add += Number(data.items[i].data.props.addcapacity) + Number(data.items[i].data.gadjet.addcapacity);
        }
        if(data.items[i].data.storage == 'normal') {
          if(data.items[i].data.typep && data.items[i].data.props.special.mini.value && (data.items[i].data.props.minivalue !== 0)){
            data.data.equipmentplace.normal += (data.items[i].data.props.minivalue / 10);
          }else{
            data.data.equipmentplace.normal +=1;
          }
        }
        if(data.items[i].data.storage == 'haven') {
          if(data.items[i].data.typep && data.items[i].data.props.special.mini.value && (data.items[i].data.props.minivalue !== 0)){
            data.data.equipmentplace.haven += (data.items[i].data.props.minivalue / 10);
          }else{
            data.data.equipmentplace.haven +=1;
          }
          if(data.items[i].data.typep && data.items[i].data.props.specialtext.furniture.value && (Number(data.items[i].data.props.specialtext.furniture.number) <= Number(data.data.circumstance.life.value))){
            data.data.equipmentplace.haven -=1;
          }
        }
        if(data.items[i].data.storage == 'haven2') {
          if(data.items[i].data.typep && data.items[i].data.props.special.mini.value && (data.items[i].data.props.minivalue !== 0)){
            data.data.equipmentplace.haven2 += (data.items[i].data.props.minivalue / 10);
          }else{
            data.data.equipmentplace.haven2 +=1;
          }
          if(data.items[i].data.typep && data.items[i].data.props.specialtext.furniture.value && (Number(data.items[i].data.props.specialtext.furniture.number) <= Number(data.data.circumstance.life.value))){
            data.data.equipmentplace.haven2 -=1;
          }
        }
        if(data.items[i].data.storage == 'vehicle') {
          if(data.items[i].data.typep && data.items[i].data.props.special.mini.value && (data.items[i].data.props.minivalue !== 0)){
            data.data.equipmentplace.vehicle += (data.items[i].data.props.minivalue / 10);
          }else{
            data.data.equipmentplace.vehicle +=1;
          }
        }
        if(!data.items[i].data.storage) {
          if(data.items[i].data.typep && data.items[i].data.props.special.mini.value && (data.items[i].data.props.minivalue !== 0)){
            data.data.equipmentplace.other += (data.items[i].data.props.minivalue / 10);
          }else{
            data.data.equipmentplace.other +=1;
          }
        }

        data.data.equipmentattribs.vehiclehave = data.items[i].data.typev || data.data.equipmentattribs.vehiclehave;
        
        //
        if((data.items[i].data.typep && (data.items[i].data.props.addcapacity !==0))||(data.items[i].data.typeg && (data.items[i].data.gadjet.addcapacity !==0))){
          var addobj = new Object();
          addobj = {capacity:null};
          if(data.items[i].data.typep && (data.items[i].data.props.addcapacity !==0)){
            if(data.items[i].data.typeg && (data.items[i].data.gadjet.addcapacity !==0)){
              addobj['capacity']=Number(data.items[i].data.props.addcapacity)+Number(data.items[i].data.gadjet.addcapacity);
            }else{
              addobj['capacity']=Number(data.items[i].data.props.addcapacity);
            }
          }else{
            addobj['capacity']=Number(data.items[i].data.gadjet.addcapacity);
          }
          
          addobj['storage']=data.items[i].data.storage;
          addobj['equipmentplace']=0;
          data.data.addcapacity[data.items[i].name]=addobj;
        }

        if(data.items[i].data.typep && (data.items[i].data.props.specialtext.securityadd.value)) {
          if(data.items[i].data.storage == 'haven'){
            data.data.equipmentattribs.securityadd += parseInt(data.items[i].data.props.specialtext.securityadd.number,10);
          }else if(data.items[i].data.storage == 'haven2'){
            data.data.equipmentattribs.securityadd2 += parseInt(data.items[i].data.props.specialtext.securityadd.number,10);
          }
        }
        if(data.items[i].data.typep && data.items[i].data.props.specialtext.upkeepcost.value) data.data.equipmentattribs.upkeep += Number(data.items[i].data.props.specialtext.upkeepcost.number);
        if(data.items[i].data.typev && data.items[i].data.vehicle.specialtext.upkeepcost.value) data.data.equipmentattribs.upkeep += Number(data.items[i].data.vehicle.specialtext.upkeepcost.number);
        if(data.items[i].data.typew && data.items[i].data.weapon.specialtext.upkeepcost.value) data.data.equipmentattribs.upkeep += Number(data.items[i].data.weapon.specialtext.upkeepcost.number);
      }
    }
    data.data.equipmentplace.normal = Math.ceil(data.data.equipmentplace.normal);
    data.data.equipmentplace.vehicle = Math.ceil(data.data.equipmentplace.vehicle);
    data.data.equipmentplace.haven = Math.ceil(data.data.equipmentplace.haven);
    data.data.equipmentplace.haven2 = Math.ceil(data.data.equipmentplace.haven2);
    data.data.equipmentplace.other = Math.ceil(data.data.equipmentplace.other);

    for(let i = 0; i < data.items.length ; i++){
      if(data.items[i].type == 'item'){
        for(let [key, value] of Object.entries(data.data.addcapacity)){
          if(value.capacity !==0){
            if(data.items[i].data.storage == key) {
              if(data.items[i].data.typep && data.items[i].data.props.special.mini.value && (data.items[i].data.props.minivalue !== 0)){
                data.data.addcapacity[key]['equipmentplace'] += (data.items[i].data.props.minivalue / 10);
              }else{
                data.data.addcapacity[key]['equipmentplace'] +=1;
              }
            }
          }
        }
      }
    }

    for(let [key, value] of Object.entries(data.data.addcapacity)){
      if(value.capacity !==0){
        data.data.addcapacity[key]['equipmentplace'] = Math.ceil(data.data.addcapacity[key]['equipmentplace']);
      }
    }

    data.data.equipmentcapacity.other = 99;
    if(data.data.equipmentplace.haven > Number(data.data.circumstance.life.value)){
      data.data.equipmentcapacity.comfort = 10 - Number(data.data.equipmentplace.haven) + Number(data.data.circumstance.life.value);
    }

    if(data.data.infos.haven == 'minami') data.data.equipmentattribs.placeorder = 9;
    if(data.data.infos.haven == 'chinatown') data.data.equipmentattribs.placeorder = 10;
    if(data.data.infos.haven == 'warship') data.data.equipmentattribs.placeorder = 8;
    if(data.data.infos.haven == 'civic') data.data.equipmentattribs.placeorder = 11;
    if(data.data.infos.haven == 'downtown') data.data.equipmentattribs.placeorder = 10;
    if(data.data.infos.haven == 'shaokin') data.data.equipmentattribs.placeorder = 7;
    if((Number(data.data.circumstance.life.value) + data.data.equipmentattribs.securityadd) > data.data.equipmentattribs.placeorder){
      data.data.equipmentattribs.security = (Number(data.data.circumstance.life.value) + data.data.equipmentattribs.securityadd);
    }else{
      data.data.equipmentattribs.security = data.data.equipmentattribs.placeorder;
    }

    if(data.data.status.secondhaven.value) {
      if(data.data.infos.haven2 == 'minami') data.data.equipmentattribs.placeorder2 = 9;
      if(data.data.infos.haven2 == 'chinatown') data.data.equipmentattribs.placeorder2 = 10;
      if(data.data.infos.haven2 == 'warship') data.data.equipmentattribs.placeorder2 = 8;
      if(data.data.infos.haven2 == 'civic') data.data.equipmentattribs.placeorder2 = 11;
      if(data.data.infos.haven2 == 'downtown') data.data.equipmentattribs.placeorder2 = 10;
      if(data.data.infos.haven2 == 'shaokin') data.data.equipmentattribs.placeorder2 = 7;
      if((Number(data.data.circumstance.life.value) + data.data.equipmentattribs.securityadd2) > data.data.equipmentattribs.placeorder2){
        data.data.equipmentattribs.security2 = (Number(data.data.circumstance.life.value) + data.data.equipmentattribs.securityadd2);
      }else{
        data.data.equipmentattribs.security2 = data.data.equipmentattribs.placeorder2;
      }
      if(data.data.equipmentplace.haven2 > Number(data.data.circumstance.life.value)){
        data.data.equipmentcapacity.comfort2 = 10 - Number(data.data.equipmentplace.haven2) + Number(data.data.circumstance.life.value);
      }
    }

    for(let [key, value] of Object.entries(data.data.hobby)){
      for(let [tag, choice]of Object.entries(data.data.hobby[key])){
        if(choice.value){
          data.data.hobbychoicenumber +=1;
        }
      }
    }
    if(data.data.hobbychoicenumber > Math.ceil((Number(data.data.circumstance.life.value)+Number(data.data.circumstance.cluture.value))/2)){
      data.data.hobbynumerror = true;
    }else{data.data.hobbynumerror = false;}

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
        case 'item':
          this.actor.createEmptyItem( ev);
          break;
        }
    });

    html.find('button.empty-ground').on("click", this._emptyGroundCreate.bind(this));
    html.find('button.all-drop-ground').on("click", this._allItemDrop.bind(this));

    html.find('.gear-name-button').on("dragstart", this._geardragstart.bind(this));
    html.find('div.drparea').on("drop", this._geardrop.bind(this));
    html.find('.gear-name-button').on("dblclick", this._gearedit.bind(this));

    html.find('.all-on-off-button').click(ev =>{
      const nowonoff = this.actor.data.data.status.allonoff.value;
      this._allonoffToggle(nowonoff);
    });
    html.find('a.table-show-hide').on("click", this._tableshowblind.bind(this));

    html.find('a.infomation').on("click", this._titleinfomation.bind(this));

    html.find('.favorite-button').click( ev => {this.createFavorite(ev);});

    html.find('.alignmentroll').on("click", this._createAlignment.bind(this));

    html.find('.add-new-variable').click( () => {this.actor.createVariableSection();});
    html.find('.delete-vatiable-section').click( ev => {
      const index = parseInt(ev.currentTarget.closest('.variable-section').dataset.index);
      this.actor.deleteVariableSection( index);
    });

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
      this._deleteItemSection(ev);
    });

    html.find('.karma-delete').click(ev => {
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
  }

  _gearedit(event){
    const item = this.actor.getOwnedItem(event.currentTarget.dataset.key);
    item.sheet.render(true);
  }

  _geardragstart(event){
    let id = event.currentTarget.dataset;
    event.originalEvent.dataTransfer.setData('text/plain', JSON.stringify(id));
  }

  async _emptyGroundCreate(event){
    let item = this.object.data.items;
    console.log(item);
    for(let i = 0; i < item.length ; i++){
      if(item[i].type == "item"){
        console.log(i);
        if(item[i].data.storage == ""){
          const id = item[i]._id;
          await this.object.deleteOwnedItem(id);
        }
      }
    }
  }

  async _allItemDrop(event){
    let item = this.actor.data.items;
    for(let i = 0; i < item.length ; i++){
      if(item[i].type == "item"){
        if(item[i].data.storage !== ""){
          const gear = duplicate(this.actor.data.items);
          gear[i].data.storage = "";
          await this.actor.update({'items' : gear});
        }
      }
    }
  }

  async _geardrop(event){
    var id = JSON.parse(event.originalEvent.dataTransfer.getData('text/plain'));
    let dataset = event.currentTarget.dataset;
    let item = this.actor.data.items;
    for(let i = 0 ; i < item.length ; i++){
      if(item[i]._id === id.key){
        if(Number(dataset.nowcontain) < Number(dataset.capacity)){
          if((dataset.placetype == 'vehicle') && (item[i].data.typev||(item[i].data.typep&&(item[i].data.props.special.normalstorage.value||item[i].data.props.special.room.value&&(dataset.habitable == 'false'))))){
          }else{
            if((dataset.placetype == 'normal')&&(item[i].data.typep&&item[i].data.props.special.room.value)){}else{
              if(((dataset.placetype == 'haven')||(dataset.placetype == 'haven2'))&&(item[i].data.typep&&item[i].data.props.special.normalstorage.value)){}else{
                if(((item[i].data.typep&&(item[i].data.props.addcapacity !== 0))||(item[i].data.typeg&&(item[i].data.gadjet.addcapacity !== 0)))&&(dataset.placetype == item[i].name)){}else{
                  const gear = duplicate(this.actor.data.items);
                  gear[i].data.storage = dataset.placetype;
                  await this.actor.update({'items' : gear});
                }
              }
            }
          }
        }
      }
    }
  }

  async _deleteItemSection(ev){
    const li = $(ev.currentTarget).parents(".item");
    const id = li.attr("data-item-id");
    let item = this.object.data.items;
    let newkeep = this.object.data.data.exp.upkeep.value == null ? 0 : this.object.data.data.exp.upkeep.value;
    for(let i = 0 ; i < item.length ; i++){
      if(item[i]._id == id){
        if(item[i].data.typew){
          if(item[i].data.weapon.upkeep) newkeep = newkeep - 1;
        }
        if(item[i].data.typev){
          if(item[i].data.vehicle.upkeep) newkeep = newkeep - 1;
        }
        if(item[i].data.typep){
          if(item[i].data.props.upkeep) newkeep = newkeep - 1;
        }
      }
    }
    await this.actor.update({'data.exp.upkeep.value' : newkeep});
    this.actor.deleteOwnedItem(id);
    li.slideUp(200, () => this.render(false));
  }
  
  _titleinfomation(event){
    event.preventDefault();
    var request = new XMLHttpRequest();
    var server = game.settings.get("satasupe", "BCDice");
    var url = server + "/game_system/Satasupe";
    request.open("GET",url,true);
    request.responseType = 'json';
    request.onload = function(){
      if(request.status == 200){
        console.log(request.status);
        var data = this.response;
        var text = data.help_message.replace(/\r?\n/g,"<br>");
        return Dialog.prompt({
          title: game.i18n.localize("SATASUPE.CommandList"),
          content:text,
          callback: () => console.log("Command list Dialog closed")
        });
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
          return Dialog.prompt({
            title:"COMMAND LIST",
            content:text2,
            callback: () => console.log("Command list Dialog closed")
          });
        }
      };
      request2.send();
    }
  }

  _allonoffToggle(nowonoff){
    const actor = this.actor.data;
    const circumstance = actor.data.circumstance;
    const aptitude = actor.data.aptitude;
    const attribs = actor.data.attribs;
    const combat = actor.data.combat;
    const status = actor.data.status;
    let variable = actor.data.variable;
    if(!nowonoff){
      circumstance.crime.substitution = circumstance.life.substitution = circumstance.cluture.substitution = circumstance.love.substitution = circumstance.combat.substitution = true;
      aptitude.body.substitution = aptitude.mind.substitution = true;
      attribs.alignment.substitution = attribs.bp.substitution = attribs.mp.substitution = attribs.wallet.substitution = attribs.drp.substitution = true;
      combat.reflex.substitution = combat.arms.substitution = combat.damage.substitution = true;
      status.majorWoundsOffset.substitution = status.fumble.substitution = status.trauma.substitution = true;
      for(let i=0 ; i < variable.length ; i++){
        variable[i].substitution = true;
      }
    }else{
      circumstance.crime.substitution = circumstance.life.substitution = circumstance.cluture.substitution = circumstance.love.substitution = circumstance.combat.substitution = false;
      aptitude.body.substitution = aptitude.mind.substitution = false;
      attribs.alignment.substitution = attribs.bp.substitution = attribs.mp.substitution = attribs.wallet.substitution = attribs.drp.substitution = false;
      combat.reflex.substitution = combat.arms.substitution = combat.damage.substitution = false;
      status.majorWoundsOffset.substitution = status.fumble.substitution = status.trauma.substitution = false;
      for(let j=0 ; j < variable.length ; j++){
        variable[j].substitution = false;
      }
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
        if(event.currentTarget.classList.contains('variable-section-input')){
          const index = parseInt(event.currentTarget.closest('.variable-section').dataset.index);
          const key = event.currentTarget.closest('.section-key').dataset.sectionkey;
          this.actor.updateVariableSection( index, event.currentTarget.value, key);
        }
        if(event.currentTarget.classList.contains('chat-section-input')){
          const li = $(event.currentTarget).parents(".item");
          const index = parseInt(event.currentTarget.closest('.chatpalette-section').dataset.ind);
          const key = event.currentTarget.closest('.section-key').dataset.sectionkey;
          const id = li.attr("data-item-id");
          this.actor.updateActorChatSection( index, event.currentTarget.value, key , id);
        }
        if(event.currentTarget.classList.contains('item-upkeepcheck')){
          const li = $(event.currentTarget).closest('.equipment-row');
          const index = li.attr("data-item-id");
          const key = event.currentTarget.closest('.equipment-row').dataset.itemtype;
          this.actor.updateEquipmentSection( index, key);
        }
        if(event.currentTarget.classList.contains('item-minivalue-select')){
          const value = event.currentTarget.value;
          const li = $(event.currentTarget).closest('.equipment-row');
          const index = li.attr("data-item-id");
          const key = event.currentTarget.closest('.equipment-row').dataset.itemtype;
          this.actor.updateEquipmentMiniSection( index, key, value);
        }
        if(event.currentTarget.classList.contains('storage-input')){
          const li = $(event.currentTarget).closest('.equipment-row');
          const index = li.attr("data-item-id");
          this.actor.updateEquipmentStorage( index, event.currentTarget.value);
        }
        if(event.currentTarget.classList.contains('bp') || event.currentTarget.classList.contains('mp')){
          this.actor.updateMajorWounds(formData);
        }
      }
    }
    return this.object.update(formData);
  }

  _onItemSummary(event){
    let button = $(event.currentTarget);
    button.parent('.item-controls').parent().next('.item-detail').children('.item-hide').toggle();
    $(button).hide();
    $(button).next().show();
  }

  _offItemSummary(event){
    let button = $(event.currentTarget);
    button.parent('.item-controls').parent('').next('.item-detail').children('.item-hide').toggle();
    $(button).hide();
    $(button).prev().show();
  }

  async _createAlignment(event){
    event.preventDefault();
    const actor = duplicate(this.object.data);
    const roll = new Roll('2d6');
    roll.roll();
    let align = 0;
    if(roll._total == 6 ||roll._total == 7 || roll._total == 8){
      align = 7;
    }else if(roll._total == 4 ||roll._total == 5){
      align = 6;
    }else if(roll._total == 9 ||roll._total == 10){
      align = 8;
    }else if(roll._total == 11){
      align = 9;
    }else if(roll._total == 12){
      align = 10;
    }else if(roll._total == 3){
      align = 5;
    }else if(roll._total == 2){
      align = 4;
    }
    const user = this.object.user ? this.object.user : game.user;
    actor.data.attribs.alignment.value = align;
    if( game.modules.get('dice-so-nice')?.active){
      await game.dice3d.showForRoll(roll,user);
    }
    let text = `<br>=>` + game.i18n.format('SATASUPE.AlignmentRollresult',{align: align});
    let chatData = {
      content : await roll.render(),
      user: user._id,
      speaker: ChatMessage.getSpeaker({actor : this.object}),
      flavor: game.i18n.localize("SATASUPE.AlignmentRolltitle") + text,
    };
    ChatMessage.create(chatData);
    const updated = {_id:actor.id, data:actor.data};
    await this.object.update({'data.attribs': actor.data.attribs});
  }

  createFavorite(event){
    event.preventDefault();
    console.log(this);
    const up = this;
    const actor = duplicate(this.object.data);
    const speaker = this.object;
    const user = this.object.user ? this.object.user : game.user;
    var text = "NPCT"
    var request = new XMLHttpRequest();
    var param = "command=" + text;
    var server = game.settings.get("satasupe", "BCDice");
    var url = server + "/game_system/Satasupe/roll?" + param;
    request.open("GET",url,true);
    request.responseType = 'json';
    request.onload = function(){
      if(request.status == 200){
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
            if( game.modules.get('dice-so-nice')?.active){
              game.dice3d.show(dicedata);
            }
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
        ChatMessage.create({user:user._id,speaker: ChatMessage.getSpeaker({actor : speaker}),content:contenthtml},{});
        actor.data.infos.favorite = favoriteText;
        const updated = {_id:actor.id, data:actor.data};
        console.log(up);
        up.object.update({'data': actor.data});
        console.log(up);
      }
    };
    request.send();

    request.onerror=function(){
      console.log("Server 1 connect error");
      var request2 = new XMLHttpRequest();
    var param2 = "command=" + text;
    var server2 = game.settings.get("satasupe", "BCDice2");
    var url2 = server2 + "/game_system/Satasupe/roll?" + param2;
    request2.open("GET",url2,true);
    request2.responseType = 'json';
    request2.onload = function(){
      if(request2.status == 200){
        var data2 = this.response;
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
        var halftext = data2.text.replace(/[！-～]/g, function(s) {
          return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);});
        var favoriteText = halftext.replace(/.*?\):/g,"")
        var contenthtml = "<div><div>" + favoriteText + "</div><div class=\"dice-roll\"><div class=\"dice-result\"><div class=\"dice-formula\">" + "FAVORITE TABLE" + "</div><div class=\"dice-tooltip\" style=\"display:none;\">"+ belowtext + "</section></div></div>"; 
        ChatMessage.create({user:user._id,speaker: ChatMessage.getSpeaker({actor : speaker}),content:contenthtml},{});
        actor.data.infos.favorite = favoriteText;
        const updated = {_id:actor.id, data:actor.data};
        game.actors.get(actor._id).update(updated);
      }
    };
      request2.send();
    };
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
    const speaker = this.actor;
    const user = this.actor.user ? this.actor.user : game.user;
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
              if((actor.circumstance[key]?.variable == repal[i]) && actor.circumstance[key]?.substitution){
                  text = text.replace(re,actor.circumstance[key].value);
                  break;
              }else if((actor.aptitude[key]?.variable == repal[i]) && actor.aptitude[key]?.substitution){
                text = text.replace(re,actor.aptitude[key].value);
                break;
              }else if((actor.attribs[key]?.variable == repal[i]) && actor.attribs[key]?.substitution){
                text = text.replace(re,actor.attribs[key].value);
                break;
              }else if((actor.combat[key]?.variable == repal[i]) && actor.combat[key]?.substitution){
                text = text.replace(re,actor.combat[key].value);
                break;
              }else if((actor.status[key]?.variable == repal[i]) && actor.status[key]?.substitution){
                text = text.replace(re,actor.status[key].value);
                break;
              }
            }
            if(!actor.variable) actor.variable = [];
            for(let j = 0; j < actor.variable.length ; j++){
              if((actor.variable[j].variable == repal[i]) && actor.variable[j].substitution){
                text = text.replace(re,actor.variable[j].title);
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
                math += parseInt(small[k], 10);
              }
              text=text.replace(new RegExp('\\(' + add[j].replace(/(\+|\-)/g,'\\$&') + '\\)', 'g'),math);
            }
          }
        }
        console.log(`your send text is ${text}.`);
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
            ChatMessage.create({user:user._id,speaker:ChatMessage.getSpeaker({actor : speaker}),content:contenthtml,flavor:message},{});
          }
        };
        request.send();

        request.onerror=function(){
          console.log("Server 1 connect error");
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
            ChatMessage.create({user:user._id,speaker:ChatMessage.getSpeaker({actor : speaker}),content:contenthtml,flavor:message},{});
          }
        };
        request2.send();
        }
      }
    }
  }
}
