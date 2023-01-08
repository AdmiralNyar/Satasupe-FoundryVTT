import { SatasupeChatCard } from "../chat-card.js";
import { memoApplication } from "./memo.js";

export class SelectItemDialog extends Dialog {

    activateListeners(html) {
        super.activateListeners(html);

        html.find('input.open-itemsheet').click(async (event) => this._onButtonClicked(event));
        html.find('.checkon').click(async (event) => this._checkboxOn(event));

        html.find('ol#playersortable li.order').on('dragstart', this.onDragStart.bind(this));
        html.find('ol#playersortable li.order').on('dragover', this.onDragOver.bind(this));
        html.find('ol#playersortable li.order').on('dragleave', this.onDragLeave.bind(this));
        html.find('ol#playersortable li.order').on('drop', this.onDrop.bind(this));
        html.find('button.after-play-list').click(async (event) => await this.afterplaylistButton(event));
        html.find('button.playervote').click(async (event) => await SatasupeChatCard._voteTarget(event));
        html.find('button.playershare').click(async (event) => {
            event.preventDefault();
            this.close();
            await memoApplication.selecttab(event.currentTarget.dataset.playerid);
        });
        html.find('button.addChoice').click(async (event) => await this.addchoice(event));
        html.find('div.choices-zone').on('click', 'a.choice-delete', async (event) => await this.deletechoice(event));
    }

    async addchoice(event) {
        event.preventDefault();
        let datan = Number(event.currentTarget.parentElement.getElementsByClassName('choices-zone')[0].dataset.idt);
        datan += 1;
        event.currentTarget.parentElement.getElementsByClassName('choices-zone')[0].dataset.idt = datan;
        var addtext = `<div class="choice" style="display: flex;"><input name="choice${(datan - 1)}" type="text" placeholder="${game.i18n.localize("SATASUPE.WriteChoice")}"><a class="choice-delete" data-id="${(datan - 1)}" title="${game.i18n.localize('SATASUPE.Delete')}"><i class="fas fa-trash"></i></a></div>`
        $(event.currentTarget).prev('div.choices-zone').append(addtext)
    }

    async deletechoice(event) {
        event.preventDefault();
        let id = event.currentTarget.dataset.id;
        $(event.currentTarget).parent('div.choice').remove()
    }

    onDragStart(event) {
        event.originalEvent.dataTransfer.setData('text', $(event.currentTarget).data('id'))
    }

    onDragOver(event) {
        event.preventDefault();
        if ((event.offsetY) < ($(event.currentTarget).innerHeight() / 2)) {
            $(event.currentTarget).css({
                'border-top': '2px solid blue',
                'border-bottom': '',
            })
        } else {
            $(event.currentTarget).css({
                'border-top': '',
                'border-bottom': '2px solid blue',
            })
        }
    }

    onDragLeave(event) {
        $(event.currentTarget).css({
            'border-top': '',
            'border-bottom': '',
        })
    }

    onDrop(event) {
        event.preventDefault();
        let id = event.originalEvent.dataTransfer.getData("text");

        if ((event.offsetY) < ($(event.currentTarget).innerHeight() / 2)) {
            $('li[data-id=\'' + id + '\'][class=\'order\']').insertBefore(event.currentTarget)
        } else {
            $('li[data-id=\'' + id + '\'][class=\'order\']').insertAfter(event.currentTarget)
        }
        $(event.currentTarget).css({
            'border-top': '',
            'border-bottom': '',
        })
    }

    async _onButtonClicked(event) {
        event.preventDefault();
        const item = game.items.get(event.currentTarget.dataset.key);
        await item.sheet.render(true);
    }

    async _checkboxOn(event) {
        event.preventDefault();
        $("#selectItemTable tr td input.radioboxin").attr("checked", false);
        $(event.currentTarget).parent().find('.radioboxin').children('input').attr({ checked: "checked" });
    }

