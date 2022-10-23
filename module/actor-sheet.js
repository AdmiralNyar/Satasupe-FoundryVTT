import { SatasupeInvestigationSheet } from "./item/sheets/investigation.js";
import { SatasupeChatpaletteSheet} from "./item/sheets/chatpalette.js";
import { SATASUPE } from "./config.js";
import { CheckDialog} from "./apps/checkdialog.js";
import { LoadDialog} from "./apps/loaddialog.js";
import { SatasupeActor } from "./actor.js";
/**
 * Extend the basic ActorSheet with some very Satasupe modifications
 * @extends {ActorSheet}
 */
export class SatasupeActorSheet extends ActorSheet {

  /** @override */
  static get defaultOptions() {
    let rule = game.settings.get("satasupe", "showchatpalette");
    let initial = 'buttons'
    if(rule) initial = 'chatpalette';
    return mergeObject(super.defaultOptions, {
      classes: ["satasupe", "sheet", "actor", "character"],
      template: "systems/satasupe/templates/actor-sheet.html",
      width: 820,
      height: 660,
      dragDrop: [{dragSelector: '.item', dropSelector: null}],
			tabs: [{navSelector: '.sheet-tabs', contentSelector: '.sheet-body', initial: initial}]
    });
  }

  /** @override */
  get template() {
    if(this.actor.type === "npc"){
      if ( !game.user.isGM && this.actor.limited ) return "systems/satasupe/templates/npclimit-sheet.html";
      return `systems/satasupe/templates/npc-sheet.html`;
    }else{
      return `systems/satasupe/templates/actor-sheet.html`;
    }
  }


  /* -------------------------------------------- */

