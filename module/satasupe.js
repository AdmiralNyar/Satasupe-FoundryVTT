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
  CONFIG.Actor.entityClass = SatasupeActor;
  CONFIG.Item.entityClass = SatasupeItem;

  // Register sheet application classes
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("satasupe", SatasupeActorSheet, { makeDefault: true });
  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("satasupe", SatasupeKarmaSheet, { types: ['karma'], makeDefault: true });
  Items.registerSheet("satasupe", SatasupeInvestigationSheet, { types: ['investigation'], makeDefault: true});
  Items.registerSheet("satasupe", SatasupeChatpaletteSheet, { types: ['chatpalette'], makeDefault: true});
  Items.registerSheet("satasupe", SatasupeItemSheet, { makeDefault: true });

  game.settings.register("satasupe", "karmaSortable", {
    name: "SETTINGS.SatasupekarmaSortN",
    hint: "SETTINGS.SatasupekarmaSortL",
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

Hooks.on("renderActorSheet", async (app, html, data) => {
  html.find(".show-detail").click( ev => {
    let button = $(ev.currentTarget);
    button.parent('.item-controls').parent().next('.item-detail').children('.item-hide').toggle();
    $(button).hide();
    $(button).next().show();
  });
  html.find(".close-detail").click( ev => {
    let button = $(ev.currentTarget);
    button.parent('.item-controls').parent('').next('.item-detail').children('.item-hide').toggle();
    $(button).hide();
    $(button).prev().show();
  });
});

Hooks.on("renderItemSheet", async (app, html, data) => {
  if(app.object.data.type == "investigation"){
    const itemid = app.object._id; 
    if(app.object.data.permission.default != 3) ui.notifications.error(game.i18n.localize("ALERTMESSAGE.DefaultInvestigationPermission"));
    const maxsl = data.data.maxsl + 3;
    console.log($(`.investigation-main#${itemid} .investigation-sl`));
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
        let tagaddzone ="";
        var style = `<style>.tagindex${parentindex}::after{content: "";display: flex;position: relative;justify-content: flex-end;top: 12px;left: auto;width: 20px;height: 0px;border-top: 3px solid brown;}</style>`;
        if(sl == 0){
          tagaddzone = SatasupeInvestigationSheet.tagzone_create(j, data, 0, -1);
          $(`.investigation-main#${itemid} .investigation-property`).append(tagaddzone);
        }else{
          tagaddzone = SatasupeInvestigationSheet.tagzone_create(j, data, sl, data.data.dendrogram[parentindex].sl);
          $(`.investigation-main#${itemid} .investigation-property .indexnum${parentindex}`).append(tagaddzone);
          $(`.investigation-main#${itemid} .investigation-property .listindex${parentindex}`).append(style);
          if(sl < data.data.dendrogram[parentindex].sl){
            $(`.investigation-main#${itemid} .investigation-property .indexnum${parentindex}.tree`).css('padding-top','50px');
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
        if((app.object.data.data.dendrogram[index].playerlist[m].id != game.user._id) || (game.user.isGM) || (game.settings.get("satasupe", "InvestigationTopicReuse"))){
        }else if((app.object.data.data.dendrogram[index].playerlist[m].id == game.user._id) && (!game.user.isGM) && ( !game.settings.get("satasupe", "InvestigationTopicReuse"))){ 
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