    async afterplaylistButton(event) {
        event.preventDefault();
        let type = event.currentTarget.dataset.after;
        switch (type) {
            case 'addiction': {
                await SatasupeChatCard.createChatCard("addiction");
                break;
            }
            case 'karma': {
                await SatasupeChatCard.createChatCard("karma")
                break;
            }
            case 'afterTable': {
                await SatasupeChatCard.createChatCard("afterTable");
                break;
            }
            case 'discussionK': {
                await SelectItemDialog._voteDialog("discussionK");
                break;
            }
            case 'discussionMVP': {
                await SatasupeChatCard._voteTarget(event)
                break;
            }
            case 'prisoner': {
                await SatasupeChatCard.createChatCard("prisoner")
                break;
            }
            case 'itemUpkeep': {
                await SatasupeChatCard.createChatCard("itemUpkeep")
                break;
            }
        }
        event.currentTarget.blur()
    }

    static async selectData(data) {
        const html = await renderTemplate(`systems/satasupe/templates/apps/selectItem.html`, data);
        return new Promise((resolve) => {
            let formData = null;
            const dlg = new SelectItemDialog({
                title: game.i18n.localize("SATASUPE.SelectItem"),
                content: html,
                buttons: {
                    send: {
                        label: game.i18n.localize("SATASUPE.Selected"),
                        callback: html => {
                            formData = new FormData(html[0].querySelector('#select-item-form'));
                            return resolve(formData);
                        }
                    }
                },
                close: () => { return resolve(false) }
            });
            dlg.render(true);
        });
    }

    static async _voteDialog(type, option) {
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
        list = playerlist.filter((i) => !!i.check && !!game.users.get(i.id).character);
        const html = await renderTemplate(`systems/satasupe/templates/apps/voteDialog.html`, { list: list, type: type });
        if (option) list = game.users;
        return new Promise((resolve) => {
            const dlg = new SelectItemDialog({
                title: game.i18n.localize("SATASUPE.ChoosePlayer"),
                content: html,
                buttons: {
                    close: {
                        label: game.i18n.localize("SATASUPE.Close"),
                        callback: () => { return resolve(true) }
                    }
                },
                close: () => { return resolve(false) }
            });
            dlg.render(true)
        });
    }

    static async originalVote(event) {
        const html = await renderTemplate(`systems/satasupe/templates/apps/originalVote.html`,);
        return new Promise((resolve) => {
            let formData = null;
            const dlg = new SelectItemDialog({
                title: game.i18n.localize("SATASUPE.VOTE"),
                content: html,
                buttons: {
                    admit: {
                        label: game.i18n.localize("SATASUPE.CreateVoteCard"),
                        icon: '<i class="far fa-check-circle"></i>',
                        callback: html => {
                            formData = new FormData(html[0].querySelector('#newVote'));
                            const data = [...formData.entries()];
                            if (data.length < 2) {
                                return resolve(false)
                            } else {
                                let q;
                                if (data[0][0] == "question") {
                                    q = data[0][1];
                                }
                                var choice = [];
                                for (let i = 1; i < data.length; i++) {
                                    if (!!data[i][1]) {
                                        choice.push({ id: (i - 1), text: data[i][1] })
                                    }
                                }
                                if (!!choice[0]) {
                                    return resolve({ question: q, choice: choice });
                                } else {
                                    return resolve(false);
                                }

                            }
                        }
                    }
                },
                default: '',
                close: () => { return resolve(false) }
            }, {
                classes: ['dialogue'],
                popOut: true,
                resizable: true,
            });
            dlg.render(true);
        });
    }

    static async chatpaletteData() {
        return new Promise((resolve) => {
            let formData = null;
            const dlg = new SelectItemDialog({
                title: game.i18n.localize("SATASUPE.MakeChatpaletteQ"),
                content: `<p>${game.i18n.localize("SATASUPE.MakeChatpaletteT")}</p>`,
                buttons: {
                    yes: {
                        label: game.i18n.localize("SATASUPE.Yes"),
                        icon: '<i class="far fa-check-circle"></i>',
                        callback: () => {
                            return resolve(true);
                        }
                    },
                    no: {
                        label: game.i18n.localize("SATASUPE.No"),
                        icon: '<i class="fas fa-times"></i>',
                        callback: () => {
                            return resolve(false);
                        }
                    }
                },
                default: 'yes',
                close: () => { return resolve(false) }
            });
            dlg.render(true);
        });
    }

