/**
 * A simple and flexible system for world-building using an arbitrary collection of character and item attributes
 * Author: Atropos
 * Software License: GNU GPLv3
 */


// Import Modules
import { SatasupeActor } from "./actor.js";
import { SatasupeItemSheet } from "./item-sheet.js";
import { SatasupeItem } from "./item/item.js";
import { SatasupeActorSheet } from "./actor-sheet.js";
import { preloadHandlebarsTemplates } from "./templates.js";
import { SatasupeKarmaSheet } from "./item/sheets/karma.js";
import { SatasupeInvestigationSheet } from "./item/sheets/investigation.js";
import { SatasupeChatpaletteSheet} from "./item/sheets/chatpalette.js";
import { SATASUPE} from './config.js';
import { SatasupeGiveItem} from './giveitem.js';
import { SatasupeMenu} from './menu.js';
import { SatasupeChatCard} from "./chat-card.js";
import { memoApplication} from "./apps/memo.js";

/* -------------------------------------------- */
/*  Foundry VTT Initialization                  */
/* -------------------------------------------- */
/**
 * Init hook.
 */
Hooks.once("init", async function() {
  console.log(`Initializing Satasupe System`);

  /**
   * Set an initiative formula for the system. This will be updated later.
   * @type {String}
   */

  game.satasupe = {
    SatasupeActor,
    SatasupeItem
  };

  // Define custom Entity classes
  CONFIG.Actor.documentClass = SatasupeActor;
  CONFIG.Item.documentClass = SatasupeItem;

  // Register sheet application classes
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("satasupe", SatasupeActorSheet, { makeDefault: true });
  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("satasupe", SatasupeKarmaSheet, { types: ['karma'], makeDefault: true });
  Items.registerSheet("satasupe", SatasupeInvestigationSheet, { types: ['investigation'], makeDefault: true});
  Items.registerSheet("satasupe", SatasupeChatpaletteSheet, { types: ['chatpalette'], makeDefault: true});
  Items.registerSheet("satasupe", SatasupeItemSheet, { types: ['item'], makeDefault: true });

  game.settings.register("satasupe", 'turnCount', {
    name: 'Turn Count',
    scope: 'world',
    config: false,
    type: Number,
    default: 0,
    range:{
      min:0
    }
  });

  game.settings.register("satasupe", 'worktimeValue', {
    name: 'Work Time value',
    scope: 'world',
    config: false,
    type: Number,
    default: 5,
    range:{
      min:0
    }
  });

  game.settings.register("satasupe", 'worklimit', {
    name: 'Work Limit value',
    scope: 'world',
    config: false,
    type: Object,
    default: {limit: 10,secret:true},
  })

  game.settings.register("satasupe", 'playerlist',{
    name: 'Player list',
    scope: 'world',
    config: false,
    type: Object,
    default: null,
  })

  game.settings.register("satasupe", 'vote',{
    name: 'Vote',
    scope: 'world',
    config: false,
    type: Object,
    default: []
  })

  game.settings.register("satasupe", "afterplayprogress",{
    name: 'Afterplay Progress',
    scope: 'world',
    config: false,
    type:Object,
    default: []
  })

  game.settings.register("satasupe", 'chatcardlog',{
    name: 'Chat Card Log',
    scope: 'world',
    config: false,
    type: Object,
    default: []
  })

  game.settings.register("satasupe", "showchatpalette", {
    name: "SETTINGS.SatasupeChatpaletteN",
    hint: "SETTINGS.SatasupeChatpaletteL",
    scope: 'client',
    type: Boolean,
    config: true,
    default: true
  });

  game.settings.register("satasupe", "karmaSortable", {
    name: "SETTINGS.SatasupekarmaSortN",
    hint: "SETTINGS.SatasupekarmaSortL",
    scope: 'client',
    type: Boolean,
    config: true,
    default: true
  });

  game.settings.register("satasupe", "originaltable", {
    name: "SETTINGS.SatasupeOriginaltableN",
    hint: "SETTINGS.SatasupeOriginaltableL",
    scope: 'client',
    type: Boolean,
    config: true,
    default: true
  });

  game.settings.register("satasupe", "turndisplay",{
    name: "SETTINGS.SatasupeTurnCountN",
    hint: "SETTINGS.SatasupeTurnCountL",
    scope: 'world',
    type: String,
    choices: {
      "0" : game.i18n.localize("SATASUPE.ChatOnly"),
      "1" : game.i18n.localize("SATASUPE.UiOnly"),
      "2" : game.i18n.localize("SATASUPE.ChatAndUi"),
      "3" : game.i18n.localize("SATASUPE.NoDisplay")
    },
    config: true,
    default: "0"
  });

  game.settings.register("satasupe", "turnskip", {
    name: "SETTINGS.SatasupeUnactedCharacterN",
    hint: "SETTINGS.SatasupeUnactedCharacterL",
    scope: 'world',
    type: Boolean,
    config: true,
    default: false
  });

  game.settings.register("satasupe", "addiction", {
    name: "SETTINGS.SatasupeAddictionN",
    hint: "SETTINGS.SatasupeAddictionL",
    scope: 'world',
    type: Boolean,
    config: true,
    default: false
  });

  game.settings.register("satasupe", "favmovie", {
    name: "SETTINGS.SatasupeFavMovieN",
    hint: "SETTINGS.SatasupeFavMovieL",
    scope: 'world',
    type: Boolean,
    config: true,
    default: false
  });

  game.settings.register("satasupe", "worktime", {
    name: "SETTINGS.SatasupeWorkTimeChangeN",
    hint: "SETTINGS.SatasupeWorkTimeChangeL",
    scope: 'world',
    type: Boolean,
    config: true,
    default: true
  });

  game.settings.register("satasupe", "BCDice", {
    name: "SETTINGS.SatasupeBCDiceAPIN",
    hint: "SETTINGS.SatasupeBCDiceAPIL",
    scope: 'world',
    type: String,
    config: true,
    default: `https://bcdice.onlinesession.app/v2`
  });

  game.settings.register("satasupe", "BCDice2", {
    name: "SETTINGS.SatasupeBCDiceAPIN2",
    hint: "SETTINGS.SatasupeBCDiceAPIL2",
    scope: 'world',
    type: String,
    config: true,
    default: `https://bcdice.trpg.net/v2`
  });

  game.settings.register("satasupe", "InvestigationTopicReuse", {
    name: "SETTINGS.SatasupeInvestigationTopicReuseN",
    hint: "SETTINGS.SatasupeInvestigationTopicReuseL",
    scope: 'world',
    type: Boolean,
    config: true,
    default: false
  });

  game.settings.register("satasupe", "InvestigationMusic", {
    name: "SETTINGS.SatasupeInvestigationMusicN",
    hint: "SETTINGS.SatasupeInvestigationMusicL",
    scope: 'world',
    type: Boolean,
    config: true,
    default: false
  });  

  game.settings.register("satasupe", "uploadCharacterSetting", {
    name: "SETTINGS.SatasupeTokenAutoSettingN",
    hint: "SETTINGS.SatasupeTokenAutoSettingL",
    scope: 'world',
    type: Boolean,
    config: true,
    default: true
  });  

  /**
   * Slugify a string.
   */
  Handlebars.registerHelper('slugify', function(value) {
    return value.slugify({strict: true});
  });

  Handlebars.registerHelper('if_odd', function(value, options) {
    if(((value + 1) % 2) == 0){
      return options.fn(this);
    }else{
      return options.inverse(this);
    }
  });

  /**
   *  v1:outerloopindex
   *  v2:innerloopindex
   *  return:totalindex
   */
  Handlebars.registerHelper('counts', function (v1, v2) {
    if(!v1) v1 = 0;
    if(!v2) v2 = 0;
    return ((v1*3) + v2);
  });

  /**
   *  i = 10 , k = 11 or (i = "pass", k = "pasta")
   *  {{#uniqueif i "===" k}}
   *  > false
   */
  Handlebars.registerHelper('uniqueif', function (v1, operator, v2, options) {
    switch (operator) {
        case '==':
            return (v1 == v2) ? options.fn(this) : options.inverse(this);
        case '===':
            return (v1 === v2) ? options.fn(this) : options.inverse(this);
        case '!=':
            return (v1 != v2) ? options.fn(this) : options.inverse(this);
        case '!==':
            return (v1 !== v2) ? options.fn(this) : options.inverse(this);
        case '<':
            return (v1 < v2) ? options.fn(this) : options.inverse(this);
        case '<=':
            return (v1 <= v2) ? options.fn(this) : options.inverse(this);
        case '>':
            return (v1 > v2) ? options.fn(this) : options.inverse(this);
        case '>=':
            return (v1 >= v2) ? options.fn(this) : options.inverse(this);
        case '&&':
            return (v1 && v2) ? options.fn(this) : options.inverse(this);
        case '||':
            return (v1 || v2) ? options.fn(this) : options.inverse(this);
        default:
            return options.inverse(this);
    }
  });

  // Preload template partials.
  preloadHandlebarsTemplates();
});

