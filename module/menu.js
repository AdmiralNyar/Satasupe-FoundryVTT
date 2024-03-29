import { SATASUPE } from "./config.js";
import { SelectItemDialog } from "./apps/select-item-dialog.js";
import { LoadDialog } from "./apps/loaddialog.js";
import { SatasupeChatCard } from "./chat-card.js";
import { memoApplication } from "./apps/memo.js"

export class SatasupeMenuLayer extends InteractionLayer {
    constructor() {
        super()
        this.objects = { visible: false }
    }

    static get layerOptions() {
        return foundry.utils.mergeObject(super.layerOptions, {
            name: 'ddtools',
            zIndex: 60
        })
    }

    static get documentName() {
        return 'Token'
    }

    get placeables() {
        return []
    }
}

export class SatasupeMenu {
    static getButtons(controls) {
        canvas.ddtools = new SatasupeMenuLayer();
        const isGM = game.user.isGM;
        controls.push({
            icon: 'fas fa-toolbox',
            name: 'ddtools',
            layer: 'ddtools',
            title: 'SATASUPE.DDTools',
            visible: isGM,
            tools: [
                {
                    button: true,
                    icon: 'fas fa-arrow-alt-circle-right',
                    name: 'nextturn',
                    title: "SATASUPE.NextTurn",
                    onClick: async (event) => await SatasupeMenu.turnskip(event, 1)
                }, {
                    button: true,
                    icon: 'fas fa-arrow-alt-circle-left',
                    name: 'prevturn',
                    title: 'SATASUPE.PrevTurn',
                    onClick: async (event) => await SatasupeMenu.turnskipcheck(event, -1)
                }, {
                    button: true,
                    icon: 'fas fa-clock',
                    name: 'worktime',
                    title: 'SATASUPE.ChangeWorkTime',
                    onClick: async (event) => await SatasupeMenu.worktime(event)
                }, {
                    button: true,
                    icon: 'fas fa-calendar-check',
                    name: 'limit',
                    title: 'SATASUPE.ChangeLimit',
                    onClick: async (event) => await SatasupeMenu.changeLimit(event)
                }, {
                    button: true,
                    icon: 'fas fa-glass-cheers',
                    name: 'afterplay',
                    title: 'SATASUPE.AfterPlay',
                    onClick: async (event) => await SatasupeMenu.afterPlay(event)
                }, {
                    button: true,
                    icon: 'fas fa-address-book',
                    name: 'choiceplayer',
                    title: 'SATASUPE.ChoosePlayer',
                    onClick: async (event) => await SatasupeMenu.choicePlayer(event)
                }, {
                    button: true,
                    icon: 'fas fa-poll',
                    name: 'vote',
                    title: 'SATASUPE.VOTE',
                    onClick: async (event) => {
                        let data = await SelectItemDialog.originalVote(event);
                        if (data) await SatasupeChatCard.votecard(data);
                    }
                }, {
                    button: true,
                    icon: 'fas fa-fist-raised',
                    name: 'combat-check',
                    title: 'SATASUPE.CombatCheck',
                    onClick: async (event) => await SatasupeMenu.combatchecked(event)
                }, {
                    button: true,
                    icon: 'fas fa-trash',
                    name: 'reset',
                    title: 'SATASUPE.Refresh',
                    onClick: async (event) => await SatasupeMenu.menuReset(event)
                }
            ]
        });
    }

    static async renderControls(app, html, data) {
        const canCreateActor = game.user.can("ACTOR_CREATE");
        const canCreateItem = game.user.can("ITEM_CREATE");
        const display = canCreateActor && canCreateItem;
        const vis = (!!game.user.character && !game.settings.get("satasupe", "turnskip"))
        let ddMenu = html.find('.fa-toolbox').parent();
        if (!game.user.isGM) ddMenu = html.find('.fa-bookmark').parent();
        ddMenu.addClass('satasupe-menu')
        ddMenu.after(
            '<li class="scene-control satasupe-menu satasupe-memo" title="' +
            game.i18n.localize('SATASUPE.MEMO') +
            '"><i class="fas fa-sticky-note"></i></li>'
        );
        if (vis) {
            let act = "";
            if (game.user.character.system.status.turn.value) act = "active"
            ddMenu.after(
                `<li class="scene-control satasupe-menu toggle ${act} satasupe-acted" title="` +
                game.i18n.localize('SATASUPE.Acted') +
                `"><i class="fas fa-user-check"></i></li>`
            )
        }
        if (display) {
            ddMenu.after(
                '<li class="scene-control satasupe-menu satasupe-char-dl" title="' +
                game.i18n.localize('SATASUPE.MenuLoad') +
                '"><i class="fas fa-file-download"></i></li>'
            )
        }
        html
            .find('.satasupe-menu.satasupe-memo')
            .click(async (event) => await memoApplication.memorender(event))
        html
            .find('.satasupe-menu.satasupe-char-dl')
            .click(async (event) => await SatasupeMenu.charaloaddialog(event))
        html
            .find('.satasupe-menu.satasupe-acted')
            .click(async event => await SatasupeMenu.actedintheTurn(event))
    }

    static async turnskipcheck(event, option) {
        Dialog.confirm({
            title: game.i18n.localize("SATASUPE.Confirm"),
            content: game.i18n.localize("SATASUPE.ConfirmPrevTurn"),
            yes: async () => {
                await SatasupeMenu.turnskip(event, option)
            },
            no: () => { }
        })
    }

    static async turnskip(event, option) {
        let value = game.settings.get("satasupe", "turnCount");
        if (game.settings.get("satasupe", 'playerlist')) {
            let playerlist = game.settings.get("satasupe", 'playerlist');
            let list = [];
            if (!playerlist[0]) {
                let players = game.users.filter((i) => true == !!i.character);
                playerlist = [];
                for (let i = 0; i < players.length; i++) {
                    playerlist.push({ id: players[i].id, key: i, name: players[i].name, check: true })
                }
                await game.settings.set("satasupe", 'playerlist', playerlist);
            }
            list = playerlist.filter((i) => true == i.check);
            if (list[0]) {
                let turn = false;
                for (let k = 0; k < list.length; k++) {
                    let actor = game.users.get(list[k].id).character;
                    if (actor) {
                        if (!actor.system.status.turn.value) {
                            turn = true;
                        }
                    }
                }
                if (option < 0) turn = false;
                if (game.settings.get("satasupe", "turnskip")) turn = false;
                if (!turn) {
                    if (option < 0) {
                        if (value > 0) {
                            value -= 1;
                        } else {
                            ui.notifications.error(game.i18n.localize("SATASUPE.Turn0"));
                        }
                    } else if (option > 0) {
                        value = 1 + value;
                    }
                    await game.settings.set("satasupe", "turnCount", value);
                    let self = list.filter((j) => game.user.id == j.id);
                    let other = list.filter((j) => game.user.id != j.id);
                    if (self[0] && !game.user.isGM) {
                        const ownActor = duplicate(game.user.character.system);
                        ownActor.status.turn.value = !ownActor.status.turn.value;
                        if ((value % game.settings.get("satasupe", 'worktimeValue') == 1) && (value != 1)) ownActor.status.investigation.value = 0;
                        ui.notifications.info(game.i18n.localize("SATASUPE.UnActedinfo"));
                        await game.user.character.update({ 'system.status': ownActor.status });
                        ui.controls.render();
                    }
                    if (other[0]) {
                        for (let pl of other) {
                            if (!(game.users.get(pl.id).isGM)) {
                                let plactor = duplicate(game.users.get(pl.id).character?.system);
                                if (plactor) {
                                    if ((value % game.settings.get("satasupe", 'worktimeValue') == 1) && (value != 1)) {
                                        plactor.status.investigation.value = 0;
                                        await game.users.get(pl.id).character.update({ 'system.status': plactor.status });
                                    }
                                }
                            }
                        }
                    }
                    if (!game.settings.get("satasupe", "turnskip")) await game.socket.emit('system.satasupe', { result: null, type: "selected", data: value, voteT: "notact" });
                    if (value > 0) {
                        let worktime = game.settings.get("satasupe", 'worktimeValue');
                        let dayturn = value % worktime;
                        if (dayturn == 0) dayturn = worktime;
                        let day = Math.floor(value / (worktime + 0.1)) + 1;
                        let defturn = false;
                        if (worktime == 5) {
                            for (let [key, value] of Object.entries(SATASUPE.turncount)) {
                                if (key == dayturn) {
                                    defturn = value;
                                }
                            }
                        };
                        let lastturn = false;
                        const worklimit = game.settings.get("satasupe", 'worklimit');
                        if (worklimit.limit == value && !worklimit.secret) lastturn = true;
                        let rule = await game.settings.get("satasupe", "turndisplay");
                        if (defturn) defturn = game.i18n.localize(defturn)
                        let disp = game.i18n.format('SATASUPE.TurnCount', { turn: dayturn, day: day });
                        if (defturn) disp = game.i18n.format('SATASUPE.TurnCount', { turn: defturn, day: day });
                        if (rule == "0" || rule == "2") {
                            var message = await renderTemplate('systems/satasupe/templates/cards/turnskipcard.html', { disp: disp, lastturn: lastturn });
                            let chatMessage = {
                                user: game.user.id,
                                speaker: ChatMessage.getSpeaker({ alias: "System" }),
                                blind: false,
                                whisper: null,
                                content: message
                            }
                            let card = await ChatMessage.create(chatMessage);
                        }
                        if (rule == "1" || rule == "2") {
                            await game.socket.emit('system.satasupe', { result: disp, type: "selected", data: null, voteT: "info" });
                            ui.notifications.info(disp);
                            if (lastturn) {
                                await game.socket.emit('system.satasupe', { result: game.i18n.localize("SATASUPE.LastTurn"), type: "selected", data: null, voteT: "info" });
                                ui.notifications.info(game.i18n.localize("SATASUPE.LastTurn"));
                            }
                        }
                    }
                } else {
                    ui.notifications.warn(game.i18n.localize("SATASUPE.Unacted"))
                }
            }
        }
    }

