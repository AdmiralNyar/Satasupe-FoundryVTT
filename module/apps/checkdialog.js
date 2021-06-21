import {SATASUPE} from '../config.js';
export class CheckDialog {
    static async _createCheckdialog(char, value, setting){
        var html = null;
        if(char == "generic"){
            html = await renderTemplate('systems/satasupe/templates/apps/checkgene.html', setting);
        }else if(char == "alignment"){
            html = await renderTemplate('systems/satasupe/templates/apps/checkalign.html', setting);
        }else if(char == "arms"){
            html = await renderTemplate('systems/satasupe/templates/apps/checkarm.html', setting);
        }else{
            html = await renderTemplate('systems/satasupe/templates/apps/check.html', setting);
        }
        
        return new Promise((resolve) =>{
          let formData = null;
          let name = null;
          for(let [key, value] of Object.entries(SATASUPE['rollbuttonType'])){
            if(key == char){
              name = value;
            }
          }
          const dlg = new Dialog({
            title: `${game.i18n.localize(name)} ${game.i18n.localize("SATASUPE.Check")} (${game.i18n.localize('SATASUPE.NOWVALUE')}:${value})`,
            content:html,
            buttons:{
              send:{
                label: game.i18n.localize("SATASUPE.SUBMIT"),
                callback: html => {
                  formData = new FormData(html[0].querySelector('#check-form'));
                  return resolve(formData);
                }
              }
            },
            default: 'send',
            close:() => {return;}
          });
          dlg.render(true);
        });
      }
}
