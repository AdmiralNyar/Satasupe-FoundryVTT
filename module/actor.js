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
    const itemData = this.data.items || [];
    const actorData = this.data;
    const flags = actorData.flags;

    for(let i of itemData){
      if(i.type === 'karma') {
        this._prepareActorKarmaData(i);
      }
    }
  }

  _prepareActorKarmaData(itemData){
    const data = itemData.data;
    for (let [key, value] of Object.entries(SATASUPE['timing'])){
      if(key == data.timing.name){
        data.timing.label = value;
      }
    }
    for (let [key, value] of Object.entries(SATASUPE['target'])){
      if(key == data.target.name){
        data.target.label = value;
      }
    }
    for (let [key, value] of Object.entries(SATASUPE['karmaType'])){
      if(key == data.type.name){
        data.type.label = value;
      }
    }
    for (let [key, value] of Object.entries(SATASUPE['abilityType'])){
      if(key == data.abilityType.name){
        data.abilityType.label = value;
      }
    }
    if(data.check.none){}else{
      if(data.check.type){
        for (let [key, value] of Object.entries(SATASUPE['alignment'])){
          if(key == data.check.alignment.name){
            data.check.alignment.label = value;
          }
        }
      }else{
        for (let [key, value] of Object.entries(SATASUPE['check'])){
          if(key == data.check.checkValue.name){
            data.check.checkValue.label = value;
          }
        } 
      }
    }
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

  async createItem( itemName, showSheet = false){
    const data = {
      name: itemName,
      type: 'item',
      data:{}
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

  createEmptyItem( event = null){
    let showSheet = event ? !event.shiftKey: true;
    if( !this.getItemIdByName(game.i18n.localize(SATASUPE.newItemName))) return this.createItem( game.i18n.localize(SATASUPE.newItemName), showSheet);
    let index = 0;
    let itemName = game.i18n.localize(SATASUPE.newItemName) + ' ' + index;
    while( this.getItemIdByName(itemName)){
      index++;
      itemName = game.i18n.localize(SATASUPE.newItemName) + ' ' + index;
    }
    return this.createItem( itemName, showSheet)
  }

  getItemIdByName( itemName){
    let id = null;
    const name = itemName.match(/\(([^)]+)\)/)? itemName.match(/\(([^)]+)\)/)[1]: itemName;
    this.items.forEach( (value) => {
      if( SatasupeItem.getNameWithoutSpec(value).toLowerCase() == name.toLowerCase()) id = value.id;
    });
    return id;
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
      case 'item':
        return await super.createEmbeddedEntity(embeddedName, data, options);
      }
  }

  async createScenarioSection( title = null){
    const scena = this.data.data.scenario ? duplicate(this.data.data.scenario) : [];
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
    if(scena[index].exp){
      let newgainexp = this.data.data.exp.expgain.value == null ? 0 : this.data.data.exp.expgain.value;
      newgainexp = newgainexp - scena[index].exp;
      await this.update({'data.exp.expgain.value' : newgainexp});
    }
    scena.splice(index, 1);
    await this.update( {'data.scenario' : scena});
  }

  async updateScenarioSection(index, value, key){
    const scena = duplicate(this.data.data.scenario);
    if(key == "exp"){
      const deff = value - scena[index].exp;
      let newgainexp = this.data.data.exp.expgain.value == null ? 0 : this.data.data.exp.expgain.value;
      newgainexp = newgainexp + deff;
      await this.update({'data.exp.expgain.value' : newgainexp});
    }
    scena[index][key] = value;
    await this.update({'data.scenario' : scena});
  }

  async createAddictionSection( title = null){
    const addic = this.data.data.addiction ? duplicate(this.data.data.addiction) : [];
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

  async updateEquipmentUpkeep(bool){
    let newkeep = this.data.data.exp.upkeep.value == null ? 0 : this.data.data.exp.upkeep.value;
    if(bool){
      newkeep +=1;
    }else{
      newkeep -=1;
    }
    await this.update({'data.exp.upkeep.value' : newkeep});
  }

  async updateEquipmentStorage( index, value){
    let item = this.data.items;
    for(let i = 0; i < item.length ; i++){
      if(item[i]._id == index){
        const equip = duplicate(this.data.items);
        equip[i].data.storage = value;
           await this.update({'items' : equip});
      }
    }
  }

  async updateEquipmentSection( index, key){
    let item = this.data.items;
    for(let i = 0; i < item.length ; i++){
      if(item[i]._id == index){
        const equip = duplicate(this.data.items);
        if(!(typeof equip[i].data[key].upkeep === "boolean")) equip[i].data[key].upkeep = equip[i].data[key].upkeep ==='false' ? true : false;
        equip[i].data[key].upkeep = !equip[i].data[key].upkeep;
        let newkeep = this.data.data.exp.upkeep.value == null ? 0 : this.data.data.exp.upkeep.value;
        if(equip[i].data[key].upkeep){
          newkeep +=1;
        }else{
          newkeep -=1;
        }
        await this.update({'data.exp.upkeep.value' : newkeep});
        await this.update({'items' : equip});
      }
    }    
  }

  async updateEquipmentMiniSection( index, key, value){
    let item = this.data.items;
    for(let i = 0; i < item.length ; i++){
      if(item[i]._id == index){
        const equip = duplicate(this.data.items);
        equip[i].data[key].minivalue = value;
        await this.update({'items' : equip});
      }
    }
  }

  async updateMajorWounds(formData){
    const mw = duplicate(this.data.data.status);
    if(formData['data.attribs.bp.value'] <= 5){
      if(formData['data.attribs.mp.value'] <= 5){
        mw.majorWoundsOffset.value = 2;
        await this.update({ 'data.status' : mw});
      }else{
        mw.majorWoundsOffset.value = 1;
        await this.update({ 'data.status' : mw});
      }
    }else{
      if(formData['data.attribs.mp.value'] <= 5){
        mw.majorWoundsOffset.value = 1;
        await this.update({ 'data.status' : mw});
      }else{
        mw.majorWoundsOffset.value = 0;
        await this.update({ 'data.status' : mw});
      }
    }
  }

  async createVariableSection( title = null){
    const vari = this.data.data.variable ? duplicate(this.data.data.variable) : [];
    vari.push({
      title:title,
      variable : null,
      substitution : false
    });
    await this.update( {'data.variable' : vari});
  }

  async updateVariableSection( index, value, key){
    const vari = duplicate(this.data.data.variable);
    if(key=='substitution'){
      vari[index][key] = !vari[index][key];
    }else{
      vari[index][key] = value;
    }
    await this.update( {'data.variable' : vari});
  }

  async deleteVariableSection( index){
    const vari = duplicate(this.data.data.variable);
    vari.splice(index, 1);
    await this.update({'data.variable' : vari});
  }

  async createPrisonerSection( title = null){
    const pris = this.data.data.prisoner ? duplicate(this.data.data.prisoner) : [];
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

    if(key == "exp"){
      let newkeep = this.data.data.exp.upkeep.value == null ? 0 : this.data.data.exp.upkeep.value;
      if( pris[index].exp){
        newkeep += 1;
        if( !pris[index].keep){
          pris[index].keep = !pris[index].keep;
        }
      }else{
        if( pris[index].keep){
          pris[index].keep = !pris[index].keep;
        }
        newkeep -= 1;
      }
      await this.update({'data.exp.upkeep.value' : newkeep});
    }
    if(key == "keep"){
      let newgainexp = this.data.data.exp.expgain.value == null ? 0 : this.data.data.exp.expgain.value;
      if( pris[index].keep){
      }else{
        if( !pris[index].exp){
          newgainexp += 1;
        }
      }
      await this.update({'data.exp.expgain.value' : newgainexp});
    }
    await this.update({'data.prisoner' : pris});
  }

  async deletePrisonerSection( index){
    const pris = duplicate(this.data.data.prisoner);
    if(pris[index].exp){
      let newkeep = this.data.data.exp.upkeep.value == null ? 0 : this.data.data.exp.upkeep.value;
      newkeep -=1;
      await this.update({'data.exp.upkeep.value' : newkeep});
    }
    if(pris[index].keep && !pris[index].exp){
      let newgainexp = this.data.data.exp.expgain.value == null ? 0 : this.data.data.exp.expgain.value;
      newgainexp += 1;
      await this.update({'data.exp.expgain.value' : newgainexp});
    }
    pris.splice(index, 1);
    await this.update( {'data.prisoner' : pris});
  }

}