Hooks.on('getSceneControlButtons', SatasupeMenu.getButtons);
Hooks.on('renderSceneControls', SatasupeMenu.renderControls);

Hooks.once('diceSoNiceReady', (dice3d) => {
  game.dice3d.addColorset({
    name: 'unseen_black',
    description: 'Secret roll',
    category: 'secret',
    foreground: '#000000',
    background: "#000000",
    outline: '#000000',
    texture: 'paper',
    edge: '#000000',
    material: 'wood',
  });
});

Hooks.on('createActor', async (document, options, userId) => {
  const actor = document.data;
  for(let [key, value] of Object.entries(actor.data.circumstance)){
    actor.data.circumstance[key].variable = game.i18n.localize(actor.data.circumstance[key].variable);
  }
  for(let [key, value] of Object.entries(actor.data.aptitude)){
    actor.data.aptitude[key].variable = game.i18n.localize(actor.data.aptitude[key].variable);
  }
  for(let [key, value] of Object.entries(actor.data.attribs)){
    actor.data.attribs[key].variable = game.i18n.localize(actor.data.attribs[key].variable);
  }
  for(let [key, value] of Object.entries(actor.data.combat)){
    actor.data.combat[key].variable = game.i18n.localize(actor.data.combat[key].variable);
  }
  actor.data.status.majorWoundsOffset.variable = game.i18n.localize(actor.data.status.majorWoundsOffset.variable);
  actor.data.status.sleep.variable = game.i18n.localize(actor.data.status.sleep.variable);
  actor.data.status.fumble.variable = game.i18n.localize(actor.data.status.fumble.variable);
  actor.data.status.trauma.variable = game.i18n.localize(actor.data.status.trauma.variable);
  await document.update({'data':actor.data});
});