  /** @override */
  async getData(options) {
    const context = await super.getData(options);
    const actorData = this.actor.toObject(false);
    context.system = actorData.system;
    context.editable = this.isEditable;
    context.dtypes = ["String", "Number", "Boolean"];

    if (this.actor.type == 'character') {
      this._prepareCharacterItems(context);
    }
    if (this.actor.type == 'npc') {
      this._prepareCharacterItems(context);
    }
    if(!context.system.circumstance){
      context.system.circumstance={
        crime:{value:1,max:null,short:"CIRCUMSTANCE.CRIME",label:"CIRCUMSTANCE.CRIME",folmula:null,variable:"CIRCUMSTANCE.CRIME",substitution:false},
        life:{value:1,max:null,short:"CIRCUMSTANCE.LIFE",label:"CIRCUMSTANCE.LIFE",folmula:null,variable:"CIRCUMSTANCE.LIFE",substitution:false},
        love:{value:1,max:null,short:"CIRCUMSTANCE.LOVE",label:"CIRCUMSTANCE.LOVE",folmula:null,variable:"CIRCUMSTANCE.LOVE",substitution:false},
        cluture:{value:1,max:null,short:"CIRCUMSTANCE.CULTURE",label:"CIRCUMSTANCE.CULTURE",folmula:null,variable:"CIRCUMSTANCE.CULTURE",substitution:false},
        combat:{value:1,max:null,short:"CIRCUMSTANCE.COMBAT",label:"CIRCUMSTANCE.COMBAT",folmula:null,variable:"CIRCUMSTANCE.COMBAT",substitution:false}
      }
    }

    if(!context.system.combat){
      context.system.combat ={
        reflex:{value:1,max:9,short:"COMBAT.REFLEX",label:"COMBAT.REFLEX",folmula:null,variable:"COMBAT.REFLEX",substitution:false},
        arms:{value:1,max:9,short:"COMBAT.ARMS",label:"COMBAT.ARMS",folmula:null,variable:"COMBAT.ARMS",substitution:false},
        damage:{value:1,max:9,short:"COMBAT.DAMAGE",label:"COMBAT.DAMAGE",folmula:null,variable:"COMBAT.DAMAGE",substitution:false}
      };
    }

    if(!context.system.status){
      context.system.status ={
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
    if(!context.system.status.unconscious){
      context.system.status.unconscious = {type:"Boolean",value:false};
    }

    if(!context.system.aptitude){
      context.system.aptitude = {
        body:{value: 3, short:"APTITUDE.BODY", label:"APTITUDE.BODY", folmula:null, variable:"APTITUDE.BODY", substitution:false},
        mind:{value:3, short:"APTITUDE.MIND", label:"APTITUDE.MIND", folmula:null, variable:"APTITUDE.MIND", substitution:false}
      }
    }

    if(!context.system.infos){
      context.system.infos = {name: "",homeland:"",sex:"",age:"",style:"",likes:"",dislikes:"",team:"",alliance:"",hierarchy:"",surface:"",language:"",favorite:"",haven:"",haven2:""}
    }

    if(!context.system.attribs){
      context.system.attribs = {
        alignment:{value: null, max:null,short: "ATTRIBS.ALIGNMENTS",label:"ATTRIBS.ALIGNMENTL",auto:true,variable:"ATTRIBS.ALIGNMENTS",substitution:false},
        bp:{value:null,max:null,short: "ATTRIBS.BPS",label:"ATTRIBS.BPL",auto:true,variable:"ATTRIBS.BPS",substitution:false},
        mp:{value:null,max:null,short: "ATTRIBS.MPS",label:"ATTRIBS.MPL",auto:true,variable:"ATTRIBS.MPS",substitution:false},
        wallet:{value:null,max:null,short: "ATTRIBS.WPS",label:"ATTRIBS.WPL",auto:true,variable:"ATTRIBS.WPS",substitution:false},
        drp:{value:null,max:null,short: "ATTRIBS.DRPS",label:"ATTRIBS.DRPL",auto:true,variable:"ATTRIBS.DRPS",substitution:false}
      };
    }
    if(!context.system.exp){
      context.system.exp ={
        combatpower:{value: null, max:null,short: "EXP.COMBATPOWERS",label:"EXP.COMBATPOWERS",folmula: null,auto:true},
        expgain:{value: null, max:null,short: "EXP.EXPGAINS",label:"EXP.EXPGAINL",folmula: null,auto:true},
        upkeep:{value: null, max:null,short: "EXP.UPKEEPS",label:"EXP.UPKEEPL",folmula: null,auto:true},
        mythos:{value: null, max:null,short: "EXP.MYTHOSS",label:"EXP.MYTHOSL",folmula: null,auto:true},
        san:{value: null, max:null,short: "EXP.SANS",label:"EXP.SANL",folmula: null,auto:true}
      }
    }

    if(!context.system.hobby){
      context.system.hobby = this.actor.context.system.hobby;
      /*context.system.hobby = {
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

    if(!context.system.scenario){
      context.system.scenario = [{title : null, dd : null, day : null, karma :null,exp:null,note:null}]
    }

    if(context.system.attribs.bp.value <= 5){
      if(context.system.attribs.bp.value <= 0){
        if(!context.system.status.unconscious.value) context.system.status.unconscious.value = true;
      }else if(context.system.attribs.mp.value > 0){context.system.status.unconscious.value = false;}
      if(context.system.attribs.mp.value <= 5){
        if(context.system.attribs.mp.value <= 0){
          if(!context.system.status.unconscious.value) context.system.status.unconscious.value = true;
        }else if(context.system.attribs.bp.value > 0){context.system.status.unconscious.value = false;}
        if(!context.system.status.mpmajorWounds.value) context.system.status.mpmajorWounds.value = true;
        if(!context.system.status.bpmajorWounds.value) context.system.status.bpmajorWounds.value = true;
      }else{
        if(!context.system.status.bpmajorWounds.value) context.system.status.bpmajorWounds.value = true;
        if(context.system.status.mpmajorWounds.value) context.system.status.mpmajorWounds.value = false;
      }
    }else{
      if(context.system.attribs.mp.value <= 5){
        if(context.system.attribs.mp.value <= 0){
          if(!context.system.status.unconscious.value) context.system.status.unconscious.value = true;
        }else if(context.system.attribs.bp.value > 0){context.system.status.unconscious.value = false;}
        if(!context.system.status.mpmajorWounds.value) context.system.status.mpmajorWounds.value = true;
        if(context.system.status.bpmajorWounds.value) context.system.status.bpmajorWounds.value = false;
      }else{
        if(context.system.status.bpmajorWounds.value) context.system.status.bpmajorWounds.value = false;
        if(context.system.status.mpmajorWounds.value) context.system.status.mpmajorWounds.value = false;
        if(context.system.status.unconscious.value) context.system.status.unconscious.value = false;
      }
    }

    if(context.system.status.trauma.value > 0 || context.system.status.trauma.value){
      context.system.attribs.mp.max = context.system.attribs.mp.max? (Number(context.system.attribs.mp.max) - Number(context.system.status.trauma.value)) : (10 -Number(context.system.status.trauma.value));
    }

    context.system.karmaSortable = game.settings.get("satasupe", "karmaSortable");
    if(context.system.attribs.wallet.value == null && context.system.circumstance.life.value != null) context.system.attribs.wallet.value=context.system.circumstance.life.value;
    context.system.exp.combatpower.value = (Number(context.system.circumstance.combat.value) * 2) + Number(context.system.aptitude.body.value);
    if(Number(context.system.exp.combatpower.value) < (Number(context.system.combat.reflex.value)+Number(context.system.combat.arms.value)+Number(context.system.combat.damage.value))){
      if(!context.system.status.alert.value) ui.notifications.error(game.i18n.localize("ALERTMESSAGE.CombatPoints"));
    }
    if(!context.system.combat.reflex.value || !context.system.combat.arms.value || !context.system.combat.damage.value){
      if(!context.system.status.alert.value) ui.notifications.error(game.i18n.localize("ALERTMESSAGE.CombatAttributes"));
    }

    if((context.system.aptitude.body.value < 3) || (context.system.aptitude.mind.value < 3) || !context.system.aptitude.mind.value || !context.system.aptitude.body.value){
      if(!context.system.status.alert.value) ui.notifications.error(game.i18n.localize("ALERTMESSAGE.AptitudePoints"));
    }
    
    context.system.usedexp = {};
    context.system.usedexp.value = 0;
    for (let [key, circumstance]of Object.entries(context.system.circumstance)){
      if(circumstance.value == 1 || circumstance.value == null){
      }else if(circumstance.value == 2){
      context.system.usedexp.value += 1;
      }else if(circumstance.value == 3){
        context.system.usedexp.value += 2;
      }else if(circumstance.value == 4){
        context.system.usedexp.value += 4;
      }else if(circumstance.value ==5){
        context.system.usedexp.value += 6;
      }else if(circumstance.value == 6){
        context.system.usedexp.value += 9;
      }else if(circumstance.value == 7){
        context.system.usedexp.value += 13;
      }else if(circumstance.value == 8){
        context.system.usedexp.value += 18;
      }else{}
    } 
    for (let [key, aptitude]of Object.entries(context.system.aptitude)){
      if(aptitude.value <= 3 || aptitude.value == null){
      }else if(aptitude.value == 4){
      context.system.usedexp.value += 1;
      }else if(aptitude.value == 5){
        context.system.usedexp.value += 2;
      }else if(aptitude.value == 6){
        context.system.usedexp.value += 4;
      }else if(aptitude.value ==7){
        context.system.usedexp.value += 10;
      }else if(aptitude.value == 8){
        context.system.usedexp.value += 18;
      }else{}
    } 

    context.system.usedexp.unused = 13 - context.system.usedexp.value + Number(context.system.exp.expgain.value) - Number(context.system.exp.upkeep.value);
    if(context.system.usedexp.unused < 0){
      if(!context.system.status.alert.value) ui.notifications.error(game.i18n.localize("ALERTMESSAGE.EXPPoints"));
    }

    context.system.equipmentcapacity={};
    context.system.equipmentplace={};
    context.system.addcapacity={};
    context.system.hobbychoicenumber=0;
    context.system.equipmentcapacity.normal = Number(context.system.circumstance.crime.value) + Number(context.system.aptitude.body.value);
    context.system.equipmentcapacity.haven = 10;
    context.system.equipmentcapacity.haven2 = 10;
    context.system.equipmentcapacity.vehicle = 0;
    context.system.equipmentcapacity.comfort=10;
    context.system.equipmentcapacity.comfort2=10;
    context.system.equipmentcapacity.add = 0;
    context.system.equipmentplace.normal = 0;
    context.system.equipmentplace.vehicle = 0;
    context.system.equipmentplace.add = 0;
    context.system.equipmentplace.haven = 0;
    context.system.equipmentplace.haven2 = 0;
    context.system.equipmentplace.other = 0;
    context.system.equipmentattribs={};
    context.system.equipmentattribs.security = 0;
    context.system.equipmentattribs.securityadd = 0;
    context.system.equipmentattribs.upkeep = 0;
    context.system.equipmentattribs.placeorder = 0;
    context.system.equipmentattribs.security2 = 0;
    context.system.equipmentattribs.securityadd2 = 0;
    context.system.equipmentattribs.placeorder2 = 0;
    context.system.equipmentattribs.vehiclehave = false;
    context.system.equipmentattribs.habitable = false;
    context.system.hobbynumerror = false;

    for(let i = 0; i < context.items.length ; i++){
      if(context.items[i].type == 'item'){
        if(context.items[i].system.typev&&Number(context.items[i].system.vehicle.capacity)){
          context.system.equipmentcapacity.vehicle = context.items[i].system.vehicle.capacity;
          context.system.equipmentattribs.habitable = context.items[i].system.vehicle.special.habitable.value || context.system.equipmentattribs.habitable;
        }
        if((Number(context.items[i].system.props.addcapacity) && context.items[i].system.typep) || (Number(context.items[i].system.gadjet.addcapacity) && context.items[i].system.typep)){
          context.system.equipmentcapacity.add += Number(context.items[i].system.props.addcapacity) + Number(context.items[i].system.gadjet.addcapacity);
        }
        if(!context.items[i].system.count){
          if(context.items[i].system.storage == 'normal') {
            if(context.items[i].system.typep && context.items[i].system.props.special.mini.value && (context.items[i].system.props.minivalue !== 0)){
              context.system.equipmentplace.normal += (context.items[i].system.props.minivalue / 10);
            }else{
              context.system.equipmentplace.normal +=1;
            }
          }
          if(context.items[i].system.storage == 'haven') {
            if(context.items[i].system.typep && context.items[i].system.props.special.mini.value && (context.items[i].system.props.minivalue !== 0)){
              context.system.equipmentplace.haven += (context.items[i].system.props.minivalue / 10);
            }else{
              context.system.equipmentplace.haven +=1;
            }
            if(context.items[i].system.typep && context.items[i].system.props.specialtext.furniture.value && (Number(context.items[i].system.props.specialtext.furniture.number) <= Number(context.system.circumstance.life.value))){
              context.system.equipmentplace.haven -=1;
            }
          }
          if(context.items[i].system.storage == 'haven2') {
            if(context.items[i].system.typep && context.items[i].system.props.special.mini.value && (context.items[i].system.props.minivalue !== 0)){
              context.system.equipmentplace.haven2 += (context.items[i].system.props.minivalue / 10);
            }else{
              context.system.equipmentplace.haven2 +=1;
            }
            if(context.items[i].system.typep && context.items[i].system.props.specialtext.furniture.value && (Number(context.items[i].system.props.specialtext.furniture.number) <= Number(context.system.circumstance.life.value))){
              context.system.equipmentplace.haven2 -=1;
            }
          }
          if(context.items[i].system.storage == 'vehicle') {
            if(context.items[i].system.typep && context.items[i].system.props.special.mini.value && (context.items[i].system.props.minivalue !== 0)){
              context.system.equipmentplace.vehicle += (context.items[i].system.props.minivalue / 10);
            }else{
              context.system.equipmentplace.vehicle +=1;
            }
          }
          if(!context.items[i].system.storage) {
            if(context.items[i].system.typep && context.items[i].system.props.special.mini.value && (context.items[i].system.props.minivalue !== 0)){
              context.system.equipmentplace.other += (context.items[i].system.props.minivalue / 10);
            }else{
              context.system.equipmentplace.other +=1;
            }
          }
        }

        context.system.equipmentattribs.vehiclehave = context.items[i].system.typev || context.system.equipmentattribs.vehiclehave;
        
        //
        if((context.items[i].system.typep && (context.items[i].system.props.addcapacity !==0))||(context.items[i].system.typeg && (context.items[i].system.gadjet.addcapacity !==0))){
          var addobj = new Object();
          addobj = {capacity:null};
          if(context.items[i].system.typep && (context.items[i].system.props.addcapacity !==0)){
            if(context.items[i].system.typeg && (context.items[i].system.gadjet.addcapacity !==0)){
              addobj['capacity']=Number(context.items[i].system.props.addcapacity)+Number(context.items[i].system.gadjet.addcapacity);
            }else{
              addobj['capacity']=Number(context.items[i].system.props.addcapacity);
            }
          }else{
            addobj['capacity']=Number(context.items[i].system.gadjet.addcapacity);
          }
          
          addobj['storage']=context.items[i].system.storage;
          addobj['equipmentplace']=0;
          context.system.addcapacity[context.items[i].name]=addobj;
        }

        if(context.items[i].system.typep && (context.items[i].system.props.specialtext.securityadd.value)) {
          if(context.items[i].system.storage == 'haven'){
            context.system.equipmentattribs.securityadd += parseInt(context.items[i].system.props.specialtext.securityadd.number,10);
          }else if(context.items[i].system.storage == 'haven2'){
            context.system.equipmentattribs.securityadd2 += parseInt(context.items[i].system.props.specialtext.securityadd.number,10);
          }
        }
        if(context.items[i].system.typep && context.items[i].system.props.specialtext.upkeepcost.value) context.system.equipmentattribs.upkeep += Number(context.items[i].system.props.specialtext.upkeepcost.number);
        if(context.items[i].system.typev && context.items[i].system.vehicle.specialtext.upkeepcost.value) context.system.equipmentattribs.upkeep += Number(context.items[i].system.vehicle.specialtext.upkeepcost.number);
        if(context.items[i].system.typew && context.items[i].system.weapon.specialtext.upkeepcost.value) context.system.equipmentattribs.upkeep += Number(context.items[i].system.weapon.specialtext.upkeepcost.number);
      }
    }
    
    context.system.equipmentplace.normal = Math.ceil(context.system.equipmentplace.normal*10)/10;
    context.system.equipmentplace.vehicle = Math.ceil(context.system.equipmentplace.vehicle*10)/10;
    context.system.equipmentplace.haven = Math.ceil(context.system.equipmentplace.haven*10)/10;
    context.system.equipmentplace.haven2 = Math.ceil(context.system.equipmentplace.haven2*10)/10;
    context.system.equipmentplace.other = Math.ceil(context.system.equipmentplace.other*10)/10;
    

    for(let i = 0; i < context.items.length ; i++){
      if(context.items[i].type == 'item'){
        for(let [key, value] of Object.entries(context.system.addcapacity)){
          if(value.capacity !==0){
            if(context.items[i].system.storage == key) {
              if(!context.items[i].system.count){
                if(context.items[i].system.typep && context.items[i].system.props.special.mini.value && (context.items[i].system.props.minivalue !== 0)){
                  context.system.addcapacity[key]['equipmentplace'] += (context.items[i].system.props.minivalue / 10);
                }else{
                  context.system.addcapacity[key]['equipmentplace'] +=1;
                }
		context.system.addcapacity[key]['equipmentplace'] = Math.ceil(context.system.addcapacity[key]['equipmentplace']*10)/10;
              }
            }
          }
        }
      }
    }

    /*for(let [key, value] of Object.entries(context.system.addcapacity)){
      if(value.capacity !==0){
        context.system.addcapacity[key]['equipmentplace'] = Math.ceil(context.system.addcapacity[key]['equipmentplace']);
      }
    }*/

    context.system.equipmentcapacity.other = 99;
    if(context.system.equipmentplace.haven > Number(context.system.circumstance.life.value)){
      context.system.equipmentcapacity.comfort = 10 - Number(context.system.equipmentplace.haven) + Number(context.system.circumstance.life.value);
      context.system.equipmentcapacity.comfort = Math.ceil(context.system.equipmentcapacity.comfort);
    }

    if(context.system.infos.haven == 'minami') context.system.equipmentattribs.placeorder = 9;
    if(context.system.infos.haven == 'chinatown') context.system.equipmentattribs.placeorder = 10;
    if(context.system.infos.haven == 'warship') context.system.equipmentattribs.placeorder = 8;
    if(context.system.infos.haven == 'civic') context.system.equipmentattribs.placeorder = 11;
    if(context.system.infos.haven == 'downtown') context.system.equipmentattribs.placeorder = 10;
    if(context.system.infos.haven == 'shaokin') context.system.equipmentattribs.placeorder = 7;
    if((Number(context.system.circumstance.life.value) + context.system.equipmentattribs.securityadd) > context.system.equipmentattribs.placeorder){
      context.system.equipmentattribs.security = (Number(context.system.circumstance.life.value) + context.system.equipmentattribs.securityadd);
    }else{
      context.system.equipmentattribs.security = context.system.equipmentattribs.placeorder;
    }

    if(context.system.status.secondhaven.value) {
      if(context.system.infos.haven2 == 'minami') context.system.equipmentattribs.placeorder2 = 9;
      if(context.system.infos.haven2 == 'chinatown') context.system.equipmentattribs.placeorder2 = 10;
      if(context.system.infos.haven2 == 'warship') context.system.equipmentattribs.placeorder2 = 8;
      if(context.system.infos.haven2 == 'civic') context.system.equipmentattribs.placeorder2 = 11;
      if(context.system.infos.haven2 == 'downtown') context.system.equipmentattribs.placeorder2 = 10;
      if(context.system.infos.haven2 == 'shaokin') context.system.equipmentattribs.placeorder2 = 7;
      if((Number(context.system.circumstance.life.value) + context.system.equipmentattribs.securityadd2) > context.system.equipmentattribs.placeorder2){
        context.system.equipmentattribs.security2 = (Number(context.system.circumstance.life.value) + context.system.equipmentattribs.securityadd2);
      }else{
        context.system.equipmentattribs.security2 = context.system.equipmentattribs.placeorder2;
      }
      if(context.system.equipmentplace.haven2 > Number(context.system.circumstance.life.value)){
        context.system.equipmentcapacity.comfort2 = 10 - Number(context.system.equipmentplace.haven2) + Number(context.system.circumstance.life.value);
        context.system.equipmentcapacity.comfort2 = Math.ceil(context.system.equipmentcapacity.comfort2);
      }
    }

    for(let [key, value] of Object.entries(context.system.hobby)){
      for(let [tag, choice]of Object.entries(context.system.hobby[key])){
        if(choice.value){
          context.system.hobbychoicenumber +=1;
        }
      }
    }
    if(context.system.hobbychoicenumber > Math.ceil((Number(context.system.circumstance.life.value)+Number(context.system.circumstance.cluture.value))/2)){
      context.system.hobbynumerror = true;
    }else{context.system.hobbynumerror = false;}

    context.system.tablelist = Array.from(game.tables);
    for(let u = 0; u < context.system.tablelist.length; u++){
      if(context.system.tablelist[u].visible == false){
        context.system.tablelist.splice(u, 1);
      }
    }
    context.system.actorid = this.actor.id;

    context.system.showchatpalette = game.settings.get("satasupe", "showchatpalette");
    context.system.addictionrule = game.settings.get("satasupe", "addiction");
    context.system.favmovie = game.settings.get("satasupe", "favmovie");

    context.system.fvttbcdiceuse = false;
    if(game.modules.get('fvtt-bcdice')?.active){
      context.system.fvttbcdiceuse = true;
    }

    var list = game.settings.get("satasupe", "bcdicelist");
    context.system.bcdicelist = list.game_system;

    return context;
  }

  /* -------------------------------------------- */

  _prepareCharacterItems(sheetData){
    const actorData = sheetData.system;
    const karma = [];
    const gear = [];
    const investigation = [];
    const chatpalette = [];
    for(let i of sheetData.items){
      let item = i.system;
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
    if ( !this.isEditable ) return;


    // Update Inventory Item
    html.find('.item-edit').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(li.attr("data-item-id"));
      item.sheet.render(true);
    });

    html.find('tr.karma-row').on("contextmenu", this.usekarma.bind(this));
    html.find('div.equipment-panel div.element-zone tr.equipment-row').on("contextmenu", this.useitem.bind(this));

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

    html.find('.all-on-off-button input').change(ev =>{
      this._allonoffToggle();
    });
    html.find('a.table-show-hide').on("click", this._tableshowblind.bind(this));

    html.find('a.infomation').on("click", this._titleinfomation.bind(this));

    html.find('.check-button').on("click", this._rollbutton.bind(this));
    html.find('.table-button').on("click", this._tablebutton.bind(this));
    html.find('.loadclipbord').on("click",this._loadclipbord.bind(this));
    html.find('.loadfvttbcdice').on("click", this._loadfvttbcdice.bind(this));

    html.find('.gear-name-button').on({"mouseenter" : this._itemhover.bind(this,true),"mouseleave": this._itemhover.bind(this,false)});
    html.find('tr.equipment-row').on({"mouseenter" : this._itemRhover.bind(this,true),"mouseleave": this._itemRhover.bind(this,false)});

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

    html.find(".hobby-button").click( this._onButtonToggle.bind(this));

    // Delete Inventory Item
    html.find('.item-delete').click(ev => {
      this._deleteItemSection(ev);
    });

    html.find('.karma-delete').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      this.actor.deleteEmbeddedDocuments("Item", [li.attr("data-item-id")]);
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

  async usekarma(event){
    event.preventDefault();
    let itemid = $(event.currentTarget).attr("data-item-id");
    const item = this.actor.items.get(itemid);
    let text = item.system.effecthtml;
    let timing = game.i18n.localize(item.system.timing.label);
    let target = game.i18n.localize(item.system.target.label);
    let check;
    let type;
    let diff;
    if(item.system.check.none){
      check = game.i18n.localize("SATASUPE.NoCheck");
    }else if(item.system.check.type){
      type = "alignment";
      if(!!item.system.check.checkText){
        check = item.system.check.checkText;
      }else{
        check = `〔`+ game.i18n.localize("ATTRIBS.ALIGNMENTS") +`〕/` + game.i18n.localize(item.system.check.alignment.label);
      }
    }else{
      type = item.system.check.checkValue.name;
      if(!!item.system.check.checkText){
        check = item.system.check.checkText;
      }else{
        check = `〔`+ game.i18n.localize(item.system.check.checkValue.label) +`〕/` + item.system.check.difficulty ;
        diff = Number(item.system.check.difficulty);
      }
    }
    if(!item.system.check.none && !item.system.check.checkText) check = `<a class="bcroll" data-type="${type}" data-actor="${this.actor.id}" data-diff="${diff}">`+ `<i class="fas fa-dice-d20"></i>` + check + `</a>`;
    let message = await renderTemplate(`systems/satasupe/templates/cards/karmausecard.html`,{pic:item.img,name:item.name,ruby:item.system.description.otherName,timing:timing,target:target,check:check,text:text});
    let chatMessage = {
      user: game.user.id,
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      blind:false,
      content:message
    }
    let card = await ChatMessage.create(chatMessage);
  }

  async useitem(event){
    event.preventDefault();
    let itemid = $(event.currentTarget).attr("data-item-id");
    const item = this.actor.items.get(itemid);
    let itemtype = event.currentTarget.dataset.itemtype;
    let timing = false;
    let speciallist=[];
    let type=[];
    let addic = false;
    let mini = false;
    let sp = false;
    let dispt = false;
    let text = [];
    if(item.system.typeg) type.push("gadjet");
    if(item.system.typep) type.push("props");
    if(item.system.typev) type.push("vehicle");
    if(item.system.typew) type.push("weapon");
    if(itemtype == "weapon" || itemtype == "vehicle"){
      if(type.indexOf("weapon") >= 0){
        let special = Object.entries(item.system.weapon.special).map(([key, value]) => ({'key': key, 'value': value}));
        let specialtext = Object.entries(item.system.weapon.specialtext).map(([key, value]) => ({'key': key, 'value': value}));
        let list1 = special.filter((i) => i.value.value == true);
        let list2 = specialtext.filter((j) => j.value.value == true);
        if(list1.length > 0){
          for(let k=0;k<list1.length;k++){
            speciallist.push({label:list1[k].value.label,num:false})
          }
        }
        if(list2.length > 0){
          for(let l=0;l<list2.length;l++){
            speciallist.push({label:list2[l].value.label,num:list2[l].value.number})
          }
        }
      }
      if(type.indexOf("vehicle") >= 0){
        let special = Object.entries(item.system.vehicle.special).map(([key, value]) => ({'key': key, 'value': value}));
        let specialtext = Object.entries(item.system.vehicle.specialtext).map(([key, value]) => ({'key': key, 'value': value}));
        let list1 = special.filter((i) => i.value.value == true);
        let list2 = specialtext.filter((j) => j.value.value == true);
        if(list1.length > 0){
          for(let k=0;k<list1.length;k++){
            speciallist.push({label:list1[k].value.label,num:false})
          }
        }
        if(list2.length > 0){
          for(let l=0;l<list2.length;l++){
            speciallist.push({label:list2[l].value.label,num:list2[l].value.number})
          }
        }
      }
    }
    if(itemtype == "props" || itemtype == "gadjet"){
      timing = game.i18n.localize(item.system[itemtype].timing);
      if(timing == game.i18n.localize("SATASUPE.Passive")) timing = game.i18n.localize("SATASUPE.Equipping");
      if(type.indexOf("gadjet") >= 0){
        if(item.system.gadjet.effect) text.push(item.system.gadjet.effect);
      }
      if(type.indexOf("props") >= 0){
        if(item.system.props.effect) text.push(item.system.props.effect);
        let special = Object.entries(item.system.props.special).map(([key, value]) => ({'key': key, 'value': value}));
        let specialtext = Object.entries(item.system.props.specialtext).map(([key, value]) => ({'key': key, 'value': value}));
        let list1 = special.filter((i) => i.value.value == true);
        let list2 = specialtext.filter((j) => j.value.value == true);
        if(list1.length > 0){
          for(let k=0;k<list1.length;k++){
            if(list1[k].key == "mini") mini = Number(item.system.props.minivalue);
            speciallist.push({label:list1[k].value.label,num:false})
          }
        }
        if(list2.length > 0){
          for(let l=0;l<list2.length;l++){
            if(list2[l].key == "addiction") addic = Number(list2[l].value.number);
            speciallist.push({label:list2[l].value.label,num:list2[l].value.number});
          }
        }
      }
    }
    if(speciallist.length > 0) sp = true;
    if(text.length > 0) dispt = true;
    let message = await renderTemplate(`systems/satasupe/templates/cards/itemausecard.html`,{pic:item.img,name:item.name,ruby:item.system.otherName,timing:timing,actor:this.actor.id,text:text,dispt:dispt,mini:mini,addic:addic,sp:sp,speciallist:speciallist});
    let chatMessage = {
      user: game.user.id,
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      blind:false,
      content:message
    }
    let card = await ChatMessage.create(chatMessage);
  }

  async _itemRhover(option,event){
    const id = event.currentTarget.dataset.id;
    const li = $(event.currentTarget).parents("div.element-zone").next("div.placement-zone");
    li.children().each(async function(i, e){
      $(e).children("div.drparea").children("button.gear-name-button").each(async function(index, element){
        if(option){
          if(element.dataset.id == id) $(element).css("box-shadow","0 0 5px 0px blue")
        }else{
          if(element.dataset.id == id) $(element).css("box-shadow","")
        }
      });
    });
  }

  async _itemhover(option,event){
    const id = event.currentTarget.dataset.id;
    const li = $(event.currentTarget).parents("div.placement-zone").prev("div.element-zone");
    li.children().each(async function(i, e){
      $(e).children().children("tbody").children().each(async function(index, element){
        if(option){
          if(element.dataset.id == id) $(element).css("box-shadow","0 0 10px 0px blue, inset 0 0 10px 0 blue")
        }else{
          if(element.dataset.id == id) $(element).css("box-shadow","")
        }
      });
    });
  }

  async _variablesum(event){
    for(let n=0; n<this.actor.system.variable.length;n++){
      if(n==10) break
      if((this.actor.system.variable[n].title != "") && (this.actor.system.variable[n].title != null)){
        await this.actor.updateVariableSection( n, this.actor.system.variable[n].title, 'title');
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
    const actor = this.object.system;
    const copy = duplicate(this.object.system);
    var tab, tab1, tab2, tab3;
    if(game.users.get(game.userId).flags["fvtt-bcdice"]){
      var data = game.users.get(game.userId).flags["fvtt-bcdice"];
      tab1 = data["macro-data"];
      for(let tab of tab1.tabs){
        tab.source = "user";
      }
    }
    if(game.user.character.flags["fvtt-bcdice"]){
      var data = game.user.character.flags["fvtt-bcdice"];
      tab2 = data["macro-data"];
      for(let tab of tab2.tabs){
        tab.source = "actor";
      }
    }
    if(game.canvas.tokens.controlled[0]){
      for(let i = 0; i < game.canvas.tokens.controlled.length; i++){
        if(game.canvas.tokens.controlled[i].flags["fvtt-bcdice"]){
          var data = game.canvas.tokens.controlled[i].flags["fvtt-bcdice"];
          tab3 = data["macro-data"];
          for(let tab of tab3.tabs){
            tab.source = "token";
          }
        }
      }
    }
    tab = {tabs:null, replacements:{user:null,actor:null,token:null}}
    if(!!tab1?.tabs[0]){
      if(!!tab2?.tabs[0]){
        if(!!tab3?.tabs[0]){
          tab["tabs"] = tab1.tabs.concat(tab2?.tabs).concat(tab3?.tabs);
          tab["replacements"].user = tab1.replacements;
          tab["replacements"].actor = tab2.replacements;
          tab["replacements"].token = tab3.replacements;
        }else{
          tab["tabs"] = tab1.tabs.concat(tab2?.tabs);
          tab["replacements"].user = tab1.replacements;
          tab["replacements"].actor = tab2.replacements;
        }        
      }else if(!!tab3?.tabs[0]){
        tab["tabs"] = tab1.tabs.concat(tab3?.tabs);
        tab["replacements"].user = tab1.replacements;
        tab["replacements"].token = tab3.replacements;
      }else{
        tab["tabs"] = tab1.tabs;
        tab["replacements"].user = tab1.replacements;
      }
    }else if(!!tab2?.tabs[0]){
      if(!!tab3?.tabs[0]){
        tab["tabs"] = tab2.tabs.concat(tab3?.tabs);
        tab["replacements"].actor = tab2.replacements;
        tab["replacements"].token = tab3.replacements;
      }else{
        tab["tabs"] = tab2.tabs;
        tab["replacements"].actor = tab2.replacements;
      }      
    }else if(!!tab3?.tabs[0]){
      tab["tabs"] = tab3.tabs;
      tab["replacements"].token = tab3.replacements;
    }

    const send = await LoadDialog._createfvttbcdicedialog(tab);
    let choice = send.get('select-tab');
    var variable = [];
    var formula = [];
    var replace = "";
    if(choice == "all"){
      if(tab.replacements["user"]){
        if(tab.replacements["actor"]){
          if(tab.replacements["token"]){
            replace = tab.replacements["user"] + "\n" + tab.replacements["actor"] + "\n" + tab.replacements["token"];
          }else{
            replace = tab.replacements["user"] + "\n" + tab.replacements["actor"];
          }
        }else{
          if(tab.replacements["token"]){
            replace = tab.replacements["user"] + "\n" + tab.replacements["token"];
          }else{
            replace = tab.replacements["user"];
          }
        }
      }else{
        if(tab.replacements["actor"]){
          if(tab.replacements["token"]){
            replace = tab.replacements["actor"] + "\n" + tab.replacements["token"];
          }else{
            replace = tab.replacements["actor"];
          }
        }else{
          if(tab.replacements["token"]){
            replace = tab.replacements["token"];
          }
        }
      }      
    }else{
      replace = tab.replacements[tab.tabs[choice].source];
    }
    replace = replace.split(/\r\n|\n/);
    for(let a=0;a<replace.length;a++){
      if(replace[a].match(/=/g)){
        let sp = replace[a].split(/(?<=^[^=]+?)=/);
        if(sp[1].match(/\{.*?\}/g)){
          sp[1] = sp[1].replace(/\{/g,"");
          sp[1] = sp[1].replace(/\}/g,"");
        }
        let ok = false;
        for(let l=0;l<actor.variable.length;l++){
          if(actor.variable[l].variable == sp[0]){
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
    copy.variable = copy.variable.concat(variable);
    await this.actor.update({'system.variable':copy.variable});
    for(let n=0; n<this.actor.system.variable.length;n++){
      if((this.actor.system.variable[n].title != "") && (this.actor.system.variable[n].title != null)){
        await this.actor.updateVariableSection( n, this.actor.system.variable[n].title, 'title');
      }
    }
    for(let n=0; n<this.actor.system.variable.length;n++){
      if((this.actor.system.variable[n].title != "") && (this.actor.system.variable[n].title != null)){
        await this.actor.updateVariableSection( n, this.actor.system.variable[n].title, 'title');
      }
    }

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
    const actor = this.object.system;
    const copy = duplicate(this.object.system);
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
          for(let k=0;k<actor.variable.length;k++){
            if(actor.variable[k].variable == sp[0]){
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
    copy.variable = copy.variable.concat(variable);
    await this.actor.update({'system.variable':copy.variable});
    for(let n=0; n<this.actor.system.variable.length;n++){
      if((this.actor.system.variable[n].title != "") && (this.actor.system.variable[n].title != null)){
        await this.actor.updateVariableSection( n, this.actor.system.variable[n].title, 'title');
      }
    }
    for(let n=0; n<this.actor.system.variable.length;n++){
      if((this.actor.system.variable[n].title != "") && (this.actor.system.variable[n].title != null)){
        await this.actor.updateVariableSection( n, this.actor.system.variable[n].title, 'title');
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
    const created = await this.actor.createEmbeddedDocuments('Item', [data], { renderSheet: option});
    return created;
  }

  async _rollbutton(event){
    event.preventDefault();
    const char = event.currentTarget.dataset.char;
    const actor = this.object.system;
    const copy = duplicate(this.object.system);
    let setting = {nobpwound:false,nompwound:false,nooverwork:false,killstop:false,nompcost:true};
    if(actor.settings){
      setting = actor.settings;
    }

    let value = "";
    if(char == "crime"){
      value = actor.circumstance.crime.value;
    }else if(char == "life"){
      value = actor.circumstance.life.value;
    }else if(char == "love"){
      value = actor.circumstance.love.value;
    }else if(char == "culture"){
      value = actor.circumstance.cluture.value;
    }else if(char == "combat"){
      value = actor.circumstance.combat.value;
    }else if(char == "body"){
      value = actor.aptitude.body.value;
    }else if(char == "mind"){
      value = actor.aptitude.mind.value;
    }else if(char == "arms"){
      value = actor.combat.arms.value;
    }else if(char == "generic"){
      value = 0;
    }else if(char == "alignment"){
      value = actor.attribs.alignment.value;
    }
    const indata = await CheckDialog._createCheckdialog(char, value, setting);

    const fumble = actor.status.fumble.value;
    var bpwounds = 0;
    var mpwounds = 0;
    var overwork = 0;
    if(Number(indata.get('overwork')) == 1){
      overwork = 0;
      copy.settings.nooverwork = true;
    }else{
      overwork = Number(actor.status.sleep.value);
      copy.settings.nooverwork = false;
    }
    if(Number(indata.get('bpwound')) == 1){
      bpwounds = 0;
      copy.settings.nobpwound = true;
    }else if(actor.attribs.bp.value <= 5){
      bpwounds = 1;
      copy.settings.nobpwound = false;
    }else{
      bpwounds = 0;
      copy.settings.nobpwound = false;
    }
    if(Number(indata.get('mpwound')) == 1){
      mpwounds = 0;
      copy.settings.nompwound = true;
    }else if(Number(actor.attribs.mp.value) <= 5){
      mpwounds = 1;
      copy.settings.nompwound = false;
    }else{
      mpwounds = 0;
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
      await this.object.update({'system' : copy});
    }else{
      copy.settings.nompcost = true;
      await this.object.update({'system' : copy});
    }

    if(typeof value == "string") value = Number(value)

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

    let result = await this._bcdicesend(event, text, char);
    return result;
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
    const actor = duplicate(this.object.system);
    const speaker = this.object;
    const user = this.object.user ? this.object.user : game.user;
    const asyncFunc = function(){
      return new Promise(function(resolve, reject){
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
            ChatMessage.create({user:user.id,speaker: ChatMessage.getSpeaker({actor : speaker}),content:contenthtml},{});

            if(char == "alignment"){
              if((data.rands[0].value == 6) && (data.rands[1].value == 6)){
                actor.attribs.alignment.value -= 1;
                up.object.update({'system': actor});
              }else if((data.rands[0].value == 1) && (data.rands[1].value == 1)){
                actor.attribs.alignment.value += 1;
                up.object.update({'system': actor});
              }
            }
            resolve(data);
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
            ChatMessage.create({user:user.id,speaker: ChatMessage.getSpeaker({actor : speaker}),content:contenthtml},{});
            if(char == "alignment"){
              if((data2.rands[0].value == 6) && (data2.rands[1].value == 6)){
                actor.attribs.alignment.value -= 1;
                up.object.update({'system': actor});
              }else if((data2.rands[0].value == 1) && (data2.rands[1].value == 1)){
                actor.attribs.alignment.value += 1;
                up.object.update({'system': actor});
              }
            }
            resoleve(data2);
          }
        };
          request2.onerror=function(){
            reject(false);
          }
          request2.send();
        };
      })
    }
    let reData = await asyncFunc()
    return reData;
  }

  _gearedit(event){
    const item = this.actor.items.get(event.currentTarget.dataset.key);
    item.sheet.render(true);
  }

  _geardragstart(event){
    let id = event.currentTarget.dataset;
    id.actorid = this.actor.id;
    event.originalEvent.dataTransfer.setData('text/plain', JSON.stringify(id));
  }

  async _emptyGroundCreate(event){
    let items = this.actor.items;
    let id = "";
    for(let item of items.contents){
      if(item.type == "item"){
        if(item.system.storage == ""){
          id = item.id;
          await this.object.deleteEmbeddedDocuments("Item", [id]);
        }
      }
    }
  }

  async _allItemDrop(event){
    let items = duplicate(this.actor.items);
    for(let item of items){
      if(item.type == "item"){
        if(item.system.storage != ""){
          item.system.storage = "";
        }
      }
    }
    await this.actor.update({'items' : items});
  }

  async _dropchat(event){
    var actor = duplicate(this.object);
    var data = JSON.parse(event.originalEvent.dataTransfer.getData('text/plain'));
    if(data.type == "Item"){
      let item = fromUuidSync(data.uuid);
      if(item.type == "chatpalette"){
        var vari =  duplicate(item.system.chatpalette.variable);
        for(let j=0 ; j <item.system.chatpalette.variable.length; j++){
          for(let i = 0 ; i < actor.system.variable?.length;i++){
            if(actor.system.variable[i]?.variable == item.system.chatpalette.variable[j].variable){
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
        actor.system.variable = actor.system.variable.concat(vari);
        await this.actor.update({'system.variable':actor.system.variable});
      }
    }    
  }

  async _geardrop(event){
    var id = JSON.parse(event.originalEvent.dataTransfer.getData('text/plain'));
    let dataset = event.currentTarget.dataset;
    let items = duplicate(this.actor.items.contents);
    let value = 0;
    for(let item of items){
      if(item._id === id.key){
        if(!item.system.count){
          if(item.system.typep){
            if(item.system.props.minivalue > 0){
              value = item.system.props.minivalue / 10;
            }else{
              value = 1;
            }
          }else{
            value = 1;
          }
        }
        if((Number(dataset.nowcontain) + value) <= Number(dataset.capacity)){
          if((dataset.placetype == 'vehicle') && (item.system.typev||(item.system.typep&&(item.system.props.special.normalstorage.value||item.system.props.special.room.value&&(dataset.habitable == 'false'))))){
          }else{
            if((dataset.placetype == 'normal')&&(item.system.typep&&item.system.props.special.room.value)){}else{
              if(((dataset.placetype == 'haven')||(dataset.placetype == 'haven2'))&&(item.system.typep&&item.system.props.special.normalstorage.value)){}else{
                if(((item.system.typep&&(item.system.props.addcapacity !== 0))||(item.system.typeg&&(item.system.gadjet.addcapacity !== 0)))&&(dataset.placetype == item.name)){}else{
                  item.system.storage = dataset.placetype;
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
    /*let item = this.object.items.contents;
    let newkeep = this.object.system.exp.upkeep.value == null ? 0 : this.object.system.exp.upkeep.value;
    for(let i = 0 ; i < item.length ; i++){
      if(item[i].id == id){
        if(item[i].system.typew){
          if(item[i].system.weapon.upkeep) newkeep = newkeep - 1;
        }
        if(item[i].system.typev){
          if(item[i].system.vehicle.upkeep) newkeep = newkeep - 1;
        }
        if(item[i].system.typep){
          if(item[i].system.props.upkeep) newkeep = newkeep - 1;
        }
      }
    }
    await this.actor.update({'system.exp.upkeep.value' : newkeep});*/
    this.actor.deleteEmbeddedDocuments('Item', [id]);
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

  async _allonoffToggle(){
    const actor = duplicate(this.object.system);
    const nowonoff = actor.status.allonoff;
    const circumstance = actor.circumstance;
    const aptitude = actor.aptitude;
    const attribs = actor.attribs;
    const combat = actor.combat;
    const status = actor.status;
    let variable = actor.variable;
    if(!nowonoff.value){
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
    nowonoff.value = !nowonoff.value
    await this.object.update({'system':actor});
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
    const actor = this.actor;
    actor.system.status.allonoff.variableonoff = !actor.system.status.allonoff.variableonoff;
    const updated = {id:actor._id, system:actor.system};
    game.actors.get(actor._id).update(updated);
  }

  async _onButtonToggle(event){
    event.preventDefault();
    if(event.currentTarget.dataset.hobby && event.currentTarget.dataset.family){
      await this.actor.toggleHobby( event.currentTarget.dataset.hobby, event.currentTarget.dataset.family);
    }
  }

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
        if(event.currentTarget.classList.contains('addiction-input')){
          const index = parseInt(event.currentTarget.closest('.addiction-section').dataset.index);
          const addictype = event.currentTarget.dataset.adic;
          this.actor.updateAddictionName( index, event.currentTarget.value, addictype);
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
        if(event.currentTarget.classList.contains('life-characteristic')){
          this.actor.checkupkeep(event.currentTarget.value);
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
    const actor = duplicate(this.object.system);
    const roll = new Roll('1d2');
    await roll.roll();
    let sex = null;
    if(roll._total == 1){
      sex = game.i18n.localize("SATASUPE.Male");
    }else{
      sex = game.i18n.localize("SATASUPE.Female");
    }
    const user = this.object.user ? this.object.user : game.user;
    actor.infos.sex = sex;
    if( game.modules.get('dice-so-nice')?.active){
      await game.dice3d.showForRoll(roll,user);
    }
    let text = `<br>=>` + game.i18n.format('SATASUPE.SexRollresult',{sex: sex});
    let chatData = {
      content : await roll.render(),
      user: user.id,
      speaker: ChatMessage.getSpeaker({actor : this.object}),
      flavor: game.i18n.localize("SATASUPE.SexRolltitle") + text,
    };
    ChatMessage.create(chatData);
    const updated = {id:actor.id, system:actor};
    await this.object.update({'system.infos': actor.infos});
  }

  async _createAge(event){
    event.preventDefault();
    const actor = duplicate(this.object.system);
    const roll1 = new Roll('1d6');
    await roll1._evaluateSync();
    let age = 0;
    let roll2 = null;
    if(roll1._total == 1){
      roll2 = new Roll('2d6+6');
      await roll2._evaluateSync();
    }else if(roll1._total == 2){
      roll2 = new Roll('2d6+10');
      await roll2._evaluateSync();
    }else if(roll1._total == 3){
      roll2 = new Roll('3d6+15');
      await roll2._evaluateSync();
    }else if(roll1._total == 4){
      roll2 = new Roll('4d6+25');
      await roll2._evaluateSync();
    }else if(roll1._total == 5){
      roll2 = new Roll('5d6+40');
      await roll2._evaluateSync();
    }else if(roll1._total == 6){
      roll2 = new Roll('6d6+60');
      await roll2._evaluateSync();
    }
    const user = this.object.user ? this.object.user : game.user;
    actor.infos.age = roll2._total;
    if( game.modules.get('dice-so-nice')?.active){
      await game.dice3d.showForRoll(roll1,user);
      game.dice3d.showForRoll(roll2,user);
    }
    let text = `<br>=>` + game.i18n.format('SATASUPE.AgeRollresult',{age: roll2._total});
    let chatData = {
      content : await roll2.render(),
      user: user.id,
      speaker: ChatMessage.getSpeaker({actor : this.object}),
      flavor: game.i18n.localize("SATASUPE.AgeRolltitle") + text,
    };
    ChatMessage.create(chatData);
    const updated = {id:actor.id, system:actor};
    await this.object.update({'system.infos': actor.infos});
  }

  async _createAlignment(event){
    event.preventDefault();
    const actor = duplicate(this.object.system);
    let roll = new Roll('2d6');
    await roll._evaluateSync();
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
    actor.attribs.alignment.value = align;
    if( game.modules.get('dice-so-nice')?.active){
      await game.dice3d.showForRoll(roll,user);
    }
    let text = `<br>=>` + game.i18n.format('SATASUPE.AlignmentRollresult',{align: align});
    let chatData = {
      content : await roll.render(),
      user: user.id,
      speaker: ChatMessage.getSpeaker({actor : this.object}),
      flavor: game.i18n.localize("SATASUPE.AlignmentRolltitle") + text,
    };

    ChatMessage.create(chatData);
    const updated = {id:actor.id, system:actor};
    await this.object.update({'system.attribs': actor.attribs});
  }

  createFavorite(event){
    event.preventDefault();
    const up = this;
    const actor = duplicate(this.object.system);
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
        ChatMessage.create({user:user.id,speaker: ChatMessage.getSpeaker({actor : speaker}),content:contenthtml},{});
        actor.infos.favorite = favoriteText;
        up.object.update({'system': actor});
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
        ChatMessage.create({user:user.id,speaker: ChatMessage.getSpeaker({actor : speaker}),content:contenthtml},{});
        actor.infos.favorite = favoriteText;
        up.object.update({'system': actor});
      }
    };
      request2.send();
    };
  }

  _Item(event){
    event.preventDefault();
    let li = $(event.currentTarget).parents('.item'),
        item = this.actor.items.get(li.data('item-id')),
        chatData = item.system;
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
    let actor = this.actor.system;
    //let item = this.actor._data.items;
    let item = this.actor.items.contents;
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
      if(item[i].id != id){
      }else{
        let text = item[i].system.chatpalette.chat[index].text ? item[i].system.chatpalette.chat[index].text : "";
        let message = item[i].system.chatpalette.chat[index].message ? item[i].system.chatpalette.chat[index].message : "";
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
              await roll.roll();
              roll.dice[0].options.hidden = true;
              roll.dice[0].options.colorset = "unseen_black";
              if(game.modules.get('dice-so-nice')?.active){
                game.dice3d.showForRoll(roll, game.user, true, null, false);
              }
              ChatMessage.create({roll:roll,user:user.id,speaker:ChatMessage.getSpeaker({actor:speaker}),blind:true,whisper:null,content:`Secret Dice are cast by ${game.user.name}!`})
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
        request2.onload = async function(){
          if(request2.status==200){
            var data2 = this.response;
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
            ChatMessage.create({user:user.id,speaker:ChatMessage.getSpeaker({actor : speaker}),whisper:whisper,blind:blind,content:contenthtml,flavor:message},{});
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
  }
}
