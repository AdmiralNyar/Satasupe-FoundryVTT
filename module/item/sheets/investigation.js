import { TagDialog } from '../../apps/dialog.js';
import { SATASUPE} from '../../config.js';

/**
 * Extend the basic ItemSheet with some very Simple modifications
 * @extends {ItemSheet}
 */
export class SatasupeInvestigationSheet extends ItemSheet {

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["satasupe", "sheet", "investigation"],
      width: 540,
      height: 480,
      tabs: [{navSelector: ".sheet-tabs", contentSelector: ".sheet-body"}],
    });
  }

  get template() {
    const path = 'systems/satasupe/templates/item'
    if( game.user.isGM){
      return `${path}/investigation-gmsheet.html`;
    }else{
      return `${path}/investigation-sheet.html`;
    }
  }

    /** @override */
  getData() {
    const data = super.getData();
    data.data.maxsl = 0;

    data.data.target.forEach(function(tar, ind){
      if(tar.open){
        if(tar.sl > data.data.maxsl){
          data.data.maxsl = Number(tar.sl);
        }
      }
    })

    data.data.dendrogram.forEach(function(tag, index){
      if(tag.sl > data.data.maxsl){
        data.data.maxsl = tag.sl;
      }
    })
    data.data.hobbylist = SATASUPE['hobby'];
    data.data.playlistAllow = game.settings.get("satasupe", "InvestigationMusic");
    data.data.playlist = Array.from(game.playlists);
    return data;
  }

  /** @override */
  async _updateObject(event, formData) {
    if( event.currentTarget){
      if(event.currentTarget.classList){
        if(event.currentTarget.classList.contains('sl-input')){
          const index = Number(event.currentTarget.dataset.slindex);
          this._updatesltag(this.object, event.currentTarget.value, index);
        }
        if(event.currentTarget.classList.contains('targettagselect')){
          const ind = Number(event.currentTarget.dataset.ind);
          const index = Number(event.currentTarget.dataset.index);
          this._updateTargettag(this.object, event.currentTarget.value, ind, index);
        }
        if(event.currentTarget.classList.contains('targetopen')){
          const index = Number(event.currentTarget.dataset.index);
          const open = duplicate(this.item.data.data.target);
          open[index].open = !open[index].open;
          this.item.update({"data.target": open});
        }
        if(event.currentTarget.classList.contains('targetsl')){
          const index = Number(event.currentTarget.dataset.index);
          this._updateTargetsl(this.object, event.currentTarget.value, index);
        }
        if(event.currentTarget.classList.contains('targetinfo')){
          const index = Number(event.currentTarget.dataset.index);
          const inf = duplicate(this.object.data.data.target);
          inf[index].info = event.currentTarget.value;
          console.log(event.currentTarget.value);
          this.object.update({"data.target": inf});
        }
        if(event.currentTarget.classList.contains('playlistselect')){
          const index = Number(event.currentTarget.dataset.index);
          this._updatePlaylist(this.object, event.currentTarget.value, index);
        }
      }
    }
  }

  async _updateTargetsl(object, value, index){
    const tar = duplicate(object.data.data.target);
    tar[index].sl = value;
    await this.item.update({"data.target": tar});
  }

  async _updateTargettag(object, value, ind, index){
    const tag = duplicate(object.data.data.target);
    tag[index].tag[ind]=value;
    await this.item.update({'data.target': tag});
  }

  async _updatePlaylist(object, value, index){
    const play = duplicate(object.data.data.target);
    play[index].playlist = value;
    this.PlaylistDefault();

    await this.item.update({'data.target': play});
  }

  async PlaylistDefault(){
    const alllist = Array.from(game.playlists);
    for(let i=0;i<alllist.length;i++){
      async function def(){
        let play = game.playlists.get(alllist[i].id);
        const pl = duplicate(play);
        pl.permission.default = 3;
        await play.update(pl);
      }
      def();
    }
  }

  async _updatesltag(object, value, index){
    const data = duplicate(object.data.data);
    const tag = data.dendrogram;
    const tar = data.target;
    tag[index].tag = value;
    
    for(let i=0;i<tar.length;i++){
      if(tag[index].sl >= tar[i].sl){
        for(let j=0;j<tar[i].tag.length;j++){
          if(!tar[i].checked){
            if(tar[i].tag[j] == value){
              tar[i].checked = true;
              if(!tar[i].open)tar[i].open = true;
              this._findMessage(tar[i].info, tar[i].playlist);
            }
          }
        }
      }
    }
    await this.item.update({'data': data});
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
    html.find('.tag-add').click( ev =>{
      const index = parseInt(ev.currentTarget.dataset.targetn);
      this._tagadd(ev, index);
    });
    html.find('.tag-remove').click( ev =>{
      const index = ev.currentTarget.dataset.targetn;
      this._tagremove(ev, index);
    });
    html.find('.target-add').click( ev =>{
      ev.preventDefault();
      this._targetadd(ev);
    });
    html.find('.target-remove').click( ev =>{
      this._targetremove(ev);
    });
    // Everything below here is only needed if the sheet is editable
    if (!this.options.editable) return;
  }

  /* -------------------------------------------- */

  static async _findMessageS(content, playlistid){
    if(content != ""){
      ChatMessage.create({speaker: ChatMessage.getSpeaker({alias : "DD"}),content:content});
    }
    if(playlistid){
      await this.playplayS(playlistid);
    }
  }

  async _findMessage(content, playlistid){
    if(content != ""){
      ChatMessage.create({speaker: ChatMessage.getSpeaker({alias : "DD"}),content:content});
    }
    if(playlistid){
      await this.playplay(playlistid);
    }
  }

  static async playplayS(id){
    const playlist = game.playlists.get(id);
    const alllist = Array.from(game.playlists);
    var playingid = [];
    const asyncFunc = function(count) {
      return new Promise(function(resolve, reject){
        if(count == 1){
          for(let i = 0;i<alllist.length;i++){
            if(alllist[i].playing){
              playingid.push(alllist[i].id);
            }            
          }
          for(let j = 0;j<playingid.length;j++){
            let play = game.playlists.get(playingid[j]);
            async function stop(p){
              await p.stopAll();
            }
            stop(play);
          }
          resolve();
        }else if(count == 2){
          playlist.playAll();
          resolve();
        }
      });
    }
    await asyncFunc(1)
      .then(function(response){
        return asyncFunc(2);
      })
      .catch(function(error){
        console.log("error");
      });
  }

  async playplay(id){
    const playlist = game.playlists.get(id);
    const alllist = Array.from(game.playlists);
    var playingid = [];
    const asyncFunc = function(count) {
      return new Promise(function(resolve, reject){
        if(count == 1){
          for(let i = 0;i<alllist.length;i++){
            if(alllist[i].playing){
              playingid.push(alllist[i].id);
            }            
          }
          for(let j = 0;j<playingid.length;j++){
            let play = game.playlists.get(playingid[j]);
            async function stop(p){
                await p.stopAll();
            }
            stop(play);
          }
          resolve();
        }else if(count == 2){
          playlist.playAll();
          resolve();
        }
      });
    }
    await asyncFunc(1)
      .then(function(response){
        return asyncFunc(2);
      })
      .catch(function(error){
        console.log("error");
      });
  }

  async _tagadd(event, index){
    const tagadd = duplicate(this.object.data.data.target);
    tagadd[index].tag.push({});
    await this.object.update({'data.target': tagadd});
  }

  async _targetadd(event){
    const targetadd = duplicate(this.object.data.data.target);
    targetadd.push({
        sl:null,
        tag:[{}],
        open:true,
        info:"",
        checked:false,
        playlist:""
    });
    await this.object.update({'data.target': targetadd});
  }

  async _tagremove(event, index){
    const tagremove = duplicate(this.object.data.data.target);
    tagremove[index].tag.splice((tagremove[index].tag.length - 1), 1);
    if(tagremove[index].tag.length == 0){
      tagremove[index].tag.push({});
    }
    await this.object.update({'data.target': tagremove});
  }

  async _targetremove(event){
    const targetremove = duplicate(this.object.data.data.target);
    targetremove.splice((targetremove.length - 1), 1);
    if(targetremove.length == 0){
      targetremove.push({
        sl:null,
        tag:[{}],
        open:true,
        info:"",
        checked:false,
        playlist:""
      });
    }
    await this.object.update({'data.target': targetremove});
  }

  static async _createBranch(event, object, index, data){
    event.preventDefault();
    const usage = await TagDialog._createBranchdialog();
    let sl = Number(usage.get('sl'));
    var tagzone = [];
    if(usage && (sl != object.data.data.dendrogram[index].sl)){
      const user = game.user;
      const dat = duplicate(object.data.data);
      const tag = dat.dendrogram;
      const parent = tag[index];
      const tar = dat.target;
      tag[index].playerlist.push({
        id : user._id,
        color : user.data.color,
        GM : user.isGM 
      });
      let type = usage.get('type');
      let num = Number(usage.get('number'));
      if(parent.edit){
        tag[index].edit = false;
      }
      if(num > 20){
        num = 20;
        ui.notifications.error(game.i18n.localize("ALERTMESSAGE.LinkNumError"));
      }
      var children = [];
      if(type=="all")num=30;
      for(let j=0 ; j < num ;j++){
        children.push(`${tag.length+j}`);
      }
      if(type == "free"){
        for(let i =0 ; i < num ;i++){
          tag.push({
            key:`${tag.length}`,
            tag:null,
            playerlist:[],
            sl:sl,
            edit:true,
            path:[...parent.path, `${tag.length}`],
            children:children
          });
        }
      }else if(type=="all"){
        for(let [k,v] of Object.entries(SATASUPE['hobby'])){
          tag.push({
            key:`${tag.length}`,
            tag:k,
            playerlist:[],
            sl:sl,
            edit:false,
            path:[...parent.path, `${tag.length}`],
            children:children
          });
        }
        for(let n=0;n<tar.length;n++){
          if(!tar[n].checked){
            if(tar[n].sl <= sl){
              tar[n].checked = true;
              if(tar[n].open == false) tar[n].open = true;
              await this._findMessageS(tar[n].info, tar[n].playlist);
            }
          }
        }
      }else if(type =="randam"){
        var randamtag= [];
        await this.createrandamTag(event, object, num).then(function (result){
          randamtag = result;
        });
        for(let l=0; l < randamtag.length; l++){
          let tagin = randamtag[l];
          let editable = false;
          if(randamtag[l]=="same"){
            const parentindex = parent.path[parent.path.length - 1];
            tagin = tag[parentindex].tag;
          }
          if(randamtag[l]=="free"){
            tagin = null;
            editable = true;
          }
          if(randamtag[l]!="event" && randamtag[l]!="accident"){
            tag.push({
              key:`${tag.length}`,
              tag:tagin,
              playerlist:[],
              sl:sl,
              edit:editable,
              path:[...parent.path, `${tag.length}`],
              children:children
            });
          }else{
            tag.push({});
          }
          for(let n=0;n<tar.length;n++){
            if(tar[n].sl <= sl){
              for(let m=0;m<tar[n].tag.length;m++){
                if(!tar[n].checked){
                  if(tagin == tar[n].tag[m]){
                    tar[n].checked = true;
                    if(!tar[n].open)tar[n].open = true;
                    await this._findMessageS(tar[n].info, tar[n].playlist);
                   }
                }
              }
            }
          }
        }
      }
      await object.update({'data': dat});
      return true;
    }else{
      if(sl == object.data.data.dendrogram[index].sl)ui.notifications.error(game.i18n.localize("ALERTMESSAGE.SameSLError"));
    }
    return true;
  }

  static async _deleteBranch(event, object, index, data){
    event.preventDefault();
    function deleteconfirm(){
      return new Promise((resolve) =>{
        const dlg = new Dialog({
          title: game.i18n.localize("SATASUPE.DeleteBranch"),
          content: game.i18n.localize("SATASUPE.DeleteBranchConfirm"),
          buttons:{
            yes:{
              label: game.i18n.localize("SATASUPE.DeleteBranchYes"),
              callback:() => {return resolve(true);}
            },
            no:{
              label: game.i18n.localize("SATASUPE.DeleteBranchNo"),
              callback:() => {console.log("canceling delete branch");}
            }
          },
          default: 'no',
          close:() => {}
        });
        dlg.render(true);
      });
    }
    deleteconfirm().then(async function (result){
      const tag = duplicate(object.data.data.dendrogram);
      for(let i = 0; i < tag.length; i++){
        var targetindex =[];
        if(Object.keys(tag[i]).length){
          for(let str of object.data.data.dendrogram[index].path){
            if( object.data.data.dendrogram[i].path.includes(str)){
              targetindex.push(str);
            }
          }
        }
        if(targetindex.length == object.data.data.dendrogram[index].path.length){
          tag[i]={};
        }
      }
      if(object.data.data.dendrogram[index].sl == 0){
        let non = true;
        for(let j=0; j< tag.length;j++){
          if(Object.keys(tag[j]).length != 0){
            non = false;
          }
        }
        if(non){
          tag.push({
            key: `${tag.length}`,
            tag: null,
            playerlist:[],
            sl:0,
            edit:true,
            path:[`${tag.length}`],
            children: [`${tag.length}`]
          });
        }
      }
      await object.update({'data.dendrogram': tag});
    });
  }

  static async _createStartTopic(event, object){
    event.preventDefault();
    const tag = duplicate(object.data.data.dendrogram);
    tag.push({
      key: `${tag.length}`,
      tag: null,
      playerlist:[],
      sl:0,
      edit:true,
      path:[`${tag.length}`],
      children: [`${tag.length}`]
    });
    await object.update({'data.dendrogram': tag});
  }

  static tagzone_create(index, data, sl,parentsl){
    let space=18;
    let bord = "3px solid brown";
    if(sl == 0)bord="none";
    let tagzone = ``;
    if(data.data.dendrogram[index].edit){
      if(sl > parentsl){
        tagzone = `<div class="sl${sl}taglistzone taglistzone listindex${index}" data-slindex="${index}" style="text-align:left;position: relative;text-indent: -200px;width:fit-content;width:-moz-fit-content;display:flex">
        <div class="tagzone sl${sl}tagzone tagindex${index}" style="justify-content:flex-start;margin-bottom: 20px;display: flex;width:${200*(sl-parentsl)}px">
        <div class="space" style="border-top: ${bord};width:${200*(sl-parentsl-1)+space}px;height:fit-content;height:-moz-fit-content;text-indent: 0px;padding-left:0px;display: flex;margin-top:12px"></div>
        <select class="sl-input" style="justify-content:flex-start;text-indent: 0px;padding-left:0px;width:121px;display: inline-block" data-slindex="${index}" name="data.dendrogram[${index}].tag" data-dtype="String">
            <option hidden value="">${ game.i18n.localize("SATASUPE.Select")}</option>`;

          for(let [k,v] of Object.entries(SATASUPE['hobby'])){
            if(k == data.data.dendrogram[index].tag){
              tagzone +=`<option value="${k}" selected>${ game.i18n.localize(v)}</option>`
            }else{
              tagzone +=`<option value="${k}">${ game.i18n.localize(v)}</option>`
            }
          }
          tagzone += `</select>`;
          tagzone += `
          <a class="item-control add-branch" style="text-indent: 0px;padding-left:0px;width:20px;display: inline-block" title="${ game.i18n.localize('SATASUPE.AddLink')}" data-slindex="${index}"><i class="fas fa-code-branch"></i></a>
          <a class="item-control tag-delete" style="text-indent: 0px;padding-left:0px;width:20px;display: inline-block" title="${ game.i18n.localize('SATASUPE.Delete')}" data-slindex="${index}"><i class="fas fa-trash"></i></a></div>
          <div class="indexnum${index} tree" style="display: flex;flex-direction:column"></div></div>
          `;

      }else if(sl < parentsl){
        tagzone = `<div class="sl${sl}taglistzone taglistzone listindex${index} reverse" data-slindex="${index}" style="text-align:left;position: relative;text-indent: -200px;left:${-200*(parentsl-sl+1)}px;width:fit-content;width:-moz-fit-content;display:flex">
        <div class="tagzone sl${sl}tagzone tagindex${index}" style="flex-direction:row-reverse;justify-content:flex-start;margin-bottom: 20px;display: flex;width:${200*(parentsl-sl+1)}px">
        <div class="space" style="border-top: ${bord};width:${200*(parentsl-sl+1)+space}px;height:fit-content;height:-moz-fit-content;text-indent: 0px;padding-left:0px;display: flex;margin-top:12px"></div>
        <select class="sl-input" style="justify-content:flex-start;text-indent: 0px;padding-left:0px;width:121px;display: inline-block" data-slindex="${index}" name="data.dendrogram[${index}].tag" data-dtype="String">
            <option hidden value="">${ game.i18n.localize("SATASUPE.Select")}</option>`;

          for(let [k,v] of Object.entries(SATASUPE['hobby'])){
            if(k == data.data.dendrogram[index].tag){
              tagzone +=`<option value="${k}" selected>${ game.i18n.localize(v)}</option>`
            }else{
              tagzone +=`<option value="${k}">${ game.i18n.localize(v)}</option>`
            }
          }
          tagzone += `</select>`;
          tagzone += `
          <a class="item-control add-branch" style="text-indent: 0px;padding-left:0px;width:20px;display: inline-block" title="Next" data-slindex="${index}"><i class="fas fa-code-branch"></i></a>
          <a class="item-control tag-delete" style="text-indent: 0px;padding-left:0px;width:20px;display: inline-block" title="${ game.i18n.localize('SATASUPE.Delete')}" data-slindex="${index}"><i class="fas fa-trash"></i></a></div>
          <div class="indexnum${index} tree" style="display: flex;flex-direction:column"></div></div>
          `;

      }
    }else{
      if(sl > parentsl){
        tagzone = `<div class="sl${sl}taglistzone taglistzone listindex${index}" data-slindex="${index}" style="text-align:left;position: relative;text-indent: -200px;width:fit-content;width:-moz-fit-content;display:flex">
        <div class="tagzone sl${sl}tagzone tagindex${index}" style="justify-content:flex-start;margin-bottom: 20px;display: flex;width:${200*(sl-parentsl)}px">
        <div class="space" style="border-top: ${bord};width:${200*(sl-parentsl-1)+space}px;height:fit-content;height:-moz-fit-content;text-indent: 0px;padding-left:0px;display: flex;margin-top:12px"></div>
        <label style="justify-content:flex-start;text-indent: 0px;padding-left:0px;width:121px;display: flex" data-slindex="${index}" data-dtype="String">`
      
        for(let [k,v] of Object.entries(SATASUPE['hobby'])){
          if(k == data.data.dendrogram[index].tag){
            tagzone +=`${ game.i18n.localize(v)}`
          }
        }
        tagzone +=`</label>`;
        tagzone += `
        <a class="item-control add-branch" style="text-indent: 0px;padding-left:0px;width:20px;display: inline-block" title="Next" data-slindex="${index}"><i class="fas fa-code-branch"></i></a>
        <a class="item-control tag-delete" style="text-indent: 0px;padding-left:0px;width:20px;display: inline-block" title="${ game.i18n.localize('SATASUPE.Delete')}" data-slindex="${index}"><i class="fas fa-trash"></i></a></div>
        <div class="indexnum${index} tree" style="display: flex;flex-direction:column"></div></div>
        `;

      }else if(sl < parentsl){
        tagzone = `<div class="sl${sl}taglistzone taglistzone listindex${index} reverse" data-slindex="${index}" style="text-align:left;position: relative;text-indent: -200px;left:${-200*(parentsl-sl+1)}px;width:fit-content;width:-moz-fit-content;display:flex">
        <div class="tagzone sl${sl}tagzone tagindex${index}" style="flex-direction:row-reverse;justify-content:flex-start;margin-bottom: 20px;display: flex;width:${200*(parentsl-sl+1)}px">
        <div class="space" style="border-top: ${bord};width:${200*(parentsl-sl+1)+space}px;height:fit-content;height:-moz-fit-content;text-indent: 0px;padding-left:0px;display: flex;margin-top:12px"></div>
        <label style="justify-content:flex-start;text-indent: 0px;padding-left:0px;width:121px;display: flex" data-slindex="${index}" data-dtype="String">`
      
        for(let [k,v] of Object.entries(SATASUPE['hobby'])){
          if(k == data.data.dendrogram[index].tag){
            tagzone +=`${ game.i18n.localize(v)}`
          }
        }
        tagzone +=`</label>`;
        tagzone += `
        <a class="item-control add-branch" style="text-indent: 0px;padding-left:0px;width:20px;display: inline-block" title="Next" data-slindex="${index}"><i class="fas fa-code-branch"></i></a>
        <a class="item-control tag-delete" style="text-indent: 0px;padding-left:0px;width:20px;display: inline-block" title="${ game.i18n.localize('SATASUPE.Delete')}" data-slindex="${index}"><i class="fas fa-trash"></i></a></div>
        <div class="indexnum${index} tree" style="display: flex;flex-direction:column"></div></div>
        `;

      }
    }
    return tagzone
  }

  static createrandamTag(event, object, tagnum){
    return new Promise(function(resolve){
      event.preventDefault();
      const speaker = object;
      const user = object.user ? object.user : game.user;
      var text = "TAGT";
      text += Number(tagnum);
      var request = new XMLHttpRequest();
      var param = "command=" + text;
      var server = game.settings.get("satasupe", "BCDice");
      var url = server + "/game_system/Satasupe/roll?" + param;
      var favoriteText ="";
      var randtaglist = [];
      request.open("GET",url,true);
      request.responseType = 'json';
      request.onload = function(){
        if(request.status == 200){
          var data = this.response;
          let rands = data.rands;
          if (data.rands){
              let dicedata = {throws:[{dice:[]}]};
              for(let i = 0; i < rands.length ; i++){
                  let typenum = rands[i].sides;
                  let bcresult = rands[i].value;
                  var addData = {result:bcresult,resultLabel:bcresult,type: `d${typenum}`,vecors:[],options:{}};
                  dicedata.throws[0].dice[i]=addData;
              }
              var dicen = {};
              data.rands.forEach(elm => {
                  if(dicen[elm.sides]){
                      dicen[`${elm.sides}`].number += 1;
                      dicen[`${elm.sides}`].value.push(elm.value);
                  }else{
                      dicen[`${elm.sides}`] = {};
                      dicen[`${elm.sides}`]['number'] = 1;
                      dicen[`${elm.sides}`]['value'] = [elm.value];
                  }
              })
              if( game.modules.get('dice-so-nice')?.active){
                game.dice3d.show(dicedata);
              }
          }else{
              return null;
          }
          var belowtext = "<section class=\"tooltip-part\">";
          for(let [k, v] of Object.entries(dicen)){
              let sumv = v.value.reduce(function(sum,element){return sum+element},0); 
              belowtext += "<div class=\"dice\"><span class=\"part-formula part-header flexrow\">"
              belowtext += `${v.number}d${k}`
              belowtext += "<div class=\"flex1\"></div><span class=\"part-total flex0\">"
              belowtext +=  `${sumv}</span></span><ol class=\"dice-rolls\">`
              for(let dice of v.value){
                  belowtext += `<li class=\"roll die d${k}\">${dice}</li>`
              }
              belowtext += "</ol></div></section>"
          }
          var halftext = data.text.replace(/[！-～]/g, function(s) {
            return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);});
          favoriteText = halftext.replace(/.*?\):/g,"");
          var contenthtml = "<div><div>" + favoriteText + "</div><div class=\"dice-roll\"><div class=\"dice-result\"><div class=\"dice-formula\">" + "FAVORITE TABLE" + "</div><div class=\"dice-tooltip\" style=\"display:none;\">"+ belowtext + "</section></div></div>"; 
          ChatMessage.create({user:user._id,speaker: ChatMessage.getSpeaker({actor : speaker}),content:contenthtml},{});
          for(let l=0;l < (tagnum*2); l++){
              randtaglist.push(SATASUPE[`cteghobby`][`${data.rands[l].value}`][`${data.rands[l+1].value}`]);
              l += 1;
          }
          resolve(randtaglist);
        }
      };
      request.send();

      request.onerror=function(){
        console.log("Server 1 connect error");
        var request2 = new XMLHttpRequest();
      var param2 = "command=" + text;
      var server2 = game.settings.get("satasupe", "BCDice2");
      var url2 = server2 + "/game_system/Satasupe/roll?" + param2;
      request2.open("GET",url2,true);
      request2.responseType = 'json';
      request2.onload = function(){
        if(request2.status == 200){
          var data2 = this.response;
          let rands = data2.rands;
          if (data2.rands){
              let dicedata = {throws:[{dice:[]}]};
              for(let i = 0; i < rands.length ; i++){
                  let typenum = rands[i].sides;
                  let bcresult = rands[i].value;
                  var addData = {result:bcresult,resultLabel:bcresult,type: `d${typenum}`,vecors:[],options:{}};
                  dicedata.throws[0].dice[i]=addData;
              }
              var dicen = {};
              data2.rands.forEach(elm => {
                  if(dicen[elm.sides]){
                      dicen[`${elm.sides}`].number += 1;
                      dicen[`${elm.sides}`].value.push(elm.value);
                  }else{
                      dicen[`${elm.sides}`] = {};
                      dicen[`${elm.sides}`]['number'] = 1;
                      dicen[`${elm.sides}`]['value'] = [elm.value];
                  }
              })
              if( game.modules.get('dice-so-nice')?.active){
                game.dice3d.show(dicedata);
              }
          }else{
              return null;
          }
          var belowtext = "<section class=\"tooltip-part\">";
          for(let [k, v] of Object.entries(dicen)){
              let sumv = v.value.reduce(function(sum,element){return sum+element},0); 
              belowtext += "<div class=\"dice\"><span class=\"part-formula part-header flexrow\">"
              belowtext += `${v.number}d${k}`
              belowtext += "<div class=\"flex1\"></div><span class=\"part-total flex0\">"
              belowtext +=  `${sumv}</span></span><ol class=\"dice-rolls\">`
              for(let dice of v.value){
                  belowtext += `<li class=\"roll die d${k}\">${dice}</li>`
              }
              belowtext += "</ol></div></section>"
          }
          var halftext = data2.text.replace(/[！-～]/g, function(s) {
            return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);});
          var favoriteText = halftext.replace(/.*?\):/g,"")
          var contenthtml = "<div><div>" + favoriteText + "</div><div class=\"dice-roll\"><div class=\"dice-result\"><div class=\"dice-formula\">" + "FAVORITE TABLE" + "</div><div class=\"dice-tooltip\" style=\"display:none;\">"+ belowtext + "</section></div></div>"; 
          ChatMessage.create({user:user._id,speaker: ChatMessage.getSpeaker({actor : speaker}),content:contenthtml},{});
          for(let l=0;l < (tagnum*2); l++){
              randtaglist.push(SATASUPE[`cteghobby`][`${data2.rands[l].value}`][`${data2.rands[l+1].value}`]);
              l += 1;
          }
          resolve(randtaglist);
        }
      };
        request2.send();
      }      
    });
  }
}
