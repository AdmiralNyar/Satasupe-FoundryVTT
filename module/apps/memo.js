import { SelectItemDialog } from "./select-item-dialog.js"

export class memoApplication extends FormApplication {
    constructor() {
        super();
        this.object = duplicate(game.user.getFlag("satasupe", "memo-data") ?? {
            tabs: { tab0: { type: "plain", name: `Tab0`, data: "", save: `tabs.tab0.data`, id: 0 } }
        });
        this.dialog = null;
    }

    set _upObje(data) {
        this.object = data
    }

    static get defaultOptions() {
        return {
            ...super.defaultOptions,
            width: 480,
            height: 350,
            resizable: true,
            closeOnSubmit: false,
            submitOnChange: true,
            submitOnClose: true,
            popOut: true,
            title: game.i18n.localize("SATASUPE.MEMO"),
            classes: ["satasupe", "sheet", "memo"],
            template: `systems/satasupe/templates/apps/memo.html`,
            tabs: [{ navSelector: '.sheet-tabs', contentSelector: '.sheet-body', initial: 'tab0' }]
        }
    }

    _getHeaderButtons() {
        let buttons = super._getHeaderButtons();
        buttons.unshift({
            label: game.i18n.localize("SATASUPE.AddTab"),
            class: "memo-addtab",
            icon: "fa fa-plus",
            onclick: async () => {
                this.addtabdlg();
            }
        });
        buttons.unshift({
            label: game.i18n.localize("SATASUPE.ImportMemo"),
            class: "import-memo",
            icon: "fas fa-file-download",
            onclick: async () => {
                this.importmemo();
            }
        });
        buttons.unshift({
            label: game.i18n.localize("SATASUPE.ExportMemo"),
            class: "export-memo",
            icon: "fas fa-file-upload",
            onclick: async () => {
                this.exportmemo();
            }
        });
        if (game.user.isGM) {
            buttons.unshift({
                label: game.i18n.localize("SATASUPE.ShareMemo"),
                class: "share-memo",
                icon: "fas fa-share-square",
                onclick: async () => {
                    this.selectshareuser();
                }
            });
        }
        return buttons
    }

    async getData() {
        const context = await super.getData();
        //await game.user.unsetFlag("satasupe", "memo-data");
        var obj = duplicate(game.user.getFlag("satasupe", "memo-data") ?? {
            tabs: { tab0: { type: "plain", name: `Tab0`, data: "", save: `tabs.tab0.data`, id: 0 } }
        });
        if (!context.data) context.data = {};
        context.data.tabs = Object.keys(obj.tabs).map(function (key) { return obj.tabs[key] })
        context.editable = this.isEditable;
        return context;
    }

    activateListeners(html) {
        super.activateListeners(html);
        html.find("a.delete-tab").click(this.deletetab.bind(this));
        html.find("div.tab.check button.memo-addtable").click(this.addtable.bind(this));
        html.find("div.tab.check button.memo-addlist").click(this.addlist.bind(this));
        html.find("div.tab.check a.memo-delete-table").click(this.deletetable.bind(this));
        html.find("div.tab.check a.memo-delete-list").click(this.deletelist.bind(this));
        html.find("div.tab.check label.check.input.name").dblclick(this.memoedit.bind(this, "check"));
        html.find(".sheet-tabs.memo a.tabname.input").dblclick(this.memoedit.bind(this, "tabname"));
        html.find("div.tab.check label.check.input.limit").dblclick(this.memoedit.bind(this, "limit"));
        html.find("div.tab.check label.check.input.memo").dblclick(this.memoedit.bind(this, "memo"));
    }

    static async memorender(event) {
        event?.preventDefault();
        return new Promise(async (com) => {
            const memo = new memoApplication();
            memo._render(true).then(() => {
                com()
            });
        })
    }

