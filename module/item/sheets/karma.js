import { SATASUPE } from '../../config.js';

export class SatasupeKarmaSheet extends ItemSheet {

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ['satasupe', 'sheet', 'karma'],
            width: 520,
            height: 480,
            tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "description" }],
        });
    }

    get template() {
        return 'systems/satasupe/templates/item/karma-sheet.html';
    }

    async _updateObject(event, formData) {
        if (event.currentTarget) {
            if (event.currentTarget.classList) {
                if (event.currentTarget.classList.contains('effect-area')) {
                    this._updateEffectArea(this.object, event.currentTarget.value);
                }
            }
        }
        return this.object.update(formData);
    }

    async getData() {
        const context = await super.getData();
        const itemData = context.item;
        context.system = itemData.system;
        context._alignment = game.i18n.localize("ALIGNMENTS.CALM");
        for (let [key, value] of Object.entries(SATASUPE['check'])) {
            if (key == context.system.check.checkValue.name) {
                context._propertiesValue = value;
            }
        }
        for (let [key, value] of Object.entries(SATASUPE['alignment'])) {
            if (key === context.system.check.alignment.name) {
                context._alignment = value;
            }
        }
        /*
        context.dtypes = ["String", "Number", "Boolean"];

        for (let attr of Object.values(context.system.attributes)) {
        attr.isCheckbox = attr.dtype === "Boolean";
        }
        */
        return context;
    }

    async _updateEffectArea(object, value) {
        const kar = duplicate(object.system);
        kar.effect = value;
        kar.effecthtml = value.replace(/\r?\n/g, '<br>');
        await this.item.update({ 'system': kar });
    }

    /*
        activateListeners(html) {
            super.activateListeners(html);
            html.find('.circumstance-type').change(function({
            }));
        }
        */
}