Hooks.on('renderChatLog', (app, html, data) => SatasupeChatCard.chatListeners(app, html, data));
Hooks.on('renderChatMessage', (app,html,data) => SatasupeChatCard.renderChatMessageHook(app,html,data));
Hooks.on('updateChatMessage', (chatMessage) => SatasupeChatCard.onUpdateChatMessage( chatMessage));
Hooks.on('renderApplication', async (app, html, data) => {
  if(game.user.isGM){
    if(html.hasClass('afterplayListDialog')){
      await SatasupeChatCard._progressupdate();
    }
  }
});
Hooks.once('ready',async function(){
  const ig = game.i18n.localize("SATASUPE.Ignore");
  const de = game.i18n.localize("SATASUPE.DeleteItemCss");
  window.document.documentElement.style.setProperty("--ignore", ig);
  window.document.documentElement.style.setProperty("--delete", de);
});

Hooks.on('ready', async function () {
  game.socket.on('system.satasupe', async (packet) => {
      let data = packet.data;
      let type = packet.type;
      if(type!="selected"){
        const receiveActorId = packet.receiveActorId;
        const sendActorId = packet.sendActorId;
        data.receiveActor = game.actors.get(receiveActorId);
        data.sendActor = game.actors.get(sendActorId);
        if (data.receiveActor.isOwner) {
            if (type === 'request') {
              SatasupeGiveItem.receiveTrade(data);
            }
            if (type === 'accepted') {
              SatasupeGiveItem.completeTrade(data);
            }
            if (type === 'denied') {
              SatasupeGiveItem.denyTrade(data);
            }
        }
      }else{
        let result = packet.result;
        const isGM = game.user.isGM;
        if(isGM){
          if(packet.voteT=="karma"){
            SatasupeChatCard._onChatCardSwitchK(result)
          }else if(packet.voteT=="mvp"){
            SatasupeChatCard._onChatCardSwitchM(result)
          }else if(packet.voteT == "button"){
            await SatasupeChatCard._onChatCardAction(result)
            await SatasupeChatCard._progressupdate();
          }else if(packet.voteT == "gene"){
            SatasupeChatCard._onChatCardSwitchG(result)
          }
        }else{
          if(packet.voteT == "notact"){
            if(game.user.character){
              await SatasupeMenu.actedintheTurn(data, true)
            }
          }
        }
        if(packet.voteT == "sharememo"){
          if(game.user.id == result || result == -1){
            await memoApplication._sharememo(packet.data)
          }
        }else if(packet.voteT == "info"){
          ui.notifications.info(result)
        }
      }
  });
});

