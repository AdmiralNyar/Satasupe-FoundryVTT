import { SatasupeInvestigationSheet } from "./item/sheets/investigation.js";
import { SatasupeChatpaletteSheet} from "./item/sheets/chatpalette.js";
import { SATASUPE } from "./config.js";
import { CheckDialog} from "./apps/checkdialog.js";
import { LoadDialog} from "./apps/loaddialog.js";
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
  async getData() {
    const data = await super.getData();
    const actorData = this.actor.data.toObject(false);
    data.data = actorData.data;
    data.editable = this.isEditable;
    data.dtypes = ["String", "Number", "Boolean"];
    /*
    for (let attr of Object.values(data.data.attributes)) {
      attr.isCheckbox = attr.dtype === "Boolean";
    }*/
    if (this.actor.data.type == 'character') {
      this._prepareCharacterItems(data);
    }
    if (this.actor.data.type == 'npc') {
      this._prepareCharacterItems(data);
    }
    if(!data.data.circumstance){
      data.data.circumstance={
        crime:{value:1,max:null,short:"CIRCUMSTANCE.CRIME",label:"CIRCUMSTANCE.CRIME",folmula:null,variable:"CIRCUMSTANCE.CRIME",substitution:false},
        life:{value:1,max:null,short:"CIRCUMSTANCE.LIFE",label:"CIRCUMSTANCE.LIFE",folmula:null,variable:"CIRCUMSTANCE.LIFE",substitution:false},
        love:{value:1,max:null,short:"CIRCUMSTANCE.LOVE",label:"CIRCUMSTANCE.LOVE",folmula:null,variable:"CIRCUMSTANCE.LOVE",substitution:false},
        cluture:{value:1,max:null,short:"CIRCUMSTANCE.CULTURE",label:"CIRCUMSTANCE.CULTURE",folmula:null,variable:"CIRCUMSTANCE.CULTURE",substitution:false},
        combat:{value:1,max:null,short:"CIRCUMSTANCE.COMBAT",label:"CIRCUMSTANCE.COMBAT",folmula:null,variable:"CIRCUMSTANCE.COMBAT",substitution:false}
      }
    }

    if(!data.data.combat){
      data.data.combat ={
        reflex:{value:1,max:9,short:"COMBAT.REFLEX",label:"COMBAT.REFLEX",folmula:null,variable:"COMBAT.REFLEX",substitution:false},
        arms:{value:1,max:9,short:"COMBAT.ARMS",label:"COMBAT.ARMS",folmula:null,variable:"COMBAT.ARMS",substitution:false},
        damage:{value:1,max:9,short:"COMBAT.DAMAGE",label:"COMBAT.DAMAGE",folmula:null,variable:"COMBAT.DAMAGE",substitution:false}
      };
    }

    if(!data.data.status){
      data.data.status ={
        bpmajorWounds:{type:"Boolean",value:false},
        mpmajorWounds:{type:"Boolean",value:false},
        majorWoundsOffset:{value:0,max:2,short:"STATUS.MajorWoundesOffsetS", label:"STATUS.MajorWoundesOffsetL",folmula:null,auto:true,variable:"STATUS.MajorWoundesOffsetL",substitution:false},
        death:{type:"Boolean",value:false},
        uncoscious:{type:"Boolean",value:false},
        sleep:{value:null,max:null,explain:"STATUS.SleepL",label:"STATUS.SleepS",auto:true,variable:"STATUS.SleepL",substitution:false},
        fumble:{value:1,max:6,explain:"STATUS.FumbleL",label:"STATUS.FumbleS",auto:true,variable:"STATUS.FumbleS",substitution:false},
        turn:{type:"Boolean",value:false},
        alert:{type:"Boolean",value:false},
        trauma:{value:0,max:null,explain:"STATUS.TraumaL",label:"STATUS.TraumaS",auto:true,variable:"STATUS.TraumaS",substitution:false},
        allonoff:{type:"Boolean",value:false},
        secondhaven:{type:"Boolean",value:false},
        reaction:{value:null},
        size:{value:null},
        drop:{value:null}
      };
    }
    if(!data.data.status.unconscious){
      data.data.status.unconscious = {type:"Boolean",value:false};
    }

    if(!data.data.aptitude){
      data.data.aptitude = {
        body:{value: 3, short:"APTITUDE.BODY", label:"APTITUDE.BODY", folmula:null, variable:"APTITUDE.BODY", substitution:false},
        mind:{value:3, short:"APTITUDE.MIND", label:"APTITUDE.MIND", folmula:null, variable:"APTITUDE.MIND", substitution:false}
      }
    }

    if(!data.data.infos){
      data.data.infos = {name: "",homeland:"",sex:"",age:"",style:"",likes:"",dislikes:"",team:"",alliance:"",hierarchy:"",surface:"",language:"",favorite:"",haven:"",haven2:""}
    }

    if(!data.data.attribs){
      data.data.attribs = {
        alignment:{value: null, max:null,short: "ATTRIBS.ALIGNMENTS",label:"ATTRIBS.ALIGNMENTL",auto:true,variable:"ATTRIBS.ALIGNMENTS",substitution:false},
        bp:{value:null,max:null,short: "ATTRIBS.BPS",label:"ATTRIBS.BPL",auto:true,variable:"ATTRIBS.BPS",substitution:false},
        mp:{value:null,max:null,short: "ATTRIBS.MPS",label:"ATTRIBS.MPL",auto:true,variable:"ATTRIBS.MPS",substitution:false},
        wallet:{value:null,max:null,short: "ATTRIBS.WPS",label:"ATTRIBS.WPL",auto:true,variable:"ATTRIBS.WPS",substitution:false},
        drp:{value:null,max:null,short: "ATTRIBS.DRPS",label:"ATTRIBS.DRPL",auto:true,variable:"ATTRIBS.DRPS",substitution:false}
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

    if(!data.data.hobby){
      data.data.hobby = this.actor.data.data.hobby;
      /*data.data.hobby = {
        subcluture:{
          abnormal:{type: "Boolean", value: false},
          kawai:{type: "Boolean", value: false},
          outrageous:{type: "Boolean", value: false},
          fanatic:{type: "Boolean", value: false, label: ""},
          otaku:{type: "Boolean", value: false, label: ""}
        },
        culture:{
          music:{type: "Boolean", value: false, label: ""},
          trend:{type: "Boolean", value: false, label: ""},
          reading:{type: "Boolean", value: false, label: ""},
          perform:{type: "Boolean", value: false, label: ""},
          art:{type: "Boolean", value: false, label: ""}
        },
        earnest:{
          cavil:{type: "Boolean", value: false, label: ""},
          meddling:{type: "Boolean", value: false, label: ""},
          housework:{type: "Boolean", value: false, label: ""},
          swot:{type: "Boolean", value: false, label: ""},
          health:{type: "Boolean", value: false, label: ""}
        },
        holiday:{
          outdoor:{type: "Boolean", value: false, label: ""},
          craft:{type: "Boolean", value: false, label: ""},
          sport:{type: "Boolean", value: false, label: ""},
          celebrity:{type: "Boolean", value: false, label: ""},
          travel:{type: "Boolean", value: false, label: ""}
        },
        comfort:{
          nurture:{type: "Boolean", value: false, label: ""},
          lonely:{type: "Boolean", value: false, label: ""},
          killtime:{type: "Boolean", value: false, label: ""},
          creed:{type: "Boolean", value: false, label: ""},
          wabisabi:{type: "Boolean", value: false, label: ""}
        },
        redLight:{
          adult:{type: "Boolean", value: false, label: ""},
          eat:{type: "Boolean", value: false, label: ""},
          gamble:{type: "Boolean", value: false, label: ""},
          gossip:{type: "Boolean", value: false, label: ""},
          fashion:{type: "Boolean", value: false, label: ""}
        }
      }*/
    }

    if(!data.data.scenario){
      data.data.scenario = [{title : null, dd : null, day : null, karma :null,exp:null,note:null}]
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

    data.data.karmaSortable = game.settings.get("satasupe", "karmaSortable");
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
        if(!data.items[i].data.count){
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
    
    data.data.equipmentplace.normal = Math.ceil(data.data.equipmentplace.normal*10)/10;
    data.data.equipmentplace.vehicle = Math.ceil(data.data.equipmentplace.vehicle*10)/10;
    data.data.equipmentplace.haven = Math.ceil(data.data.equipmentplace.haven*10)/10;
    data.data.equipmentplace.haven2 = Math.ceil(data.data.equipmentplace.haven2*10)/10;
    data.data.equipmentplace.other = Math.ceil(data.data.equipmentplace.other*10)/10;
    

    for(let i = 0; i < data.items.length ; i++){
      if(data.items[i].type == 'item'){
        for(let [key, value] of Object.entries(data.data.addcapacity)){
          if(value.capacity !==0){
            if(data.items[i].data.storage == key) {
              if(!data.items[i].data.count){
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
    }

    /*for(let [key, value] of Object.entries(data.data.addcapacity)){
      if(value.capacity !==0){
        data.data.addcapacity[key]['equipmentplace'] = Math.ceil(data.data.addcapacity[key]['equipmentplace']);
      }
    }*/

    data.data.equipmentcapacity.other = 99;
    if(data.data.equipmentplace.haven > Number(data.data.circumstance.life.value)){
      data.data.equipmentcapacity.comfort = 10 - Number(data.data.equipmentplace.haven) + Number(data.data.circumstance.life.value);
      data.data.equipmentcapacity.comfort = Math.ceil(data.data.equipmentcapacity.comfort);
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
        data.data.equipmentcapacity.comfort2 = Math.ceil(data.data.equipmentcapacity.comfort2);
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

    data.data.tablelist = Array.from(game.tables);
    for(let u = 0; u < data.data.tablelist.length; u++){
      if(data.data.tablelist[u].visible == false){
        data.data.tablelist.splice(u, 1);
      }
    }

    data.data.actorid = this.actor.id;

    data.data.showchatpalette = game.settings.get("satasupe", "showchatpalette");

    data.data.fvttbcdiceuse = false;
    if(game.modules.get('fvtt-bcdice')?.active){
      data.data.fvttbcdiceuse = true;
    }

    var list = game.settings.get("satasupe", "bcdicelist");
    data.data.bcdicelist = list.game_system;
    return data;
  }

  /* -------------------------------------------- */

  _prepareCharacterItems(sheetData){
    const actorData = sheetData.data;
    const karma = [];
    const gear = [];
    const investigation = [];
    const chatpalette = [];
    for(let i of sheetData.items){
      let item = i.data;
      i.img = i.img || CONST.DEFAULT_ICON;
      if(i.type ==="item"){
        gear.push(i);
      }
      else if(i.type ==="karma"){
        karma.push(i);
      }
      else if(i.type ==="investigation"){
        investigation.push(i);
      }
      else if(i.type ==="chatpalette"){
        chatpalette.push(i);
      }
    }
    actorData.gear = gear;
    actorData.karma = karma; 
    actorData.investigation = investigation;
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

    html.find('th.characteristics.title.change').on("click", this._variablesum.bind(this));

    html.on("drop", this._dropchat.bind(this));

    html.find('.all-on-off-button').click(ev =>{
      const nowonoff = this.actor.data.data.status.allonoff.value;
      this._allonoffToggle(nowonoff);
    });
    html.find('a.table-show-hide').on("click", this._tableshowblind.bind(this));

    html.find('a.infomation').on("click", this._titleinfomation.bind(this));

    html.find('.check-button').on("click", this._rollbutton.bind(this));
    html.find('.table-button').on("click", this._tablebutton.bind(this));
    html.find('.loadclipbord').on("click",this._loadclipbord.bind(this));
    html.find('.loadfvttbcdice').on("click", this._loadfvttbcdice.bind(this));

    html.find('.favorite-button').click( ev => {this.createFavorite(ev);});

    html.find('.alignmentroll').on("click", this._createAlignment.bind(this));
    html.find('.ageroll').on("click", this._createAge.bind(this));
    html.find('.sexroll').on("click", this._createSex.bind(this));

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

    /*
    html.find(".show-detail").on("click", this._onItemSummary.bind(this));
    html.find(".close-detail").on("click", this._offItemSummary.bind(this));
    */
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
      const system = $(ev.currentTarget).parent().parent().parent().parent().parent().prev('div.bcdicesystem').children('.bcdicetable').val();
      this._sendMessage(ev, index, id, system);
    });
  }

  async _variablesum(event){
    for(let n=0; n<this.actor.data.data.variable.length;n++){
      if(n==10) break
      if((this.actor.data.data.variable[n].title != "") && (this.actor.data.data.variable[n].title != null)){
        await this.actor.updateVariableSection( n, this.actor.data.data.variable[n].title, 'title');
      }
    }
  }

  async _tablebutton(event){
    event.preventDefault();
    const tname = event.currentTarget.dataset.tname;
    var id = "";
    let change = false;
    const rule = game.settings.get("satasupe", "originaltable");
    if(tname!="origin"){
      let tablelist = Array.from(game.tables);
      for(let i=0; i < tablelist.length; i++){
        if(tablelist[i].name == event.currentTarget.value){
          id = tablelist[i]._id;
          change = true;
        }
      }
    }
    if(tname=="origin"){
      id = event.currentTarget.name;
      const table = game.tables.get(id);
      event.currentTarget.disabled = true;
      let tableRoll = table.roll();
      await table.draw(tableRoll);
      event.currentTarget.disabled = false;
    }else if(change && rule){
      const table = game.tables.get(id);
      event.currentTarget.disabled = true;
      let tableRoll = table.roll();
      await table.draw(tableRoll);
      event.currentTarget.disabled = false;
    }else{
      this._bcdicesend(event, tname, 0);
    }
  }

  async _loadfvttbcdice(event){
    event.preventDefault();
    const actor = this.object.data;
    const copy = duplicate(this.object.data);
    var data = game.users.get(game.userId).data.flags["fvtt-bcdice"];
    var tab = data["macro-data"];
    const send = await LoadDialog._createfvttbcdicedialog(tab);
    var variable = [];
    var formula = [];
    var replace = tab.replacements.split(/\r\n|\n/);
    for(let a=0;a<replace.length;a++){
      if(replace[a].match(/=/g)){
        let sp = replace[a].split(/(?<=^[^=]+?)=/);
        if(sp[1].match(/\{.*?\}/g)){
          sp[1] = sp[1].replace(/\{/g,"");
          sp[1] = sp[1].replace(/\}/g,"");
        }
        let ok = false;
        for(let l=0;l<actor.data.variable.length;l++){
          if(actor.data.variable[l].variable == sp[0]){
            ok = true;
          }
        }
        if(!ok){
          variable.push({title:sp[1], variable: sp[0], substitution: true});
        }
      }
    }
    for(let c=0;c<variable.length;c++){
      let tar = variable[c].variable;
      let regexp = new RegExp(tar, 'g');
      let rep = "\{" + tar + "\}";
      for(let d=0;d<variable.length;d++){
        if(variable[d].title.match(regexp)){
          variable[d].title = variable[d].title.replace(regexp,rep);
        }
      }
    }
    copy.data.variable = copy.data.variable.concat(variable);
    await this.actor.update({'data.variable':copy.data.variable});
    for(let n=0; n<this.actor.data.data.variable.length;n++){
      if((this.actor.data.data.variable[n].title != "") && (this.actor.data.data.variable[n].title != null)){
        await this.actor.updateVariableSection( n, this.actor.data.data.variable[n].title, 'title');
      }
    }
    for(let n=0; n<this.actor.data.data.variable.length;n++){
      if((this.actor.data.data.variable[n].title != "") && (this.actor.data.data.variable[n].title != null)){
        await this.actor.updateVariableSection( n, this.actor.data.data.variable[n].title, 'title');
      }
    }
    let choice = send.get('select-tab');
    var alllist = [];
    if(choice == "all"){
      for(let b = 0;b<tab.tabs.length;b++){
        var list = tab.tabs[b];
        for(let i =0; i< list.headers.length;i++){
          for(let j =0;j<list.headers[i].macros.length;j++){
            alllist.push(list.headers[i].macros[j]);
          }
        }
      }
    }else{
      var list = tab.tabs[choice];
      for(let i =0; i< list.headers.length;i++){
        for(let j =0;j<list.headers[i].macros.length;j++){
          alllist.push(list.headers[i].macros[j]);
        }
      }
    }
    for(let k=0;k<alllist.length;k++){
      if(alllist[k].macro.match(/^x\d|^rep\d|^repeat\d/)){
        let str = alllist[k].macro.match(/ /g);
        if(str.length > 1){
          let re = alllist[k].macro.split(/(?<=^x\d )|(?<=^rep\d )|(?<=^repeat\d )/);
          let sp = re[1].split(/(?<=^[^ ]+?) /);
          formula.push({text:`${re[0]}${sp[0]}`,message:sp[1]})
        }else{
          formula.push({text:alllist[k].macro,message:""});
        }
      }else{
        if(alllist[k].macro.match(/ /)){
          let sp = alllist[k].macro.split(/(?<=^[^ ]+?) /);
          formula.push({text:sp[0],message:sp[1]});
        }else{
          formula.push({text:alllist[k].macro,message:""});
        }
      }
    }
    if(formula.length > 0){
      for(let e=0;e<variable.length;e++){
        let tar = variable[e].variable;
        let regexp = new RegExp(tar, 'g');
        let rep = "\{" + tar + "\}";
        for(let f=0;f<formula.length;f++){
          if(formula[f].text.match(regexp)){
            formula[f].text = formula[f].text.replace(regexp,rep);
          }
        }
      }
      this._createloadChatpalettetitle(event, formula);
    }
  }

  async _loadclipbord(event){
    event.preventDefault();
    const actor = this.object.data;
    const copy = duplicate(this.object.data);
    const send = await LoadDialog._createclipborddialog();
    let text = send.get('clipbord-data');
    text = text.replace(/[！-～]/g, function(s) {
      return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);});
    text = text.replace(/　/g," ");
    var data = text.split(/\r\n|\n/);
    var variable = [];
    var formula = [];
    for(let i=0; i<data.length;i++){
      if(data[i].match(/^\/\//)){
        if(data[i].match(/=/g)){
          let sp = data[i].split(/(?<=^[^=]+?)=/);
          sp[0] = sp[0].replace(/^\/\//,"");
          if(sp[1].match(/\{\{|\}\}/g)){
            if(sp[1].match(/\{.*?\}/g)){
              sp[1] = sp[1].replace(/\{\{/g,"{");
              sp[1] = sp[1].replace(/\}\}/g,"}");
            }
          }
          let ok = false
          for(let k=0;k<actor.data.variable.length;k++){
            if(actor.data.variable[k].variable == sp[0]){
              ok = true;
            }
          }
          if(!ok){
            variable.push({title:sp[1], variable: sp[0], substitution: true});
          }
        }
      }else if(data[i].match(/^x\d|^rep\d|^repeat\d/)){
        let str = data[i].match(/ /g);
        if(str.length > 1){
          let re = data[i].split(/(?<=^x\d )|(?<=^rep\d )|(?<=^repeat\d )/);
          let sp = re[1].split(/(?<=^[^ ]+?) /);
          formula.push({text:`${re[0]}${sp[0]}`,message:sp[1]})
        }else{
          formula.push({text:data[i],message:""});
        }
      }else{
        if(data[i].match(/ /)){
          let sp = data[i].split(/(?<=^[^ ]+?) /);
          formula.push({text:sp[0],message:sp[1]});
        }else{
          formula.push({text:data[i],message:""});
        }
      }
    }
    copy.data.variable = copy.data.variable.concat(variable);
    await this.actor.update({'data.variable':copy.data.variable});
    for(let n=0; n<this.actor.data.data.variable.length;n++){
      if((this.actor.data.data.variable[n].title != "") && (this.actor.data.data.variable[n].title != null)){
        await this.actor.updateVariableSection( n, this.actor.data.data.variable[n].title, 'title');
      }
    }
    for(let n=0; n<this.actor.data.data.variable.length;n++){
      if((this.actor.data.data.variable[n].title != "") && (this.actor.data.data.variable[n].title != null)){
        await this.actor.updateVariableSection( n, this.actor.data.data.variable[n].title, 'title');
      }
    }
    if(formula.length > 0){
      this._createloadChatpalettetitle(event, formula);
    }
  }

  async _createloadChatpalettetitle(event, formula){
    if( !this.actor.getItemIdByName(game.i18n.localize(SATASUPE.newChatpaletteName))) return this.createloadChatpalette( event, game.i18n.localize(SATASUPE.newChatpaletteName), formula, false);
    let index = 0;
    let chatpaletteName = game.i18n.localize(SATASUPE.newChatpaletteName) + ' ' + index;
    while( this.actor.getItemIdByName(chatpaletteName)){
      index++;
      chatpaletteName = game.i18n.localize(SATASUPE.newChatpaletteName) + ' ' + index;
    }
    return this.createloadChatpalette(event, chatpaletteName, formula,false);
  }

  async createloadChatpalette(event, chatpaletteName, formula, option){
    const data= {
      name:chatpaletteName,
      type: 'chatpalette',
      data:{
        chatpalette:{
          chat : formula,
          variable : []
        }
      }
    }
    const created = await this.actor.createEmbeddedEntity('Item', data, { renderSheet: option});
    return created;
  }

  async _rollbutton(event){
    event.preventDefault();
    console.log(this.object)
    const char = event.currentTarget.dataset.char;
    const actor = this.object.data;
    const copy = duplicate(this.object.data.data);
    let setting = {nobpwound:false,nompwound:false,nooverwork:false,killstop:false,nompcost:true};
    if(actor.data.settings){
      setting = actor.data.settings;
    }

    let value = "";
    if(char == "crime"){
      value = actor.data.circumstance.crime.value;
    }else if(char == "life"){
      value = actor.data.circumstance.life.value;
    }else if(char == "love"){
      value = actor.data.circumstance.love.value;
    }else if(char == "culture"){
      value = actor.data.circumstance.cluture.value;
    }else if(char == "combat"){
      value = actor.data.circumstance.combat.value;
    }else if(char == "body"){
      value = actor.data.aptitude.body.value;
    }else if(char == "mind"){
      value = actor.data.aptitude.mind.value;
    }else if(char == "arms"){
      value = actor.data.combat.arms.value;
    }else if(char == "generic"){
      value = 0;
    }else if(char == "alignment"){
      value = actor.data.attribs.alignment.value;
    }
    const indata = await CheckDialog._createCheckdialog(char, value, setting);

    const fumble = actor.data.status.fumble.value;
    var bpwounds = 0;
    var mpwounds = 0;
    var overwork = 0;
    if(Number(indata.get('overwork')) == 1){
      overwork = 0;
      copy.settings.nooverwork = true;
    }else{
      overwork = Number(actor.data.status.sleep.value);
      copy.settings.nooverwork = false;
    }
    if(Number(indata.get('bpwound')) == 1){
      bpwounds = 0;
      copy.settings.nobpwound = true;
    }else if(actor.data.attribs.bp.value <= 5){
      bpwounds = 1;
      copy.settings.nobpwound = false;
    }else{
      bpwounds = 0;
      copy.settings.nobpwound = false;
    }
    if(Number(indata.get('mpwound')) == 1){
      bpwounds = 0;
      copy.settings.nompwound = true;
    }else if(actor.data.attribs.mp.value <= 5){
      bpwounds = 1;
      copy.settings.nompwound = false;
    }else{
      bpwounds = 0;
      copy.settings.nompwound = false;
    }
    var text = ""
    var kill = "";
    if(Number(indata.get('kill'))!=0){
      kill = Number(indata.get('kill'));
    }
    if(Number(indata.get('killstop')) == 1){
      copy.settings.killstop = true;
    }else{
      copy.settings.killstop = false;
    }

    if(Number(indata.get('cost')) != 1){
      copy.settings.nompcost = false;
      copy.attribs.mp.value -= Number(indata.get('boost'));
      await this.object.update({'data' : copy});
    }else{
      copy.settings.nompcost = true;
      await this.object.update({'data' : copy});
    }

    if(char == "generic"){
      if((Number(indata.get('killstop'))==1)&&(kill != "")){
        text = `${value+Number(indata.get('roll'))+Number(indata.get('boost'))-bpwounds-mpwounds-overwork}R>=${Number(indata.get('difficulty'))}[${Number(indata.get('success'))},${Number(indata.get('fumble'))+fumble},${kill}S]`;
      }else if(kill != ""){
        text = `${value+Number(indata.get('roll'))+Number(indata.get('boost'))-bpwounds-mpwounds-overwork}R>=${Number(indata.get('difficulty'))}[${Number(indata.get('success'))},${Number(indata.get('fumble'))+fumble},${kill}]`;
      }else{
        text = `${value+Number(indata.get('roll'))+Number(indata.get('boost'))-bpwounds-mpwounds-overwork}R>=${Number(indata.get('difficulty'))}[${Number(indata.get('success'))},${Number(indata.get('fumble'))+fumble}]`;
      }

    }else if(char == "alignment"){
      if(Number(indata.get('roll'))>0){
        text = `SR${value}+${Number(indata.get('roll'))}`
      }else if(Number(indata.get('roll'))<0){
        text = `SR${value}${Number(indata.get('roll'))}`
      }else{
        text = `SR${value}`
      }
    }else if(char == "arms"){
      if((Number(indata.get('killstop'))==1)&&(kill != "")){
        text = `${value+Number(indata.get('roll'))+Number(indata.get('boost'))-bpwounds-mpwounds-overwork}R>=${Number(indata.get('difficulty'))}[${Number(indata.get('success'))},${Number(indata.get('fumble'))+fumble},${kill}S]`;
      }else if(kill != ""){
        text = `${value+Number(indata.get('roll'))+Number(indata.get('boost'))-bpwounds-mpwounds-overwork}R>=${Number(indata.get('difficulty'))}[${Number(indata.get('success'))},${Number(indata.get('fumble'))+fumble},${kill}]`;
      }else{
        text = `${value+Number(indata.get('roll'))+Number(indata.get('boost'))-bpwounds-mpwounds-overwork}R>=${Number(indata.get('difficulty'))}[${Number(indata.get('success'))},${Number(indata.get('fumble'))+fumble}]`;
      }
    }else{
      text = `${value+Number(indata.get('roll'))+Number(indata.get('boost'))-bpwounds-mpwounds-overwork}R>=${Number(indata.get('difficulty'))}[${Number(indata.get('success'))},${Number(indata.get('fumble'))+fumble}]`;
    }
    this._bcdicesend(event, text, char);
  }

  static async _bcdiceback(text, system, option){
    var server = game.settings.get("satasupe", "BCDice");
    var url = "";
    if(option){
      var param = "command=" + text;
      url = server + "/game_system/" + system + "/roll?" + param;
    }else{
      url = server + text;
    }
    return new Promise(function(resolve){   
      var request = new XMLHttpRequest();
      request.open("GET", url, true);
      request.responseType = 'json';
      request.onload = function(){
        if(request.status == 200){
          var data = this.response;
          resolve(data);
        }
      };
      request.send();

      request.onerror=function(){
        console.log("Server 1 connect error");
        var request2 = new XMLHttpRequest();
        var server2 = game.settings.get("satasupe", "BCDice2");
        var url2 = "";
      if(option){
        var param2 = "command=" + text;
        url2 = server2 + "/game_system/" + system + "/roll?" + param2;
      }else{
        url2 = server2 + text;
      }
      request2.open("GET",url2,true);
      request2.responseType = 'json';
      request2.onload = function(){
        if(request2.status == 200){
          var data2 = this.response;
          resolve(data2);
        }
      };
        request2.send();
      };
    });
  }

  async _bcdicesend(event, text, char){
    event.preventDefault();
    const up = this;
    const actor = duplicate(this.object.data);
    const speaker = this.object;
    const user = this.object.user ? this.object.user : game.user;
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
        var text_line = data.text.replace(/\r?\n/g,"<br>");
        var contenthtml = "<div><div style=\"word-break : break-all;\">" + text_line + "</div><div class=\"dice-roll\"><div class=\"dice-result\"><div class=\"dice-formula\">" + text + "</div><div class=\"dice-tooltip\" style=\"display:none;\">"+ belowtext + "</section></div></div>"; 
        ChatMessage.create({user:user._id,speaker: ChatMessage.getSpeaker({actor : speaker}),content:contenthtml},{});
        if(char = "alignment"){
          if((data.rands[0].value == 6) && (data.rands[1].value == 6)){
            actor.data.attribs.alignment.value -= 1;
            up.object.update({'data': actor.data});
          }else if((data.rands[0].value == 1) && (data.rands[1].value == 1)){
            actor.data.attribs.alignment.value += 1;
            up.object.update({'data': actor.data});
          }
        }
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
        var text_line = data2.text.replace(/\r?\n/g,"<br>");
        var contenthtml = "<div><div style=\"word-break : break-all;\">" + text_line + "</div><div class=\"dice-roll\"><div class=\"dice-result\"><div class=\"dice-formula\">" + text + "</div><div class=\"dice-tooltip\" style=\"display:none;\">"+ belowtext + "</section></div></div>"; 
        ChatMessage.create({user:user._id,speaker: ChatMessage.getSpeaker({actor : speaker}),content:contenthtml},{});
        if(char = "alignment"){
          if((data2.rands[0].value == 6) && (data2.rands[1].value == 6)){
            actor.data.attribs.alignment.value -= 1;
            up.object.update({'data': actor.data});
          }else if((data2.rands[0].value == 1) && (data2.rands[1].value == 1)){
            actor.data.attribs.alignment.value += 1;
            up.object.update({'data': actor.data});
          }
        }
      }
    };
      request2.send();
    };
  }

  _gearedit(event){
    const item = this.actor.getOwnedItem(event.currentTarget.dataset.key);
    item.sheet.render(true);
  }

  _geardragstart(event){
    let id = event.currentTarget.dataset;
    id.actorid = this.actor.id;
    event.originalEvent.dataTransfer.setData('text/plain', JSON.stringify(id));
  }

  async _emptyGroundCreate(event){
    let items = this.actor.data.items;
    let id = "";
    for(let item of items){
      if(item.type == "item"){
        if(item.data.data.storage == ""){
          id = item._id;
          await this.object.deleteOwnedItem(id);
        }
      }
    }
  }

  async _allItemDrop(event){
    let items = duplicate(this.actor.data.items);
    for(let item of items){
      if(item.type == "item"){
        if(item.data.storage != ""){
          item.data.storage = "";
        }
      }
    }
    await this.actor.update({'items' : items});
  }

  async _dropchat(event){
    var actor = duplicate(this.object.data);
    var data = JSON.parse(event.originalEvent.dataTransfer.getData('text/plain'));
    if(data.type == "Item"){
      let item;
      if (data.pack) {
        const pack = game.packs.get(data.pack);
        if (pack.metadata.entity !== 'Item') return;
        item = await pack.getEntity(data.id);
      } else if (data.data) {
        item = data;
      } else {
        item = game.items.get(data.id);
      }
      if(item.type == "chatpalette"){
        var vari =  duplicate(item.data.data.chatpalette.variable);
        for(let j=0 ; j <item.data.data.chatpalette.variable.length; j++){
          for(let i = 0 ; i < actor.data.variable?.length;i++){
            if(actor.data.variable[i]?.variable == item.data.data.chatpalette.variable[j].variable){
              vari[j] = {};
            }
          }
        }
        for(let k = vari.length; k>0;k--){
          const d = vari[k-1];
          if(!Object.keys(vari[k-1]).length){
            vari.splice(k-1,1);
          }
        }
        actor.data.variable = actor.data.variable.concat(vari);
        await this.actor.update({'data.variable':actor.data.variable});
      }
    }    
  }

  async _geardrop(event){
    var id = JSON.parse(event.originalEvent.dataTransfer.getData('text/plain'));
    let dataset = event.currentTarget.dataset;
    let items = duplicate(this.actor.data.items);
    let value = 0;
    for(let item of items){
      if(item._id === id.key){
        if(!item.data.count){
          if(item.data.typep){
            if(item.data.props.minivalue > 0){
              value = item.data.props.minivalue / 10;
            }else{
              value = 1;
            }
          }else{
            value = 1;
          }
        }
        if((Number(dataset.nowcontain) + value) <= Number(dataset.capacity)){
          if((dataset.placetype == 'vehicle') && (item.data.typev||(item.data.typep&&(item.data.props.special.normalstorage.value||item.data.props.special.room.value&&(dataset.habitable == 'false'))))){
          }else{
            if((dataset.placetype == 'normal')&&(item.data.typep&&item.data.props.special.room.value)){}else{
              if(((dataset.placetype == 'haven')||(dataset.placetype == 'haven2'))&&(item.data.typep&&item.data.props.special.normalstorage.value)){}else{
                if(((item.data.typep&&(item.data.props.addcapacity !== 0))||(item.data.typeg&&(item.data.gadjet.addcapacity !== 0)))&&(dataset.placetype == item.name)){}else{
                  item.data.storage = dataset.placetype;
                }
              }
            }
          }
        }
      }
    }
    await this.actor.update({'items' : items});
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
    const li = $(event.currentTarget);
    let system = li.prev('.bcdicetable').val();
    var request = new XMLHttpRequest();
    var server = game.settings.get("satasupe", "BCDice");
    var url = server + "/game_system/"+ system;
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

  async _allonoffToggle(nowonoff){
    const actor = duplicate(this.object.data);
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
      status.majorWoundsOffset.substitution = status.sleep.substitution = status.fumble.substitution = status.trauma.substitution = true;
      for(let i=0 ; i < variable?.length ; i++){
        variable[i].substitution = true;
      }
    }else{
      circumstance.crime.substitution = circumstance.life.substitution = circumstance.cluture.substitution = circumstance.love.substitution = circumstance.combat.substitution = false;
      aptitude.body.substitution = aptitude.mind.substitution = false;
      attribs.alignment.substitution = attribs.bp.substitution = attribs.mp.substitution = attribs.wallet.substitution = attribs.drp.substitution = false;
      combat.reflex.substitution = combat.arms.substitution = combat.damage.substitution = false;
      status.majorWoundsOffset.substitution = status.sleep.substitution = status.fumble.substitution = status.trauma.substitution = false;
      for(let j=0 ; j < variable?.length ; j++){
        variable[j].substitution = false;
      }
    }
    await this.object.update({'data':actor.data});
  }

  _onTableSort(event){
    let button = $(event.currentTarget);
    let sortItem = button.parent().attr('id');
    let sortFlag = button.parent().attr('sort-type');
    $(button).parent().parent().find('.sort-table-before').css('display', "");
    $(button).parent().parent().find('.sort-table-up').css('display', "none");
    $(button).parent().parent().find('.sort-table-down').css('display', "none");
    if(sortFlag == "desc"){
      $(button).prev().prev().hide();
      $(button).hide();
      $(button).prev().show();
    }else if(sortFlag == "asc"){
      $(button).prev().hide();
      $(button).hide();
      $(button).next().show();
    }else{
      $(button).hide();
      $(button).next().show();
    }
    $(button).parent().parent().children('th').removeAttr('sort-type');
    if(sortFlag == "asc"){
      sortFlag = "desc";
      button.parent().attr('sort-type', "desc");
    }else{
      sortFlag = "asc";
      button.parent().attr('sort-type', "asc");
    }
    this._sortTable(sortItem, sortFlag, button);  
  }

  _sortTable(sortItem, sortFlag, button){
    let arr = $(button).parent().parent().parent().next('tbody').children('.karma-row').sort(function(a, b){
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
    $(button).closest('table').find('.main-body').append(arr);
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

  async _createSex(event){
    event.preventDefault();
    const actor = duplicate(this.object.data);
    const roll = new Roll('1d2');
    roll.roll();
    let sex = null;
    if(roll._total == 1){
      sex = game.i18n.localize("SATASUPE.Male");
    }else{
      sex = game.i18n.localize("SATASUPE.Female");
    }
    const user = this.object.user ? this.object.user : game.user;
    actor.data.infos.sex = sex;
    if( game.modules.get('dice-so-nice')?.active){
      await game.dice3d.showForRoll(roll,user);
    }
    let text = `<br>=>` + game.i18n.format('SATASUPE.SexRollresult',{sex: sex});
    let chatData = {
      content : await roll.render(),
      user: user._id,
      speaker: ChatMessage.getSpeaker({actor : this.object}),
      flavor: game.i18n.localize("SATASUPE.SexRolltitle") + text,
    };
    ChatMessage.create(chatData);
    const updated = {_id:actor.id, data:actor.data};
    await this.object.update({'data.infos': actor.data.infos});
  }

  async _createAge(event){
    event.preventDefault();
    const actor = duplicate(this.object.data);
    const roll1 = new Roll('1d6');
    roll1.roll();
    let age = 0;
    let roll2 = null;
    if(roll1._total == 1){
      roll2 = new Roll('2d6+6');
      roll2.roll();
    }else if(roll1._total == 2){
      roll2 = new Roll('2d6+10');
      roll2.roll();
    }else if(roll1._total == 3){
      roll2 = new Roll('3d6+15');
      roll2.roll();
    }else if(roll1._total == 4){
      roll2 = new Roll('4d6+25');
      roll2.roll();
    }else if(roll1._total == 5){
      roll2 = new Roll('5d6+40');
      roll2.roll();
    }else if(roll1._total == 6){
      roll2 = new Roll('6d6+60');
      roll2.roll();
    }
    const user = this.object.user ? this.object.user : game.user;
    actor.data.infos.age = roll2._total;
    if( game.modules.get('dice-so-nice')?.active){
      await game.dice3d.showForRoll(roll1,user);
      game.dice3d.showForRoll(roll2,user);
    }
    let text = `<br>=>` + game.i18n.format('SATASUPE.AgeRollresult',{age: roll2._total});
    let chatData = {
      content : await roll2.render(),
      user: user._id,
      speaker: ChatMessage.getSpeaker({actor : this.object}),
      flavor: game.i18n.localize("SATASUPE.AgeRolltitle") + text,
    };
    ChatMessage.create(chatData);
    const updated = {_id:actor.id, data:actor.data};
    await this.object.update({'data.infos': actor.data.infos});
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
        var contenthtml = "<div><div style=\"word-break : break-all;\">" + favoriteText + "</div><div class=\"dice-roll\"><div class=\"dice-result\"><div class=\"dice-formula\">" + "FAVORITE TABLE" + "</div><div class=\"dice-tooltip\" style=\"display:none;\">"+ belowtext + "</section></div></div>"; 
        ChatMessage.create({user:user._id,speaker: ChatMessage.getSpeaker({actor : speaker}),content:contenthtml},{});
        actor.data.infos.favorite = favoriteText;
        up.object.update({'data': actor.data});
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
        var contenthtml = "<div><div style=\"word-break : break-all;\">" + favoriteText + "</div><div class=\"dice-roll\"><div class=\"dice-result\"><div class=\"dice-formula\">" + "FAVORITE TABLE" + "</div><div class=\"dice-tooltip\" style=\"display:none;\">"+ belowtext + "</section></div></div>"; 
        ChatMessage.create({user:user._id,speaker: ChatMessage.getSpeaker({actor : speaker}),content:contenthtml},{});
        actor.data.infos.favorite = favoriteText;
        up.object.update({'data': actor.data});
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

  _sendMessage(event,index, id, system){
    event.preventDefault();
    let actor = this.actor.data.data;
    let item = this.actor._data.items;
    const speaker = this.actor;
    const user = game.user;

    /*let list = game.settings.get("satasupe", "bcdicelist");
    var systemname;
    let map = new Map();
    list.game_system.forEach(obj=>{
      map.set(obj.id,obj);
    });
    systemname = (map.get(system)).name;*/

    for(let i = 0; i < item.length ; i++){
      if(item[i]._id !== id){
      }else{
        let text = item[i].data.chatpalette.chat[index].text ? item[i].data.chatpalette.chat[index].text : "";
        let message = item[i].data.chatpalette.chat[index].message ? item[i].data.chatpalette.chat[index].message : "";
        text = text.replace(/[！-～]/g, function(s) {
            return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);});
        text = text.replace(/　/g," ");
        let originaltext = text;
        let repal = text.match(/(?<=\{).*?(?=\})/g);
        const re = /\{.*?\}/;
        let ok = false;
        let repd = "";
        if(repal){
          for (let i = 0 ; i < repal.length ; i++){
            if(i!=0){
              repd += `, `;
            }
            for(let j = 0; j < actor.variable?.length ; j++){
              if((actor.variable[j].variable == repal[i]) && actor.variable[j].substitution){
                text = text.replace(re,Number(actor.variable[j].sum));
                repd += `${repal[i]} : ${Number(actor.variable[j].sum)}`;
                ok = true;
                break;
              }
            }
            if(!ok){
              for(let[key, value] of Object.entries(SATASUPE['referenceable'])){
                if((actor.circumstance[key]?.variable == repal[i]) && actor.circumstance[key]?.substitution){
                    text = text.replace(re,Number(actor.circumstance[key].value));
                    repd += `${repal[i]} : ${Number(actor.circumstance[key].value)}`;
                    ok = true;
                    break;
                }else if((actor.aptitude[key]?.variable == repal[i]) && actor.aptitude[key]?.substitution){
                  text = text.replace(re,Number(actor.aptitude[key].value));
                  repd += `${repal[i]} : ${Number(actor.aptitude[key].value)}`;
                  ok = true;
                  break;
                }else if((actor.attribs[key]?.variable == repal[i]) && actor.attribs[key]?.substitution){
                  text = text.replace(re,Number(actor.attribs[key].value));
                  repd += `${repal[i]} : ${Number(actor.attribs[key].value)}`;
                  ok = true;
                  break;
                }else if((actor.combat[key]?.variable == repal[i]) && actor.combat[key]?.substitution){
                  text = text.replace(re,Number(actor.combat[key].value));
                  repd += `${repal[i]} : ${Number(actor.combat[key].value)}`;
                  ok = true;
                  break;
                }else if((actor.status[key]?.variable == repal[i]) && actor.status[key]?.substitution){
                  text = text.replace(re,Number(actor.status[key].value));
                  repd += `${repal[i]} : ${Number(actor.status[key].value)}`;
                  ok = true;
                  break;
                }
              }
            }
            if(!ok){
              text = text.replace(re, '0');
              repd += `${repal[i]} : ${0}`;
              ui.notifications.error(game.i18n.localize("ALERTMESSAGE.ReplaceUnread"));
            }
            ok = false;
          }
          repd += `<br>`;
        }
        let add = text.match(/\((?:[^\(\)]|\([^\)]*\))*\)/g);
        if(add){
          for(let j = 0; j < add.length; j++){
            let dev = add[j].match(/[^\+|\-|\*|\/|\^|\(|\)|0-9]+/g);
            if(!dev){
              /*
              console.log(dev);
              var small = add[j].match(/(?:(?:[\+\-]+)?\d+)/g);
              console.log(small);
              let math =  0;
              for(let k=0; k < small.length; k++){
                if(small[k].match(/\-\-\d+/gi)){
                  math += parseInt(small[k].match(/\d+/gi),10);
                }else if(small[k].match(/\-\+\d+|\+\-\d+/gi)){
                  math -= parseInt(small[k].match(/\d+/gi),10);
                }else{
                  math += parseInt(small[k], 10);
                }
              }*/
              let num = add[j];
              num = num.replace(/\-\+/g,"-");
              num = num.replace(/\+\-/g,"-");
              num = num.replace(/\-\-/g,"+");
              num = num.replace(/\+\+/g,"+");
              num = num.replace(/\^/g,"**");
              var mat = new Function(`return ${num};`);
              let result = mat();
              if(!result){
                result = 0;
              }
              if(result == Infinity){
                ui.notifications.error("sum is infinity! so change 1");
                result = 1;
              }
              result = Math.round(result);
              text=text.replace(new RegExp(add[j].replace(/(\+|\-|\^|\*|\/|\(|\))/g,'\\$&'), 'g'),result);
            }
          }
        }
        console.log(`your send text is ${text}`);
        let sendtext = encodeURIComponent(text);
        var request = new XMLHttpRequest();
        var param = "command=" + sendtext;
        var server = game.settings.get("satasupe", "BCDice");
        var url = server + "/game_system/"+system+"/roll?" + param;
        request.open("GET",url,true);
        request.responseType = 'json';
        request.onload = function(){
          if(request.status==200){
            var data = this.response;

            let rands = data.rands;
            const secret = data.secret;
            let whisper = null;
            let blind = false;
            if(secret){
              whisper = [game.user._id];
            }else{
              let rollMode = game.settings.get("core", "rollMode");
              if (["gmroll", "blindroll"].includes(rollMode)) whisper = ChatMessage.getWhisperRecipients("GM");
              if (rollMode === "selfroll") whisper = [game.user._id];
              if (rollMode === "blindroll") blind = true;
            }
            let dicetotal =0;
            if (data.rands){
                let dicedata = {throws:[{dice:[]}]};
                for(let i = 0; i < rands.length ; i++){
                    let typenum ="";
                    let bcresult = "";
                    var addData = "";
                    var addData2 = "";
                    if(rands[i].sides == "100"){
                      let d100resu = rands[i].value;
                      dicetotal += rands[i].value;
                      bcresult =Math.floor(rands[i].value / 10);
                      let bcresult2 = rands[i].value % 10;
                      addData = {result:bcresult,resultLabel:bcresult*10,d100Result:d100resu,type: `d100`,vecors:[],options:{}};
                      addData2 = {result:bcresult2,resultLabel:bcresult2,d100Result:d100resu,type: `d10`,vecors:[],options:{}};
                      dicedata.throws[0].dice[i]=addData;
                      dicedata.throws[0].dice[rands.length+i]=addData2;
                    }else if(rands[i].kind == "tens_d10"){
                      typenum = rands[i].sides;
                      bcresult = rands[i].value;
                      dicetotal += rands[i].value;
                      addData =  {result:Math.floor(bcresult/10),resultLabel:bcresult,d100Result:bcresult,type: `d100`,vecors:[],options:{}};
                      dicedata.throws[0].dice[i]=addData;
                    }else{
                      typenum = rands[i].sides;
                      bcresult = rands[i].value;
                      dicetotal += rands[i].value;
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
            if(repd !== ""){
              belowtext += `<section class="tooltip-part"><div class="dice"><header class="part-header flexrow"><span class="part-header part-formula">${"Variable"}</span></header><div>${"Original Text"} : ${originaltext}<br>${repd}</div></div></section>`
            }
            for(let [k, v] of Object.entries(dicen)){
                let sumv = v.value.reduce(function(sum,element){return sum+element},0); 
                belowtext += "<section class=\"tooltip-part\"><div class=\"dice\"><header class=\"part-header flexrow\"><span class=\"part-formula part-header flexrow\">"
                belowtext += `${v.number}d${k}</span>`
                belowtext += "<span class=\"part-total flex0\">"
                belowtext +=  `${sumv}</span></header><ol class=\"dice-rolls\">`
                for(let dice of v.value){
                    belowtext += `<li class=\"roll die d${k}\">${dice}</li>`
                }
                belowtext += "</ol></div></section>"
            }
            var successtext = "</div>"
            if(data.success || data.failure || data.critical || data.fumble){
              if(data.success){
                if(data.critical){
                    successtext += "<div class=\"dice-total success critical\">";
                    successtext += game.i18n.localize("SATASUPE.CRITICAL");
                    successtext += "</div>";
                }else{
                    successtext += "<div class=\"dice-total success\">";
                    successtext += game.i18n.localize("SATASUPE.SUCCESS");
                    successtext += "</div>";
                }
            　}else if(!data.fumble){
                successtext += "<div class=\"dice-total failure\">";
                successtext += game.i18n.localize("SATASUPE.FAILURE");
                successtext += "</div>";
              }else{
                successtext += "<div class=\"dice-total failure fumble\">";
                successtext += game.i18n.localize("SATASUPE.FUMBLE");
                successtext += "</div>";
              }
            }else{
              if(!dicetotal){
                dicetotal = "";
              }
              successtext += `<h4 class="dice-total">${dicetotal}</h4>`;
            }
            var text_line = data.text.replace(/\r?\n/g,"<br>");
            var contenthtml = "<div><div style=\"word-break : break-all;\">" + "<br>"+ system + " : " +  text_line + "</div><div class=\"dice-roll\"><div class=\"dice-result\"><div class=\"dice-formula\">" + text + "</div><div class=\"dice-tooltip\" style=\"display:none;\">"+ belowtext + successtext + "</div></div></div>"; 
            ChatMessage.create({user:user.id,speaker:ChatMessage.getSpeaker({actor : speaker}),whisper:whisper,blind:blind,content:contenthtml,flavor:message});
            if(secret){
              let count = 0;
              for(let [o, l]of Object.entries(dicen)){
                count += l.number;
              }
              if(count == 0) count = 1;
              let roll = new Roll(`${count}d20`);
              roll.roll();
              roll.dice[0].options.hidden = true;
              roll.dice[0].options.colorset = "unseen_black";
              if(game.modules.get('dice-so-nice')?.active){
                game.dice3d.showForRoll(roll, game.user, true, null, false);
              }
              ChatMessage.create({roll:roll,user:user._id,speaker:ChatMessage.getSpeaker({actor:speaker}),blind:true,whisper:null,content:`Secret Dice are cast by ${game.user.name}!`})
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
        request.send();

        request.onerror=function(){
          console.log("Server 1 connect error");
          var request2 = new XMLHttpRequest();
        var param2 = "command=" + sendtext;
        var server2 = game.settings.get("satasupe", "BCDice2");
        var url2 = server2 + "/game_system/"+system+"/roll?" + param2;
        request2.open("GET",url2,true);
        request2.responseType = 'json';
        request2.onload = function(){
          if(request2.status==200){
            var data2 = this.response;
            let rands = data2.rands;
            const secret = data2.secret;
            let whisper = null;
            let blind = false;
            if(secret){
              whisper = [game.user._id];
            }else{
              let rollMode = game.settings.get("core", "rollMode");
              if (["gmroll", "blindroll"].includes(rollMode)) whisper = ChatMessage.getWhisperRecipients("GM");
              if (rollMode === "selfroll") whisper = [game.user._id];
              if (rollMode === "blindroll") blind = true;
            }
            let dicetotal =0;
            if (data2.rands){
                let dicedata = {throws:[{dice:[]}]};
                for(let i = 0; i < rands.length ; i++){
                  let typenum ="";
                  let bcresult = "";
                  var addData = "";
                  var addData2 = "";
                  if(rands[i].sides == "100"){
                    let d100resu = rands[i].value;
                    dicetotal += rands[i].value;
                    bcresult =Math.floor(rands[i].value / 10);
                    let bcresult2 = rands[i].value % 10;
                    addData = {result:bcresult,resultLabel:bcresult*10,d100Result:d100resu,type: `d100`,vecors:[],options:{}};
                    addData2 = {result:bcresult2,resultLabel:bcresult2,d100Result:d100resu,type: `d10`,vecors:[],options:{}};
                    dicedata.throws[0].dice[i]=addData;
                    dicedata.throws[0].dice[rands.length+i]=addData2;
                  }else if(rands[i].kind == "tens_d10"){
                    typenum = rands[i].sides;
                    bcresult = rands[i].value;
                    dicetotal += rands[i].value;
                    addData =  {result:Math.floor(bcresult/10),resultLabel:bcresult,d100Result:bcresult,type: `d100`,vecors:[],options:{}};
                    dicedata.throws[0].dice[i]=addData;
                  }else{
                    typenum = rands[i].sides;
                    bcresult = rands[i].value;
                    dicetotal += rands[i].value;
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
            if(repd !== ""){
              belowtext += `<section class="tooltip-part"><div class="dice"><header class="part-header flexrow"><span class="part-header part-formula">${"Variable"}</span></header><div>${"Original Text"} : ${originaltext}<br>${repd}</div></div></section>`
            }
            for(let [k, v] of Object.entries(dicen)){
              let sumv = v.value.reduce(function(sum,element){return sum+element},0); 
              belowtext += "<section class=\"tooltip-part\"><div class=\"dice\"><header class=\"part-header flexrow\"><span class=\"part-formula part-header flexrow\">";
              belowtext += `${v.number}d${k}</span>`;
              belowtext += "<span class=\"part-total flex0\">";
              belowtext +=  `${sumv}</span></header><ol class=\"dice-rolls\">`;
              for(let dice of v.value){
                  belowtext += `<li class=\"roll die d${k}\">${dice}</li>`;
              }
              belowtext += "</ol></div></section>";
            }
            var successtext = "</div><div class=\"test\"></div>";
            if(data2.success || data2.failure || data2.critical || data2.fumble){
                if(data2.success){
                    if(data2.critical){
                        successtext += "<div class=\"dice-total success critical\">";
                        successtext += game.i18n.localize("SATASUPE.CRITICAL");
                        successtext += "</div>";
                    }else{
                        successtext += "<div class=\"dice-total success\">";
                        successtext += game.i18n.localize("SATASUPE.SUCCESS");
                        successtext += "</div>";
                    }
                }else if(!data2.fumble){
                    successtext += "<div class=\"dice-total failure\">";
                    successtext += game.i18n.localize("SATASUPE.FAILURE");
                    successtext += "</div>";
                }else{
                    successtext += "<div class=\"dice-total failure fumble\">";
                    successtext += game.i18n.localize("SATASUPE.FUMBLE");
                    successtext += "</div>";
                }
            }else{
              if(!dicetotal){
                dicetotal = "";
              }
              successtext += `<h4 class="dice-total">${dicetotal}</h4>`;
            }
            var text_line2 = data2.text.replace(/\r?\n/g,"<br>");
            var contenthtml = "<div><div style=\"word-break : break-all;\">" + "<br>" + system + " : " + text_line2 + "</div><div class=\"dice-roll\"><div class=\"dice-result\"><div class=\"dice-formula\">" + text + "</div><div class=\"dice-tooltip\" style=\"display:none;\">"+ belowtext + successtext + "</div></div></div>"; 
            ChatMessage.create({user:user._id,speaker:ChatMessage.getSpeaker({actor : speaker}),whisper:whisper,blind:blind,content:contenthtml,flavor:message},{});
            if(secret){
              let count = 0;
              for(let [o, l]of Object.entries(dicen)){
                count += l.number;
              }
              if(count == 0) count = 1;
              let roll = new Roll(`${count}d20`);
              roll.roll();
              roll.dice[0].options.hidden = true;
              roll.dice[0].options.colorset = "unseen_black";
              if(game.modules.get('dice-so-nice')?.active){
                game.dice3d.showForRoll(roll, game.user, true, null, false);
              }
              ChatMessage.create({roll:roll,user:user._id,speaker:ChatMessage.getSpeaker(),blind:true,whisper:null,content:`Secret Dice are cast by ${game.user.name}!`})
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
  }
}