    async _updateObject(event, formData) {
        return new Promise(async (com) => {
            if (!event?.currentTarget) {
                const data = mergeObject(duplicate(game.user.getFlag("satasupe", "memo-data") ?? {
                    tabs: { tab0: { type: "plain", name: `Tab0`, data: "", save: `tabs.tab0.data`, id: 0 } }
                }), expandObject(formData));

                if (event === null) {

                    const tabs = formData.tabs || (game.user.getFlag("satasupe", "memo-data")?.tabs || { tab0: { type: "plain", name: `Tab0`, data: "", save: `tabs.tab0.data`, id: 0 } });
                    data.tabs = tabs;

                    for (let [k, v] of Object.entries(formData)) {
                        data[`${k}`] = v;
                    }

                    await game.user.unsetFlag("satasupe", "memo-data")
                    await game.user.setFlag("satasupe", "memo-data", data);
                } else if (event?.type == "submit") {
                    for (let k in formData) {
                        let s = k.split('.')
                        if (s[0] == "tabs") data[s[0]][s[1]][s[2]] = formData[k]
                    }

                    this._upObje = data;

                    await game.user.unsetFlag("satasupe", "memo-data")
                    await game.user.setFlag("satasupe", "memo-data", data);
                }
            } else {
                const data = duplicate(game.user.getFlag("satasupe", "memo-data"));
                if (event.currentTarget.classList) {
                    if (event.currentTarget.classList.contains("check")) {
                        let id = event.currentTarget.dataset.id;
                        let dataid = event.currentTarget.dataset.dataid;
                        let listid = event.currentTarget.dataset.listid;
                        let iddn = data.tabs[`tab${id}`].data.findIndex((i) => i.dataid == dataid);
                        let idln = data.tabs[`tab${id}`].data[iddn].list.findIndex((j) => j.listid == listid);
                        if (event.currentTarget.classList.contains("checkbox")) {
                            data.tabs[`tab${id}`].data[iddn].list[idln].check = !data.tabs[`tab${id}`].data[iddn].list[idln].check;
                        }
                    }
                }
                await game.user.unsetFlag("satasupe", "memo-data")
                await game.user.setFlag("satasupe", "memo-data", data);
            }
            var p = []
            for (let [ke, va] of Object.entries(ui.windows)) {
                if (va instanceof memoApplication) {
                    p.push(va._render());
                }
            }
            Promise.all(p).then(() => {
                com()
            })
        })
    }

    addtabdlg() {
        const dlg = new Dialog({
            title: game.i18n.localize("SATASUPE.ChooseMemoType"),
            content: game.i18n.localize("SATASUPE.ChooseMemoTypeText"),
            buttons: {
                plain: {
                    label: game.i18n.localize("SATASUPE.Plain"),
                    callback: async () => {
                        this.addtab("plain");
                    }
                },
                check: {
                    label: game.i18n.localize("SATASUPE.CheckList"),
                    callback: async () => {
                        this.addtab("check");
                    }
                }
            },
            default: '',
            close: () => { console.log("close") }
        });
        dlg.render(true);
    }

    addtab(type) {
        return new Promise((com) => {
            let tabs = game.user.getFlag("satasupe", "memo-data").tabs || { tab0: { type: "plain", name: `Tab0`, data: "", save: `tabs.tab0.data`, id: 0 } };
            if (tabs.tabs || tabs[0] == "a") tabs = { tab0: { type: "plain", name: `Tab0`, data: "", save: `tabs.tab0.data`, id: 0 } }
            let id = -1;
            for (let [k, v] of Object.entries(tabs)) {
                if (id < v.id) {
                    id = v.id;
                }
            }
            if (type == "plain") {
                tabs[`tab${(id + 1)}`] = { type: "plain", name: `Tab${(id + 1)}`, data: "", save: `tabs.tab${(id + 1)}.data`, id: (id + 1) };
            } else if (type = "check") {
                tabs[`tab${(id + 1)}`] = { type: "check", name: `Tab${(id + 1)}`, data: [{ name: "", dataid: 0, list: [{ listid: 0, check: false, limit: "", memo: "" }] }], save: `tabs.tab${(id + 1)}.data`, id: (id + 1) };
            }
            this._updateObject(null, { tabs: tabs }).then(() => {
                com({ [type]: `tab${(id + 1)}` })
            });
        })
    }