    static async worktime(event) {
        let value = game.settings.get("satasupe", 'worktimeValue');
        let formValue = await SatasupeMenu._changeWorktimeDialog(value);
        let rule = game.settings.get("satasupe", "worktime");
        let totaldailyturn;
        if (formValue) {
            if (rule) {
                totaldailyturn = formValue;
                if (formValue < 2) totaldailyturn = 5;
            } else {
                if (formValue > 4) {
                    totaldailyturn = Math.ceil(3 * formValue / 2) - 1;
                } else {
                    if (formValue == 3) totaldailyturn = 5;
                    if (formValue == 2) totaldailyturn = 3;
                    if (formValue == 1) totaldailyturn = 2;
                    if (formValue < 1) totaldailyturn = 5;
                }

            }
            await game.settings.set('satasupe', 'worktimeValue', totaldailyturn);
        }
    }

    static async changeLimit(event) {
        let value = game.settings.get("satasupe", 'worklimit');
        let worktime = game.settings.get("satasupe", 'worktimeValue');
        let turn = game.settings.get("satasupe", "turnCount");
        let newlimit, secret, data;
        data = await SatasupeMenu._changeLimitDialog(turn, worktime, value);
        newlimit = data.newturn;
        secret = false;
        if (data) {
            if (data.secret == "true") secret = true;
            await game.settings.set('satasupe', 'worklimit', { limit: newlimit, secret: secret });
        }
    }

    static async afterPlay(event) {
        return new Promise(async (com) => {
            let progress = game.settings.get("satasupe", "afterplayprogress");
            if (!Object.keys(progress).length) {
                let player = game.settings.get("satasupe", "playerlist");
                if (!player[0]) {
                    let players = game.users.filter((i) => (true == !!i.character) || i.isGM);
                    for (let i = 0; i < players.length; i++) {
                        player.push({ id: players[i].id, key: i, name: players[i].name, check: true })
                    }
                    await game.settings.set("satasupe", 'playerlist', player);
                }
                let list = [];
                for (let j = 0; j < player.length; j++) {
                    list.push({ id: player[j].id, name: player[j].name, cardlist: [] })
                }
                let progresslist = { addiction: { list: list }, karma: { list: list }, aftertable: { list: list }, discussionK: { list: list }, discussionM: { cardid: null, voteid: null }, prisoner: { list: list }, upkeep: { rich: list, upkeep: list } }
                game.settings.set("satasupe", "afterplayprogress", progresslist);
            }
            const p = SelectItemDialog._afterplaylistDialog();
            p.then(() => {
                com()
            });
        })

    }

    static async choicePlayer(event) {
        var playerlist = await SelectItemDialog._makeplayerlist()
        await game.settings.set("satasupe", 'playerlist', playerlist);
    }

    static async combatchecked(event) {
        if (game.settings.get("satasupe", 'playerlist')) {
            let playerlist = game.settings.get("satasupe", 'playerlist');
            let list = [];
            if (!playerlist[0]) {
                let players = game.users.filter((i) => true == !!i.character || i.isGM);
                playerlist = [];
                for (let i = 0; i < players.length; i++) {
                    playerlist.push({ id: players[i].id, key: i, name: players[i].name, check: true })
                }
                await game.settings.set("satasupe", 'playerlist', playerlist);
            }
            list = playerlist.filter((i) => true == i.check);
            for (let i = 0; i < list?.length; i++) {
                let actor = game.users.get(list[i].id).character;
                if (actor) {
                    let token = actor.getActiveTokens(true, false);
                    if (!!token[0]) await token[0].toggleCombat();
                }
            }
        }
    }

    static async actedintheTurn(data, option) {
        if (game.user.character) {
            const Actor = game.user.character;
            const ownActor = duplicate(game.user.character.system);
            ownActor.status.turn.value = !Actor.system.status.turn.value;
            if (ownActor.status.turn.value) {
                ui.notifications.info(game.i18n.localize("SATASUPE.Actedinfo"))
            } else {
                ui.notifications.info(game.i18n.localize("SATASUPE.UnActedinfo"))
            }
            await Actor.update({ 'system.status': ownActor.status })
        } else {
            ui.notifications.warn(game.i18n.localize("SATASUPE.DontHaveActor"))
        }
        ui.controls.render();
    }

    static async _changeWorktimeDialog(worktime) {
        let rule = game.settings.get("satasupe", "worktime");
        let time = worktime;
        let title;
        let mean;
        let formula;
        let caption;
        if (rule) {
            title = game.i18n.localize("SATASUPE.ChangeTotalDailyTurns");
            mean = game.i18n.localize("SATASUPE.ChangeTotalDailyTurnsMean");
            formula = game.i18n.localize("SATASUPE.ChangeTotalDailyTurnsFolmula");
            caption = game.i18n.localize("SATASUPE.ChangeTotalDailyTurnsCaption");
        } else {
            title = game.i18n.localize("SATASUPE.ChangeWorkTimeTitle");
            mean = game.i18n.localize("SATASUPE.ChangeWorkTimeMean");
            formula = game.i18n.localize("SATASUPE.ChangeWorkTimeFolmula");
            caption = game.i18n.localize("SATASUPE.ChangeWorkTimeCaption");
            time = Math.floor(2 * (worktime + 1) / 3);
            if (worktime == 5) time = 3;
            if (worktime == 2) time = 1;
            if (worktime < 2) time = 3;
        }
        var html = await renderTemplate('systems/satasupe/templates/apps/worktimeDialog.html', { worktime: game.i18n.format("SATASUPE.TurnOnlyCount", { turn: time }), text: { title: title, mean: mean, formula: formula } });
        return new Promise(resolve => {
            let formData;
            const dlg = new Dialog({
                title: caption,
                content: html,
                buttons: {
                    send: {
                        label: game.i18n.localize("SATASUPE.Save"),
                        icon: `<i class="fas fa-save"></i>`,
                        callback: html => {
                            formData = new FormData(html[0].querySelector("#change-worktime"));
                            let newturn = formData.get("newworktime");
                            return resolve(newturn);
                        }
                    }
                },
                default: 'send',
                close: () => { return resolve(false) }
            });
            dlg.render(true);
        });
    }

