/**
 * Extend the basic ItemSheet with some very Simple modifications
 * @extends {ItemSheet}
 */
export class SatasupeItemSheet extends ItemSheet {

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["satasupe", "sheet", "item"],
      width: 520,
      height: 545,
      tabs: [{navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "description"}],
    });
  }

  get template() {
    const path = 'systems/satasupe/templates/item'
    return `${path}/item-sheet.html`;
  }

    /** @override */
  getData() {
    const data = super.getData();
    const itemData = data.data;
    data.data = itemData.data;
    if((data.data.weapon?.special?.blast) && (data.data.weapon?.specialtext?.blast)){
      delete data.data.weapon?.special?.blast;
    }
    return data;
  }

  /** @override */
  setPosition(options={}) {
    const position = super.setPosition(options);
    const sheetBody = this.element.find(".sheet-body");
    const bodyHeight = position.height - 192;
    sheetBody.css("height", bodyHeight);
    return position;
  }

  /** @override */
	activateListeners(html) {
    super.activateListeners(html);
    html.find("input.item-upkeep").click( this.upkeeperreset.bind(this))
    html.find("button.special-button").click( this._onSpecialButtonToggle.bind(this));
    // Everything below here is only needed if the sheet is editable
    if (!this.options.editable) return;
  }

  /* -------------------------------------------- */

  /** @override */
  _updateObject(event, formData) {
    if( event.currentTarget){
      if(event.currentTarget.classList){
        if(this.object.data.type == 'item'){
          if(this.object.parent?.type == 'character'){
            if(event.currentTarget.classList.contains('item-upkeep')){
              const bool = event.currentTarget.checked;
              let name = $(event.currentTarget).parent(".upkeep").parent(".detail").parent(".tab.active")[0].dataset.tab;
              this.object.parent.updateEquipmentUpkeep(bool, this.object.data.data[name].upkeeper);
            }
          }
          if(event.currentTarget.classList.contains('effect-area')){
            const key = event.currentTarget.closest('.tab').dataset.tab
            this._updateEffectArea(this.object, event.currentTarget.value, key);
          }
          if(event.currentTarget.classList.contains('specialtext-input')){
            const key = event.currentTarget.closest('.tab').dataset.tab;
            const specialtext = event.currentTarget.dataset.specialtext;
            this._updateSpecialtext(this.object, event.currentTarget.value, key, specialtext);
          }
        }
      }
    }

    // Update the Actor with the new form values.
    return this.object.update(formData);
  }

  async upkeeperreset(event){
    let name = $(event.currentTarget).parent(".upkeep").parent(".detail").parent(".tab.active")[0].dataset.tab;
    if(!this.object.data.data[name].upkeep){
      let up = duplicate(this.object.data.data);
      up[name].upkeeper = this.object.parent?.id;
      await this.object.update({'data': up});
    }
  }
  
  async _updateEffectArea(object, value, key){
      const efare = duplicate(object.data.data);
      efare[key].effect = value;
      await this.item.update({'data': efare});
  }
  
  async _updateSpecialtext(object, value, key, specialtextname){
      const stext = duplicate(object.data.data);
      stext[key].specialtext[specialtextname].number = value;
      await this.item.update({'data': stext});
  }

  async _onSpecialButtonToggle(event){
    event.preventDefault();
    if((event.currentTarget.dataset.special|| event.currentTarget.dataset.specialtext)&& event.currentTarget.dataset.itemtype){
      await this.item.toggleSpecial( event.currentTarget.dataset.special, event.currentTarget.dataset.specialtext, event.currentTarget.dataset.itemtype);
    }
  }

}