    deletetab(event) {
        event.preventDefault();
        let id = event.currentTarget.dataset.id;
        let tabs = game.user.getFlag("satasupe", "memo-data").tabs || { tab0: { type: "plain", name: `Tab0`, data: "", save: `tabs.tab0.data`, id: 0 } };
        Dialog.confirm({
            title: game.i18n.localize("SATASUPE.Confirm"),
            content: `<div style="display:flex;margin-bottom: 10px;"><i style="font-size: 65px;width: 25%;display: flex;justify-content: center;" class="fas fa-exclamation-triangle"></i><div style="width: 75%;display: flex;align-items: center;">${game.i18n.format("SATASUPE.MemoDeleteConfirm", { tabname: tabs[`tab${id}`].name })}</div></div>`,
            yes: () => {
                delete tabs[`tab${id}`];
                this._updateObject(null, { tabs: tabs })
            },
            no: () => { },
            defaultYes: false
        })
    }

    addtable(event) {
        event.preventDefault();
        let id = event.currentTarget.dataset.id;
        let tabs = game.user.getFlag("satasupe", "memo-data").tabs;
        let idn = -1;
        for (let i = 0; i < tabs[`tab${id}`].data.length; i++) {
            if (idn < tabs[`tab${id}`].data[i].dataid) {
                idn = tabs[`tab${id}`].data[i].dataid;
            }
        }
        tabs[`tab${id}`].data.push({ name: "", dataid: (idn + 1), list: [{ listid: 0, check: false, limit: "", memo: "" }] });
        this._updateObject(null, { tabs: tabs });
    }

    deletetable(event) {
        event.preventDefault();
        let id = event.currentTarget.dataset.id;
        let dataid = event.currentTarget.dataset.dataid;
        let tabs = game.user.getFlag("satasupe", "memo-data").tabs;
        let idn = tabs[`tab${id}`].data.findIndex((i) => i.dataid == dataid);
        tabs[`tab${id}`].data.splice(idn, 1);
        this._updateObject(null, { tabs: tabs });
    }

    memoedit(type, event) {
        event.preventDefault();
        let id = event.currentTarget.dataset.id;
        let tabs = game.user.getFlag("satasupe", "memo-data").tabs;
        const memo = this;
        if (!$(event.currentTarget).hasClass('on')) {
            $(event.currentTarget).addClass('on');
            var txt = $(event.currentTarget).text();
            $(event.currentTarget).html('<input type="text" style="width:100%" value="' + txt + '" />');
            if (type == "check") {
                let dataid = event.currentTarget.dataset.dataid;
                $('label.check.input.name > input').focus().change(async function () {
                    var inputVal = $(this).val();
                    if (inputVal === '') {
                        inputVal = event.currentTarget.defaultValue;
                    };
                    $(this).parent().removeClass('on').text(inputVal);
                    let idn = tabs[`tab${id}`].data.findIndex((i) => i.dataid == dataid);
                    tabs[`tab${id}`].data[idn].name = inputVal;
                    memo._updateObject(null, { tabs: tabs });
                });
            } else if (type == "tabname") {
                $('a.tabname.input > input').focus().change(async function () {
                    var inputVal = $(this).val();
                    if (inputVal === '') {
                        inputVal = event.currentTarget.defaultValue;
                    };
                    $(this).parent().removeClass('on').text(inputVal);
                    tabs[`tab${id}`].name = inputVal;
                    memo._updateObject(null, { tabs: tabs });
                });
            } else if (type == "limit") {
                let dataid = event.currentTarget.dataset.dataid;
                let listid = event.currentTarget.dataset.listid;
                $('label.check.input.limit > input').focus().change(async function () {
                    var inputVal = $(this).val();
                    if (inputVal === '') {
                        inputVal = event.currentTarget.defaultValue;
                    };
                    $(this).parent().removeClass('on').text(inputVal);
                    let iddn = tabs[`tab${id}`].data.findIndex((i) => i.dataid == dataid);
                    let idln = tabs[`tab${id}`].data[iddn].list.findIndex((j) => j.listid == listid);
                    tabs[`tab${id}`].data[iddn].list[idln].limit = inputVal;
                    memo._updateObject(null, { tabs: tabs });
                });
            } else if (type == "memo") {
                let dataid = event.currentTarget.dataset.dataid;
                let listid = event.currentTarget.dataset.listid;
                $('label.check.input.memo > input').focus().change(async function () {
                    var inputVal = $(this).val();
                    if (inputVal === '') {
                        inputVal = event.currentTarget.defaultValue;
                    };
                    $(this).parent().removeClass('on').text(inputVal);
                    let iddn = tabs[`tab${id}`].data.findIndex((i) => i.dataid == dataid);
                    let idln = tabs[`tab${id}`].data[iddn].list.findIndex((j) => j.listid == listid);
                    tabs[`tab${id}`].data[iddn].list[idln].memo = inputVal;
                    memo._updateObject(null, { tabs: tabs });
                });
            }
        }
    }

