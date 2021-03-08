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

    getData(){
        const data = super.getData();
        data._alignment = "CALM";
        data._propertiesValue ="CRIME";

        for( let [key, value] of Object.entries(SATASUPE['check'])){
            if (key === data.data.check.checkValue){
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
/*
    activateListeners(html) {
        super.activateListeners(html);
        html.find('.circumstance-type').change(function({
        }));
    }
    */
}