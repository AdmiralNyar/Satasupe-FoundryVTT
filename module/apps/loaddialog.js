import {NoKeyDownDialog} from './noKeyDown.js';
export class LoadDialog {
  #onKeyDown = true
  static async _createclipborddialog(textdata){
    const html = await renderTemplate('systems/satasupe/templates/apps/clipload.html', this);
    return new Promise((resolve) =>{
      let formData = null;
      const dlg = new NoKeyDownDialog({
        title: game.i18n.localize("SATASUPE.LOADCLIPBOARD"),
        content:html,
        buttons:{
          send:{
            label: game.i18n.localize("SATASUPE.LOAD"),
            callback: html => {
              formData = new FormData(html[0].querySelector('#clipload-form'));
              return resolve(formData);
            }
          }
        },
        default: '',
        close:() => {return;},
      });
      dlg.render(true);
    });
  }
  static async _createfvttbcdicedialog(data){
    const html = await renderTemplate('systems/satasupe/templates/apps/fvttbcdice.html', data);
    return new Promise((resolve) =>{
      let formData = null;
      const dlg = new NoKeyDownDialog({
        title: game.i18n.localize("SATASUPE.LOADFVTTBCDICE"),
        content:html,
        buttons:{
          send:{
            label: game.i18n.localize("SATASUPE.LOAD"),
            callback: html => {
              formData = new FormData(html[0].querySelector('#fvttbcdice-form'));
              return resolve(formData);
            }
          }
        },
        default: '',
        close:() => {return;}
      });
      dlg.render(true);
    });
  }
}