    addlist(event) {
        event.preventDefault();
        let id = event.currentTarget.dataset.id;
        let dataid = event.currentTarget.dataset.dataid;
        let tabs = game.user.getFlag("satasupe", "memo-data").tabs;
        let iddn = tabs[`tab${id}`].data.findIndex((i) => i.dataid == dataid);
        let idn = -1;
        for (let j = 0; j < tabs[`tab${id}`].data[iddn].list.length; j++) {
            if (idn < tabs[`tab${id}`].data[iddn].list[j].listid) {
                idn = tabs[`tab${id}`].data[iddn].list[j].listid;
            }
        }
        tabs[`tab${id}`].data[iddn].list.push({ listid: (idn + 1), check: false, limit: "", memo: "" });
        this._updateObject(null, { tabs: tabs });
    }

    deletelist(event) {
        event.preventDefault();
        let id = event.currentTarget.dataset.id;
        let dataid = event.currentTarget.dataset.dataid;
        let listid = event.currentTarget.dataset.listid;
        let tabs = game.user.getFlag("satasupe", "memo-data").tabs;
        let iddn = tabs[`tab${id}`].data.findIndex((i) => i.dataid == dataid);
        let idln = tabs[`tab${id}`].data[iddn].list.findIndex((j) => j.listid == listid);
        tabs[`tab${id}`].data[iddn].list.splice(idln, 1);
        this._updateObject(null, { tabs: tabs });
    }

    exportmemo() {
        var tabs = game.user.getFlag("satasupe", "memo-data");
        var origin = {};
        origin.tabs = tabs.tabs;
        const data = JSON.stringify(origin);
        let type = "text/plain";
        let filename = "memo.json"
        saveDataToFile(data, type, filename);
    }

    importmemo() {
        const memo = this;
        const input = window.document.createElement("input");
        input.type = "file";
        input.accept = ".json"
        input.addEventListener("change", event => {
            var result = event.target.files[0];
            var reader = new FileReader();
            reader.readAsText(result);
            reader.addEventListener("load", () => {
                var filetype = result.name.match(/\.json$/)[0];
                if (filetype) {
                    let originalData = JSON.parse(reader.result);
                    if (originalData.tabs) {
                        const senddata = {};
                        senddata.tabs = originalData.tabs;
                        memo.mergememo(senddata);
                    } else {
                        ui.notifications.error(game.i18n.localize("SATASUPE.MemoImportError"))
                    }
                }
            });
        });
        input.click();
    }

