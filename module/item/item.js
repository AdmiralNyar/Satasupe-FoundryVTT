import { SATASUPE } from '../config.js';

export class SatasupeItem extends Item {
  prepareData() {
    super.prepareData();
    // Get the Item's data
    const itemData = this;
    const data = itemData.system;
    if (itemData.type === 'karma') this._prepareItemData(itemData);
  }

  _prepareItemData(itemData) {
    const data = itemData.system;
    for (let [key, value] of Object.entries(SATASUPE['timing'])) {
      if (key == data.timing.name) {
        data.timing.label = value;
      }
    }
    for (let [key, value] of Object.entries(SATASUPE['target'])) {
      if (key == data.target.name) {
        data.target.label = value;
      }
    }
    for (let [key, value] of Object.entries(SATASUPE['karmaType'])) {
      if (key == data.type.name) {
        data.type.label = value;
      }
    }
    for (let [key, value] of Object.entries(SATASUPE['abilityType'])) {
      if (key == data.abilityType.name) {
        data.abilityType.label = value;
      }
    }
    if (data.check.none) { } else {
      if (data.check.type) {
        for (let [key, value] of Object.entries(SATASUPE['alignment'])) {
          if (key == data.check.alignment.name) {
            data.check.alignment.label = value;
          }
        }
      } else {
        for (let [key, value] of Object.entries(SATASUPE['check'])) {
          if (key == data.check.checkValue.name) {
            data.check.checkValue.label = value;
          }
        }
      }
    }
  }

  async createChatSection(title = null) {
    const chat = this.system.chatpalette.chat ? duplicate(this.system.chatpalette.chat) : [];
    chat.push({
      text: title,
      message: null,
    });
    await this.update({ 'system.chatpalette.chat': chat });
  }

  async createVariableItemSection() {
    const vari = this.system.chatpalette.variable ? duplicate(this.system.chatpalette.variable) : [];
    vari.push({
      title: null,
      variable: null,
      substitution: false
    });
    await this.update({ 'system.chatpalette.variable': vari });
  }

  async deleteChatSection(index) {
    const chat = duplicate(this.system.chatpalette.chat);
    chat.splice(index, 1);
    await this.update({ 'system.chatpalette.chat': chat });
  }

  async deleteVariableItemSection(index) {
    const vari = duplicate(this.system.chatpalette.variable);
    vari.splice(index, 1);
    await this.update({ 'system.chatpalette.variable': vari });
  }

  async updateChatSection(index, value, key) {
    const chat = duplicate(this.system.chatpalette.chat);
    chat[index][key] = value;
    await this.update({ 'system.chatpalette.chat': chat });
  }

  async updateVariableItemSection(index, value, key) {
    const vari = duplicate(this.system.chatpalette.variable);
    if (key == 'substitution') {
      vari[index][key] = !vari[index][key];
    } else if (key == 'title') {
      let num = value;
      num = num.replace(/[！-～]/g, function (s) {
        return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);
      });
      num = num.replace(/(　| )/g, "");
      let mathsign = num.match(/[!-'|,|.|:-@|\[-\]|_-`|\||~]/g);
      for (let l = 0; l < mathsign?.length; l++) {
        ui.notifications.error(`${mathsign[l]} can't use! It is replaced by "".`);
      }
      num = num.replace(/[!-'|,|.|:-@|\[-\]|_-`|\||~]/g, "");
      vari[index][key] = num;
      let repal = num.match(/(?<=\{).*?(?=\})/g);
      const re = /\{.*?\}/;
      let ok = false;
      if (repal) {
        for (let i = 0; i < repal.length; i++) {
          for (let j = 0; j < this.system.chatpalette.variable?.length; j++) {
            if ((this.system.chatpalette.variable[j].variable == repal[i]) && this.system.chatpalette.variable[j].substitution) {
              if (this.system.chatpalette.variable[j]?.sum) {
                num = num.replace(re, `Number(vari[${j}].sum)`);
              } else {
                num = num.replace(re, `Number(vari[${j}].title)`);
              }
              ok = true;
              break;
            }
          }
          if (!ok) {
            num = num.replace(re, '0');
            ui.notifications.error(game.i18n.localize("ALERTMESSAGE.ReplaceUnread"));
          }
          ok = false;
        }
      }
      num = num.replace(/[{|}]/g, "");
      num = num.replace(/\-\+/g, "-");
      num = num.replace(/\+\-/g, "-");
      num = num.replace(/\-\-/g, "+");
      num = num.replace(/\+\+/g, "+");
      num = num.replace(/\^/g, "**");
      vari[index]["formla"] = num;
      var mat = new Function('vari', `return ${num};`);
      let result = mat(vari);
      if (!result) {
        result = 0;
      }
      if (result == Infinity) {
        ui.notifications.error("sum is infinity! so change 1");
        result = 1;
      }
      vari[index]["sum"] = Number(result);
    } else if (key == 'variable') {
      let num = value;
      if (num.match(/[！-～]/g)) {
        ui.notifications.error(game.i18n.localize("ALERTMESSAGE.DoubleByteSymbol"));
      }
      if (num.match(/(　| )/g)) {
        ui.notifications.error(game.i18n.localize("ALERTMESSAGE.DoubleByteSpace"));
      }
      num = num.replace(/[！-～]/g, function (s) {
        return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);
      });
      num = num.replace(/　/g, " ");
      num = num.replace(/ /g, "");
      vari[index][key] = num;
    } else {
      vari[index][key] = value;
    }
    await this.update({ 'system.chatpalette.variable': vari });
  }

  async toggleSpecial(specialName, specialtextName, type) {
    if (specialName) {
      if (specialName == "blast" && type == "weapon") {
        const data = duplicate(this.system);
        const specialValue = data.weapon.special.blast.value;
        data.weapon.specialtext.blast = { type: "Boolean", value: !specialValue, number: "", label: "SPEC.BLAST" };
        delete data.weapon.special['blast']
        await this.update({ id: this.id, 'system': data });
      } else {
        let specialValue = this.system[type]?.special[specialName]?.value;
        if (!(typeof specialValue === "boolean")) specialValue = specialValue === 'false' ? true : false;
        await this.update({ [`system.${type}.special.${specialName}.value`]: !specialValue });
      }
    } else {
      let specialtextValue = this.system[type]?.specialtext[specialtextName]?.value;
      if (!(typeof specialtextValue === "boolean")) specialtextValue = specialtextValue === 'false' ? true : false;
      await this.update({ [`system.${type}.specialtext.${specialtextName}.value`]: !specialtextValue });
    }
  }

  async roll() {
    // Basic template rendering data
    const token = this.actor.token;
    const item = this.data;
    const actorData = this.actor ? this.actor.system : {};
    const itemData = item.system;

    let roll = new Roll('d20', actorData);
    let label = `Rolling ${item.name}`;
    roll._evaluateSync().toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      flavor: label
    });
  }

  static getNameWithoutSpec(item) {
    if (item instanceof SatasupeItem) {
      if (item.system?.properties?.special) {
        const specNameRegex = new RegExp(item.system.specialization, 'ig');
        const filteredName = item.name.replace(specNameRegex, '').trim().replace(/^\(+|\)+$/gm, '');
        return filteredName.length ? filteredName : item.name;
      }
    } else {
      if (item.system.properties?.special) {
        const specNameRegex = new RegExp(item.system.specialization, 'ig');
        const filteredName = item.name.replace(specNameRegex, '').trim().replace(/^\(+|\)+$/gm, '');
        return filteredName.length ? filteredName : item.name;
      }
    }
    return item.name;
  }
}