Hooks.once("init", async () => {
  await game.settings.register('satasupe', 'bcdicelist', {
    name: 'My Setting',
    hint: 'A description of the registered setting and its behavior.',
    scope: 'client',     // "world" = sync to db, "client" = local storage
    config: false,       // false if you dont want it to show in module config
    onChange: value => { // value is the new value of the setting
    }
  });
  let tablelist = await SatasupeActorSheet._bcdiceback("/game_system", "", false);
  game.settings.set("satasupe", "bcdicelist", tablelist);
});

Hooks.on("renderActorSheet", async (app, html, data) => {
  html.find("tr.variable-section").attr('draggable','false');
  html.find("tr.chatpalette-section").attr('draggable','false');

  html.find(".show-detail").click( ev => {
    let button = $(ev.currentTarget);
    button.parent('.item-controls').parent().next('.item-detail').children('td').removeClass("item-hide");
    $(button).hide();
    $(button).next().css("display", "contents");
  });
  html.find(".close-detail").click( ev => {
    let button = $(ev.currentTarget);
    button.parent('.item-controls').parent().next('.item-detail').children('td').addClass("item-hide");
    $(button).hide();
    $(button).prev().show();
  });
  html.find('div.passdrparea').on("drop", async function(ev){
    let reciveactorid = ev.currentTarget.dataset.actorid;
    var id = JSON.parse(ev.originalEvent.dataTransfer.getData('text/plain'));
    const sendActor=game.actors.get(id.actorid);
    const receiveActor = game.actors.get(reciveactorid);
    if(sendActor.id != receiveActor.id){
      const currentItem = sendActor.items.find(item => item.id === id.key);
      if(game.user.isGM) {
        await SatasupeGiveItem.receiveItem({sendActor, receiveActor, currentItem});
        await SatasupeGiveItem.sendMessageToPL({sendActor, receiveActor, currentItem});
        await SatasupeGiveItem.completeTrade({sendActor:receiveActor, receiveActor:sendActor, currentItem:currentItem});
      }else{
        game.socket.emit('system.satasupe', {
          data: {sendActor, receiveActor, currentItem},
          receiveActorId: receiveActor.id,
          sendActorId: sendActor.id,
          type: "request"
        });
      }
    }
  });
});