    static async menuReset(event) {
        await game.settings.set("satasupe", 'turnCount', 0);
        await game.settings.set("satasupe", 'worktimeValue', 5);
        await game.settings.set("satasupe", 'worklimit', { limit: 10, secret: false });
        await game.settings.set("satasupe", 'playerlist', []);
        let player = game.settings.get("satasupe", "playerlist");
        if (!player[0]) {
            let players = game.users.filter((i) => (true == !!i.character) || i.isGM);
            for (let i = 0; i < players.length; i++) {
                player.push({ id: players[i].id, key: i, name: players[i].name, check: true })
            }
            await game.settings.set("satasupe", 'playerlist', player);
        }
        let list = [];
        for (let j = 0; j < player.length; j++) {
            list.push({ id: player[j].id, name: player[j].name, cardlist: [] })
        }
        let progresslist = { addiction: { list: list }, karma: { list: list }, aftertable: { list: list }, discussionK: { list: list }, discussionM: { cardid: null, voteid: null }, prisoner: { list: list }, upkeep: { rich: list, upkeep: list } }
        await game.settings.set("satasupe", "afterplayprogress", progresslist);
        let vote = await game.settings.get("satasupe", 'vote')
        for (let i = 0; i <= vote.length; i++) {
            if (vote.length != i) {
                try { await game.messages.get(vote[i].id)?.setFlag('satasupe', 'activate', true) }
                catch { }
            } else {
                await game.settings.set("satasupe", 'vote', []);
            }
        }
        let chatcard = await game.settings.get("satasupe", 'chatcardlog')
        for (let j = 0; j <= chatcard.length; j++) {
            if (chatcard.length != j) {
                try { await game.messages.get(chatcard[j].id)?.setFlag('satasupe', 'activate', true) }
                catch { }
            } else {
                await game.settings.set("satasupe", 'chatcardlog', []);
            }
        }
        await ui.notifications.info(game.i18n.localize("SATASUPE.RefreshFinished"));
    }

    static async _changeLimitDialog(turn, worktime, limit) {
        let option = false;
        if (turn <= 0) option = true;
        let dayturn = turn % worktime;
        if (dayturn == 0) dayturn = worktime;
        let day = Math.floor(turn / (worktime + 0.1)) + 1;
        let limitturn = limit.limit % worktime;
        if (limitturn == 0) limitturn = worktime;
        let limitday = Math.floor(limit.limit / (worktime + 0.1)) + 1;
        let defturn = false;
        let deflimitturn = false;
        if (worktime == 5) {
            for (let [key, value] of Object.entries(SATASUPE.turncount)) {
                if (key == dayturn) {
                    defturn = game.i18n.localize(value);
                }
                if (key == limitturn) {
                    deflimitturn = game.i18n.localize(value);
                }
            }
        };
        var limitlist = [];
        for (let j = 1; j < 51; j++) {
            let a = j % worktime;
            if (a == 0) a = worktime;
            if (worktime == 5) {
                for (let [k, v] of Object.entries(SATASUPE.turncount)) {
                    if (k == a) {
                        a = game.i18n.localize(v);
                    }
                }
            }
            let b = Math.ceil(j / (worktime));
            let text = game.i18n.format('SATASUPE.TurnCountMethod', { turn: a, day: b, total: j })
            limitlist.push({ text: text, value: j })
        }
        var html = await renderTemplate('systems/satasupe/templates/apps/changelimitDialog.html', { dayturn: game.i18n.format("SATASUPE.TurnCount", { day: day, turn: dayturn }), turn: defturn, limit: deflimitturn, limitturn: game.i18n.format("SATASUPE.TurnCount", { day: limitday, turn: limitturn }), limitday: limitday, option: option, defturn: game.i18n.format("SATASUPE.TurnCount", { day: day, turn: defturn }), deflimitturn: game.i18n.format("SATASUPE.TurnCount", { day: limitday, turn: deflimitturn }), limitlist: limitlist, secret: limit.secret });
        return new Promise(resolve => {
            let formData;
            const dlg = new Dialog({
                title: game.i18n.localize("SATASUPE.ChangeLimit"),
                content: html,
                buttons: {
                    send: {
                        label: game.i18n.localize("SATASUPE.Save"),
                        icon: `<i class="fas fa-save"></i>`,
                        callback: html => {
                            formData = new FormData(html[0].querySelector("#change-limit"));
                            let newturn = formData.get("newlimit");
                            let secret = formData.get("secret");
                            return resolve({ newturn: newturn, secret: secret });
                        }
                    }
                },
                default: 'send',
                close: () => { return resolve(false) }
            });
            dlg.render(true);
        });
    }

    static async charaloaddialog(event) {
        var html = await renderTemplate('systems/satasupe/templates/apps/importActor.html');
        return new Promise(resolve => {
            let formData = null;
            const dlg = new Dialog({
                title: game.i18n.localize('SATASUPE.MenuLoad'),
                content: html,
                buttons: {
                    import: {
                        icon: '<i class="fas fa-file-import"></i>',
                        label: game.i18n.localize('SATASUPE.Import'),
                        callback: html => {
                            formData = new FormData(html[0].querySelector('#actor-link'));
                            SatasupeMenu.importActor(formData, event);
                        },
                    },
                    no: {
                        icon: '<i class="fas fa-times"></i>',
                        label: game.i18n.localize('SATASUPE.Cancel')
                    }
                },
                default: 'import',
                close: console.log("Closing:")
            }, {
                classes: ['dialogue'],
                width: 600
            });
            dlg.render(true);
        });
    }

    static async createImportCharactersFolderIfNotExists() {
        let importedCharactersFolder = game.folders.find(entry => entry.name === game.i18n.localize("SATASUPE.ImportedCharacters") && entry.type === 'Actor')
        if (importedCharactersFolder === null || importedCharactersFolder === undefined) {
            if (Folder.canUserCreate(game.user)) {
                // Create the folder
                importedCharactersFolder = await Folder.create({
                    name: game.i18n.localize("SATASUPE.ImportedCharacters"),
                    type: 'Actor',
                    parent: null
                })
                ui.notifications.info(game.i18n.localize("SATASUPE.CreatedImportedFolder"))
            } else {
                ui.notifications.error(game.i18n.format('ALERTMESSAGE.FolderPermissionError', { folder: game.i18n.localize("SATASUPE.ImportedCharacters") }));
                console.error(game.i18n.format('ALERTMESSAGE.FolderPermissionError', { folder: game.i18n.localize("SATASUPE.ImportedCharacters") }));
            }
        }
        return importedCharactersFolder;
    }

