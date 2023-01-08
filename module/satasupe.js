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
import { SatasupeChatpaletteSheet } from "./item/sheets/chatpalette.js";
import { SATASUPE } from './config.js';
import { SatasupeGiveItem } from './giveitem.js';
import { SatasupeMenu } from './menu.js';
import { SatasupeChatCard } from "./chat-card.js";
import { memoApplication } from "./apps/memo.js";
import { SatasupeMenuLayer } from "./menu.js";

/* -------------------------------------------- */
/*  Foundry VTT Initialization                  */
/* -------------------------------------------- */
/**
 * Init hook.
 */
Hooks.once("init", async function () {
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
  Items.registerSheet("satasupe", SatasupeInvestigationSheet, { types: ['investigation'], makeDefault: true });
  Items.registerSheet("satasupe", SatasupeChatpaletteSheet, { types: ['chatpalette'], makeDefault: true });
  Items.registerSheet("satasupe", SatasupeItemSheet, { types: ['item'], makeDefault: true });

  game.settings.register("satasupe", 'turnCount', {
    name: 'Turn Count',
    scope: 'world',
    config: false,
    type: Number,
    default: 0,
    range: {
      min: 0
    }
  });

  game.settings.register("satasupe", 'worktimeValue', {
    name: 'Work Time value',
    scope: 'world',
    config: false,
    type: Number,
    default: 5,
    range: {
      min: 0
    }
  });

  game.settings.register("satasupe", 'worklimit', {
    name: 'Work Limit value',
    scope: 'world',
    config: false,
    type: Object,
    default: { limit: 10, secret: false },
  })

  game.settings.register("satasupe", 'playerlist', {
    name: 'Player list',
    scope: 'world',
    config: false,
    type: Object,
    default: null,
  })

  game.settings.register("satasupe", 'vote', {
    name: 'Vote',
    scope: 'world',
    config: false,
    type: Object,
    default: []
  })

  game.settings.register("satasupe", "afterplayprogress", {
    name: 'Afterplay Progress',
    scope: 'world',
    config: false,
    type: Object,
    default: []
  })

  game.settings.register("satasupe", 'chatcardlog', {
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
    scope: 'world',
    type: Boolean,
    config: true,
    default: true
  });

  game.settings.register("satasupe", "turndisplay", {
    name: "SETTINGS.SatasupeTurnCountN",
    hint: "SETTINGS.SatasupeTurnCountL",
    scope: 'world',
    type: String,
    choices: {
      "0": game.i18n.localize("SATASUPE.ChatOnly"),
      "1": game.i18n.localize("SATASUPE.UiOnly"),
      "2": game.i18n.localize("SATASUPE.ChatAndUi"),
      "3": game.i18n.localize("SATASUPE.NoDisplay")
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

  game.settings.register("satasupe", "afterplay", {
    name: "SETTINGS.SatasupeAfterplayN",
    hint: "SETTINGS.SatasupeAfterplayL",
    scope: 'world',
    type: Boolean,
    config: true,
    default: false
  })

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
  Handlebars.registerHelper('slugify', function (value) {
    return value.slugify({ strict: true });
  });

  Handlebars.registerHelper('if_odd', function (value, options) {
    if (((value + 1) % 2) == 0) {
      return options.fn(this);
    } else {
      return options.inverse(this);
    }
  });

  /**
   *  v1:outerloopindex
   *  v2:innerloopindex
   *  return:totalindex
   */
  Handlebars.registerHelper('counts', function (v1, v2) {
    if (!v1) v1 = 0;
    if (!v2) v2 = 0;
    return ((v1 * 3) + v2);
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
  const actor = document.system;
  for (let [key, value] of Object.entries(actor.circumstance)) {
    actor.circumstance[key].variable = game.i18n.localize(actor.circumstance[key].variable);
  }
  for (let [key, value] of Object.entries(actor.aptitude)) {
    actor.aptitude[key].variable = game.i18n.localize(actor.aptitude[key].variable);
  }
  for (let [key, value] of Object.entries(actor.attribs)) {
    actor.attribs[key].variable = game.i18n.localize(actor.attribs[key].variable);
  }
  for (let [key, value] of Object.entries(actor.combat)) {
    actor.combat[key].variable = game.i18n.localize(actor.combat[key].variable);
  }
  actor.status.majorWoundsOffset.variable = game.i18n.localize(actor.status.majorWoundsOffset.variable);
  actor.status.sleep.variable = game.i18n.localize(actor.status.sleep.variable);
  actor.status.fumble.variable = game.i18n.localize(actor.status.fumble.variable);
  actor.status.trauma.variable = game.i18n.localize(actor.status.trauma.variable);
  await document.update({ 'system': actor });
});

Hooks.on('renderChatLog', (app, html, data) => SatasupeChatCard.chatListeners(app, html, data));
Hooks.on('renderChatMessage', (app, html, data) => SatasupeChatCard.renderChatMessageHook(app, html, data));
Hooks.on('updateChatMessage', (chatMessage) => SatasupeChatCard.onUpdateChatMessage(chatMessage));
Hooks.on('renderApplication', async (app, html, data) => {
  if (game.user.isGM) {
    if (html.hasClass('afterplayListDialog')) {
      await SatasupeChatCard._progressupdate();
    }
  }
});
Hooks.once('ready', async function () {
  globalThis.CONFIG.Canvas.layers.ddtools = { layerClass: SatasupeMenuLayer, group: "interface" }
  const ig = game.i18n.localize("SATASUPE.Ignore");
  const de = game.i18n.localize("SATASUPE.DeleteItemCss");
  window.document.documentElement.style.setProperty("--ignore", ig);
  window.document.documentElement.style.setProperty("--delete", de);

  try {
    const canCreateActor = game.user.can("ACTOR_CREATE");
    const canCreateItem = game.user.can("ITEM_CREATE");

    const controlled = game.users.reduce((arr, u) => {
      if (u.character) arr.push(u.character.id);
      return arr;
    }, []);

    let p = Promise.resolve();
    var control = false;

    game.actors.forEach(function (v, k) {
      p = p.then(() => { if (v.permission > 1 && v.type == "character" && !controlled.includes(v.id)) control = true });
    })
    await p;

    if (game.user.isGM) {
      game.tours.register("satasupe", "config", await SatasupeTour.fromJSON("systems/satasupe/module/tours/first-gm-char-create.json"))
    } else {
      if (!!game.user.character) {
        if (canCreateActor && canCreateItem) {
          game.tours.register("satasupe", "config", await SatasupeTour.fromJSON("systems/satasupe/module/tours/first-pl-char-create.json"))
        } else {
          game.tours.register("satasupe", "config", await Tour.fromJSON("systems/satasupe/module/tours/first-pl-char-nocreate.json"))
        }
      } else {
        if (canCreateActor && canCreateItem) {
          if (control) {
            game.tours.register("satasupe", "config", await SatasupeTour.fromJSON("systems/satasupe/module/tours/first-pl-nochar-create-select.json"))
          } else {
            game.tours.register("satasupe", "config", await SatasupeTour.fromJSON("systems/satasupe/module/tours/first-pl-nochar-create.json"))
          }
        } else if (control) {
          game.tours.register("satasupe", "config", await Tour.fromJSON("systems/satasupe/module/tours/first-pl-nochar-nocreate-select.json"))
        } else {
          game.tours.register("satasupe", "config", await Tour.fromJSON("systems/satasupe/module/tours/first-pl-nochar-nocreate.json"))
        }
      }
    }

    game.tours.register("satasupe", "char-sheet", await SatasupeTour.fromJSON("systems/satasupe/module/tours/char-sheet.json"))
    game.tours.register("satasupe", "make-item", await SatasupeTour.fromJSON("systems/satasupe/module/tours/make-item.json"))
    game.tours.register("satasupe", "item-sheet", await SatasupeTour.fromJSON("systems/satasupe/module/tours/item-sheet.json"))
    game.tours.register("satasupe", "karma-sheet", await SatasupeTour.fromJSON("systems/satasupe/module/tours/karma-sheet.json"))
    game.tours.register("satasupe", "palette-sheet", await SatasupeTour.fromJSON("systems/satasupe/module/tours/palette-sheet.json"))

    if (game.user.isGM) {
      game.tours.register("satasupe", "investigation-sheet", await SatasupeTour.fromJSON("systems/satasupe/module/tours/investigation-sheet-gm.json"))
      game.tours.register("satasupe", "memo-func", await SatasupeTour.fromJSON("systems/satasupe/module/tours/memo-func-gm.json"))
      game.tours.register("satasupe", "settings", await SatasupeTour.fromJSON("systems/satasupe/module/tours/settings-gm.json"))
      game.tours.register("satasupe", "dd-tools", await SatasupeTour.fromJSON("systems/satasupe/module/tours/dd-tools-gm.json"))
    } else {
      game.tours.register("satasupe", "investigation-sheet", await SatasupeTour.fromJSON("systems/satasupe/module/tours/investigation-sheet-pl.json"))
      if (!game.settings.get("satasupe", "turnskip") && !!game.user.character) game.tours.register("satasupe", "acted-button", await SatasupeTour.fromJSON("systems/satasupe/module/tours/acted.json"))
      game.tours.register("satasupe", "memo-func", await SatasupeTour.fromJSON("systems/satasupe/module/tours/memo-func-pl.json"))
      game.tours.register("satasupe", "settings", await SatasupeTour.fromJSON("systems/satasupe/module/tours/settings-pl.json"))
    }
  }
  catch (e) {
    console.error(e);
  }

  const compare = (a, b) => {
    if (a == b) {
      return 0;
    }

    var a_components = a.split(".");
    var b_components = b.split(".");
    var len = Math.min(a_components.length, b_components.length);

    for (var i = 0; i < len; i++) {
      if (parseInt(a_components[i]) > parseInt(b_components[i])) {
        return 1;
      }

      if (parseInt(a_components[i]) < parseInt(b_components[i])) {
        return -1;
      }
    }

    if (a_components.length > b_components.length) {
      return 1;
    }

    if (a_components.length < b_components.length) {
      return -1;
    }

    return 0;
  }

  const a = game.user.getFlag("satasupe", "announcements");
  if (!!a) {
    let lastversion = duplicate(a.version);
    const nowversion = game.system.version;
    if (compare(nowversion, lastversion) == 1) {
      // Automatic display of update announcements to be implemented (TBD)
      a.version = nowversion;
      game.user.setFlag("satasupe", "announcements", a);
    }
  } else {
    const m = [
      `\n                <div>\n                    <h3 class="nue">${game.i18n.localize(
        "SATASUPE.WelcomeTitle"
      )}</h3>\n                    <p class="nue">${game.i18n.localize(
        "SATASUPE.WelcomeMessage"
      )}</p>\n                    <p class="nue">${game.i18n.localize(
        "SATASUPE.WelcomeMessageTour"
      )}</p>\n                    <p>\n                        <button type="button" class="satasupe-btn-tour">\n                            <i class="fas fa-hiking"></i> ${game.i18n.localize(
        "SATASUPE.WelcomeMessageTourBtn"
      )}\n                        </button>\n                    </p>\n                    <p class="nue">${game.i18n.localize(
        "SATASUPE.WelcomeMessageLast"
      )}</p>\n                    <footer class="nue">${game.i18n.localize(
        "NUE.FirstLaunchHint"
      )}</footer>\n                </div>\n                `,
    ].map((m) => ({
      whisper: [game.user.id],
      speaker: { alias: "Asian Punk RPG: Satasupe" },
      flags: { core: { canPopout: !0 } },
      content: m,
    }));
    ChatMessage.implementation.createDocuments(m);
    game.user.setFlag("satasupe", "announcements", { version: game.system.version });
  }
});

class SatasupeTour extends Tour {

  static #itemlist = [
    `SatasupeKarmaSheet-Compendium-satasupe-items-srQUHXOKQ26pifJG`,
    `SatasupeItemSheet-Compendium-satasupe-items-4KxizPWxeMjp1Xll`,
    `SatasupeItemSheet-Compendium-satasupe-items-ywR4pw8MntLIC8Vk`,
    `SatasupeItemSheet-Compendium-satasupe-items-cAYFrfvrPdEXLxYV`,
    `SatasupeItemSheet-Compendium-satasupe-items-PLU4FGoEGlmwjmSr`,
    `SatasupeChatpaletteSheet-Compendium-satasupe-items-y8IJAzsHHjOZOYt6`,
    `SatasupeInvestigationSheet-Compendium-satasupe-items-s5cJDmA4Fk69VHrv`,
    `SatasupeActorSheet-Compendium-satasupe-actor-q6BkLzggMsf6Zvpx`
  ]

  static #itemSheetList = [
    `item-sheet`, `karma-sheet`, `palette-sheet`, `investigation-sheet`
  ]

  /** @override */
  _onButtonClick(event, buttons) {
    event.preventDefault();

    // Disable all the buttons to prevent double-clicks
    for (let button of buttons) {
      button.classList.add("disabled");
    }
    // Handle action
    const action = event.currentTarget.dataset.action;
    const nextTour = event.currentTarget.dataset?.nexttourid;
    const nextStepId = event.currentTarget.dataset?.nextstepid;
    switch (action) {
      case "exit": return this.exit();
      case "previous": return this.previous();
      case "next": return this.next();
      case "changeTour": return this.changeTour(nextTour, nextStepId);
      default: throw new Error(`Unexpected Tour button action - ${action}`);
    }
  }



  /** @override */
  async start() {
    game.togglePause(false);
    // Charcter sheet view
    if (this.id === "char-sheet") {
      const w = Object.values(ui.windows);
      if (w.length > 0) {
        for (let i = 0; i < w.length; i++) {
          if (w[i].id == "SatasupeActorSheet-Compendium-satasupe-actor-q6BkLzggMsf6Zvpx") {
            await ui.windows[w[i].appId].close()
          };
        }
      }
      const promise = game.packs.contents
        .filter((pack) => (pack.documentClass.documentName === "Actor") && (pack.metadata.label == "Tour Actor") && (pack.metadata.id == "satasupe.actor"))
        .map((pack) => pack.getDocuments());
      const content = await (await Promise.all(promise))[0].filter((actor) => actor._id === "q6BkLzggMsf6Zvpx");
      await content[0].sheet._render(true)
      await super.start();
    } else if (SatasupeTour.#itemSheetList.some((x) => x == this.id)) {
      const w = Object.values(ui.windows);
      if (w.length > 0) {
        for (let i = 0; i < w.length; i++) {
          if (SatasupeTour.#itemlist.some((x) => x == w[i].id)) {
            await ui.windows[w[i].appId].close()
          };
        }
      }
      const promises = game.packs.contents
        .filter((pack) => (pack.documentClass.documentName === "Item") && (pack.metadata.label == "Tour Items") && (pack.metadata.id == "satasupe.items"))
        .map((pack) => pack.getDocuments());
      let id = this.currentStep === null ? this.steps[0]?.itemid : this.currentStep?.itemid;
      const contents = await (await Promise.all(promises))[0].filter((item) => item._id === id);
      await contents[0].sheet._render(true)
      if (this.id === "investigation-sheet") {
        if (this.stepIndex > 5) {
          $("#SatasupeInvestigationSheet-Compendium-satasupe-items-s5cJDmA4Fk69VHrv .window-content form").children(".investigation-main").hide()
          $("#SatasupeInvestigationSheet-Compendium-satasupe-items-s5cJDmA4Fk69VHrv .window-content form").children(".investigation-target").show()
        }
      }
      await super.start();
    } else if (this.id == "memo-func" && this.stepIndex >= 2) {
      const w = Object.values(ui.windows);
      if (w.length > 0) {
        for (let i = 0; i < w.length; i++) {
          if (w[i].constructor.name == "memoApplication") {
            await ui.windows[w[i].appId].close()
          };
        }
      }
      const m = memoApplication.memorender();
      m.then(async () => {
        const x = game.user.getFlag("satasupe", "memo-data")?.tabs;
        let ch = false;
        let pl = false;
        for (let m in x) {
          if (x[m].type == "check") ch = m;
          if (x[m].type == "plain") pl = m;
        }
        let a = void 0;
        const w = Object.values(ui.windows);
        if (w.length > 0) {
          for (let i = 0; i < w.length; i++) {
            if (w[i].constructor.name == "memoApplication") {
              a = i;
            };
          }
        }
        var p = [];
        if (ch === false) {
          p.push(w[a].addtab("check"));
        }
        if (pl === false) {
          p.push(w[a].addtab("plain"));
        }
        let index = this.currentStep === null ? 0 : this.stepIndex;
        const tabname = await Promise.all(p)
        if (this.steps[index].checkTab) {
          if (ch === false) {
            await this.changeMemo(w[a], tabname[tabname.findIndex(i => i?.check)].check)
          } else {
            await this.changeMemo(w[a], ch);
          }
        } else {
          if (pl === false) {
            await this.changeMemo(w[a], tabname[tabname.findIndex(i => i?.plain)].plain)
          } else {
            await this.changeMemo(w[a], pl);
          }
        }
        await super.start();
      })
    } else if (this.id == "settings" && this.stepIndex >= 1) {
      game.settings.sheet._render(true).then(async () => {
        if (this.stepIndex > 0) await this.changeSettings();
        await super.start();
      });
    } else if (this.id === "dd-tools") {
      await this.#activateTool();
      let index = this.currentStep === null ? 0 : this.stepIndex;
      if (this.steps[index].toolwindow == "afterplay") {
        SatasupeMenu.afterPlay().then(async () => {
          await super.start();
        })
      } else {
        await super.start();
      }
    } else if (this.id == "config") {
      if (this.steps[this.stepIndex]?.config) {
        game.settings.sheet._render(true).then(async () => {
          await this.changeSettings(false);
          await super.next();
        });
      } else {
        await super.start();
      }
    } else {
      await super.start();
    }
  }

  /** @override */
  async next() {
    const n = (this.steps[this.stepIndex + 1]?.itemid) != (this.steps[this.stepIndex]?.itemid);
    const w = Object.values(ui.windows);
    if ((this.id === "investigation-sheet") && (this.steps[this.stepIndex + 1]?.investigation == "DD") && (this.steps[this.stepIndex]?.investigation != "DD")) {
      $("#SatasupeInvestigationSheet-Compendium-satasupe-items-s5cJDmA4Fk69VHrv .window-content form").children(".investigation-main").hide()
      $("#SatasupeInvestigationSheet-Compendium-satasupe-items-s5cJDmA4Fk69VHrv .window-content form").children(".investigation-target").show()
    }
    if (this.id == "memo-func") {
      var m;
      if (this.stepIndex == 1) {
        if (w.length > 0) {
          for (let i = 0; i < w.length; i++) {
            if (w[i].constructor.name == "memoApplication") {
              await ui.windows[w[i].appId].close()
            };
          }
        }
        m = memoApplication.memorender();
      } else {
        m = Promise.resolve();
      }
      m.then(async () => {
        const w = Object.values(ui.windows);
        if (this.stepIndex > 0) {
          const x = game.user.getFlag("satasupe", "memo-data")?.tabs;
          let ch = false;
          let pl = false;
          for (let m in x) {
            if (x[m].type == "check") ch = m;
            if (x[m].type == "plain") pl = m;
          }
          let a = void 0;
          if (w.length > 0) {
            for (let i = 0; i < w.length; i++) {
              if (w[i].constructor.name == "memoApplication") {
                a = i;
              };
            }
          }
          var p = [];
          if (ch === false) {
            p.push(w[a].addtab("check"));
          }
          if (pl === false) {
            p.push(w[a].addtab("plain"));
          }
          const tabname = await Promise.all(p)
          if (this.steps[this.stepIndex + 1]?.checkTab) {
            if (ch === false) {
              await this.changeMemo(w[a], tabname[tabname.findIndex(i => i?.check)].check)
            } else {
              await this.changeMemo(w[a], ch);
            }
            await super.next();
          } else {
            if (pl === false) {
              await this.changeMemo(w[a], tabname[tabname.findIndex(i => i?.plain)].plain)
            } else {
              await this.changeMemo(w[a], pl);
            }
            await super.next();
          }
        } else { await super.next(); }
      })
    } else if ((SatasupeTour.#itemSheetList.some((x) => x == this.id)) && (this.steps[this.stepIndex + 1]?.itemid) && n) {
      if (w.length > 0) {
        for (let i = 0; i < w.length; i++) {
          if (SatasupeTour.#itemlist.some((x) => x == w[i].id)) {
            await ui.windows[w[i].appId].close()
          };
        }
      }

      const promises = game.packs.contents
        .filter((pack) => (pack.documentClass.documentName === "Item") && (pack.metadata.label == "Tour Items") && (pack.metadata.id == "satasupe.items"))
        .map((pack) => pack.getDocuments());
      const contents = await (await Promise.all(promises))[0].filter((item) => item._id === this.steps[this.stepIndex + 1].itemid);
      await contents[0].sheet._render(true)
      await super.next();
    } else if (this.id == "settings" && this.stepIndex >= 0) {
      game.settings.sheet._render(true).then(async () => {
        if (this.stepIndex > 0) await this.changeSettings();
        await super.next();
      });
    } else if (this.id === "dd-tools") {
      if (this.steps[this.stepIndex + 1]?.toolwindow == "afterplay" && this.steps[this.stepIndex]?.toolwindow != "afterplay") {
        SatasupeMenu.afterPlay().then(async () => {
          await super.next();
        })
      } else {
        await super.next();
      }
    } else if (this.id == "config") {
      if (this.steps[this.stepIndex + 1]?.config && !this.steps[this.stepIndex]?.config) {
        game.settings.sheet._render(true).then(async () => {
          await this.changeSettings(false);
          await super.next();
        });
      } else if (!this.steps[this.stepIndex + 1]?.config && this.steps[this.stepIndex]?.config) {
        if (w.length > 0) {
          for (let i = 0; i < w.length; i++) {
            if (w[i].constructor.name == "SettingsConfig") {
              await ui.windows[w[i].appId].close()
            };
          }
        }
        await super.next();
      } else {
        await super.next();
      }
    } else {
      await super.next();
    }
  }

  async previous() {
    const n = (this.steps[this.stepIndex - 1]?.itemid) != (this.steps[this.stepIndex]?.itemid);
    const w = Object.values(ui.windows);
    if ((this.id === "investigation-sheet") && (this.steps[this.stepIndex - 1]?.investigation != "DD") && (this.steps[this.stepIndex]?.investigation == "DD")) {
      $("#SatasupeInvestigationSheet-Compendium-satasupe-items-s5cJDmA4Fk69VHrv .window-content form").children(".investigation-target").hide()
      $("#SatasupeInvestigationSheet-Compendium-satasupe-items-s5cJDmA4Fk69VHrv .window-content form").children(".investigation-main").show()
    }
    if (this.id == "memo-func") {
      if (!this.steps[this.stepIndex - 1].checkTab) {
        if (this.stepIndex == 2) {
          if (w.length > 0) {
            for (let i = 0; i < w.length; i++) {
              if (w[i].constructor.name == "memoApplication") {
                await ui.windows[w[i].appId].close()
              };
            }
          }
        }
        const x = game.user.getFlag("satasupe", "memo-data")?.tabs;
        let t;
        for (let m in x) {
          if (x[m].type == "plain") t = m;
        }
        let a = void 0;
        if (w.length > 0) {
          for (let i = 0; i < w.length; i++) {
            if (w[i].constructor.name == "memoApplication") {
              a = i;
            };
          }
        }
        await this.changeMemo(w[a], t);
        await super.previous();
      } else {
        await super.previous();
      }
    } else if ((SatasupeTour.#itemSheetList.some((x) => x == this.id)) && (this.steps[this.stepIndex - 1]?.itemid) && n) {
      if (w.length > 0) {
        for (let i = 0; i < w.length; i++) {
          if (SatasupeTour.#itemlist.some((x) => x == w[i].id)) {
            await ui.windows[w[i].appId].close()
          };
        }
      }

      const promises = game.packs.contents
        .filter((pack) => (pack.documentClass.documentName === "Item") && (pack.metadata.label == "Tour Items") && (pack.metadata.id == "satasupe.items"))
        .map((pack) => pack.getDocuments());
      const contents = await (await Promise.all(promises))[0].filter((item) => item._id === this.steps[this.stepIndex - 1].itemid);
      await contents[0].sheet._render(true)
      await super.previous();
    } else if (this.id == "settings" && this.stepIndex >= 2) {
      game.settings.sheet._render(true).then(async () => {
        if (this.stepIndex > 2) await this.changeSettings();
        if (this.stepIndex == 2) await this.changeSettings(false);
        await super.previous();
      });
    } else if (this.id === "dd-tools") {
      if (this.steps[this.stepIndex - 1].toolwindow == "afterplay") {
        SatasupeMenu.afterPlay().then(async () => {
          await super.previous();
        })
      } else {
        await super.previous();
      }
    } else if (this.id == "config") {
      if (!this.steps[this.stepIndex]?.config && this.steps[this.stepIndex - 1]?.config) {
        game.settings.sheet._render(true).then(async () => {
          await this.changeSettings(false);
          await super.previous();
        });
      } else if (this.steps[this.stepIndex]?.config && !this.steps[this.stepIndex - 1]?.config) {
        if (w.length > 0) {
          for (let i = 0; i < w.length; i++) {
            if (w[i].constructor.name == "SettingsConfig") {
              await ui.windows[w[i].appId].close()
            };
          }
        }
        await super.previous();
      } else {
        await super.previous();
      }
    } else {
      await super.previous();
    }
  }

  /** @override */
  async complete() {
    const w = Object.values(ui.windows);
    if (w.length > 0) {
      for (let i = 0; i < w.length; i++) {
        if (SatasupeTour.#itemlist.some((x) => x == w[i].id)) {
          await ui.windows[w[i].appId].close()
        };
        if (w[i].constructor.name == "memoApplication" && this.id == "memo-func") await ui.windows[w[i].appId].close()
        if (w[i].constructor.name == "SettingsConfig" && (this.id == "settings" || this.id == "config")) await ui.windows[w[i].appId].close()
      }
    }
    await super.complete();
  }

  /** @override */
  async exit() {
    const w = Object.values(ui.windows);
    if (w.length > 0) {
      for (let i = 0; i < w.length; i++) {
        if (SatasupeTour.#itemlist.some((x) => x == w[i].id)) {
          ui.windows[w[i].appId].close()
        };
        if (w[i].constructor.name == "memoApplication" && this.id == "memo-func") await ui.windows[w[i].appId].close()
        if (w[i].constructor.name == "SettingsConfig" && (this.id == "settings" || this.id == "config")) await ui.windows[w[i].appId].close()
      }
    }

    super.exit();
  }

  /** @override */
  static async fromJSON(filepath) {
    const json = await foundry.utils.fetchJsonWithTimeout(foundry.utils.getRoute(filepath, { prefix: ROUTE_PREFIX }));
    return new this(json);
  }

  /* -------------------------------------------- */

  async _postStep() {
    await super._postStep();
  }

  /** @override */
  async _preStep() {

    await super._preStep();

    // Karma sheet tabs
    if ((this.id === "karma-sheet") && (this.currentStep?.karmaTab)) {
      await this._updateKarmasheet();
    }

    // Configure specific steps
    if (this.id === "config" || this.id == "make-item" || this.id == "settings") {
      await this._updateSidebarTab();
    }

    // Charcter sheet tabs
    if (this.id === "char-sheet") {
      await this._updateCharsheet();
    }
  }

  async #activateTool() {
    let index = this.currentStep === null ? 0 : this.stepIndex;
    if ("layer" in this.steps[index] && canvas.scene) {
      const layer = canvas[this.steps[index].layer];
      if (layer.active) ui.controls.initialize({ tool: this.steps[index].tool });
      else layer.activate({ tool: this.steps[index].tool });
    }
  }

  async changeMemo(memo, name) {
    memo.activateTab(name)
  }

  async changeTour(id, index = -1) {
    await this.exit();
    const nextTour = game.tours.get("satasupe." + id)
    if (Number(index) > 0) {
      let progress = await game.settings.get("core", "tourProgress");
      progress.satasupe[id] = Number(index);
      await game.settings.set("core", "tourProgress", progress);
      await nextTour._reloadProgress()
    }
    nextTour.start();
  }

  async changeSettings(option = true) {
    const w = Object.values(ui.windows);
    if (w.length > 0) {
      for (let i = 0; i < w.length; i++) {
        if (option) {
          if (w[i].constructor.name == "SettingsConfig") ui.windows[w[i].appId].activateTab("system")
        } else {
          if (w[i].constructor.name == "SettingsConfig") ui.windows[w[i].appId].activateTab("all")
        }
      }
    }
  }

  async _renderStep() {
    if (this.id === "char-sheet" || (this.id == "memo-func" && !!this.stepIndex && this.stepIndex != 1) || ((SatasupeTour.#itemSheetList.some((x) => x == this.id)) && (this.currentStep?.itemid))) {
      const step = this.currentStep;
      const d = document.createElement("div");
      d.classList.add("tour-fadeout");
      d.classList.add("tempo");
      const targetBoundingRect = this.targetElement.getBoundingClientRect();

      d.style.width = `${targetBoundingRect.width + (step.selector ? Tour.HIGHLIGHT_PADDING : 0)}px`;
      d.style.height = `${targetBoundingRect.height + (step.selector ? Tour.HIGHLIGHT_PADDING : 0)}px`;
      d.style.top = `${targetBoundingRect.top - ((step.selector ? Tour.HIGHLIGHT_PADDING : 0) / 2)}px`;
      d.style.left = `${targetBoundingRect.left - ((step.selector ? Tour.HIGHLIGHT_PADDING : 0) / 2)}px`;
      document.body.appendChild(d);
      await super._renderStep();
      document.body.getElementsByClassName("tempo")[0].remove();
    } else {
      await super._renderStep();
    }
  }

  /* -------------------------------------------- */

  async _updateCharsheet() {
    if (this.currentStep.charactersheetTab) {
      const w = Object.values(ui.windows);
      if (w.length > 0) {
        for (let i = 0; i < w.length; i++) {
          if (w[i].id == `SatasupeActorSheet-Compendium-satasupe-actor-q6BkLzggMsf6Zvpx`) {
            ui.windows[w[i].appId].activateTab(this.currentStep.charactersheetTab);
          };
        }
      }
    }
  }

  async _updateKarmasheet() {
    const w = Object.values(ui.windows);
    if (w.length > 0) {
      for (let i = 0; i < w.length; i++) {
        if (w[i].id == `SatasupeKarmaSheet-Compendium-satasupe-items-srQUHXOKQ26pifJG`) {
          ui.windows[w[i].appId].activateTab(this.currentStep.karmaTab);
        };
      }
    }
  }

  async _updateSidebarTab() {
    if (this.currentStep.sidebarTab) {
      ui.sidebar.activateTab(this.currentStep.sidebarTab);
    }
  }
}

Hooks.on('ready', async function () {
  game.socket.on('system.satasupe', async (packet) => {
    let data = packet.data;
    let type = packet.type;
    if (type != "selected") {
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
    } else {
      let result = packet.result;
      const isGM = game.user.isGM;
      if (isGM) {
        if (packet.voteT == "karma") {
          SatasupeChatCard._onChatCardSwitchK(result)
        } else if (packet.voteT == "mvp") {
          SatasupeChatCard._onChatCardSwitchM(result)
        } else if (packet.voteT == "button") {
          await SatasupeChatCard._onChatCardAction(result)
          await SatasupeChatCard._progressupdate();
        } else if (packet.voteT == "gene") {
          SatasupeChatCard._onChatCardSwitchG(result)
        }
      } else {
        if (packet.voteT == "notact") {
          if (game.user.character) {
            await SatasupeMenu.actedintheTurn(data, true)
          }
        }
      }
      if (packet.voteT == "sharememo") {
        if (game.user.id == result || result == -1) {
          await memoApplication._sharememo(packet.data)
        }
      } else if (packet.voteT == "info") {
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
  html.find("tr.variable-section").attr('draggable', 'false');
  html.find("tr.chatpalette-section").attr('draggable', 'false');

  html.find(".show-detail").click(ev => {
    let button = $(ev.currentTarget);
    button.parent('.item-controls').parent().next('.item-detail').children('td').removeClass("item-hide");
    $(button).hide();
    $(button).next().css("display", "contents");
  });
  html.find(".close-detail").click(ev => {
    let button = $(ev.currentTarget);
    button.parent('.item-controls').parent().next('.item-detail').children('td').addClass("item-hide");
    $(button).hide();
    $(button).prev().show();
  });
  html.find('div.passdrparea').on("drop", async function (ev) {
    let reciveactorid = ev.currentTarget.dataset.actorid;
    var id = JSON.parse(ev.originalEvent.dataTransfer.getData('text/plain'));
    const sendActor = game.actors.get(id.actorid);
    const receiveActor = game.actors.get(reciveactorid);
    if (sendActor.id != receiveActor.id) {
      const currentItem = sendActor.items.find(item => item.id === id.key);
      if (game.user.isGM) {
        await SatasupeGiveItem.receiveItem({ sendActor, receiveActor, currentItem });
        await SatasupeGiveItem.sendMessageToPL({ sendActor, receiveActor, currentItem });
        await SatasupeGiveItem.completeTrade({ sendActor: receiveActor, receiveActor: sendActor, currentItem: currentItem });
      } else {
        game.socket.emit('system.satasupe', {
          data: { sendActor, receiveActor, currentItem },
          receiveActorId: receiveActor.id,
          sendActorId: sendActor.id,
          type: "request"
        });
      }
    }
  });
});

Hooks.on("renderItemSheet", async (app, html, data) => {

  if (app.object.type == "investigation") {
    const itemid = app.object.id;
    if (app.object.ownership.default != 3) ui.notifications.error(game.i18n.localize("ALERTMESSAGE.DefaultInvestigationPermission"));
    const maxsl = data.system.maxsl + 3;
    for (let i = 0; i < maxsl; i++) {
      if (i == 0) {
        $(`.investigation-main#${itemid} .investigation-sl`).append(`<div class="sl${i}list" style="vertical-align: top;display: inline-block;width: 200px;"><div class="sllist" style="display: inline-block;width:50px;vertical-align: top;">SL ${i}</div><button class="start-topic-add" type="button" style="vertical-align: top;display:inline-block;width:120px;height:fit-content;height:-moz-fit-content;margin: 0px 2px 0px 5px;line-height: 16px; font-size: 10.5px;">${game.i18n.localize("SATASUPE.AddStartTopic")}</button></div>`);
      } else {
        $(`.investigation-main#${itemid} .investigation-sl`).append(`<div class="sl${i}list" style="vertical-align: top;display: inline-block;width: 200px;"><div class="sllist" style="display: inline-block;width:50px;vertical-align: top;">SL ${i}</div></div>`);
      }
    }

    for (let k = 0; k < data.system.target.length; k++) {
      let place = data.system.target[k].sl;
      if (data.system.target[k].open) {
        var taglist = "";
        for (let l = 0; l < data.system.target[k].tag.length; l++) {
          for (let [key, v] of Object.entries(SATASUPE['hobby'])) {
            if (data.system.target[k].tag[l]) {
              if (key == data.system.target[k].tag[l]) {
                taglist += game.i18n.localize(v);
                if (l != (data.system.target[k].tag.length - 1)) taglist += ", ";
              }
            }
          }
        }
      }

      if (!taglist) taglist = game.i18n.localize("SATASUPE.TargetPrivate")
      if (data.system.target[k].checked) taglist += " ★";
      $(`.investigation-main#${itemid} .investigation-sl .sl${place}list`).append(`<div class="target-sl" style="width:150px;display:block;white-space:normal;">TARGET : ${taglist}</div>`);
    }

    for (let j = 0; j < data.system.dendrogram.length; j++) {
      if (Object.keys(data.system.dendrogram[j]).length) {
        const parentindex = data.system.dendrogram[j].path[data.system.dendrogram[j].path.length - 2];
        const sl = data.system.dendrogram[j].sl;
        let parentsl = -1;
        const grandparentindex = data.system.dendrogram[j].path[data.system.dendrogram[j].path.length - 3];
        let grandparentsl = -1;
        if (sl != 0) {
          parentsl = data.system.dendrogram[parentindex].sl;
        }
        if (data.system.dendrogram[grandparentindex]) {
          grandparentsl = data.system.dendrogram[grandparentindex].sl;
        }
        let tagaddzone = "";
        var style = ``;
        if (parentsl > grandparentsl) {
          style = `<style>.tagindex${parentindex}::after{content: "";display: flex;position: relative;justify-content: flex-end;top:13px;left: 0px;width: 0px;height: 20px;border-left: 3px solid brown;margin-left:${200 * (Math.abs(parentsl - grandparentsl))}px;}</style>`;
        } else if (parentsl < grandparentsl) {
          style = `<style>.tagindex${parentindex}::after{content: "";display: flex;position: relative;justify-content: flex-end;top:13px;left: 0px;width: 0px;height: 20px;border-left: 3px solid brown;margin-right:${200 * (grandparentsl - parentsl)}px;}</style>`;
        }
        if (sl == 0) {
          tagaddzone = SatasupeInvestigationSheet.tagzone_create(j, data, 0, -1, -1);
          $(`.investigation-main#${itemid} .investigation-property`).append(tagaddzone);
        } else {
          tagaddzone = SatasupeInvestigationSheet.tagzone_create(j, data, sl, parentsl, grandparentsl);
          $(`.investigation-main#${itemid} .investigation-property .indexnum${parentindex}`).append(tagaddzone);
          $(`.investigation-main#${itemid} .investigation-property .listindex${parentindex}`).append(style);
          if (sl > parentsl) {
            if (parentsl < grandparentsl) {
              $(`.investigation-main#${itemid} .investigation-property .indexnum${parentindex}.tree`).css('left', '50px');
            }
          } else if (sl < parentsl) {
            if (parentsl > grandparentsl) {
              $(`.investigation-main#${itemid} .investigation-property .taglistzone.listindex${j}`).css('left', `${-50 - 200 * (parentsl - sl)}px`);
            }
          }
        }
      }
    }

    html.find('.target-set').click(ev => {
      app.object.update({ 'system.gmsetting': !data.system.gmsetting });
      if (data.system.gmsetting && game.user.isGM) {
        $(`.investigation-main#${itemid}`).css('display', 'none');
        $(`.investigation-target#${itemid}`).css('display', '');
      } else {
        $(`.investigation-main#${itemid}`).css('display', '');
        $(`.investigation-target#${itemid}`).css('display', 'none');
      }
    });
    if (data.system.gmsetting && game.user.isGM) {
      $(`.investigation-main#${itemid}`).css('display', 'none');
      $(`.investigation-target#${itemid}`).css('display', '');
    } else {
      $(`.investigation-main#${itemid}`).css('display', '');
      $(`.investigation-target#${itemid}`).css('display', 'none');
    }
    html.find('.add-branch').click(ev => {
      const index = parseInt(ev.currentTarget.dataset.slindex);
      let view = true;
      if (app.object.system.dendrogram[index].playerlist.length == 0) {
        view = true;
      }
      for (let m = 0; m < app.object.system.dendrogram[index].playerlist.length; m++) {
        if ((app.object.system.dendrogram[index].playerlist[m].id != game.user.id) || (game.user.isGM) || (game.settings.get("satasupe", "InvestigationTopicReuse"))) {
        } else if ((app.object.system.dendrogram[index].playerlist[m].id == game.user.id) && (!game.user.isGM) && (!game.settings.get("satasupe", "InvestigationTopicReuse"))) {
          ui.notifications.error(game.i18n.localize("ALERTMESSAGE.SelectedTopic"));
          view = false;
        }
      }
      if (view) {
        if (data.system.dendrogram[index].tag) {
          SatasupeInvestigationSheet._createBranch(ev, app.object, index, data);
        } else {
          ui.notifications.error(game.i18n.localize("ALERTMESSAGE.ParentTag"));
        }
      }
    });
    html.find('.tag-delete').click(ev => {
      const index = parseInt(ev.currentTarget.dataset.slindex);
      SatasupeInvestigationSheet._deleteBranch(ev, app.object, index, data);
    });
    html.find('.start-topic-add').click(ev => {
      SatasupeInvestigationSheet._createStartTopic(ev, app.object);
    });
  }
});
