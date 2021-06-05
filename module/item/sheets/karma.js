import {SATASUPE} from '../../config.js';

export class SatasupeKarmaSheet extends ItemSheet {

    static get defaultOptions() {
		return mergeObject(super.defaultOptions, {
			classes: ['satasupe', 'sheet', 'karma'],
			width: 520,
			height: 480,
            tabs: [{navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "description"}],
		});
	}

    get template(){
        return 'systems/satasupe/templates/item/karma-sheet.html';
    }

    async _updateObject(event, formData) {
        if( event.currentTarget){
          if(event.currentTarget.classList){
            if(event.currentTarget.classList.contains('effect-area')){
                this._updateEffectArea(this.object, event.currentTarget.value);
            }
          }
        }
        return this.object.update(formData);
      }

    getData(){
        const data = super.getData();
        data._alignment = game.i18n.localize("ALIGNMENT.CALM");

        for( let [key, value] of Object.entries(SATASUPE['check'])){
            if (key == data.data.check.checkValue.name){
                data._propertiesValue = value;
            }
        }
        for( let [key, value] of Object.entries(SATASUPE['alignment'])){
            if (key === data.data.check.alignment.name){
                data._alignment = value;
             }
        }
        /*
        data.dtypes = ["String", "Number", "Boolean"];

        for (let attr of Object.values(data.data.attributes)) {
        attr.isCheckbox = attr.dtype === "Boolean";
        }
        */
        return data;
    }

    async _updateEffectArea(object, value){
        const kar = duplicate(object.data.data);
        kar.effect = value;
        kar.effecthtml = value.replace(/\n|\r/g, '<br>');
        await this.item.update({'data': kar});
    }

/*
    activateListeners(html) {
        super.activateListeners(html);
        html.find('.circumstance-type').change(function({
        }));
    }
    */
}