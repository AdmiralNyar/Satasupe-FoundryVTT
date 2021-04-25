export class TagDialog {
    static async _createBranchdialog(){
        const html = await renderTemplate('systems/satasupe/templates/apps/tagadd.html', this);
        return new Promise((resolve) =>{
          let formData = null;
          const dlg = new Dialog({
            title: "TAG ADD",
            content:html,
            buttons:{
              send:{
                label: "Send",
                callback: html => {
                  formData = new FormData(html[0].querySelector('#tag-add-form'));
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