Hooks.on("renderItemSheet", async (app, html, data) => {
  if(app.object.data.type == "investigation"){
    const itemid = app.object.id; 
    if(app.object.data.permission.default != 3) ui.notifications.error(game.i18n.localize("ALERTMESSAGE.DefaultInvestigationPermission"));
    const maxsl = data.data.maxsl + 3;
    for(let i = 0; i < maxsl;i++){
      if(i==0){
        $(`.investigation-main#${itemid} .investigation-sl`).append(`<div class="sl${i}list" style="vertical-align: top;display: inline-block;width: 200px;"><div class="sllist" style="display: inline-block;width:50px;vertical-align: top;">SL ${i}</div><button class="start-topic-add" type="button" style="vertical-align: top;display:inline-block;width:120px;height:fit-content;height:-moz-fit-content;margin: 0px 2px 0px 5px;line-height: 16px;">${ game.i18n.localize("SATASUPE.AddStartTopic")}</button></div>`);
      }else{
        $(`.investigation-main#${itemid} .investigation-sl`).append(`<div class="sl${i}list" style="vertical-align: top;display: inline-block;width: 200px;"><div class="sllist" style="display: inline-block;width:50px;vertical-align: top;">SL ${i}</div></div>`);
      }
    }

    for(let k = 0; k < data.data.target.length; k++){
      if(data.data.target[k].open){
        let place = data.data.target[k].sl;
        var taglist = "";
        for(let l=0; l < data.data.target[k].tag.length; l++){
          for(let [key,v] of Object.entries(SATASUPE['hobby'])){
            if(data.data.target[k].tag[l]){
              if(key == data.data.target[k].tag[l]){
                taglist += game.i18n.localize(v);
                if(l != (data.data.target[k].tag.length - 1))taglist += ", ";
              }
            }
          }
        }
        if(data.data.target[k].checked) taglist += " ★";
        $(`.investigation-main#${itemid} .investigation-sl .sl${place}list`).append(`<div class="target-sl" style="width:150px;display:block;white-space:normal;">TARGET : ${taglist}</div>`);
      }
    }

    for(let j=0;j<data.data.dendrogram.length;j++){
      if(Object.keys(data.data.dendrogram[j]).length){
        const parentindex = data.data.dendrogram[j].path[data.data.dendrogram[j].path.length - 2];
        const sl = data.data.dendrogram[j].sl;
        let parentsl = -1;
        const grandparentindex = data.data.dendrogram[j].path[data.data.dendrogram[j].path.length - 3];
        let grandparentsl = -1;
        if(sl != 0){
          parentsl = data.data.dendrogram[parentindex].sl;
        }
        if(data.data.dendrogram[grandparentindex]){
          grandparentsl = data.data.dendrogram[grandparentindex].sl;
        }
        let tagaddzone ="";
        var style = ``;
        if(parentsl > grandparentsl){
          style = `<style>.tagindex${parentindex}::after{content: "";display: flex;position: relative;justify-content: flex-end;top:13px;left: 0px;width: 0px;height: 20px;border-left: 3px solid brown;margin-left:${200*(Math.abs(parentsl-grandparentsl))}px;}</style>`;
        }else if(parentsl < grandparentsl){
          style = `<style>.tagindex${parentindex}::after{content: "";display: flex;position: relative;justify-content: flex-end;top:13px;left: 0px;width: 0px;height: 20px;border-left: 3px solid brown;margin-right:${200*(grandparentsl-parentsl)}px;}</style>`;
        }
        if(sl == 0){
          tagaddzone = SatasupeInvestigationSheet.tagzone_create(j, data, 0, -1, -1);
          $(`.investigation-main#${itemid} .investigation-property`).append(tagaddzone);
        }else{
          tagaddzone = SatasupeInvestigationSheet.tagzone_create(j, data, sl, parentsl, grandparentsl);
          $(`.investigation-main#${itemid} .investigation-property .indexnum${parentindex}`).append(tagaddzone);
          $(`.investigation-main#${itemid} .investigation-property .listindex${parentindex}`).append(style);
          if(sl > parentsl){
            if(parentsl < grandparentsl){
              $(`.investigation-main#${itemid} .investigation-property .indexnum${parentindex}.tree`).css('left','50px');
            }
          }else if(sl < parentsl){
            if(parentsl > grandparentsl){
              $(`.investigation-main#${itemid} .investigation-property .taglistzone.listindex${j}`).css('left',`${-50-200*(parentsl-sl)}px`);
            }
          }
        }
      }
    }

    html.find('.target-set').click( ev => {
      app.object.update({'data.gmsetting': !data.data.gmsetting});
      if(data.data.gmsetting && game.user.isGM){
        $(`.investigation-main#${itemid}`).css('display','none');
        $(`.investigation-target#${itemid}`).css('display','');
      }else{
        $(`.investigation-main#${itemid}`).css('display','');
        $(`.investigation-target#${itemid}`).css('display','none');
      }
    });
    if(data.data.gmsetting && game.user.isGM){
      $(`.investigation-main#${itemid}`).css('display','none');
      $(`.investigation-target#${itemid}`).css('display','');
    }else{
      $(`.investigation-main#${itemid}`).css('display','');
      $(`.investigation-target#${itemid}`).css('display','none');
    }
    html.find('.add-branch').click( ev => {
      const index = parseInt(ev.currentTarget.dataset.slindex);
      let view = true;
      if(app.object.data.data.dendrogram[index].playerlist.length == 0){
        view = true;
      }
      for(let m=0; m < app.object.data.data.dendrogram[index].playerlist.length; m++){
        if((app.object.data.data.dendrogram[index].playerlist[m].id != game.user.id) || (game.user.isGM) || (game.settings.get("satasupe", "InvestigationTopicReuse"))){
        }else if((app.object.data.data.dendrogram[index].playerlist[m].id == game.user.id) && (!game.user.isGM) && ( !game.settings.get("satasupe", "InvestigationTopicReuse"))){ 
          ui.notifications.error(game.i18n.localize("ALERTMESSAGE.SelectedTopic"));
          view = false;
        }
      }
      if(view){
        if(data.data.dendrogram[index].tag){
          SatasupeInvestigationSheet._createBranch(ev, app.object, index, data);
        }else{
          ui.notifications.error(game.i18n.localize("ALERTMESSAGE.ParentTag"));
        }
      }
    });
    html.find('.tag-delete').click( ev => {
      const index = parseInt(ev.currentTarget.dataset.slindex);
      SatasupeInvestigationSheet._deleteBranch(ev, app.object, index, data);
    });
    html.find('.start-topic-add').click( ev =>{
      SatasupeInvestigationSheet._createStartTopic(ev, app.object);
    });
  }
});