    static async createImportItemsFolderIfNotExists() {
        let importedItemsFolder = game.folders.find(entry => entry.name === game.i18n.localize("SATASUPE.ImportedItems") && entry.type === 'Item')
        if (importedItemsFolder === null || importedItemsFolder === undefined) {
            if (Folder.canUserCreate(game.user)) {
                // Create the folder
                importedItemsFolder = await Folder.create({
                    name: game.i18n.localize("SATASUPE.ImportedItems"),
                    type: 'Item',
                    parent: null
                });
                ui.notifications.info(game.i18n.localize("SATASUPE.CreatedImportedItemsFolder"))
            } else {
                ui.notifications.error(game.i18n.format('ALERTMESSAGE.FolderPermissionError', { folder: game.i18n.localize("SATASUPE.ImportedItems") }));
                console.error(game.i18n.format('ALERTMESSAGE.FolderPermissionError', { folder: game.i18n.localize("SATASUPE.ImportedItems") }));
            }
        }
        let karmaItemsFolder = game.folders.find(entry => entry.name === game.i18n.localize("SATASUPE.ImportedKarmas") && entry.type === 'Item')
        if (karmaItemsFolder === null || karmaItemsFolder === undefined) {
            if (Folder.canUserCreate(game.user)) {
                karmaItemsFolder = await Folder.create({
                    name: game.i18n.localize("SATASUPE.ImportedKarmas"),
                    type: 'Item',
                    parent: importedItemsFolder.id
                });
                ui.notifications.info(game.i18n.localize("SATASUPE.CreatedImportedKarmasFolder"))
            } else {
                ui.notifications.error(game.i18n.format('ALERTMESSAGE.FolderPermissionError', { folder: game.i18n.localize("SATASUPE.ImportedKarmas") }));
                console.error(game.i18n.format('ALERTMESSAGE.FolderPermissionError', { folder: game.i18n.localize("SATASUPE.ImportedKarmas") }));
            }
        }
        let itemItemsFolder = game.folders.find(entry => entry.name === game.i18n.localize("SATASUPE.ImportedEquipments") && entry.type === 'Item')
        if (itemItemsFolder === null || itemItemsFolder === undefined) {
            if (Folder.canUserCreate(game.user)) {
                itemItemsFolder = await Folder.create({
                    name: game.i18n.localize("SATASUPE.ImportedEquipments"),
                    type: 'Item',
                    parent: importedItemsFolder.id
                });
                ui.notifications.info(game.i18n.localize("SATASUPE.CreatedImportedEquipmentsFolder"))
            } else {
                ui.notifications.error(game.i18n.format('ALERTMESSAGE.FolderPermissionError', { folder: game.i18n.localize("SATASUPE.ImportedEquipments") }));
                console.error(game.i18n.format('ALERTMESSAGE.FolderPermissionError', { folder: game.i18n.localize("SATASUPE.ImportedEquipments") }));
            }
        }
        let weaponItemsFolder = game.folders.find(entry => entry.name === game.i18n.localize("SATASUPE.ImportedWeapons") && entry.type === 'Item')
        if (weaponItemsFolder === null || weaponItemsFolder === undefined) {
            if (Folder.canUserCreate(game.user)) {
                weaponItemsFolder = await Folder.create({
                    name: game.i18n.localize("SATASUPE.ImportedWeapons"),
                    type: 'Item',
                    parent: itemItemsFolder.id
                });
                ui.notifications.info(game.i18n.localize("SATASUPE.CreatedImportedWeaponsFolder"))
            } else {
                ui.notifications.error(game.i18n.format('ALERTMESSAGE.FolderPermissionError', { folder: game.i18n.localize("SATASUPE.ImportedWeapons") }));
                console.error(game.i18n.format('ALERTMESSAGE.FolderPermissionError', { folder: game.i18n.localize("SATASUPE.ImportedWeapons") }));
            }
        }
        let vehicleItemsFolder = game.folders.find(entry => entry.name === game.i18n.localize("SATASUPE.ImportedVehicles") && entry.type === 'Item')
        if (vehicleItemsFolder === null || vehicleItemsFolder === undefined) {
            if (Folder.canUserCreate(game.user)) {
                vehicleItemsFolder = await Folder.create({
                    name: game.i18n.localize("SATASUPE.ImportedVehicles"),
                    type: 'Item',
                    parent: itemItemsFolder.id
                });
                ui.notifications.info(game.i18n.localize("SATASUPE.CreatedImportedVehiclesFolder"))
            } else {
                ui.notifications.error(game.i18n.format('ALERTMESSAGE.FolderPermissionError', { folder: game.i18n.localize("SATASUPE.ImportedVehicles") }));
                console.error(game.i18n.format('ALERTMESSAGE.FolderPermissionError', { folder: game.i18n.localize("SATASUPE.ImportedVehicles") }));
            }
        }
        let gadjetItemsFolder = game.folders.find(entry => entry.name === game.i18n.localize("SATASUPE.ImportedGadjets") && entry.type === 'Item')
        if (gadjetItemsFolder === null || gadjetItemsFolder === undefined) {
            if (Folder.canUserCreate(game.user)) {
                gadjetItemsFolder = await Folder.create({
                    name: game.i18n.localize("SATASUPE.ImportedGadjets"),
                    type: 'Item',
                    parent: itemItemsFolder.id
                });
                ui.notifications.info(game.i18n.localize("SATASUPE.CreatedImportedGadjetsFolder"))
            } else {
                ui.notifications.error(game.i18n.format('ALERTMESSAGE.FolderPermissionError', { folder: game.i18n.localize("SATASUPE.ImportedGadjets") }));
                console.error(game.i18n.format('ALERTMESSAGE.FolderPermissionError', { folder: game.i18n.localize("SATASUPE.ImportedGadjets") }));
            }
        }
        let propsItemsFolder = game.folders.find(entry => entry.name === game.i18n.localize("SATASUPE.ImportedProps") && entry.type === 'Item')
        if (propsItemsFolder === null || propsItemsFolder === undefined) {
            if (Folder.canUserCreate(game.user)) {
                propsItemsFolder = await Folder.create({
                    name: game.i18n.localize("SATASUPE.ImportedProps"),
                    type: 'Item',
                    parent: itemItemsFolder.id
                });
                ui.notifications.info(game.i18n.localize("SATASUPE.CreatedImportedPropsFolder"))
            } else {
                ui.notifications.error(game.i18n.format('ALERTMESSAGE.FolderPermissionError', { folder: game.i18n.localize("SATASUPE.ImportedProps") }));
                console.error(game.i18n.format('ALERTMESSAGE.FolderPermissionError', { folder: game.i18n.localize("SATASUPE.ImportedProps") }));
            }
        }
        let palleteItemsFolder = game.folders.find(entry => entry.name === game.i18n.localize("SATASUPE.ImportedPalette") && entry.type === 'Item')
        if (palleteItemsFolder === null || palleteItemsFolder === undefined) {
            if (Folder.canUserCreate(game.user)) {
                palleteItemsFolder = await Folder.create({
                    name: game.i18n.localize("SATASUPE.ImportedPalette"),
                    type: 'Item',
                    parent: importedItemsFolder.id
                });
                ui.notifications.info(game.i18n.localize("SATASUPE.CreatedImportedPaletteFolder"))
            } else {
                ui.notifications.error(game.i18n.format('ALERTMESSAGE.FolderPermissionError', { folder: game.i18n.localize("SATASUPE.ImportedPalette") }));
                console.error(game.i18n.format('ALERTMESSAGE.FolderPermissionError', { folder: game.i18n.localize("SATASUPE.ImportedPalette") }));
            }
        }
        let otherFolders = [karmaItemsFolder, itemItemsFolder, weaponItemsFolder, vehicleItemsFolder, gadjetItemsFolder, propsItemsFolder, palleteItemsFolder]
        return importedItemsFolder, otherFolders;
    }

    static async createImortImageFolderIfNotExists() {
        let source = "data";
        if (typeof ForgeVTT != "undefined" && ForgeVTT.usingTheForge) {
            source = "forgevtt";
        }
        try {
            await FilePicker.browse(source, "uploadedCharacterImage");
        }
        catch (error) {
            try {
                await FilePicker.createDirectory(source, "uploadedCharacterImage");
            } catch (error2) {
                let fl = "Local folder"
                if (source == "forgevtt") fl = "Forge VTT Folder"
                console.error(game.i18n.format('ALERTMESSAGE.FolderPermissionError', { folder: `uploadedCharacterImage(${fl})` }))
            }
        }
    }

