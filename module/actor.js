import { SatasupeItem } from "./item/item.js";
import { SATASUPE } from "./config.js";
/**
 * Extend the base Actor entity by defining a custom roll data structure which is ideal for the Satasupe system.
 * @extends {Actor}
 */
export class SatasupeActor extends Actor {
  async initialize () {
    super.initialize()
  }

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
    const data = itemData.data.data;

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
    const created = await this.createEmbeddedDocuments('Item', [data], { renderSheet: showSheet});
    return created;
  }

  async createChatpalette( chatpaletteName, showSheet = false){
    const data = {
      name: chatpaletteName,
      type: 'chatpalette',
      data: {}
    };
    const created = await this.createEmbeddedDocuments('Item', [data], { renderSheet: showSheet});
    return created;
  }

  async createItem( itemName, showSheet = false){
    const data = {
      name: itemName,
      type: 'item',
      data:{}
    };
    const created = await this.createEmbeddedDocuments('Item', [data], { renderSheet: showSheet});
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

  async createEmbeddedDocuments(embeddedName, [data], options){
    switch( data.type){
      case 'karma':
        return await super.createEmbeddedDocuments(embeddedName, [data], options);
      case 'chatpalette':
        return await super.createEmbeddedDocuments(embeddedName, [data], options);
      case 'item':
        return await super.createEmbeddedDocuments(embeddedName, [data], options);
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
    if(key =="note"){
      value = value.replace(/\n/g, '\r');
    }
    scena[index][key] = value;
    await this.update({'data.scenario' : scena});
  }

  async createAddictionSection( title = null){
    const addic = this.data.data.addiction ? duplicate(this.data.data.addiction) : [];
    addic.push({
      title : title,
      value: false,
      times: 0,
      use : false,
      addic: false
    });
    await this.update( {'data.addiction' : addic});
  }

  async updateAddictionName( index, name, addictype){
    const addic = duplicate(this.data.data.addiction);
    addic[index][`${addictype}`] = name;
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
    let items = duplicate(this.data.items);
    let del = false;
    for(let item of items){
      if(item._id == id){
        console.log(`Foundry VTT | Deleted a part of  OwnedItem ${id} from parent Actor ${this.data._id}`);
        item.data.chatpalette.chat.splice(ind, 1);
        if(!item.data.chatpalette.chat.length){
          del = true;
        }
      }
    }
    await this.update({'items' : items});
    if(del){
      console.log(`Foundry VTT | Deleted OwnedItem ${id} from parent Actor ${this.data._id}`);
      let it = this.data.items.get(id,{strict:true});
      await it.delete();
    }
  }

  async updateActorChatSection( index, value, key , id){
    let items = duplicate(this.data.items);
    for(let item of items){
      if(item._id == id){
        item.data.chatpalette.chat[index][key] = value;
      }
    }
    await this.update({'items' : items});
  }

  async updateEquipmentUpkeep(bool, acid){
    let newkeep = this.data.data.exp.upkeep.value == null ? 0 : this.data.data.exp.upkeep.value;
    if(bool){
      newkeep +=1;
    }else{
      if(this.id == acid) newkeep -=1;
    }
    await this.update({'data.exp.upkeep.value' : newkeep});
  }

  /*async updateEquipmentStorage( index, value){
    let item = this.data.items;
    for(let i = 0; i < item.length ; i++){
      if(item[i]._id == index){
        const equip = duplicate(this.data.items);
        equip[i].data.storage = value;
           await this.update({'items' : equip});
      }
    }
  }*/

  async updateEquipmentSection( index, key){
    let items = duplicate(this.data.items);
    for(let item of items){
      if(item._id == index){
        if(!(typeof item.data[key].upkeep === "boolean")) item.data[key].upkeep = item.data[key].upkeep ==='false' ? true : false;
        item.data[key].upkeep = !item.data[key].upkeep;
        let newkeep = this.data.data.exp.upkeep.value == null ? 0 : this.data.data.exp.upkeep.value;
        if(item.data[key].upkeep){
          item.data[key].upkeeper = this.id;
          newkeep +=1;
        }else{
          if(item.data[key].upkeeper == this.id) newkeep -=1;
        }
        await this.update({'data.exp.upkeep.value' : newkeep});
      }
    }
    await this.update({'items' : items});   
  }

  async updateEquipmentMiniSection( index, key, value){
    let items = duplicate(this.data.items);
    for(let item of items){
      if(item._id == index){
        item.data[key].minivalue = value;
      }
    }
    await this.update({'items' : items});
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

  async checkupkeep(life){
    let up = duplicate(this.items);
    let ex = duplicate(this.data.data.exp);
    let change = 0
    for(let item of up){
      if(item.type == "item"){
        if(item.data.typep){
          if(item.data.props.upkeep){
            if(item.data.props.price.value != ""){
              if(item.data.props.price.value <= Number(life)){
                if(item.data.props.upkeeper == this.id){
                  item.data.props.upkeep = false;
                  change += 1;
                }
              }
            }
          }
        }
        if(item.data.typew){
          if(item.data.weapon.upkeep){
            if(item.data.weapon.price.value != ""){
              if(item.data.weapon.price.value <= Number(life)){
                if(item.data.weapon.upkeeper == this.id){
                  item.data.weapon.upkeep = false;
                  change += 1;
                }
              }
            }
          }
        }
        if(item.data.typev){
          if(item.data.vehicle.upkeep){
            if(item.data.vehicle.price.value != ""){
              if(item.data.vehicle.price.value <= Number(life)){
                if(item.data.vehicle.upkeeper == this.id){
                  item.data.vehicle.upkeep = false;
                  change += 1;
                }
              }
            }
          }
        }
      }
    }

    let usedexp = 0;
    if(change > 0){
      for (let [key, circumstance]of Object.entries(this.data.data.circumstance)){
        let v = circumstance.value;
        if(key == "life" && life != v) v = life
        if(v == 1 || v== null){
        }else if(v == 2){
          usedexp += 1;
        }else if(v == 3){
          usedexp += 2;
        }else if(v == 4){
          usedexp += 4;
        }else if(v ==5){
          usedexp += 6;
        }else if(v == 6){
          usedexp += 9;
        }else if(v == 7){
          usedexp += 13;
        }else if(v == 8){
          usedexp += 18;
        }else{}
      }

      for (let [key, aptitude]of Object.entries(this.data.data.aptitude)){
        if(aptitude.value <= 3 || aptitude.value == null){
        }else if(aptitude.value == 4){
          usedexp += 1;
        }else if(aptitude.value == 5){
          usedexp += 2;
        }else if(aptitude.value == 6){
          usedexp += 4;
        }else if(aptitude.value ==7){
          usedexp += 10;
        }else if(aptitude.value == 8){
          usedexp += 18;
        }else{}
      }

      if((13 - usedexp - Number(ex.upkeep.value) + Number(ex.expgain.value)) > 0){
        ex.upkeep.value -= change;
        await this.update({'items' : up});
        await this.update({'data.exp' : ex});
      }
    }
  }

  async createVariableSection( title = null){
    const vari = this.data.data.variable ? duplicate(this.data.data.variable) : [];
    vari.push({
      title:title,
      variable : null,
      substitution : false,
      formla: "",
      sum:0
    });
    await this.update( {'data.variable' : vari});
  }

  async updateVariableSection( index, value, key){
    var vari = duplicate(this.data.data.variable);
    if(key=='substitution'){
      vari[index][key] = !vari[index][key];
    }else if(key == 'title'){
      let num = value;
      num = num.replace(/[！-～]/g, function(s) {
        return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);});
      num = num.replace(/(　| )/g,"");
      let mathsign = num.match(/[!-'|,|.|:-@|\[-\]|_-`|\||~]/g);
        for(let l=0;l<mathsign?.length;l++){
          ui.notifications.error(`${mathsign[l]} can't use! It is replaced by "".`);
        }
      num = num.replace(/[!-'|,|.|:-@|\[-\]|_-`|\||~]/g,"");
      vari[index][key] = num;
      let repal = num.match(/(?<=\{).*?(?=\})/g);
      const re = /\{.*?\}/;
      var actor = this.data.data;
      let ok = false;
      if(repal){
        for (let i = 0 ; i < repal.length ; i++){
          for(let j = 0; j < this.data.data.variable?.length ; j++){
            if((this.data.data.variable[j].variable == repal[i]) && this.data.data.variable[j].substitution){
              num = num.replace(re,`Number(vari[${j}].sum)`);
              ok = true;
              break;
            }
          }
          if(!ok){
            for(let[ky, value] of Object.entries(SATASUPE['referenceable'])){
              if((actor.circumstance[ky]?.variable == repal[i]) && actor.circumstance[ky]?.substitution){
                  num = num.replace(re,Number(actor.circumstance[ky].value));
                  ok = true;
                  break;
              }else if((actor.aptitude[ky]?.variable == repal[i]) && actor.aptitude[ky]?.substitution){
                num = num.replace(re,Number(actor.aptitude[ky].value));
                ok = true;
                break;
              }else if((actor.attribs[ky]?.variable == repal[i]) && actor.attribs[ky]?.substitution){
                num = num.replace(re,Number(actor.attribs[ky].value));
                ok = true;
                break;
              }else if((actor.combat[ky]?.variable == repal[i]) && actor.combat[ky]?.substitution){
                num = num.replace(re,Number(actor.combat[ky].value));
                ok = true;
                break;
              }else if((actor.status[ky]?.variable == repal[i]) && actor.status[ky]?.substitution){
                num = num.replace(re,Number(actor.status[ky].value));
                ok = true;
                break;
              }
            }
          }
          if(!ok){
            num = num.replace(re, '0');
            ui.notifications.error(game.i18n.localize("ALERTMESSAGE.ReplaceUnread"));
          }
          ok = false;
        }
      }
      num = num.replace(/[{|}]/g,"");
      num = num.replace(/\-\+/g,"-");
      num = num.replace(/\+\-/g,"-");
      num = num.replace(/\-\-/g,"+");
      num = num.replace(/\+\+/g,"+");
      num = num.replace(/\^/g,"**");
      vari[index]["formla"] = num;
      var mat = new Function('vari', `return ${num};`);
      let result = mat(vari);
      if(!result){
        result = 0;
      }
      if(result == Infinity){
        ui.notifications.error("sum is infinity! so change 1");
        result = 1;
      }
      vari[index]["sum"] = Number(result);
    }else if(key == 'variable'){
      let num = value;
      if(num.match(/[！-～]/g)){
        ui.notifications.error(game.i18n.localize("ALERTMESSAGE.DoubleByteSymbol"));
      }
      if(num.match(/(　| )/g)){
        ui.notifications.error(game.i18n.localize("ALERTMESSAGE.DoubleByteSpace"));
      }
      num = num.replace(/[！-～]/g, function(s) {
        return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);});
      num = num.replace(/　/g," ");
      num = num.replace(/ /g,"");
      vari[index][key] = num;
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