    mergememo(merge) {
        const data = merge;
        const originaldata = duplicate(game.user.getFlag("satasupe", "memo-data") ?? {
            tabs: { tab0: { type: "plain", name: `Tab0`, data: "", save: `tabs.tab0.data`, id: 0 } }
        });
        let idn = -1;
        for (let [k, v] of Object.entries(originaldata.tabs)) {
            if (idn < v.id) {
                idn = v.id;
            }
        }
        let newdata = {};
        newdata.tabs = {}
        for (let [key, value] of Object.entries(data.tabs)) {
            let ed = data.tabs[key]
            ed.id = idn + 1;
            let newkey = `tab${(idn + 1)}`;
            ed.save = `tabs.tab${(idn + 1)}.data`;
            newdata.tabs[newkey] = ed;
            idn += 1;
        }
        const result = Object.assign(originaldata.tabs, newdata.tabs);
        this._updateObject(null, { tabs: result });
    }

    async selectshareuser() {
        let list = [];
        let players = game.users.filter((i) => true == i.active);
        for (let i = 0; i < players.length; i++) {
            if (game.user.id != players[i].id) {
                list.push({ id: players[i].id, key: i, name: players[i].name })
            }
        }
        list.push({ id: -1, key: -1, name: game.i18n.localize("SATASUPE.AllOnlinePlayer") })
        const html = await renderTemplate(`systems/satasupe/templates/apps/shareDialog.html`, { list: list });
        const dlg = new SelectItemDialog({
            title: game.i18n.localize("SATASUPE.MemoSharePlayer"),
            content: html,
            buttons: {},
            default: '',
            close: () => { console.log("close") }
        });
        dlg.render(true);
    }

    static async selecttab(userid) {
        let tabs = game.user.getFlag("satasupe", "memo-data").tabs;
        const html = await renderTemplate(`systems/satasupe/templates/apps/selectTabDialog.html`, { tabs: tabs });
        let formData = null;
        const dlg = new SelectItemDialog({
            title: game.i18n.localize("SATASUPE.ChooseShareTab"),
            content: html,
            buttons: {
                select: {
                    label: game.i18n.localize("SATASUPE.Selected"),
                    icon: '<i class="far fa-check-circle"></i>',
                    callback: async (html) => {
                        formData = new FormData(html[0].querySelector('#select-tab-form'));
                        let selecttab = formData.getAll("memotab");
                        var senddata = {};
                        for (let i = 0; i < selecttab.length; i++) {
                            senddata[`${"tab" + selecttab[i]}`] = tabs[`${"tab" + selecttab[i]}`];
                        }
                        await game.socket.emit('system.satasupe', { result: userid, type: "selected", data: senddata, voteT: "sharememo" });
                        return true;
                    }
                }
            },
            default: '',
            close: () => { console.log("close") }
        });
        dlg.render(true);
    }

    static async _sharememo(merge) {
        const data = {}
        data.tabs = duplicate(merge);
        const originaldata = duplicate(game.user.getFlag("satasupe", "memo-data") ?? {
            tabs: { tab0: { type: "plain", name: `Tab0`, data: "", save: `tabs.tab0.data`, id: 0 } }
        });
        let idn = -1;
        for (let [k, v] of Object.entries(originaldata.tabs)) {
            if (idn < v.id) {
                idn = v.id;
            }
        }

        let newdata = {};
        newdata.tabs = {};
        for (let [key, value] of Object.entries(data.tabs)) {
            let ed = data.tabs[key]
            ed.id = idn + 1;
            let newkey = `tab${(idn + 1)}`;
            ed.save = `tabs.tab${(idn + 1)}.data`;
            newdata.tabs[newkey] = ed;
            idn += 1;
        }

        const result = Object.assign(originaldata.tabs, newdata.tabs);
        const tabs = result;
        originaldata.tabs = tabs;

        for (let [k, v] of Object.entries(result)) {
            originaldata.tabs[`${k}`] = v;
        }
        await game.user.unsetFlag("satasupe", "memo-data")
        await game.user.setFlag("satasupe", "memo-data", originaldata);
        for (let [ke, va] of Object.entries(ui.windows)) {
            if (va instanceof memoApplication) {
                va._render();
            }
        }
    }
}