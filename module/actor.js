import { EntitySheetHelper } from "./helper.js";
import { SatasupeItem } from "./item/item.js";
import { SATASUPE } from "./config.js";
/**
 * Extend the base Actor entity by defining a custom roll data structure which is ideal for the Satasupe system.
 * @extends {Actor}
 */
export class SatasupeActor extends Actor {

  /** @override */
  prepareData() {
    super.prepareData();
    this.data.data.groups = this.data.data.groups || {};
    this.data.data.attributes = this.data.data.attributes || {};
  }

  /* -------------------------------------------- */

  async createKarma( karmaName, showSheet = false){
    const data = {
      name: karmaName,
      type: 'karma',
      data: {}
    };
    const created = await this.createEmbeddedEntity('OwnedItem', data, { renderSheet: showSheet});
    return created;
  }

  async createChatpalette( chatpaletteName, showSheet = false){
    const data = {
      name: chatpaletteName,
      type: 'chatpalette',
      data: {}
    };
    const created = await this.createEmbeddedEntity('OwnedItem', data, { renderSheet: showSheet});
    return created;
  }

  async createEmptyKarma( event = null){
    let showSheet = event ? !event.shiftKey: true;
    if( !this.getItemIdByName(game.i18n.localize(SATASUPE.newKarmaName))) return this.createKarma( game.i18n.localize(SATASUPE.newKarmaName), showSheet);
    let index = 0;
    let karmaName = game.i18n.localize(SATASUPE.newKarmaName) + ' ' + index;
    while( this.getItemIdByName(karmaName)){
      index++;
      karmaName = game.i18n.localize(SATASUPE.newKarmaName) + ' ' + index;
    }
    return this.createKarma( karmaName, showSheet)
  }

  createEmptyChatpalette( event = null){
    let showSheet = event ? !event.shiftKey: true;
    if( !this.getItemIdByName(game.i18n.localize(SATASUPE.newChatpaletteName))) return this.createChatpalette( game.i18n.localize(SATASUPE.newChatpaletteName), showSheet);
    let index = 0;
    let chatpaletteName = game.i18n.localize(SATASUPE.newChatpaletteName) + ' ' + index;
    while( this.getItemIdByName(chatpaletteName)){
      index++;
      chatpaletteName = game.i18n.localize(SATASUPE.newChatpaletteName) + ' ' + index;
    }
    return this.createChatpalette( chatpaletteName, showSheet)
  }

