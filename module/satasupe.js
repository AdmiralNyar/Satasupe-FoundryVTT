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
import { SatasupeInventrySheet } from "./item/sheets/inventry.js";
import { SatasupeChatpaletteSheet} from "./item/sheets/chatpalette.js";

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
  Items.registerSheet("satasupe", SatasupeInventrySheet, { types: ['inventry'], makeDefault: true});
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
