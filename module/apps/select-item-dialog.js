export class SelectItemDialog extends Dialog {
    activateListeners(html) {
		super.activateListeners( html);

		html.find('input.open-itemsheet').click( async (event) => this._onButtonClicked( event));
        html.find('.checkon').click( async (event) => this._checkboxOn( event));
	}

    async _onButtonClicked( event){
        event.preventDefault();
        const item = game.items.get(event.currentTarget.dataset.key);
        await item.sheet.render(true);
    }

    async _checkboxOn( event){
        event.preventDefault();
        $("#selectItemTable tr td input.radioboxin").attr("checked", false);
        $(event.currentTarget).parent().find('.radioboxin').children('input').attr({checked: "checked"});
    }

    static async selectData(data){
        const html = await renderTemplate(`systems/satasupe/templates/apps/selectItem.html`, data);
        return new Promise((resolve) => {
            let formData = null;
            const dlg = new SelectItemDialog({
                title: game.i18n.localize("SATASUPE.SelectItem"),
                content: html,
                buttons:{
                    send:{
                        label: game.i18n.localize("SATASUPE.Selected"),
                        callback: html => {
                            formData = new FormData(html[0].querySelector('#select-item-form'));
                            return resolve(formData);
                        }
                    }
                },
                close:()=>{return resolve(false)}
            });
            dlg.render(true);
        });
    }

    static async chatpaletteData(){
        return new Promise((resolve) => {
            let formData = null;
            const dlg = new SelectItemDialog({
                title: game.i18n.localize("SATASUPE.MakeChatpaletteQ"),
                content: `<p>${game.i18n.localize("SATASUPE.MakeChatpaletteT")}</p>`,
                buttons:{
                    yes:{
                        label: game.i18n.localize("SATASUPE.Yes"),
                        icon: '<i class="far fa-check-circle"></i>',
                        callback: () => {
                            return resolve(true);
                        }
                    },
                    no:{
                        label: game.i18n.localize("SATASUPE.No"),
                        icon: '<i class="fas fa-times"></i>',
                        callback: () => {
                            return resolve(false);
                        }
                    }
                },
                default: 'yes',
                close:()=>{return resolve(false)}
            });
            dlg.render(true);
        });
    }
}