  getItemIdByName( itemName){
    let id = null;
    const name = itemName.match(/\(([^)]+)\)/)? itemName.match(/\(([^)]+)\)/)[1]: itemName;
    this.items.forEach( (value) => {
      if( SatasupeItem.getNameWithoutSpec(value).toLowerCase() == name.toLowerCase()) id = value.id;
    });
    return id;
  }

  /** @override */
  getRollData() {
    const data = super.getRollData();
    const shorthand = game.settings.get("satasupe", "macroShorthand");
    const formulaAttributes = [];
    const itemAttributes = [];

    // Handle formula attributes when the short syntax is disabled.
    this._applyShorthand(data, formulaAttributes, shorthand);

    // Map all items data using their slugified names
    this._applyItems(data, itemAttributes, shorthand);

    // Evaluate formula replacements on items.
    this._applyItemsFormulaReplacements(data, itemAttributes, shorthand);

    // Evaluate formula attributes after all other attributes have been handled, including items.
    this._applyFormulaReplacements(data, formulaAttributes, shorthand);

    // Remove the attributes if necessary.
    if ( !!shorthand ) {
      delete data.attributes;
      delete data.attr;
      delete data.abil;
      delete data.groups;
    }

    return data;
  }

  async toggleHobby(hobbyName, familyName){
    let hobbyValue = this.data.data.hobby[familyName]?.[hobbyName]?.value;
    //let hobbyValue = hobbyFamily[hobbyName]?.value;
    if(!(typeof hobbyValue === "boolean")) hobbyValue = hobbyValue === 'false' ? true : false;
    await this.update( {[`data.hobby.${familyName}.${hobbyName}.value`]: !hobbyValue});
  }

  async createEmbeddedEntity(embeddedName, data, options){
    switch( data.type){
      case 'karma':
        return await super.createEmbeddedEntity(embeddedName, data, options);
      case 'chatpalette':
        return await super.createEmbeddedEntity(embeddedName, data, options);
      }
  }

  async createScenarioSection( title = null){
    const scena = this.data.data.scenario ? this.data.data.scenario : [];
    scena.push({
      title : title,
      dd : null,
      day : null,
      karma : null,
      exp : null,
      note : null
    });
    await this.update( {'data.scenario' : scena});
  }

  async deleteScenarioSection( index){
    const scena = duplicate(this.data.data.scenario);
    scena.splice(index, 1);
    await this.update( {'data.scenario' : scena});
  }

  async updateScenarioSection(index, value, key){
    const scena = duplicate(this.data.data.scenario);
    scena[index][key] = value;
    await this.update({'data.scenario' : scena});
  }

  async createAddictionSection( title = null){
    const addic = this.data.data.addiction ? this.data.data.addiction : [];
    addic.push({
      title : title,
      use : false
    });
    await this.update( {'data.addiction' : addic});
  }

  async updateAddictionName( index, name){
    const addic = duplicate(this.data.data.addiction);
    addic[index].title = name;
    await this.update({'data.addiction' : addic});
  }

  async updateAddictionBool( index, key){
    const addic = duplicate(this.data.data.addiction);
    if(!(typeof addic[index][key] === "boolean")) addic[index][key] = addic[index][key] === 'false' ? true:false;
    addic[index][key] = !addic[index][key];
    await this.update({'data.addiction' : addic});
  }

  async deleteAddictionSection( index){
    const addic = duplicate(this.data.data.addiction);
    addic.splice(index, 1);
    await this.update( {'data.addiction' : addic});
  }

  async deleteActorChatSection( index, ind, id){
    let item = this.data.items;
    for(let i = 0; i < item.length ; i++){
      if(item[i]._id == id){
        const chat = duplicate(this.data.items);
        console.log(`Foundry VTT | Deleted a part of  OwnedItem ${id} from parent Actor ${this.data._id}`);
        chat[i].data.chatpalette.chat.splice(ind, 1);
        item.splice(i, 1);
        if(!chat[i].data.chatpalette.chat.length){
          console.log(`Foundry VTT | Deleted OwnedItem ${id} from parent Actor ${this.data._id}`);
          chat.splice(i, 1);
        }
        await this.update({'items' : chat});
      }
    }
  }

  async updateActorChatSection( index, value, key , id){
    let item = this.data.items;
    for(let i = 0; i < item.length ; i++){
      if(item[i]._id == id){
        const chat = duplicate(this.data.items);
        chat[i].data.chatpalette.chat[index][key] = value;
        await this.update({'items' : chat});
      }
    }
  }

  async createPrisonerSection( title = null){
    const pris = this.data.data.prisoner ? this.data.data.prisoner : [];
    pris.push( {
      title : title,
      keep : false,
      exp : false,
      lovers : false
    });
    await this.update( {'data.prisoner' : pris});
  }

  async updatePrisonerName( index, name){
    const pris = duplicate(this.data.data.prisoner);
    pris[index].title = name;
    await this.update({'data.prisoner' : pris});
  }

  async updatePrisonerBool( index, key){
    const pris = duplicate(this.data.data.prisoner);
    if(!(typeof pris[index][key] === "boolean")) pris[index][key] = pris[index][key] === 'false' ? true:false;
    pris[index][key] = !pris[index][key];

    if(key == "exp" || key == "keep"){
      if(pris[index].exp == true && pris[index].keep == true){
        await this.update({'data.exp.upkeep.case': true});
      }
    }
    if(key == "exp"){
      let newkeep = this.data.data.exp.upkeep.value == null ? 0 : this.data.data.exp.upkeep.value;
      if( pris[index][key]){
        newkeep += 1;
      }else{
        await this.update({'data.exp.upkeep.case': false});
        newkeep -= 1;
      }
      await this.update({'data.exp.upkeep.value' : newkeep});
    }
    if(key == "keep"){
      let newgainexp = this.data.data.exp.expgain.value == null ? 0 : this.data.data.exp.expgain.value;
      if( pris[index][key]){
      }else{
        if( !pris[index].exp){
          if(!this.data.data.exp.upkeep.case){
            newgainexp += 1;
          }
        }
      }
      await this.update({'data.exp.expgain.value' : newgainexp});
    }
    await this.update({'data.prisoner' : pris});
  }

  async deletePrisonerSection( index){
    const pris = duplicate(this.data.data.prisoner);
    pris.splice(index, 1);
    await this.update( {'data.prisoner' : pris});
  }

  /**
   * Apply shorthand syntax to actor roll data.
   * @param {Object} data The actor's data object.
   * @param {Array} formulaAttributes Array of attributes that are derived formulas.
   * @param {Boolean} shorthand Whether or not the shorthand syntax is used.
   */
  _applyShorthand(data, formulaAttributes, shorthand) {
    // Handle formula attributes when the short syntax is disabled.
    for ( let [k, v] of Object.entries(data.attributes) ) {
      // Make an array of formula attributes for later reference.
      if ( v.dtype == "Formula" ) formulaAttributes.push(k);
      // Add shortened version of the attributes.
      if ( !!shorthand ) {
        if ( !(k in data) ) {
          // Non-grouped attributes.
          if ( v.dtype ) {
            data[k] = v.value;
          }
          // Grouped attributes.
          else {
            data[k] = {};
            for ( let [gk, gv] of Object.entries(v) ) {
              data[k][gk] = gv.value;
              if ( gv.dtype == "Formula" ) formulaAttributes.push(`${k}.${gk}`);
            }
          }
        }
      }
    }
  }

  /**
   * Add items to the actor roll data object. Handles regular and shorthand
   * syntax, and calculates derived formula attributes on the items.
   * @param {Object} data The actor's data object.
   * @param {Boolean} shorthand Whether or not the shorthand syntax is used.
   */
  _applyItems(data, itemAttributes, shorthand) {
    // Map all items data using their slugified names
    data.items = this.data.items.reduce((obj, i) => {
      let key = i.name.slugify({strict: true});
      let itemData = duplicate(i.data);

      // Add items to shorthand and note which ones are formula attributes.
      for ( let [k, v] of Object.entries(itemData.attributes) ) {
        // When building the attribute list, prepend the item name for later use.
        if ( v.dtype == "Formula" ) itemAttributes.push(`${key}..${k}`);
        // Add shortened version of the attributes.
        if ( !!shorthand ) {
          if ( !(k in itemData) ) {
            // Non-grouped item attributes.
            if ( v.dtype ) {
              itemData[k] = v.value;
            }
            // Grouped item attributes.
            else {
              if ( !itemData[k] ) itemData[k] = {};
              for ( let [gk, gv] of Object.entries(v) ) {
                itemData[k][gk] = gv.value;
                if ( gv.dtype == "Formula" ) itemAttributes.push(`${key}..${k}.${gk}`);
              }
            }
          }
        }
        // Handle non-shorthand version of grouped attributes.
        else {
          if ( !v.dtype ) {
            if ( !itemData[k] ) itemData[k] = {};
            for ( let [gk, gv] of Object.entries(v) ) {
              itemData[k][gk] = gv.value;
              if ( gv.dtype == "Formula" ) itemAttributes.push(`${key}..${k}.${gk}`);
            }
          }
        }
      }

      // Delete the original attributes key if using the shorthand syntax.
      if ( !!shorthand ) {
        delete itemData.attributes;
      }

      obj[key] = itemData;
      return obj;
    }, {});
  }

  _applyItemsFormulaReplacements(data, itemAttributes, shorthand) {
    for ( let k of itemAttributes ) {
      // Get the item name and separate the key.
      let item = null;
      let itemKey = k.split('..');
      item = itemKey[0];
      k = itemKey[1];

      // Handle group keys.
      let gk = null;
      if ( k.includes('.') ) {
        let attrKey = k.split('.');
        k = attrKey[0];
        gk = attrKey[1];
      }

      let formula = '';
      if ( !!shorthand ) {
        // Handle grouped attributes first.
        if ( data.items[item][k][gk] ) {
          formula = data.items[item][k][gk];
          data.items[item][k][gk] = EntitySheetHelper.replaceData(formula.replace('@item.', `@items.${item}.`), data, {missing: "0"});
        }
        // Handle non-grouped attributes.
        else if ( data.items[item][k] ) {
          formula = data.items[item][k];
          data.items[item][k] = EntitySheetHelper.replaceData(formula.replace('@item.', `@items.${item}.`), data, {missing: "0"});
        }
      }
      else {
        // Handle grouped attributes first.
        if ( data.items[item]['attributes'][k][gk] ) {
          formula = data.items[item]['attributes'][k][gk]['value'];
          data.items[item]['attributes'][k][gk]['value'] = EntitySheetHelper.replaceData(formula.replace('@item.', `@items.${item}.attributes.`), data, {missing: "0"});
        }
        // Handle non-grouped attributes.
        else if ( data.items[item]['attributes'][k]['value'] ) {
          formula = data.items[item]['attributes'][k]['value'];
          data.items[item]['attributes'][k]['value'] = EntitySheetHelper.replaceData(formula.replace('@item.', `@items.${item}.attributes.`), data, {missing: "0"});
        }
      }
    }
  }

  /**
   * Apply replacements for derived formula attributes.
   * @param {Object} data The actor's data object.
   * @param {Array} formulaAttributes Array of attributes that are derived formulas.
   * @param {Boolean} shorthand Whether or not the shorthand syntax is used.
   */
  _applyFormulaReplacements(data, formulaAttributes, shorthand) {
    // Evaluate formula attributes after all other attributes have been handled,
    // including items.
    for ( let k of formulaAttributes ) {
      // Grouped attributes are included as `group.attr`, so we need to split
      // them into new keys.
      let attr = null;
      if ( k.includes('.') ) {
        let attrKey = k.split('.');
        k = attrKey[0];
        attr = attrKey[1];
      }
      // Non-grouped attributes.
      if ( data.attributes[k]?.value ) {
        data.attributes[k].value = EntitySheetHelper.replaceData(data.attributes[k].value, data, {missing: "0"});
        // TODO: Replace with:
        // data.attributes[k].value = Roll.replaceFormulaData(data.attributes[k].value, data, {missing: "0"});
      }
      // Grouped attributes.
      else {
        if ( attr ) {
          data.attributes[k][attr].value = EntitySheetHelper.replaceData(data.attributes[k][attr].value, data, {missing: "0"});
        }
      }

      // Duplicate values to shorthand.
      if ( !!shorthand ) {
        // Non-grouped attributes.
        if ( data.attributes[k]?.value ) {
          data[k] = data.attributes[k].value;
        }
        // Grouped attributes.
        else {
          if ( attr ) {
            // Initialize a group key in case it doesn't exist.
            if ( !data[k] ) {
              data[k] = {};
            }
            data[k][attr] = data.attributes[k][attr].value;
          }
        }
      }
    }
  }
}
