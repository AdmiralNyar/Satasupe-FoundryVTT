/**
 * Extend the basic ItemSheet with some very Simple modifications
 * @extends {ItemSheet}
 */
export class SatasupeInventrySheet extends ItemSheet {

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["satasupe", "sheet", "inventry"],
      width: 520,
      height: 480,
      tabs: [{navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "description"}],
    });
  }

  get template() {
    const path = 'systems/satasupe/templates/item'
    return `${path}/inventry-sheet.html`;
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


}
