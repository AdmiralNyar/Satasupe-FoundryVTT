import {SATASUPE} from '../config.js';

export class SatasupeItem extends Item {
    prepareData() {
      super.prepareData();
  
      // Get the Item's data
      const itemData = this.data;
      const data = itemData.data;

      if(itemData.type === 'karma') this._prepareItemData(itemData);
    }

    _prepareItemData(itemData){
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

    async createChatSection( title = null){
      const chat = this.data.data.chatpalette.chat ? duplicate(this.data.data.chatpalette.chat) : [];
      chat.push({
        text : title,
        message : null,
      });
      await this.update( {'data.chatpalette.chat' : chat});
    }

    async createVariableSection(){
      const vari = this.data.data.chatpalette.variable ? duplicate(this.data.data.chatpalette.variable) : [];
      vari.push({
        title : null,
        variable : null,
        substitution: false
      });
      await this.update( {'data.chatpalette.variable' : vari});
    }

    async deleteChatSection( index){
      const chat = duplicate(this.data.data.chatpalette.chat);
      chat.splice(index, 1);
      await this.update( {'data.chatpalette.chat' : chat});
    }

    async deleteVariableSection( index){
      const vari = duplicate(this.data.data.chatpalette.variable);
      vari.splice(index, 1);
      await this.update( {'data.chatpalette.variable' : vari});
    }

    async updateChatSection( index, value, key){
      const chat = duplicate(this.data.data.chatpalette.chat);
      chat[index][key] = value;
      await this.update({'data.chatpalette.chat' : chat});
    }

    async updateVariableSection( index, value, key){
      const vari = duplicate(this.data.data.chatpalette.variable);
      if(key=='substitution'){
        vari[index][key] = !vari[index][key];
      }else{
        vari[index][key] = value;
      }
      await this.update( {'data.chatpalette.variable' : vari});
    }

    async toggleSpecial(specialName, specialtextName, type){
      if(specialName){
        if(specialName=="blast" && type=="weapon"){
          const data = duplicate(this.data.data);
          const specialValue = data.weapon.special.blast.value;
          data.weapon.specialtext.blast = {type:"Boolean",value:!specialValue,number:"",label:"SPEC.BLAST"};
          delete data.weapon.special['blast']
          await this.update({_id:this._id, 'data': data});
        }else{
        let specialValue = this.data.data[type]?.special[specialName]?.value;
        if(!(typeof specialValue === "boolean")) specialValue = specialValue === 'false' ? true : false;
        await this.update( {[`data.${type}.special.${specialName}.value`]: !specialValue});
        }
      }else{
        let specialtextValue = this.data.data[type]?.specialtext[specialtextName]?.value;
        if(!(typeof specialtextValue === "boolean")) specialtextValue = specialtextValue === 'false' ? true : false;
        await this.update( {[`data.${type}.specialtext.${specialtextName}.value`]: !specialtextValue});
      }
    }

    async roll() {
      // Basic template rendering data
      const token = this.actor.token;
      const item = this.data;
      const actorData = this.actor ? this.actor.data.data : {};
      const itemData = item.data;
  
      let roll = new Roll('d20', actorData);
      let label = `Rolling ${item.name}`;
      roll.roll().toMessage({
        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
        flavor: label
      });
    } 
    static getNameWithoutSpec( item){
      if( item instanceof SatasupeItem){
        if( item.data.data?.properties?.special){
          const specNameRegex = new RegExp(item.data.data.specialization, 'ig');
          const filteredName = item.name.replace( specNameRegex, '').trim().replace(/^\(+|\)+$/gm,'');
          return filteredName.length?filteredName:item.name;
        }
      } else {
        if( item.data.properties?.special){
          const specNameRegex = new RegExp(item.data.specialization, 'ig');
          const filteredName =  item.name.replace( specNameRegex, '').trim().replace(/^\(+|\)+$/gm,'');
          return filteredName.length?filteredName:item.name;
        }
      }
      return item.name;
    }
  }
  