    static async importActor(formData, event) {
        let importedCharactersFolder = await SatasupeMenu.createImportCharactersFolderIfNotExists();
        let importedItemsFolder, otherFolders = await SatasupeMenu.createImportItemsFolderIfNotExists();
        await SatasupeMenu.createImortImageFolderIfNotExists();
        let url = formData.get('adress');
        let key;
        let file;
        let response;
        const canUPLOADFILE = game.user.can("FILES_UPLOAD");

        if (url.match(/^https:\/\/character\-sheets\.appspot\.com\/satasupe|^http:\/\/character\-sheets\.appspot\.com\/satasupe/g)) {
            if (url.match(/key=/g)) {
                key = url.match(/(?<=key=).+/g)[0];
                if (key.match(/&/g)) {
                    key = key.match(/.+(?=&)/g)[0];
                }
            }
        }

        $.ajax({
            type: 'GET',
            url: `https://character-sheets.appspot.com/satasupe/display?ajax=1&key=${key}`,
            data: { base64Image: 1 },
            dataType: 'jsonp',
            jsonp: 'callback',
            jsonpCallback: 'yourCallback'
        })
            .done(async function (data) {
                let name = data.base.name;
                if (!data.base.name) {
                    name = game.i18n.localize("SATASUPE.NewCharacter");
                }
                let source = "data";
                if (typeof ForgeVTT != "undefined" && ForgeVTT.usingTheForge) {
                    source = "forgevtt";
                }
                const type = data.images.uploadImage.match(/image\/.+?(?=;)/)[0];
                const extension = type.match(/(?<=image\/)(.*)/)[0];
                const bin = atob(data.images.uploadImage.replace(/^.*,/, ''));
                const buffer = new Uint8Array(bin.length).map((_, x) => bin.charCodeAt(x));
                const blob = new Blob([buffer.buffer], { type: type });
                let file = new File([blob], (name + '.' + extension), { type: type });

                try {
                    if (canUPLOADFILE) {
                        response = await FilePicker.upload(source, "uploadedCharacterImage", file, {});
                    } else {
                        response = true;
                        ui.notifications.error(game.i18n.localize("ALERTMESSAGE.FileUploadPermissionError"))
                    }
                } catch (error) { console.error(error) }
                let img = response?.path;

                if (!response) {
                    img = data.images.uploadImage;
                    ui.notifications.info(game.i18n.localize("NOTIFYMESSAGE.Base64"))
                }

                const pc = await Actor.create({
                    name: name,
                    type: 'character',
                    img: null,
                    folder: importedCharactersFolder.id,
                    data: {}
                })

                if (canUPLOADFILE) await pc.update({ img: img })
                await SatasupeMenu.editdata(pc, data);
                await SatasupeMenu.editItem(pc, data);
                await SatasupeMenu.editKarma(pc, data);
                let chatdisp = await game.settings.get("satasupe", "showchatpalette")
                if (chatdisp) await SatasupeMenu.editPalette(pc);
                let set = await game.settings.get("satasupe", "uploadCharacterSetting")
                if (set) await SatasupeMenu.editProtoToken(pc);
                pc.sheet.render(true);
            }
            )
    }

    static async editPalette(pc) {
        let question = await SelectItemDialog.chatpaletteData();
        if (question) {
            return await SatasupeMenu._loadclipbord(pc);
        } else {
            return false;
        }
    }

    static async editProtoToken(pc) {
        let tokensettings = pc.prototypeToken;
        tokensettings.actorLink = true;
        tokensettings.disposition = 0;
        tokensettings.displayBars = 50;
        tokensettings.displayName = 50;
        await pc.update({ 'prototypeToken': pc.prototypeToken })
    }

