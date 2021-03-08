import { EntitySheetHelper } from "./helper.js";

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
      height: 480,
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

    // Everything below here is only needed if the sheet is editable
    if (!this.options.editable) return;
  }

  /* -------------------------------------------- */

  /** @override 
  _updateObject(event, formData) {
    console.log(formData);
    console.log(this.object);

    // Handle attribute and group updates.
    formData = EntitySheetHelper.updateAttributes(formData, this);
    formData = EntitySheetHelper.updateGroups(formData, this);

    // Update the Actor with the new form values.
    return this.object.update(formData);
  }
  */
}