    static async _makeplayerlist() {
        let players = game.users.filter((i) => (true == !!i.character) || i.isGM);
        let list = players
        if (game.settings.get("satasupe", 'playerlist')[0]) {
            list = game.settings.get("satasupe", 'playerlist');
            for (let a = (list.length - 1); a >= 0; a--) {
                //deleted id search
                let del = players.find((b) => b.id == list[a].id);
                if (!del) {
                    list.splice(a, 1);
                } else {
                    //name changed search
                    if (del.name != list[a].name) {
                        list[a].name = del.name;
                    }
                }
            }
            if (list.length < players.length) {
                let newlist = players;
                for (let d = 0; d < list.length; d++) {
                    let dele = newlist.find((b) => b.id == list[d].id);
                    if (dele) {
                        newlist = newlist.filter((b) => b.id != list[d].id)
                    }
                }
                for (let e = 0; e < newlist.length; e++) {
                    list.push({ check: true, id: newlist[e].id, key: list.length + e, name: newlist[e].name, order: list.length + e })
                }
            }
        }
        const gmlist = game.users.filter(i => !i.character && i.isGM);
        let applist = duplicate(list);
        if (gmlist[0]) {
            for (let b = (applist.length - 1); b >= 0; b--) {
                let d = gmlist.find(c => c.id == applist[b].id)
                if (!!d) applist.splice(b, 1)
            }
        }
        const html = await renderTemplate(`systems/satasupe/templates/apps/playerlist.html`, { list: applist });;
        return new Promise((resolve) => {
            let formData = null;
            const dlg = new SelectItemDialog({
                title: game.i18n.localize("SATASUPE.ChoosePlayer"),
                content: html,
                buttons: {
                    send: {
                        label: game.i18n.localize("SATASUPE.Save"),
                        icon: `<i class="fas fa-save"></i>`,
                        callback: html => {
                            let listOrder = [];
                            $('ol#playersortable li').each(function () {
                                let group = { id: $(this).data('playerid'), key: $(this).data('id'), name: $(this).data('name') }
                                listOrder.push(group)
                            });
                            $('#list_order').val(listOrder.join(','));
                            formData = new FormData(html[0].querySelector('#select-player'));
                            for (let i = 0; i < listOrder.length; i++) {
                                if (formData.get(listOrder[i].id) == "true") {
                                    listOrder[i].check = true;
                                } else {
                                    listOrder[i].check = false;
                                }
                            }
                            if (gmlist[0]) {
                                for (let j = 0; j < gmlist.length; j++) {
                                    listOrder.push({ id: gmlist[j].id, key: (listOrder.length + j), name: gmlist[j].name, check: true })
                                }
                            }
                            let order = 0;
                            for (let j = 0; j < listOrder.length; j++) {
                                if (listOrder[j].check) {
                                    listOrder[j].order = order
                                    order += 1;
                                }
                            }
                            return resolve(listOrder);
                        }
                    }
                },
                default: 'send',
                close: html => {
                    let listOrder = [];
                    $('ol#playersortable li').each(function () {
                        let group = { id: $(this).data('playerid'), key: $(this).data('id'), name: $(this).data('name') }
                        listOrder.push(group)
                    });
                    $('#list_order').val(listOrder.join(','));
                    formData = new FormData(html[0].querySelector('#select-player'));
                    for (let i = 0; i < listOrder.length; i++) {
                        if (formData.get(listOrder[i].id) == "true") {
                            listOrder[i].check = true;
                        } else {
                            listOrder[i].check = false;
                        }
                    }
                    let order = 0;
                    for (let j = 0; j < listOrder.length; j++) {
                        if (listOrder[j].check) {
                            listOrder[j].order = order
                            order += 1;
                        }
                    }
                    return resolve(listOrder);
                }
            });
            dlg.render(true);
        });
    }

    static async _afterplaylistDialog() {
        const html = await renderTemplate(`systems/satasupe/templates/apps/afterplaylist.html`);
        return new Promise(async (resolve) => {
            const dlg = new SelectItemDialog({
                title: game.i18n.localize("SATASUPE.ToDoAfterplay"),
                content: html,
                buttons: {
                },
                default: '',
                close: () => { return resolve(false) }
            }, {
                classes: ['afterplayListDialog', 'dialog'],
                height: 300
            });
            dlg._render(true).then(async () => {
                await SatasupeChatCard._progressupdate();
                resolve();
            });
        });
    }
}