    static async _loadclipbord(pc) {
        const actor = pc.system;
        const copy = duplicate(pc.system);
        const send = await LoadDialog._createclipborddialog();
        let text = send.get('clipbord-data');
        text = text.replace(/[！-～]/g, function (s) {
            return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);
        });
        text = text.replace(/　/g, " ");
        var data = text.split(/\r\n|\n/);
        var variable = [];
        var formula = [];
        for (let i = 0; i < data.length; i++) {
            if (data[i].match(/^\/\//)) {
                if (data[i].match(/=/g)) {
                    let sp = data[i].split(/(?<=^[^=]+?)=/);
                    sp[0] = sp[0].replace(/^\/\//, "");
                    if (sp[1].match(/\{\{|\}\}/g)) {
                        if (sp[1].match(/\{.*?\}/g)) {
                            sp[1] = sp[1].replace(/\{\{/g, "{");
                            sp[1] = sp[1].replace(/\}\}/g, "}");
                        }
                    }
                    let ok = false
                    for (let k = 0; k < actor.variable.length; k++) {
                        if (actor.variable[k].variable == sp[0]) {
                            ok = true;
                        }
                    }
                    if (!ok) {
                        variable.push({ title: sp[1], variable: sp[0], substitution: true });
                    }
                }
            } else if (data[i].match(/^x\d|^rep\d|^repeat\d/)) {
                let str = data[i].match(/ /g);
                if (str.length > 1) {
                    let re = data[i].split(/(?<=^x\d )|(?<=^rep\d )|(?<=^repeat\d )/);
                    let sp = re[1].split(/(?<=^[^ ]+?) /);
                    formula.push({ text: `${re[0]}${sp[0]}`, message: sp[1] })
                } else {
                    formula.push({ text: data[i], message: "" });
                }
            } else {
                if (data[i].match(/ /)) {
                    let sp = data[i].split(/(?<=^[^ ]+?) /);
                    formula.push({ text: sp[0], message: sp[1] });
                } else {
                    formula.push({ text: data[i], message: "" });
                }
            }
        }
        copy.variable = copy.variable.concat(variable);
        await pc.update({ 'system.variable': copy.variable });
        for (let n = 0; n < pc.system.variable.length; n++) {
            if ((pc.system.variable[n].title != "") && (pc.system.variable[n].title != null)) {
                await pc.updateVariableSection(n, pc.system.variable[n].title, 'title');
            }
        }
        for (let n = 0; n < pc.system.variable.length; n++) {
            if ((pc.system.variable[n].title != "") && (pc.system.variable[n].title != null)) {
                await pc.updateVariableSection(n, pc.system.variable[n].title, 'title');
            }
        }
        if (formula.length > 0 || variable.length > 0) {
            await SatasupeMenu._createloadChatpalettetitle(formula, variable, pc);
        }
        return true;
    }

    static async _createloadChatpalettetitle(formula, variable, pc) {
        let name = game.items.find((i) => i.name == game.i18n.localize(SATASUPE.newChatpaletteName));
        if (!name) return SatasupeMenu.createloadChatpalette(pc, game.i18n.localize(SATASUPE.newChatpaletteName), formula, variable, false);
        let index = 0;
        let chatpaletteName = game.i18n.localize(SATASUPE.newChatpaletteName) + ' ' + index;
        let existname = game.items.find((i) => i.name == chatpaletteName);
        while (existname) {
            index++;
            chatpaletteName = game.i18n.localize(SATASUPE.newChatpaletteName) + ' ' + index;
            existname = game.items.find((i) => i.name == chatpaletteName);
            if (index > 15) {
                break;
            }
        }
        return await SatasupeMenu.createloadChatpalette(pc, chatpaletteName, formula, variable, false);
    }

    static async createloadChatpalette(pc, chatpaletteName, formula, variable, option) {
        let importedItemsFolder, otherFolders = await SatasupeMenu.createImportItemsFolderIfNotExists();
        const data = {
            name: chatpaletteName,
            type: 'chatpalette',
            data: {
                chatpalette: {
                    chat: formula,
                    variable: variable
                }
            }
        }
        const createsa = await Item.create({
            name: chatpaletteName,
            type: 'chatpalette',
            folder: otherFolders[6].id,
            data: {
                chatpalette: {
                    chat: formula,
                    variable: variable
                }
            }
        });
        const created = await pc.createEmbeddedDocuments('Item', [data], { renderSheet: option });
        return created;
    }

    static async editdata(pc, data) {
        var result = {};
        ['crime', 'life', 'love', 'combat'].forEach(key => {
            result[`data.circumstance.${key}.value`] = data.base.abl[key].value;
        })
        result[`data.circumstance.cluture.value`] = data.base.abl.culture.value;
        result[`data.aptitude.body.value`] = data.base.gift.body.value;
        result[`data.aptitude.mind.value`] = data.base.gift.mind.value;

        result[`data.attribs.alignment.value`] = data.base.emotion;
        result[`data.attribs.alignment.value`] = data.base.emotion;
        result[`data.attribs.bp.value`] = data.cond.body.value;
        result[`data.attribs.mp.value`] = data.cond.mental.value;
        result[`data.attribs.wallet.value`] = data.cond.wallet.value;

        result[`data.combat.reflex.value`] = data.base.power.initiative;
        result[`data.combat.arms.value`] = data.base.power.attack;
        result[`data.combat.damage.value`] = data.base.power.destroy;

        result[`data.exp.expgain.value`] = data.base.exp.total;
        result[`data.exp.upkeep.value`] = data.base.exp.waste;
        result[`data.exp.mythos.value`] = data.cond.cthulhu.value;
        result[`data.exp.san.value`] = data.cond.san.value;

        result[`data.status.trauma.value`] = data.cond.trauma.value;
        result[`data.prisoner`] = [{ title: data.cond.prisoner.value }];
        result[`data.addiction`] = [{ title: data.cond.addiction.value }];

        ['homeland', 'sex', 'age', 'style', 'likes', 'dislikes', 'team', 'alliance', 'hierarchy', 'surface'].forEach(key => {
            result[`data.infos.${key}`] = data.base[key];
        });
        result[`data.infos.language`] = data.base.langueges;
        result[`data.infos.favorite`] = data.base.favorites;

        var his = [];
        for (let i = 0; i < data.history.length; i++) {
            let karma;
            for (let [key, value] of Object.entries(SATASUPE.advancedKarma)) {
                if (game.i18n.localize(value) == data.history[i].speakeasy) {
                    karma = key;
                }
            }
            his.push({ title: data.history[i].name, dd: data.history[i].dd, day: data.history[i].date, karma: karma, exp: data.history[i].exp, note: data.history[i].comment })
        }
        result[`data.scenario`] = his;

        result[`data.bg.bg.value`] = `<p>${data.base.memo?.replace(/\r?\n/g, "<br>")}</p>`

        let place;
        for (let [k, v] of Object.entries(SATASUPE.city)) {
            if (game.i18n.localize(v) == data.home.place) {
                place = k;
            }
        }
        result[`data.infos.haven`] = place;

        var hobby = []
        let gethobby;
        for (let j = 1; j < data.learned.length; j++) {
            hobby.push(data.learned[j].id.match(/(?<=hobby\.).+/g));
        }

        for (let l = 0; l < hobby.length; l++) {
            let categ = hobby[l][0].match(/^\d/g);
            let num = hobby[l][0].match(/\d$/g);
            gethobby = SATASUPE.cteghobby[categ][num];

            result[`data.hobby.${SATASUPE.hobbyctegnum[categ]}.${gethobby}.value`] = true;
        }

        await pc.update(result);
    }

    static async editItem(pc, data) {
        let importedItemsFolder, otherFolders = await SatasupeMenu.createImportItemsFolderIfNotExists();
        const LIST = {
            items: game.items.filter((i) => i.type === "item")
        };
        for (let a = 0; a < data.vehicles.length; a++) {
            let savevehicle = data.vehicles[a];
            if (savevehicle.name) {
                const vehiclelist = LIST.items.filter((i) => i.system.typev == true);
                const existlist = vehiclelist.filter(
                    (i) =>
                        savevehicle.name.indexOf(i.name) === 0
                );
                var existvehicle;
                if (existlist.length > 1) {
                    let selected = await SelectItemDialog.selectData({ data: existlist });
                    if (selected) {
                        let id = selected.get('item');
                        existvehicle = existlist.find((j) => j._id == id);
                        if (!id) {
                            existvehicle = existlist[0];
                        }
                    } else {
                        existvehicle = existlist[0];
                    }
                } else {
                    existvehicle = existlist[0];
                }
                if (existvehicle?.name == savevehicle.name) {
                    await pc.createEmbeddedDocuments('Item', [existvehicle]);
                } else {
                    if (existvehicle) {
                        await pc.createEmbeddedDocuments('Item', [existvehicle]);
                    } else {
                        const createvehicle = await Item.create({
                            name: savevehicle.name,
                            type: 'item',
                            folder: otherFolders[3].id,
                            data: {}
                        });
                        let result = {};
                        result[`data.typev`] = true;
                        result[`data.vehicle.speed`] = savevehicle.speed;
                        result[`data.vehicle.drp`] = savevehicle.frame;
                        result[`data.vehicle.capacity`] = savevehicle.burden;
                        for (let [key, value] of Object.entries(SATASUPE.specialV)) {
                            let re = new RegExp(`${game.i18n.localize(value)}`, `g`);
                            if (savevehicle.notes?.match(re)) {
                                result[`data.vehicle.special.${key}.value`] = true;
                            }
                        }
                        for (let [k, v] of Object.entries(SATASUPE.specialtextV)) {
                            let reg = new RegExp(`${game.i18n.localize(v)}\\d+`, `g`)
                            let reg2 = new RegExp(`(?<=${game.i18n.localize(v)})\\d+`, `g`)
                            if (savevehicle.notes?.match(reg)) {
                                result[`data.vehicle.specialtext.${k}.value`] = true;
                                if (savevehicle.notes.match(reg2)) {
                                    result[`data.vehicle.specialtext.${k}.number`] = savevehicle.notes.match(reg2)[0];
                                }
                            }
                        }
                        await createvehicle.update(result);
                        await pc.createEmbeddedDocuments('Item', [createvehicle]);
                    }
                }
            }
        }

        for (let b = 0; b < data.weapons.length; b++) {
            let saveweapon = data.weapons[b];
            if (saveweapon.name) {
                const weaponlist = LIST.items.filter((j) => j.system.typew == true);
                const existlistW = weaponlist.filter(
                    (j) =>
                        saveweapon.name.indexOf(j.name) === 0
                );
                var existweapon;
                if (existlistW.length > 1) {
                    let selected = await SelectItemDialog.selectData({ data: existlistW });
                    if (selected) {
                        let id = selected.get('item');
                        existweapon = existlistW.find((j) => j._id == id);
                        if (!id) {
                            existweapon = existlistW[0];
                        }
                    } else {
                        existweapon = existlistW[0];
                    }
                } else {
                    existweapon = existlistW[0];
                }
                if (existweapon?.name == saveweapon.name) {
                    var dup = duplicate(existweapon);
                    if (saveweapon.place == "アジト") {
                        dup.system.storage = "haven";
                    } else if (saveweapon.place == "乗物") {
                        dup.system.storage = "vehicle";
                    } else {
                        dup.system.storage = "normal";
                    }
                    await pc.createEmbeddedDocuments('Item', [dup]);
                } else {
                    if (existweapon) {
                        var dup = duplicate(existweapon);
                        if (saveweapon.place == "アジト") {
                            dup.system.storage = "haven";
                        } else if (saveweapon.place == "乗物") {
                            dup.system.storage = "vehicle";
                        } else {
                            dup.system.storage = "normal";
                        }
                        await pc.createEmbeddedDocuments('Item', [dup]);
                    } else {
                        const createweapon = await Item.create({
                            name: saveweapon.name,
                            type: 'item',
                            folder: otherFolders[2].id,
                            data: {}
                        });
                        let result = {};
                        result[`data.typew`] = true;
                        result[`data.weapon.hit`] = saveweapon.aim;
                        result[`data.weapon.damageadd`] = saveweapon.damage;
                        for (let [ke, va] of Object.entries(SATASUPE.range)) {
                            if (game.i18n.localize(va) == saveweapon.range) {
                                result[`data.weapon.range`] = va;
                            }
                        }
                        for (let [key, value] of Object.entries(SATASUPE.specialW)) {
                            let re = new RegExp(`${game.i18n.localize(value)}`, `g`)
                            if (saveweapon.notes?.match(re)) {
                                result[`data.weapon.special.${key}.value`] = true;
                            }
                        }
                        for (let [k, v] of Object.entries(SATASUPE.specialtextW)) {
                            let reg = new RegExp(`${game.i18n.localize(v)}\\d+`, `g`)
                            let reg2 = new RegExp(`(?<=${game.i18n.localize(v)})\\d+`, `g`)
                            if (saveweapon.notes?.match(reg)) {
                                result[`data.weapon.specialtext.${k}.value`] = true;
                                if (saveweapon.notes.match(reg2)) {
                                    result[`data.weapon.specialtext.${k}.number`] = saveweapon.notes.match(reg2)[0];
                                }
                            }
                        }
                        await createweapon.update(result);
                        var dup = duplicate(createweapon);
                        if (saveweapon.place == "アジト") {
                            dup.system.storage = "haven";
                        } else if (saveweapon.place == "乗物") {
                            dup.system.storage = "vehicle";
                        } else {
                            dup.system.storage = "normal";
                        }
                        await pc.createEmbeddedDocuments('Item', [dup]);
                    }
                }
            }
        }

        for (let c = 0; c < data.outfits.length; c++) {
            let saveitem = data.outfits[c];
            if (saveitem.name) {
                const itemlist = LIST.items.filter((k) => (k.system.typep == true) || (k.system.typeg == true));
                const existlistI = itemlist.filter(
                    (k) =>
                        saveitem.name.indexOf(k.name) === 0
                );
                var existitem;
                if (existlistI.length > 1) {
                    let selected = await SelectItemDialog.selectData({ data: existlistI });
                    if (selected) {
                        let id = selected.get('item');
                        existitem = existlistI.find((j) => j._id == id);
                        if (!id) {
                            existitem = existlistI[0];
                        }
                    } else {
                        existitem = existlistI[0];
                    }
                } else {
                    existitem = existlistI[0];
                }
                if (existitem?.name == saveitem.name) {
                    var dup = duplicate(existitem);
                    if (saveitem.place == "アジト") {
                        dup.system.storage = "haven";
                    } else if (saveitem.place == "乗物") {
                        dup.system.storage = "vehicle";
                    } else {
                        dup.system.storage = "normal";
                    }
                    await pc.createEmbeddedDocuments('Item', [dup]);
                } else {
                    if (existitem) {
                        var dup = duplicate(existitem);
                        if (saveitem.place == "アジト") {
                            dup.system.storage = "haven";
                        } else if (saveitem.place == "乗物") {
                            dup.system.storage = "vehicle";
                        } else {
                            dup.system.storage = "normal";
                        }
                        await pc.createEmbeddedDocuments('Item', [dup]);
                    } else {
                        let regE = new RegExp(`${game.i18n.localize("SATASUPE.GADJET")}`);
                        let f;
                        if (saveitem.notes?.match(regE)) {
                            f = otherFolders[4].id;
                        } else {
                            f = otherFolders[5].id;
                        }
                        const createitem = await Item.create({
                            name: saveitem.name,
                            type: 'item',
                            folder: f,
                            data: {}
                        });
                        let result = {};

                        if (saveitem.notes?.match(regE)) {
                            result[`data.typeg`] = true;
                            for (let [ke, va] of Object.entries(SATASUPE.timingG)) {
                                if (game.i18n.localize(va) == saveitem.use) {
                                    result[`data.gadjet.timing`] = ke;
                                }
                            }
                            result[`data.gadjet.effect`] = saveitem.effect;
                        } else {
                            result[`data.typep`] = true;
                            for (let [key, val] of Object.entries(SATASUPE.timingG)) {
                                if (game.i18n.localize(val) == saveitem.use) {
                                    if (val != 'SATASUPE.Equipping') {
                                        result[`data.props.timing`] = val;
                                    } else {
                                        result[`data.props.timing`] = 'SATASUPE.Passive';
                                    }
                                }
                            }
                            result[`data.props.effect`] = saveitem.effect;
                            for (let [k, v] of Object.entries(SATASUPE.specialP)) {
                                let re = new RegExp(`${game.i18n.localize(v)}`, `g`)
                                if (saveitem.notes?.match(re)) {
                                    result[`data.props.special.${k}.value`] = true;
                                }
                            }
                            for (let [keyword, target] of Object.entries(SATASUPE.specialtextP)) {
                                let reg = new RegExp(`${game.i18n.localize(target)}\\d+`, `g`)
                                let reg2 = new RegExp(`(?<=${game.i18n.localize(target)})\\d+`, `g`)
                                if (saveitem.notes?.match(reg)) {
                                    result[`data.props.specialtext.${keyword}.value`] = true;
                                    if (saveitem.notes.match(reg2)) {
                                        result[`data.props.specialtext.${keyword}.number`] = saveitem.notes.match(reg2)[0];
                                    }
                                }
                            }
                        }
                        await createitem.update(result);
                        var dup = duplicate(createitem);
                        if (saveitem.place == "アジト") {
                            dup.system.storage = "haven";
                        } else if (saveitem.place == "乗物") {
                            dup.system.storage = "vehicle";
                        } else {
                            dup.system.storage = "normal";
                        }
                        await pc.createEmbeddedDocuments('Item', [dup]);
                    }
                }
            }
        }
    }

    static async editKarma(pc, data) {
        let importedItemsFolder, otherFolders = await SatasupeMenu.createImportItemsFolderIfNotExists();
        const LIST = {
            karmas: game.items.filter((i) => i.type === "karma")
        };

        for (let d = 0; d < data.karma.length; d++) {
            let savecompensation = data.karma[d].price;
            let savetalent = data.karma[d].talent;

            if (savecompensation.name) {
                const compensationlist = LIST.karmas.filter((k) => k.system.abilityType.name == "compensation");
                const existlistC = compensationlist.filter(
                    (k) =>
                        savecompensation.name.indexOf(k.name) === 0
                );
                var existcompensation;
                if (existlistC.length > 1) {
                    let selected = await SelectItemDialog.selectData({ data: existlistC });
                    if (selected) {
                        let id = selected.get('item');
                        existcompensation = existlistC.find((l) => l._id == id);
                        if (!id) {
                            existcompensation = existlistC[0];
                        }
                    } else {
                        existcompensation = existlistC[0];
                    }
                } else {
                    existcompensation = existlistC[0];
                }

                if (existcompensation?.name == savecompensation.name) {
                    await pc.createEmbeddedDocuments('Item', [existcompensation]);
                } else {
                    if (existcompensation) {
                        await pc.createEmbeddedDocuments('Item', [existcompensation]);
                    } else {
                        const createcompensation = await Item.create({
                            name: savecompensation.name,
                            type: 'karma',
                            folder: otherFolders[0].id,
                            data: {}
                        });
                        let result = {};
                        result[`data.effect`] = savecompensation.effect;
                        result[`data.effecthtml`] = savecompensation.effect?.replace(/\r?\n/g, '<br>');
                        result[`data.abilityType.name`] = "compensation";
                        result[`data.abilityType.label`] = "SATASUPE.COMPENSATION";
                        for (let [key, value] of Object.entries(SATASUPE.timing)) {
                            if (game.i18n.localize(value) == savecompensation.use) {
                                result[`data.timing.name`] = key;
                                result[`data.timing.label`] = value;
                            }
                        }
                        for (let [k, v] of Object.entries(SATASUPE.target)) {
                            if (game.i18n.localize(v) == savecompensation.target) {
                                result[`data.target.name`] = k;
                                result[`data.target.label`] = v;
                            }
                        }
                        for (let [ke, va] of Object.entries(SATASUPE.checkSelection)) {
                            if (savecompensation.judge) {
                                let reg = new RegExp(`${game.i18n.localize(va)}`, `g`);
                                if (savecompensation.judge.match(reg)) {
                                    if (ke == 'alignment') {
                                        result[`data.check.type`] = true;
                                        for (let [keyword, target] of Object.entries(SATASUPE.alignment)) {
                                            let re = new RegExp(`(?<=[〔〈《【｛（\\{\\[\\(]?${game.i18n.localize(va)}[〕〉》】｝）\\}\\]\\)]?[\\/／])${game.i18n.localize(target)}$`, `g`);
                                            if (savecompensation.judge.match(re)) {
                                                result[`data.check.alignment.name`] = keyword;
                                                result[`data.check.alignment.label`] = target;
                                            }
                                        }
                                    } else {
                                        let regE = new RegExp(`(?<=[〔〈《【｛（\\{\\[\\(]?${game.i18n.localize(va)}[〕〉》】｝）\\}\\]\\)]?[\\/／])\\d+$`, `g`);
                                        let regEXP = new RegExp(`(?<=[〔〈《【｛（\\{\\[\\(]?${game.i18n.localize(va)}[〕〉》】｝）\\}\\]\\)]?[\\/／]).+`, `g`);
                                        if (savecompensation.judge.match(regE)) {
                                            result[`data.check.checkValue.name`] = ke;
                                            result[`data.check.checkValue.label`] = va;
                                            result[`data.check.difficulty`] = savecompensation.judge.match(regE)[0];
                                            result[`data.check.none`] = false;
                                        } else if (savecompensation.judge.match(regEXP)) {
                                            result[`data.check.checkValue.name`] = ke;
                                            result[`data.check.checkValue.label`] = va;
                                            result[`data.check.checkText`] = savecompensation.judge.match(regEXP)[0];
                                            result[`data.check.none`] = false;
                                        } else {
                                            result[`data.check.checkValue.name`] = ke;
                                            result[`data.check.checkValue.label`] = va;
                                        }
                                    }
                                } else {
                                    let char = new RegExp(`^${game.i18n.localize("SATASUPE.None")}`, `g`)
                                    if (savecompensation.judge.match(char)) {
                                        result[`data.check.none`] = true;
                                    } else {
                                        result[`data.check.checkValue.name`] = "crime";
                                        result[`data.check.checkValue.label`] = "CIRCUMSTANCE.CRIME";
                                        result[`data.check.checkText`] = savecompensation.judge;
                                    }
                                }
                            } else {
                                result[`data.check.none`] = true;
                            }
                        }
                        await createcompensation.update(result);
                        await pc.createEmbeddedDocuments('Item', [createcompensation]);
                    }
                }
            }

            if (savetalent.name) {
                const talentlist = LIST.karmas.filter((k) => k.system.abilityType.name == "talent");
                const existlistT = talentlist.filter(
                    (k) =>
                        savetalent.name.indexOf(k.name) === 0
                );
                var existtalent;
                if (existlistT.length > 1) {
                    let selected = await SelectItemDialog.selectData({ data: existlistT });
                    if (selected) {
                        let id = selected.get('item');
                        existtalent = existlistT.find((l) => l._id == id);
                        if (!id) {
                            existtalent = existlistT[0];
                        }
                    } else {
                        existtalent = existlistT[0];
                    }
                } else {
                    existtalent = existlistT[0];
                }
                if (existtalent?.name == savetalent.name) {
                    await pc.createEmbeddedDocuments('Item', [existtalent]);
                } else {
                    if (existtalent) {
                        await pc.createEmbeddedDocuments('Item', [existtalent]);
                    } else {
                        const createtalent = await Item.create({
                            name: savetalent.name,
                            type: 'karma',
                            folder: otherFolders[0].id,
                            data: {}
                        });
                        let result = {};
                        result[`data.effect`] = savetalent.effect;
                        result[`data.effecthtml`] = savetalent.effect?.replace(/\r?\n/g, '<br>');
                        result[`data.abilityType.name`] = "talent";
                        result[`data.abilityType.label`] = "SATASUPE.Talent";
                        for (let [key, value] of Object.entries(SATASUPE.timing)) {
                            if (game.i18n.localize(value) == savetalent.use) {
                                result[`data.timing.name`] = key;
                                result[`data.timing.label`] = value;
                            }
                        }
                        for (let [k, v] of Object.entries(SATASUPE.target)) {
                            if (game.i18n.localize(v) == savetalent.target) {
                                result[`data.target.name`] = k;
                                result[`data.target.label`] = v;
                            }
                        }
                        for (let [ke, va] of Object.entries(SATASUPE.checkSelection)) {
                            if (savetalent.judge) {
                                let reg = new RegExp(`${game.i18n.localize(va)}`, `g`);
                                if (savetalent.judge.match(reg)) {
                                    if (ke == 'alignment') {
                                        result[`data.check.type`] = true;
                                        for (let [keyword, target] of Object.entries(SATASUPE.alignment)) {
                                            let re = new RegExp(`(?<=[〔〈《【｛（\\{\\[\\(]?${game.i18n.localize(va)}[〕〉》】｝）\\}\\]\\)]?[\\/／])${game.i18n.localize(target)}$`, `g`);
                                            if (savetalent.judge.match(re)) {
                                                result[`data.check.alignment.name`] = keyword;
                                                result[`data.check.alignment.label`] = target;
                                            }
                                        }
                                    } else {
                                        let regE = new RegExp(`(?<=[〔〈《【｛（\\{\\[\\(]?${game.i18n.localize(va)}[〕〉》】｝）\\}\\]\\)]?[\\/／])\\d+$`, `g`);
                                        let regEXP = new RegExp(`(?<=[〔〈《【｛（\\{\\[\\(]?${game.i18n.localize(va)}[〕〉》】｝）\\}\\]\\)]?[\\/／]).+`, `g`);
                                        if (savetalent.judge.match(regE)) {
                                            result[`data.check.checkValue.name`] = ke;
                                            result[`data.check.checkValue.label`] = va;
                                            result[`data.check.difficulty`] = savetalent.judge.match(regE)[0];
                                            result[`data.check.none`] = false;
                                        } else if (savetalent.judge.match(regEXP)) {
                                            result[`data.check.checkValue.name`] = ke;
                                            result[`data.check.checkValue.label`] = va;
                                            result[`data.check.checkText`] = savetalent.judge.match(regEXP)[0];
                                            result[`data.check.none`] = false;
                                        } else {
                                            result[`data.check.checkValue.name`] = ke;
                                            result[`data.check.checkValue.label`] = va;
                                        }
                                    }
                                } else {
                                    let char = new RegExp(`^${game.i18n.localize("SATASUPE.None")}`, `g`)
                                    if (savetalent.judge.match(char)) {
                                        result[`data.check.none`] = true;
                                    } else {
                                        result[`data.check.checkValue.name`] = "crime";
                                        result[`data.check.checkValue.label`] = "CIRCUMSTANCE.CRIME";
                                        result[`data.check.checkText`] = savetalent.judge;
                                    }
                                }
                            } else {
                                result[`data.check.none`] = true;
                            }
                        }
                        await createtalent.update(result);
                        await pc.createEmbeddedDocuments('Item', [createtalent]);
                    }
                }
            }
        }
    }
}