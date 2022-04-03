import { SatasupeActorSheet } from "./actor-sheet.js";
import { CheckDialog} from "./apps/checkdialog.js";
import { SATASUPE } from "./config.js";

export class SatasupeChatCard{
    static async renderChatMessageHook(chatMessage, html){

        if(!chatMessage.getFlag('satasupe', 'activate')){
            if(chatMessage.getFlag('satasupe', 'votewhisper')){
                if(game.user.isGM){
                    html.find(`select.vote`).each(function(index, element) {$(element).css('display','inline-block')});
                }else{
                    html.find(`select[data-userid="${game.user.id}"]`).css('display','inline-block');
                    let id = html[0].dataset.messageId;
                    let data = game.settings.get("satasupe", 'vote');
                    let index = data.findIndex((i) => i.id == id);
                    if(index >= 0){
                        for(let i=0;i<data[index].list.length;i++){
                            if(data[index].list[i].userid!=game.user.id){
                                if(data[index].list[i].select){
                                    $(`<label style="margin-left: 5px;">  ${game.i18n.localize("SATASUPE.Selected")}</label>`).insertBefore(html.find(`select[data-userid="${data[index].list[i].userid}"]`));
                                }
                            }
                        }
                    }
                }
            }

            if(chatMessage.getFlag('satasupe', 'toggle')){
                //let ind = data[index].list.findIndex((j) => j.userid ==userid);
                //if(game.user.isGM) await chatMessage.setFlag('satasupe', 'ok', false);
                    html.find(`div.switchArea`).each(async function(index, element) {
                        if(!chatMessage.getFlag('satasupe', 'activate')){
                            let data = await game.settings.get("satasupe", 'chatcardlog');
                            let ind = data.findIndex((i) => i.id == chatMessage.id);
                            let id = $(element)[0].dataset.id;
                            if(data[ind]?.richitemlist){
                                if(data[ind]?.richitemlist[id]?.on === true){
                                    $(element).children('button.switch').removeClass('button-on');
                                }else if(data[ind]?.richitemlist[id]?.on === false){
                                    $(element).children('button.switch').addClass('button-on');
                                }
                            }else if(data[ind]?.upkeep){
                                if(data[ind]?.upkeep[id]?.on === true){
                                    $(element).children('button.switch').removeClass('button-on');
                                }else if(data[ind]?.upkeep[id]?.on === false){
                                    $(element).children('button.switch').addClass('button-on');
                                }
                            }
                        }
                    });
            }

            html.find(`.effect-op`).on('click', await SatasupeChatCard.oceffect.bind(this, true));
            html.find(`.effect-cl`).on('click', await SatasupeChatCard.oceffect.bind(this, false));
            html.find(`a.bcroll`).on('click', await SatasupeChatCard.cardroll.bind(this));
            html.find(`a.bctable`).on('click', await SatasupeChatCard._tablebutton.bind(this));

            html.find('.card-buttons button').click(async (event) => {
                event.preventDefault();
                if(!chatMessage.getFlag('satasupe', 'activate')){
                    let cardid =event.currentTarget.closest('li.chat-message').dataset.messageId;
                    let userid = event.currentTarget.dataset.userid;
                    let buttontype = event.currentTarget.dataset.buttontype;
                    let type = event.currentTarget.dataset.type;
                    let id = event.currentTarget.dataset.id;
                    let actorid = event.currentTarget.dataset.actor;
                    let prisonername = event.currentTarget.dataset.prisoner;
                    let addic = event.currentTarget.dataset.addic;
                    let karma = event.currentTarget.dataset.karma;
                    let button = event.currentTarget.dataset.button;
                    let itemid = event.currentTarget.dataset.itemid;
                    let life = event.currentTarget.dataset.life;
                    let totalupkeep = event.currentTarget.dataset.totalupkeep;
                    let checkresult;
                    let deleteadmit = false;
                    if(buttontype=="check" && type=="addiction"){
                        let actor = game.actors.get(actorid);
                        let def = Number(actor.data.data.addiction[id].value);
                        let addicset = await game.settings.get("satasupe", "addiction")
                        if(addicset) {
                            if(actor.data.data.addiction[id].times > 1) def += (Number(actor.data.data.addiction[id].times) - 1);
                        }
                        checkresult = await SatasupeChatCard._rollbutton(event, actor, "mind", def, cardid);
                    }
                    if(buttontype == "admit" && type=="itemUpkeep"){
                        let data = game.settings.get("satasupe", 'chatcardlog');
                        let index = data.findIndex((i) => i.id == cardid);
                        let deletelist;
                        if(data[index].richitemlist){
                            deletelist = data[index].richitemlist.filter((j) => j.on == true);
                        }else if(data[index].upkeep){
                            deletelist = data[index].upkeep.filter((j) => j.on == true);
                        }
                        let ind = data[index].list.findIndex((j) => j.userid == userid);
                        if(data[index].list[ind].result !="admit"){
                            if(!!deletelist[0]){
                                let mess = await renderTemplate(`systems/satasupe/templates/cards/deleteremind.html`,{deletelist:deletelist})
                                const dlg = new Dialog({
                                    title:game.i18n.localize("SATASUPE.DeleteItem"),
                                    content:mess,
                                    buttons:{
                                        yes:{
                                            label:game.i18n.localize("SATASUPE.Yes"),
                                            icon: '<i class="far fa-check-circle"></i>',
                                            callback: async () => {
                                                deleteadmit = true;
                                                let result2={cardid:cardid,userid:userid,buttontype:buttontype,type:type,id:id,actorid:actorid,prisonername:prisonername,addic:addic,karma:karma,button:button,checkresult:checkresult,itemid:itemid,life:life,totalupkeep:totalupkeep,deleteadmit:deleteadmit}
                                                await game.socket.emit('system.satasupe', {result:result2,type:"selected",data:null,voteT:"button"});
                                                if(game.user.isGM){
                                                    await SatasupeChatCard._onChatCardAction(result2);
                                                }
                                                await SatasupeChatCard._progressupdate();
                                            }
                                        },
                                        no:{
                                            label:game.i18n.localize("SATASUPE.No"),
                                            icon: '<i class="fas fa-times"></i>',
                                            callback: () => {return false}
                                        }
                                    },
                                    default:'no',
                                    close:() =>{console.log("close")}
                                });
                                dlg.render(true);
                            }else{
                                deleteadmit = true;
                                let result2={cardid:cardid,userid:userid,buttontype:buttontype,type:type,id:id,actorid:actorid,prisonername:prisonername,addic:addic,karma:karma,button:button,checkresult:checkresult,itemid:itemid,life:life,totalupkeep:totalupkeep,deleteadmit:deleteadmit}
                                await game.socket.emit('system.satasupe', {result:result2,type:"selected",data:null,voteT:"button"});
                                if(game.user.isGM){
                                    await SatasupeChatCard._onChatCardAction(result2);
                                }
                                await SatasupeChatCard._progressupdate();
                            }
                        }
                    }
                    let result={cardid:cardid,userid:userid,buttontype:buttontype,type:type,id:id,actorid:actorid,prisonername:prisonername,addic:addic,karma:karma,button:button,checkresult:checkresult,itemid:itemid,life:life,totalupkeep:totalupkeep,deleteadmit:deleteadmit}
                    await game.socket.emit('system.satasupe', {result:result,type:"selected",data:null,voteT:"button"});
                    if(game.user.isGM){
                        await SatasupeChatCard._onChatCardAction(result);
                    }
                    await SatasupeChatCard._progressupdate();
                }
            });

            html.find('select.select-switch-mvp').change(async (event) => {
                event.preventDefault();
                if(!chatMessage.getFlag('satasupe', 'activate')){
                    let id =event.currentTarget.closest('li.chat-message').dataset.messageId;
                    let userid = event.currentTarget.dataset.userid;
                    let vote = $(event.currentTarget).val();
                    let result = {id:id,userid:userid,vote:vote}
                    game.socket.emit('system.satasupe', {result:result,type:"selected",data:null,voteT:"mvp"});
                    if(game.user.isGM){
                        SatasupeChatCard._onChatCardSwitchM(result);
                    }
                }
            });

            html.find('select.select-switch-gene').change(async (event) => {
                event.preventDefault();
                if(!chatMessage.getFlag('satasupe', 'activate')){
                    let id =event.currentTarget.closest('li.chat-message').dataset.messageId;
                    let userid = event.currentTarget.dataset.userid;
                    let vote = $(event.currentTarget).val();
                    let result = {id:id,userid:userid,vote:vote}
                    game.socket.emit('system.satasupe', {result:result,type:"selected",data:null,voteT:"gene"});
                    if(game.user.isGM){
                        SatasupeChatCard._onChatCardSwitchG(result);
                    }
                }
            });

            html.find('select.select-switch').change(async (event) => {
                event.preventDefault();
                if(!chatMessage.getFlag('satasupe', 'activate')){
                    let id =event.currentTarget.closest('li.chat-message').dataset.messageId;
                    let userid = event.currentTarget.dataset.userid;
                    const name = event.currentTarget.closest('div.message-content').dataset.name;
                    let karma = $(event.currentTarget).val();
                    let targetid = event.currentTarget.dataset.targetid;
                    let result = {id:id,userid:userid,name:name,karma:karma,targetid:targetid}
                    game.socket.emit('system.satasupe', {result:result,type:"selected",data:null,voteT:"karma"});
                    if(game.user.isGM){
                        await SatasupeChatCard._onChatCardSwitchK(result);
                    }
                }
            });

            html.find('.card-buttons div.switchArea').click(async (event) => {
                event.preventDefault();
                if(!chatMessage.getFlag('satasupe', 'activate')){
                    let cardid =event.currentTarget.closest('li.chat-message').dataset.messageId;
                    let userid = event.currentTarget.dataset.userid;
                    let buttontype = event.currentTarget.dataset.buttontype;
                    let type = event.currentTarget.dataset.type;
                    let id = event.currentTarget.dataset.id;
                    let actorid = event.currentTarget.dataset.actor;
                    let itemid = event.currentTarget.dataset.itemid;
                    let life = event.currentTarget.dataset.life;
                    let totalupkeep = event.currentTarget.dataset.totalupkeep;
                    let checkresult;
                    let result={cardid:cardid,userid:userid,buttontype:buttontype,type:type,id:id,actorid:actorid,checkresult:checkresult,itemid:itemid,life:life,totalupkeep:totalupkeep}
                    let e = await game.socket.emit('system.satasupe', {result:result,type:"selected",data:null,voteT:"button"});
                    if(game.user.isGM){
                        await SatasupeChatCard._onChatCardAction(result);
                    }
                    let message = game.messages.get(cardid);
                    if(game.user.isGM){
                        if(message.getFlag('satasupe', 'toggle')){
                            let data = game.settings.get("satasupe", 'chatcardlog');
                            let ind = data.findIndex((i) => i.id == message.id);
                            let li = $(event.currentTarget.closest('li.chat-message'))
                            li.find(`div.switchArea`).each(async function(index, element) {
                                let id = $(element)[0].dataset.id;
                                if(data[ind]?.richitemlist){
                                    if(data[ind]?.richitemlist[id]?.on === true){
                                        $(element).children('button.switch').removeClass('button-on');
                                    }else if(data[ind]?.richitemlist[id]?.on === false){
                                        $(element).children('button.switch').addClass('button-on');
                                    }
                                }else if(data[ind]?.upkeep){
                                    if(data[ind]?.upkeep[id]?.on === true){
                                        $(element).children('button.switch').removeClass('button-on');
                                    }else if(data[ind]?.upkeep[id]?.on === false){
                                        $(element).children('button.switch').addClass('button-on');
                                    }
                                }
                            });
                        }
                    }else{
                        if(message.getFlag('satasupe', 'toggle')){
                            let data = game.settings.get("satasupe", 'chatcardlog');
                            let ind = data.findIndex((i) => i.id == message.id);
                            let li = $(event.currentTarget.closest('li.chat-message'));

                            li.find(`div.switchArea`).each(async function(index, element) {
                                let idn = $(element)[0].dataset.id;
                                if(data[ind]?.richitemlist){
                                    if(data[ind]?.richitemlist[idn]?.on === true){
                                        $(element).children('button.switch').removeClass('button-on');
                                    }else if(data[ind]?.richitemlist[idn]?.on === false){
                                        $(element).children('button.switch').addClass('button-on');
                                    }
                                    if(id==idn){
                                        setTimeout(async function(){$(element).children('button.switch').toggleClass('button-on');},250);
                                    }
                                }else if(data[ind]?.upkeep){
                                    if(data[ind]?.upkeep[idn]?.on === true){
                                        $(element).children('button.switch').removeClass('button-on');
                                    }else if(data[ind]?.upkeep[idn]?.on === false){
                                        $(element).children('button.switch').addClass('button-on');
                                    }
                                    if(id==idn){
                                        $(element).children('button.switch').toggleClass('button-on');
                                    }
                                }
                            });
                        } 
                    }
                    setTimeout(async function(){
                        if(game.user.isGM) await game.socket.emit("modifyDocument", {action:"update",options:{diff:true,render:true},pack:null,type:"ChatMessage",updates:[{flags:{satasupe:{ok:true}},_id:message.id}]})
                    },450);
                }
            });
        }
    }

    static chatListeners(app, html){
    }

    static async onUpdateChatMessage( chatMessage){
    }

    static async oceffect(option, event){
        event.preventDefault();
        if(option){
            $(event.currentTarget).css("display", "none");
            $(event.currentTarget).parent().next('p').slideToggle('fast');
            $(event.currentTarget).next('a').css("display", "flex");
        }else{
            $(event.currentTarget).css("display", "none");
            $(event.currentTarget).parent().next('p').slideToggle('fast');
            $(event.currentTarget).prev('a').css("display", "flex");
        }
    }

    static async cardroll(event){
        event.preventDefault();
        let actorid = event.currentTarget.dataset.actor;
        let type = event.currentTarget.dataset.type;
        let diff = Number(event.currentTarget.dataset.diff);
        let cardid = event.currentTarget.closest('li.chat-message').dataset.messageId;
        if(actorid){
            const actor = game.actors.get(actorid);
            let result = await SatasupeChatCard._rollbutton(event, actor, type, diff, cardid);
        }
    }

    static async createChatCard(type, text, option){
        var message;
        let playerlist = game.settings.get("satasupe", 'playerlist');
        let target=[];
        if(!playerlist[0]){
            let players = game.users.filter((i) => true == !!i.character);
            playerlist=[];
            for(let i=0;i<players.length;i++){
                playerlist.push({id:players[i].id,key:i,name:players[i].name,check:true})
            }
            await game.settings.set("satasupe", 'playerlist', playerlist);
        }  
        target = playerlist.filter((i) => true == i.check);
        let list = target;
        if(option)list = game.users;
        let progress = game.settings.get("satasupe", "afterplayprogress");
        if(!Object.keys(progress).length){
            let player = game.settings.get("satasupe", "playerlist");
            if(!player[0]){
                let players = game.users.filter((i) => true == !!i.character);
                for(let i=0;i<players.length;i++){
                    player.push({id:players[i].id,key:i,name:players[i].name,check:true})
                }
                await game.settings.set("satasupe", 'playerlist', player); 
            }
            let lis=[];
            for(let j=0;j<player.length;j++){
                lis.push({id:player[j].id,name:player[j].name,cardlist:[]})
            }
            let prog = {addiction:{list:lis},karma:{list:lis},aftertable:{list:lis},discussionK:{list:lis},discussionM:{cardid:null,voteid:null},prisoner:{list:lis},upkeep:{rich:lis,upkeep:lis}}
            await game.settings.set("satasupe", "afterplayprogress", prog);
        }
        for(let i=0;i<list.length;i++){
            const actor = game.users.get(list[i].id).character;
            switch (type){
                case "addiction":
                    if(actor.data.data.addiction){
                        let addiction = actor.data.data.addiction;
                        let progresslist = game.settings.get("satasupe", "afterplayprogress");
                        let progid = progresslist.addiction.list.findIndex((u) => u.id ==list[i].id);
                        progresslist.addiction.list[progid].cardlist = [];
                        for(let j=0;j<addiction.length;j++){
                            let check;
                            if(addiction[j].use && !addiction[j].addic){
                                check = true;
                            }else if(!addiction[j].use && addiction[j].addic){
                                check = false;
                            }
                            if(check === false || check === true){
                                message = await renderTemplate(`systems/satasupe/templates/cards/addictioncheck.html`,{id:j,userid:list[i].id,type:type,addic:addiction[j].title,actor:actor.id,button:check,skip:false,check:false});
                                let chatMessage = {
                                    user: game.user.id,
                                    speaker: ChatMessage.getSpeaker({alias : "System"}),
                                    blind: false,
                                    whisper: [list[i].id],
                                    content: message
                                }
                                let card = await ChatMessage.create(chatMessage);
                                let data = game.settings.get("satasupe", 'chatcardlog');
                                let space = [];
                                for(let o=0;o<list.length;o++){
                                    space.push({userid:list[o].id,select:false,result:null,resulttitle:null,time:null});
                                }
                                const datalength = await data.length;
                                data.push({id:card.id,list:space,type:"addiciton"})
                                progresslist.addiction.list[progid].cardlist.push({cardid:card.id,logid:datalength});
                                await game.settings.set("satasupe", "afterplayprogress", progresslist);
                                await game.settings.set("satasupe", 'chatcardlog', data);
                            }
                        }
                    }
                    let progr = game.settings.get("satasupe", "afterplayprogress");
                    progr.addiction.created = true;
                    await game.settings.set("satasupe", "afterplayprogress", progr);
                    break;
                case "karma":
                    if(actor.data.items?._source){
                        let karmalist = actor.data.items._source.filter((j) => (j.data.timing?.name == "epilogue") && (j.type == "karma"));
                            let progresslist = game.settings.get("satasupe", "afterplayprogress");
                        let progid = progresslist.karma.list.findIndex((u) => u.id ==list[i].id);
                        progresslist.karma.list[progid].cardlist = [];
                        for(let k=0;k<karmalist.length;k++){
                            message = await renderTemplate(`systems/satasupe/templates/cards/karmacheck.html`,{id:k,userid:list[i].id,type:type,karma:karmalist[k].name,actor:actor.id,button:false,skip:false,check:false});
                            let chatMessage = {
                                user: game.user.id,
                                speaker: ChatMessage.getSpeaker({alias : "System"}),
                                blind: false,
                                whisper: [list[i].id],
                                content: message
                            }
                            let card = await ChatMessage.create(chatMessage);
                            let data = game.settings.get("satasupe", 'chatcardlog');
                            let space = [];
                            for(let o=0;o<list.length;o++){
                                space.push({userid:list[o].id,select:false,result:null,resulttitle:null,time:null});
                            }
                            const datalength = await data.length;
                            data.push({id:card.id,list:space,type:"karma"})
                            progresslist.karma.list[progid].cardlist.push({cardid:card.id,logid:datalength});
                            await game.settings.set("satasupe", "afterplayprogress", progresslist);
                            game.settings.set("satasupe", 'chatcardlog',data);
                        }
                    }
                    let progrk = game.settings.get("satasupe", "afterplayprogress");
                    progrk.karma.created = true;
                    await game.settings.set("satasupe", "afterplayprogress", progrk);
                    break;
                case "afterTable":
                    message = await renderTemplate(`systems/satasupe/templates/cards/aftertablecard.html`,{id:0,userid:list[i].id,type:type,actor:actor.id,roll:false});
                    let chatMessage = {
                        user: game.user.id,
                        speaker: ChatMessage.getSpeaker({alias : "System"}),
                        blind: false,
                        whisper: [list[i].id],
                        content: message
                    }
                    let card = await ChatMessage.create(chatMessage);
                    let data = game.settings.get("satasupe", 'chatcardlog');
                    let space = [];
                    for(let o=0;o<list.length;o++){
                        space.push({userid:list[o].id,select:false,result:null,resulttitle:null,time:null});
                    }
                    const datalength = await data.length;
                    data.push({id:card.id,list:space,type:"afterTable"});
                    let progresslist = game.settings.get("satasupe", "afterplayprogress");
                    let progid = progresslist.aftertable.list.findIndex((u) => u.id ==list[i].id);
                    progresslist.aftertable.list[progid].cardlist = [];
                    progresslist.aftertable.list[progid].cardlist.push({cardid:card.id,logid:datalength});
                    progresslist.aftertable.created = true;
                    await game.settings.set("satasupe", "afterplayprogress", progresslist);
                    game.settings.set("satasupe", 'chatcardlog',data);
                    break;
                case "discussionK":
                    break;
                case "discussionMVP":
                    break;
                case "prisoner":
                    if(actor.data.data.prisoner){
                        let progresslist = game.settings.get("satasupe", "afterplayprogress");
                        let progid = progresslist.prisoner.list.findIndex((u) => u.id ==list[i].id);
                        progresslist.prisoner.list[progid].cardlist = [];
                        for(let k=0;k<actor.data.data.prisoner.length;k++){
                            if((actor.data.data.prisoner[k].keep == false) && (!!actor.data.data.prisoner[k].title)){
                                message = await renderTemplate(`systems/satasupe/templates/cards/prisonercheck.html`,{id:k,userid:list[i].id,type:type,prisoner:actor.data.data.prisoner[k].title,prisonercheck:game.i18n.format("SATASUPE.KeepPrisoner",{name:actor.data.data.prisoner[k].title}),actor:actor.id,keep:false,discard:false,skip:false});
                                let chatMessage = {
                                    user: game.user.id,
                                    speaker: ChatMessage.getSpeaker({alias : "System"}),
                                    blind: false,
                                    whisper: [list[i].id],
                                    content: message
                                }
                                let card = await ChatMessage.create(chatMessage);
                                let data = game.settings.get("satasupe", 'chatcardlog');
                                let space = [];
                                for(let o=0;o<list.length;o++){
                                    space.push({userid:list[o].id,select:false,result:null,resulttitle:null,time:null});
                                }
                                const datalength = await data.length;
                                data.push({id:card.id,list:space,type:"prisoner"});
                                progresslist.prisoner.list[progid].cardlist.push({cardid:card.id,logid:datalength});
                                await game.settings.set("satasupe", "afterplayprogress", progresslist);
                                game.settings.set("satasupe", 'chatcardlog',data);
                            }
                        }
                    }
                    let progrp = game.settings.get("satasupe", "afterplayprogress");
                    progrp.prisoner.created = true;
                    await game.settings.set("satasupe", "afterplayprogress", progrp);
                    break;
                case "itemUpkeep":
                    let upkeep = [];
                    if(actor.data.data.status.secondhaven.value) upkeep.push({type:"haven",name:"haven",id:0,upkeepV:2,on:false});
                    let upkeepWlist = actor.data.items._source.filter((j) => (j.data.typew == true));
                    let upkeepVlist = actor.data.items._source.filter((j) => (j.data.typev == true));
                    let upkeepPlist = actor.data.items._source.filter((j) => (j.data.typep == true));
                    let richitemlist = [];
                    for(let n=0;n<upkeepWlist?.length;n++){
                        if(upkeepWlist[n].data.weapon.specialtext.upkeepcost.value == true){
                            if(upkeepWlist[n].data.weapon.specialtext.upkeepcost.number) upkeep.push({type:"weapon",name:upkeepWlist[n].name,id:upkeepWlist[n]._id,upkeepV:upkeepWlist[n].data.weapon.specialtext.upkeepcost.number,on:false});
                        }
                        if((upkeepWlist[n].data.weapon.price.value > actor.data.data.circumstance.life.value)&&(!upkeepWlist[n].data.weapon.upkeep)) richitemlist.push({type:"weapon",name:upkeepWlist[n].name, id:upkeepWlist[n]._id,price:upkeepWlist[n].data.weapon.price.value,on:false});
                    }
                    for(let m=0;m<upkeepVlist?.length;m++){
                        if(upkeepVlist[m].data.vehicle.specialtext.upkeepcost.value == true){
                            if(upkeepVlist[m].data.vehicle.specialtext.upkeepcost.number) upkeep.push({type:"vehicle",name:upkeepVlist[m].name,id:upkeepVlist[m]._id,upkeepV:upkeepVlist[m].data.vehicle.specialtext.upkeepcost.number,on:false});
                        }
                        if((upkeepVlist[m].data.vehicle.price.value > actor.data.data.circumstance.life.value)&&(!upkeepVlist[m].data.vehicle.upkeep)) richitemlist.push({type:"vehicle",name:upkeepVlist[m].name, id:upkeepVlist[m]._id,price:upkeepVlist[m].data.vehicle.price.value,on:false})
                    }
                    for(let o=0;o<upkeepPlist?.length;o++){
                        if(upkeepPlist[o].data.props.specialtext.upkeepcost.value == true){
                            if(upkeepPlist[o].data.props.specialtext.upkeepcost.number) upkeep.push({type:"props",name:upkeepPlist[o].name,id:upkeepPlist[o]._id,upkeepV:upkeepPlist[o].data.props.specialtext.upkeepcost.number,on:false});
                        }
                        if((upkeepPlist[o].data.props.price.value > actor.data.data.circumstance.life.value)&&(!upkeepPlist[o].data.props.upkeep)) richitemlist.push({type:"props",name:upkeepPlist[o].name, id:upkeepPlist[o]._id,price:upkeepPlist[o].data.props.price.value,on:false})
                    }
                    let totalupkeep = 0;
                    for(let p=0;p<upkeep.length;p++){
                        totalupkeep += Number(upkeep[p].upkeepV);
                    }
                    if(richitemlist?.length>0){
                        message = await renderTemplate(`systems/satasupe/templates/cards/richitemcheck.html`,{richitemlist:richitemlist,actorid:actor.id,userid:list[i].id,type:type,admitted:false})
                        let chatMessage ={
                            user: game.user.id,
                            speaker: ChatMessage.getSpeaker({alias : "System"}),
                            blind: false,
                            whisper: [list[i].id],
                            flags:{satasupe:{toggle:true}},
                            content: message   
                        }
                        let card = await ChatMessage.create(chatMessage);
                        let data = game.settings.get("satasupe", 'chatcardlog');
                        let space = [];
                        for(let o=0;o<list.length;o++){
                            space.push({userid:list[o].id,select:false,result:null,resulttitle:null,time:null});
                        }
                        const datalength = await data.length;
                        data.push({id:card.id,list:space,richitemlist:richitemlist});
                        let progresslist = game.settings.get("satasupe", "afterplayprogress");
                        let progid = progresslist.upkeep.rich.findIndex((u) => u.id ==list[i].id);
                        progresslist.upkeep.rich[progid].cardlist = [];
                        progresslist.upkeep.rich[progid].cardlist.push({cardid:card.id,logid:datalength});
                        await game.settings.set("satasupe", "afterplayprogress", progresslist);
                        game.settings.set("satasupe", 'chatcardlog',data);
                    }
                    if(totalupkeep>actor.data.data.circumstance.life.value){
                        message = await renderTemplate(`systems/satasupe/templates/cards/upkeepcheck.html`,{upkeep:upkeep,life:actor.data.data.circumstance.life.value,lifetext:game.i18n.format("SATASUPE.LifeVtext",{life:actor.data.data.circumstance.life.value}),totalupkeep:totalupkeep,totalupkeeptext:game.i18n.format("SATASUPE.TotalUpkeepText",{totalupkeep:totalupkeep}),actorid:actor.id,userid:list[i].id,type:type,admitted:false})
                        let chatMessage ={
                            user: game.user.id,
                            speaker: ChatMessage.getSpeaker({alias : "System"}),
                            blind: false,
                            whisper: [list[i].id],
                            flags:{satasupe:{toggle:true}},
                            content: message   
                        }
                        let card2 = await ChatMessage.create(chatMessage);
                        let data2 = game.settings.get("satasupe", 'chatcardlog');
                        let space2 = [];
                        for(let o=0;o<list.length;o++){
                            space2.push({userid:list[o].id,select:false,result:null,resulttitle:null,time:null});
                        }
                        const datalength2 = await data2.length;
                        data2.push({id:card2.id,list:space2,type:"itemUpkeep",upkeep:upkeep});
                        let progresslist2 = game.settings.get("satasupe", "afterplayprogress");
                        let progid2 = progresslist2.upkeep.upkeep.findIndex((u) => u.id ==list[i].id);
                        progresslist2.upkeep.upkeep[progid2].cardlist = [];
                        progresslist2.upkeep.upkeep[progid2].cardlist.push({cardid:card2.id,logid:datalength2});
                        await game.settings.set("satasupe", "afterplayprogress", progresslist2);
                        game.settings.set("satasupe", 'chatcardlog',data2);
                    }
                    let progru = game.settings.get("satasupe", "afterplayprogress");
                    progru.upkeep.ricreated = true;
                    progru.upkeep.upcreated = true;
                    await game.settings.set("satasupe", "afterplayprogress", progru);
                    break;
                case "vote":
                    break;
            }
        }
        await SatasupeChatCard._progressupdate();
    }

    static async _onChatCardSwitchG(result){
        let id = result.id
        let userid = result.userid;
        let vote = result.vote;
        if(vote){
            const message = game.messages.get(id);
            if(message.data.user == game.user.id){
                let data = game.settings.get("satasupe", 'vote');
                let index = data.findIndex((i) => i.id == id);
                var votedata = data[index].votedata;
                let ind = data[index].list.findIndex((j) => j.userid == userid);
                if(!data[index].list[ind].select){
                    data[index].list[ind].select = true;
                }
                data[index].list[ind].result = vote;
                data[index].list[ind].resulttitle = votedata.choice.find((i) => i.id ==vote).text
                let playerlist = game.settings.get("satasupe", 'playerlist');
                let target=[];
                if(!playerlist[0]){
                    let players = game.users.filter((i) => true == !!i.character);
                    playerlist=[];
                    for(let i=0;i<players.length;i++){
                        playerlist.push({id:players[i].id,key:i,name:players[i].name,check:true})
                    }
                    await game.settings.set("satasupe", 'playerlist', playerlist);
                }  
                target = playerlist.filter((i) => true == i.check);
                let mess = await renderTemplate(`systems/satasupe/templates/cards/genevotecard.html`,{list:target, question:votedata.question,choice:votedata.choice})
                var dom = jQuery.parseHTML(mess)
                var elem = jQuery(dom);
                for(let i=0;i<data[index].list.length;i++){
                    if(data[index].list[i].select){
                        if(data[index].list[i].result){
                            let ta = elem.find(`[data-userid="${data[index].list[i].userid}"]`).find(`option[value="${data[index].list[i].result}"]`)
                            ta.replaceWith(function(){return `<option value="${data[index].list[i].result}" selected="true">`+ $(ta).text() +`</option>`})
                        }
                    }
                }
                var dummy = jQuery('<div>');
                dummy.append(elem.clone(true));
                var dd = dummy.html();
                await game.settings.set("satasupe", 'vote', data);
                await message.update({content:dd});

                let ok=true;
                for(let j=0;j<data[index].list.length;j++){
                    if(!data[index].list[j].select){
                        ok=false;
                    }
                }
                if(ok){
                    const dlg = new Dialog({
                        title:game.i18n.localize("SATASUPE.AllChose"),
                        content:`<p>${game.i18n.localize("SATASUPE.AllChose")}</p>`,
                        buttons:{
                            open:{
                                label:game.i18n.localize("SATASUPE.OpenResult"),
                                callback: async () => {
                                    message.setFlag('satasupe', 'votewhisper', false);
                                    let data = game.settings.get("satasupe", 'vote');
                                    let mess = await renderTemplate(`systems/satasupe/templates/cards/genevotecard.html`,{list:target, question:votedata.question,choice:votedata.choice})
                                    var dom = jQuery.parseHTML(mess);
                                    var elem = jQuery(dom);
                                    for(let i=0;i<data[index].list.length;i++){
                                        if(data[index].list[i].select){
                                            if(data[index].list[i].result){
                                                let ta = elem.find(`[data-userid="${data[index].list[i].userid}"]`)
                                                ta.replaceWith(function(){return `<label>${data[index].list[i].resulttitle}</label>`})
                                            }
                                        }
                                    }
                                    var dummy = jQuery('<div>');
                                    dummy.append(elem.clone(true));
                                    var dd = dummy.html();
                                    await message.update({content:dd});
                                }
                            },
                            cancel:{
                                label:game.i18n.localize("SATASUPE.Cancel"),
                                callback: () => {}
                            },
                        },
                        default:'cancel',
                        close:()=>{console.log("close")}
                    });
                    dlg.render(true);
                }
            }
        }
    }

    static async _onChatCardSwitchM(result){
        let id = result.id
        let userid = result.userid;
        let vote = result.vote;
        if(vote){
            const message = game.messages.get(id);
            if(message.data.user == game.user.id){ //???
                let data = game.settings.get("satasupe", 'vote');
                let index = data.findIndex((i) => i.id == id);
                let ind = data[index].list.findIndex((j) => j.userid == userid);
                if(!data[index].list[ind].select){
                    data[index].list[ind].select = true;
                }
                data[index].list[ind].resulttitle = game.actors.get(vote).name;
                data[index].list[ind].result = vote;
                var charlist=[];
                let playerlist = game.settings.get("satasupe", 'playerlist');
                let target=[];
                if(!playerlist[0]){
                    let players = game.users.filter((i) => true == !!i.character);
                    playerlist=[];
                    for(let i=0;i<players.length;i++){
                        playerlist.push({id:players[i].id,key:i,name:players[i].name,check:true})
                    }
                    await game.settings.set("satasupe", 'playerlist', playerlist);
                }  
                target = playerlist.filter((i) => true == i.check);
                for(let m=0;m<target.length;m++){
                    let ch =game.users.get(target[m].id).character;
                    charlist.push({name:ch.name,id:ch.id});
                }
                let mess = await renderTemplate(`systems/satasupe/templates/cards/mvpvotecard.html`,{list:target,charlist:charlist});
                var dom = jQuery.parseHTML(mess);
                var elem = jQuery(dom);
                for(let i=0;i<data[index].list.length;i++){
                    if(data[index].list[i].select){
                        if(data[index].list[i].result){
                            let ta = elem.find(`[data-userid="${data[index].list[i].userid}"]`).find(`option[value="${data[index].list[i].result}"]`)
                            ta.replaceWith(function(){return `<option value="${data[index].list[i].result}" selected="true">`+ $(ta).text() +`</option>`})
                        }
                    }
                }
                var dummy = jQuery('<div>');
                dummy.append(elem.clone(true));
                var dd = dummy.html();
                await game.settings.set("satasupe", 'vote', data);
                await message.update({content:dd});

                let ok=true;
                for(let j=0;j<data[index].list.length;j++){
                    if(!data[index].list[j].select){
                        ok=false;
                    }
                }
                if(ok){
                    let progresslist = await game.settings.get("satasupe", "afterplayprogress");
                    const dlg = new Dialog({
                        title:game.i18n.localize("SATASUPE.AllChose"),
                        content:`<p>${game.i18n.localize("SATASUPE.AllChose")}</p>`,
                        buttons:{
                            open:{
                                label:game.i18n.localize("SATASUPE.OpenResult"),
                                callback: async () => {
                                    message.setFlag('satasupe', 'votewhisper', false);
                                    let data = game.settings.get("satasupe", 'vote');
                                    let mess = await renderTemplate(`systems/satasupe/templates/cards/mvpvotecard.html`,{list:target});
                                    var dom = jQuery.parseHTML(mess);
                                    var elem = jQuery(dom);
                                    for(let i=0;i<data[index].list.length;i++){
                                        if(data[index].list[i].select){
                                            if(data[index].list[i].result){
                                                let ta = elem.find(`[data-userid="${data[index].list[i].userid}"]`)
                                                ta.replaceWith(function(){return `<label style="width:150px">${data[index].list[i].resulttitle}</label>`})
                                            }
                                        }
                                    }
                                    var dummy = jQuery('<div>');
                                    dummy.append(elem.clone(true));
                                    var dd = dummy.html();
                                    await message.update({content:dd});
                                    progresslist.discussionM.select = true;
                                    await game.settings.set("satasupe", "afterplayprogress", progresslist);
                                    await SatasupeChatCard._progressupdate();
                                }
                            },
                            cancel:{
                                label:game.i18n.localize("SATASUPE.Cancel"),
                                callback: () => {}
                            },
                        },
                        default:'cancel',
                        close:()=>{console.log("close")}
                    });
                    dlg.render(true);
                }
            }
        }
    }

    static async _onChatCardSwitchK(result){
        let id = result.id
        let userid = result.userid;
        const name = result.name;
        let karma = result.karma;
        let targetid = result.targetid;
        let re=false;
        if(karma){
            const message = game.messages.get(id);
            if(message.data.user == game.user.id){
                let data = game.settings.get("satasupe", 'vote');
                let index = data.findIndex((i) => i.id == id);
                let ind = data[index].list.findIndex((j) => j.userid == userid);
                if(!data[index].list[ind].select){
                    data[index].list[ind].select = true;
                }
                data[index].list[ind].result = karma;
                for(let [k,v] of Object.entries(SATASUPE.advancedKarma)){
                    if(k==karma){
                        data[index].list[ind].resulttitle = game.i18n.localize(v);
                    }
                }
                let playerlist = game.settings.get("satasupe", 'playerlist');
                let target=[];
                if(!playerlist[0]){
                    let players = game.users.filter((i) => true == !!i.character);
                    playerlist=[];
                    for(let i=0;i<players.length;i++){
                        playerlist.push({id:players[i].id,key:i,name:players[i].name,check:true})
                    }
                    await game.settings.set("satasupe", 'playerlist', playerlist);
                }  
                target = playerlist.filter((i) => true == i.check);
                let mess = await renderTemplate(`systems/satasupe/templates/cards/karmavotecard.html`,{list:target,name:name,titlename:game.i18n.format("SATASUPE.KarmaSelectTitle",{name:name}),karmalist:SATASUPE.advancedKarma,id:targetid})
                var dom = jQuery.parseHTML(mess)
                var elem = jQuery(dom);
                for(let i=0;i<data[index].list.length;i++){
                    if(data[index].list[i].select){
                        if(data[index].list[i].result){
                            let ta = elem.find(`[data-userid="${data[index].list[i].userid}"]`).find(`option[value="${data[index].list[i].result}"]`)
                            ta.replaceWith(function(){return `<option value="${data[index].list[i].result}" selected="true">`+ $(ta).text() +`</option>`})
                        }
                    }
                }
                var dummy = jQuery('<div>');
                dummy.append(elem.clone(true));
                var dd = dummy.html();
                await game.settings.set("satasupe", 'vote', data);
                await message.update({content:dd});

                let ok=true;
                for(let j=0;j<data[index].list.length;j++){
                    if(!data[index].list[j].select){
                        ok=false;
                    }
                }
                if(ok){
                    let progresslist = await game.settings.get("satasupe", "afterplayprogress");
                    if(!!progresslist[0]){
                        let player = game.settings.get("satasupe", "playerlist");
                        if(!player[0]){
                            let players = game.users.filter((i) => true == !!i.character);
                            for(let i=0;i<players.length;i++){
                                player.push({id:players[i].id,key:i,name:players[i].name,check:true})
                            }
                            await game.settings.set("satasupe", 'playerlist', player); 
                        }
                        let list=[];
                        for(let j=0;j<player.length;j++){
                            list.push({id:player[j].id,name:player[j].name,cardlist:[]})
                        }
                        let progress = {addiction:{list:list},karma:{list:list},aftertable:{list:list},discussionK:{list:list},discussionM:{cardid:null,voteid:null},prisoner:{list:list},upkeep:{rich:list,upkeep:list}}
                        game.settings.set("satasupe", "afterplayprogress", progress);
                        progresslist = progress;
                    }
                    let progid = progresslist.discussionK.list.findIndex((i) => i.id == targetid);
                    const dlg = new Dialog({
                        title:game.i18n.localize("SATASUPE.AllChose"),
                        content:`<p>${game.i18n.localize("SATASUPE.AllChose")}</p>`,
                        buttons:{
                            open:{
                                label:game.i18n.localize("SATASUPE.OpenResult"),
                                callback: async () => {
                                    message.setFlag('satasupe', 'votewhisper', false);
                                    let data = game.settings.get("satasupe", 'vote');
                                    let mess = await renderTemplate(`systems/satasupe/templates/cards/karmavotecard.html`,{list:target,name:name,titlename:game.i18n.format("SATASUPE.KarmaSelectTitle",{name:name}),karmalist:SATASUPE.advancedKarma,id:targetid})
                                    var dom = jQuery.parseHTML(mess);
                                    var elem = jQuery(dom);
                                    for(let i=0;i<data[index].list.length;i++){
                                        if(data[index].list[i].select){
                                            if(data[index].list[i].result){
                                                let ta = elem.find(`[data-userid="${data[index].list[i].userid}"]`)
                                                ta.replaceWith(function(){return `<label>${data[index].list[i].resulttitle}</label>`})
                                            }
                                        }
                                    }
                                    var dummy = jQuery('<div>');
                                    dummy.append(elem.clone(true));
                                    var dd = dummy.html();
                                    await message.update({content:dd});
                                    let cardnum = progresslist.discussionK.list[progid].cardlist.findIndex((i)=>i.cardid ==id);
                                    progresslist.discussionK.list[progid].cardlist[cardnum].select = true;
                                    await game.settings.set("satasupe", "afterplayprogress", progresslist);
                                    await SatasupeChatCard._progressupdate();
                                }
                            },
                            cancel:{
                                label:game.i18n.localize("SATASUPE.Cancel"),
                                callback: () => {}
                            },
                        },
                        default:'cancel',
                        close:()=>{console.log("close")}
                    });
                    dlg.render(true);
                }
            }
        }
        return re;
    }

    static async votecard(votedata){
        let playerlist = game.settings.get("satasupe", 'playerlist');
        let list=[];
        if(!playerlist[0]){
            let players = game.users.filter((i) => true == !!i.character);
            playerlist=[];
            for(let i=0;i<players.length;i++){
                playerlist.push({id:players[i].id,key:i,name:players[i].name,check:true})
            }
            await game.settings.set("satasupe", 'playerlist', playerlist);
        }  
        list = playerlist.filter((i) => true == i.check);
        let message;
        message = await renderTemplate(`systems/satasupe/templates/cards/genevotecard.html`,{list:list,question:votedata.question,choice:votedata.choice})
        let chatMessage = {
            user: game.user.id,
            speaker: ChatMessage.getSpeaker({alias : "System"}),
            blind: false,
            whisper: null,
            flags:{satasupe:{votewhisper:true}},
            content: message
        }
        let card = await ChatMessage.create(chatMessage);
        let data = game.settings.get("satasupe", 'vote');
        let space = [];
        for(let i=0;i<list.length;i++){
            space.push({userid:list[i].id,select:false,result:null,resulttitle:null,time:null});
        }
        data.push({id:card.id,list:space,votedata:votedata});
        game.settings.set("satasupe", 'vote', data);
    }

    static async _voteTarget(event){
        event.preventDefault();
        let id;
        let type = event.currentTarget.dataset.type;
        var actor;
        let playerlist = game.settings.get("satasupe", 'playerlist');
        let list=[];
        if(!playerlist[0]){
            let players = game.users.filter((i) => true == !!i.character);
            playerlist=[];
            for(let i=0;i<players.length;i++){
                playerlist.push({id:players[i].id,key:i,name:players[i].name,check:true})
            }
            await game.settings.set("satasupe", 'playerlist', playerlist);
        }  
        list = playerlist.filter((i) => true == i.check);
        let message;
        if(type=="discussionK"){
            let karmalist = SATASUPE.advancedKarma;
            id = event.currentTarget.dataset.playerid;
            actor = game.users.get(id).character;
            message = await renderTemplate(`systems/satasupe/templates/cards/karmavotecard.html`,{list:list,name:actor.name,titlename:game.i18n.format("SATASUPE.KarmaSelectTitle",{name:actor.name}),id:id,karmalist:karmalist})
        }else if(type=="discussionMVP"){
            var charlist=[];
            for(let m=0;m<list.length;m++){
                let ch =game.users.get(list[m].id).character;
                charlist.push({name:ch.name,id:ch.id});
            }
            message = await renderTemplate(`systems/satasupe/templates/cards/mvpvotecard.html`,{list:list,charlist:charlist})
        }
        let chatMessage = {
            user: game.user.id,
            speaker: ChatMessage.getSpeaker({alias : "System"}),
            blind: false,
            whisper: null,
            flags:{satasupe:{votewhisper:true}},
            content: message
        }
        let card = await ChatMessage.create(chatMessage);
        let data = game.settings.get("satasupe", 'vote');
        let space = [];
        for(let i=0;i<list.length;i++){
            space.push({userid:list[i].id,select:false,result:null,resulttitle:null,time:null});
        }
        const datalength = await data.length;
        data.push({id:card.id,list:space});
        let progresslist = game.settings.get("satasupe", "afterplayprogress");
        if(!!progresslist[0]){
            let player = game.settings.get("satasupe", "playerlist");
            if(!player[0]){
                let players = game.users.filter((i) => true == !!i.character);
                for(let i=0;i<players.length;i++){
                    player.push({id:players[i].id,key:i,name:players[i].name,check:true})
                }
                await game.settings.set("satasupe", 'playerlist', player); 
            }
            let lis=[];
            for(let j=0;j<player.length;j++){
                lis.push({id:player[j].id,name:player[j].name,cardlist:[]})
            }
            let prog = {addiction:{list:lis},karma:{list:lis},aftertable:{list:lis},discussionK:{list:lis},discussionM:{cardid:null,voteid:null},prisoner:{list:lis},upkeep:{rich:lis,upkeep:lis}}
            game.settings.set("satasupe", "afterplayprogress", prog);
            progresslist = prog;
        }
        let progid;
        if(type=="discussionK"){
            progid = progresslist.discussionK.list.findIndex((u) => u.id ==id);
            progresslist.discussionK.list[progid].cardlist = [];
            progresslist.discussionK.list[progid].cardlist.push({cardid:card.id,logid:datalength});
            progresslist.discussionK.created = true;
        }else if(type=="discussionMVP"){
            progresslist.discussionM.voteid = datalength;
            progresslist.discussionM.cardid = card.id;
            if(progresslist.discussionM.select == true) progresslist.discussionM.select = false;
            progresslist.discussionM.created = true;
        }
        await game.settings.set("satasupe", "afterplayprogress", progresslist);
        game.settings.set("satasupe", 'vote', data);
    }

    static async _onChatCardAction(result){
        let cardid = result.cardid;
        let userid = result.userid;
        let buttontype = result.buttontype;
        let type = result.type;
        let id = result.id;
        let actorid = result.actorid;
        let message = game.messages.get(cardid);
        if(message.data.user == game.user.id){
            const actor = game.actors.get(actorid);
            const origindata = game.settings.get("satasupe", 'chatcardlog');
            let data = game.settings.get("satasupe", 'chatcardlog');
            let index = data.findIndex((i) => i.id == cardid);
            let ind = data[index].list.findIndex((j) => j.userid == userid);
            if(!data[index].list[ind].select){
                data[index].list[ind].select = true;
            }
            data[index].list[ind].result = buttontype;
            let progresslist = await game.settings.get("satasupe", "afterplayprogress");
            if(!!progresslist[0]){
                let player = game.settings.get("satasupe", "playerlist");
                if(!player[0]){
                    let players = game.users.filter((i) => true == !!i.character);
                    for(let i=0;i<players.length;i++){
                        player.push({id:players[i].id,key:i,name:players[i].name,check:true})
                    }
                    await game.settings.set("satasupe", 'playerlist', player); 
                }
                let lis=[];
                for(let j=0;j<player.length;j++){
                    lis.push({id:player[j].id,name:player[j].name,cardlist:[]})
                }
                let prog = {addiction:{list:lis},karma:{list:lis},aftertable:{list:lis},discussionK:{list:lis},discussionM:{cardid:null,voteid:null},prisoner:{list:lis},upkeep:{rich:lis,upkeep:lis}}
                game.settings.set("satasupe", "afterplayprogress", prog);
                progresslist = prog;
            }
            let progid = progresslist[type]?.list?.findIndex((i) => i.id == userid);
            if(buttontype == "keep"){
                switch (type){
                    case "prisoner":{
                        let prisonername = result.prisonername;
                        let mess = await renderTemplate(`systems/satasupe/templates/cards/prisonercheck.html`,{id:id,userid:userid,type:type,prisoner:prisonername,prisonercheck:game.i18n.format("SATASUPE.KeepPrisoner",{name:prisonername}),actor:actor.id,keep:true,discard:false,skip:false});
                        if((origindata[index].list[ind].result !="keep")&&(origindata[index].list[ind].result !="discard")){
                            let ad = duplicate(actor.data.data);
                            if(ad.exp.upkeep.value){
                                ad.exp.upkeep.value +=1;
                            }else{
                                ad.exp.upkeep.value =1;
                            }
                            ad.prisoner[id].exp = true;
                            ad.prisoner[id].keep = true;
                            await actor.update({'data' : ad});
                            await message.update({content: mess});
                            await game.settings.set("satasupe", 'chatcardlog', data);
                            let cardnum = progresslist[type].list[progid].cardlist.findIndex((i)=>i.cardid ==cardid);
                            progresslist[type].list[progid].cardlist[cardnum].select = true;
                            await game.settings.set("satasupe", "afterplayprogress", progresslist);
                        }
                        break;
                    }
                }
            }else if(buttontype == "check"){
                switch (type){
                    case "addiction":{
                        let addic = result.addic;
                        let mess = await renderTemplate(`systems/satasupe/templates/cards/addictioncheck.html`,{id:id,userid:userid,type:type,addic:addic,actor:actor.id,button:true,skip:false,check:true});
                        let addiction = actor.data.data.addiction;
                        if(origindata[index].list[ind].result !="check"){
                            if(!addiction[id].addic){
                                if(addiction[id].use){
                                    let ad = duplicate(actor.data.data.addiction);
                                    if(result.checkresult){
                                        if(!result.checkresult.success){
                                            ad[id].addic = true;
                                        }
                                    }
                                    ad[id].use = false;
                                    ad[id].times = 0;
                                    await actor.update({'data.addiction' : ad});
                                    await message.update({content:mess});
                                    await game.settings.set("satasupe", 'chatcardlog', data);
                                    await game.settings.set("satasupe", "afterplayprogress", progresslist);
                                    let cardnum = progresslist[type].list[progid].cardlist.findIndex((i)=>i.cardid ==cardid);
                                    progresslist[type].list[progid].cardlist[cardnum].select = true;
                                    await game.settings.set("satasupe", "afterplayprogress", progresslist);
                                }
                            }
                        }
                        break;
                    }
                    case "karma":{
                        const message = game.messages.get(cardid);
                        let karma = result.karma;
                        let mess = await renderTemplate(`systems/satasupe/templates/cards/karmacheck.html`,{id:id,userid:userid,type:type,karma:karma,actor:actor.id,button:false,skip:false,check:true});
                        await message.update({content:mess});
                        await game.settings.set("satasupe", 'chatcardlog', data);
                        let cardnum = progresslist[type].list[progid].cardlist.findIndex((i)=>i.cardid ==cardid);
                        progresslist[type].list[progid].cardlist[cardnum].select = true;
                        await game.settings.set("satasupe", "afterplayprogress", progresslist);
                        break;
                    }
                }
            }else if(buttontype == "skip"){
                switch (type){
                    case "addiction":{
                        if((origindata[index].list[ind].result !="skip") && (origindata[index].list[ind].result !="admit" && origindata[index].list[ind].result !="check")){
                            let addic = result.addic;
                            let button = false
                            if(result.button =="true") button=true;
                            let mess = await renderTemplate(`systems/satasupe/templates/cards/addictioncheck.html`,{id:id,userid:userid,type:type,addic:addic,actor:actor.id,button:button,skip:true,check:false});
                            await message.update({content:mess});
                            await game.settings.set("satasupe", 'chatcardlog', data);
                            let cardnum = progresslist[type].list[progid].cardlist.findIndex((i)=>i.cardid ==cardid);
                            progresslist[type].list[progid].cardlist[cardnum].select = true;
                            await game.settings.set("satasupe", "afterplayprogress", progresslist);
                        }
                        break;
                    }
                    case "karma":{
                        if((origindata[index].list[ind].result !="skip") && (origindata[index].list[ind].result !="admit")){
                            const message = game.messages.get(cardid);
                            let karma = result.karma;
                            let mess = await renderTemplate(`systems/satasupe/templates/cards/karmacheck.html`,{id:id,userid:userid,type:type,karma:karma,actor:actor.id,button:false,skip:true,check:false});
                            await message.update({content:mess});
                            await game.settings.set("satasupe", 'chatcardlog', data);
                            let cardnum = progresslist[type].list[progid].cardlist.findIndex((i)=>i.cardid ==cardid);
                            progresslist[type].list[progid].cardlist[cardnum].select = true;
                            await game.settings.set("satasupe", "afterplayprogress", progresslist);
                        }
                        break;
                    }
                    case "prisoner":{
                        if((origindata[index].list[ind].result !="skip") && (origindata[index].list[ind].result !="keep" && origindata[index].list[ind].result !="discard")){
                            let prisonername = result.prisonername;
                            let mess = await renderTemplate(`systems/satasupe/templates/cards/prisonercheck.html`,{id:id,userid:userid,type:type,prisoner:prisonername,prisonercheck:game.i18n.format("SATASUPE.KeepPrisoner",{name:prisonername}),actor:actor.id,keep:false,discard:false,skip:true});
                            await message.update({content:mess});
                            await game.settings.set("satasupe", 'chatcardlog', data);
                            let cardnum = progresslist[type].list[progid].cardlist.findIndex((i)=>i.cardid ==cardid);
                            progresslist[type].list[progid].cardlist[cardnum].select = true;
                            await game.settings.set("satasupe", "afterplayprogress", progresslist);
                        }
                        break;
                    }
                }
            }else if(buttontype == "admit"){
                switch (type){
                    case "addiction" : {
                        if(origindata[index].list[ind].result !="admit"){
                            let addic = result.addic;
                            let mess = await renderTemplate(`systems/satasupe/templates/cards/addictioncheck.html`,{id:id,userid:userid,type:type,addic:addic,actor:actor.id,button:false,skip:false,check:true});
                            let use = duplicate(actor.data.data.status);
                            use.trauma.value += 1;
                            await actor.update({'data.status' : use});
                            await message.update({content:mess});
                            await game.settings.set("satasupe", 'chatcardlog', data);
                            let cardnum = progresslist[type].list[progid].cardlist.findIndex((i)=>i.cardid ==cardid);
                            progresslist[type].list[progid].cardlist[cardnum].select = true;
                            await game.settings.set("satasupe", "afterplayprogress", progresslist);
                        }
                        break;
                    }
                    case "karma":{
                        if(origindata[index].list[ind].result !="admit"){
                            let karma = result.karma;
                            let mess = await renderTemplate(`systems/satasupe/templates/cards/karmacheck.html`,{id:id,userid:userid,type:type,karma:karma,actor:actor.id,button:false,skip:false,check:true});
                            await message.update({content:mess});
                            await game.settings.set("satasupe", 'chatcardlog', data);
                            let cardnum = progresslist[type].list[progid].cardlist.findIndex((i)=>i.cardid ==cardid);
                            progresslist[type].list[progid].cardlist[cardnum].select = true;
                            await game.settings.set("satasupe", "afterplayprogress", progresslist);
                        }
                        break;
                    }
                    case "itemUpkeep":{
                        if(result.deleteadmit){
                            if(origindata[index].list[ind].result !="admit"){
                                let deletelist;
                                if(data[index].richitemlist){
                                    deletelist = data[index].richitemlist.filter((j) => j.on == true);
                                }else if(data[index].upkeep){
                                    deletelist = data[index].upkeep.filter((j) => j.on == true);
                                }
                                if(deletelist[0]?.type=="haven"){
                                    let items = duplicate(actor.data.items);
                                    for(let item of items){
                                        if(item.type == "item"){
                                            if(item.data.storage == "haven2"){
                                                item.data.storage = "";
                                            }
                                        }
                                    }
                                    await actor.update({'items': items});
                                    await actor.update({'data.status.secondhaven.value':false});
                                    deletelist.splice(0,1);
                                }
                                for(let n = 0; n<deletelist.length;n++){
                                    await  SatasupeChatCard._deleteItem(deletelist[n].id,actor.id);
                                }
                                let admitmess;
                                if(data[index].richitemlist){
                                    admitmess = await renderTemplate(`systems/satasupe/templates/cards/richitemcheck.html`,{richitemlist:data[index].richitemlist,actorid:actor.id,userid:userid,type:type,admitted:true});
                                    await message.update({content:admitmess});
                                    message.setFlag('satasupe', 'toggle', false);
                                    await game.settings.set("satasupe", 'chatcardlog', data);
                                    let progid = progresslist.upkeep.rich.findIndex((i) => i.id == userid);
                                    let cardnum = progresslist.upkeep.rich[progid].cardlist.findIndex((i)=>i.cardid ==cardid);
                                    progresslist.upkeep.rich[progid].cardlist[cardnum].select = true;
                                    await game.settings.set("satasupe", "afterplayprogress", progresslist);
                                }else if(data[index].upkeep){
                                    admitmess = await renderTemplate(`systems/satasupe/templates/cards/upkeepcheck.html`,{upkeep:data[index].upkeep,life:result.life,lifetext:game.i18n.format("SATASUPE.LifeVtext",{life:result.life}),totalupkeep:result.totalupkeep,totalupkeeptext:game.i18n.format("SATASUPE.TotalUpkeepText",{totalupkeep:result.totalupkeep}),actorid:actor.id,userid:userid,type:type,admitted:true});
                                    await message.update({content:admitmess});
                                    message.setFlag('satasupe', 'toggle', false);
                                    await game.settings.set("satasupe", 'chatcardlog', data);
                                    let progid = progresslist.upkeep.upkeep.findIndex((i) => i.id == userid);
                                    let cardnum = progresslist.upkeep.upkeep[progid].cardlist.findIndex((i)=>i.cardid ==cardid);
                                    progresslist.upkeep.upkeep[progid].cardlist[cardnum].select = true;
                                    await game.settings.set("satasupe", "afterplayprogress", progresslist);
                                }
                            }
                        }
                        break;
                    }
                }
            }else if(buttontype == "roll"){
                switch(type){
                    case "afterTable":{
                        if(origindata[index].list[ind].result !="roll"){
                            let tablelist = Array.from(game.tables);
                            let id;
                            let change=false;
                            const rule = game.settings.get("satasupe", "originaltable");
                            for(let i=0; i < tablelist.length; i++){
                                if(tablelist[i].name == game.i18n.localize("SATASUPE.AFTERT")){
                                    id = tablelist[i].id;
                                    change = true;
                                }
                            }
                            let reData 
                            const table = game.tables.get(id);
                            if(change&&rule){
                                let tableRoll = await table.roll();
                                reData = await table.draw(tableRoll);
                            }else{
                                reData = await SatasupeChatCard._bcdicesend(event, "aftert", 0, actor);
                            }
                            if(!!reData.rands){
                                data[index].list[ind].resulttitle = reData.rands[0].value + reData.rands[1].value;
                                data[index].list[ind].tabletype = "bcdice"
                            }else{
                                data[index].list[ind].resulttitle = reData.roll.total;
                                data[index].list[ind].tabletype = "original";
                                data[index].list[ind].tableid = table.id;
                            }
                            let mess = await renderTemplate(`systems/satasupe/templates/cards/aftertablecard.html`,{id:0,userid:userid,type:type,actor:actor.id,roll:true});
                            await message.update({content:mess});
                            await game.settings.set("satasupe", 'chatcardlog', data);
                            let progid = progresslist.aftertable.list.findIndex((i) => i.id == userid);
                            let cardnum = progresslist.aftertable.list[progid].cardlist.findIndex((i)=>i.cardid ==cardid);
                            progresslist.aftertable.list[progid].cardlist[cardnum].select = true;
                            await game.settings.set("satasupe", "afterplayprogress", progresslist);
                        }
                        break;
                    }
                }
            }else if(buttontype == "discard"){
                switch(type){
                    case "prisoner":{
                        let prisonername = result.prisonername;
                        let mess = await renderTemplate(`systems/satasupe/templates/cards/prisonercheck.html`,{id:id,userid:userid,type:type,prisoner:prisonername,prisonercheck:game.i18n.format("SATASUPE.KeepPrisoner",{name:prisonername}),actor:actor.id,keep:false,discard:true,skip:false});
                        if((origindata[index].list[ind].result !="keep")&&(origindata[index].list[ind].result !="discard")){
                            let ad = duplicate(actor.data.data);
                            ad.prisoner.splice(id,1);
                            await actor.update({'data' : ad});
                            await message.update({content: mess});
                            await game.settings.set("satasupe", 'chatcardlog', data);
                            let cardnum = progresslist[type].list[progid].cardlist.findIndex((i)=>i.cardid ==cardid);
                            progresslist[type].list[progid].cardlist[cardnum].select = true;
                            await game.settings.set("satasupe", "afterplayprogress", progresslist);
                        }
                        break;
                    }
                }
            }else if(buttontype == "toggle"){
                switch(type){
                    case "itemUpkeep":{
                        if(message.getFlag('satasupe', 'toggle')){
                            if(origindata[index].richitemlist){
                                let itemindex = origindata[index].richitemlist.findIndex((l) => l.id == result.itemid);
                                data[index].richitemlist[itemindex].select = true;
                                data[index].richitemlist[itemindex].on = !data[index].richitemlist[itemindex].on;
                            }else if(origindata[index].upkeep){
                                let itemindex = origindata[index].upkeep.findIndex((l) => l.id == result.itemid);
                                data[index].upkeep[itemindex].select = true;
                                data[index].upkeep[itemindex].on = !data[index].upkeep[itemindex].on; 
                            }
                            data[index].list[ind].select = false;
                            await game.settings.set("satasupe", 'chatcardlog', data);
                        }
                        break;
                    }
                }
            }
        }
    }

    static async _progressrender(percent, type, $content){
        let $circular = $content.children(`div.${type}`).children('div.progressbar').children('div').children('div.circular')
        $circular.children('div.number').text(`${percent}%`);
        if(percent<50){
            let deg = ((50 - percent) / 100)*360;
            $circular.children('div.circle').children('div.right').css('transform', 'rotate(180deg)');
            $circular.children('div.circle').children('div.right').children('div.progress').css('animation', 'none');
            $circular.children('div.circle').children('div.right').children('div.progress').css('animation-delay', 'none');
            $circular.children('div.circle').children('div.left').css('transform', 'rotate(-'+ deg +'deg)');
        }else{
            let deg = ((percent - 50) / 100)*360;
            let delay = ((percent - 50) / 100)*8;
            $circular.children('div.circle').children('div.left').css('transform', 'rotate(0deg)');
            $circular.children('div.circle').children('div.right').css('transform', 'rotate('+ deg +'deg)');
            $circular.children('div.circle').children('div.right').children('div.progress').css('animation', 'right 4s linear both');
            $circular.children('div.circle').children('div.right').children('div.progress').css('animation-delay', delay + 's');
        }
        if(percent==100) {
            $circular.parents("div.progressbar").prevAll("i.fa-check-square").css("display","flex");
            $circular.parents("div.progressbar").prevAll("i.fa-square").css("display","none");
        }
    }

    static async _progressupdate(){
        let $appwindow = $(window.document).children('html').children('body').children('div.afterplayListDialog');
        if($appwindow.length > 0){
            $appwindow.each(async function(){
                let progresslist = game.settings.get("satasupe", "afterplayprogress");
                if(!!progresslist[0]){
                    let player = game.settings.get("satasupe", "playerlist");
                    if(!player[0]){
                        let players = game.users.filter((i) => true == !!i.character);
                        for(let i=0;i<players.length;i++){
                            player.push({id:players[i].id,key:i,name:players[i].name,check:true})
                        }
                        await game.settings.set("satasupe", 'playerlist', player); 
                    }
                    let list=[];
                    for(let j=0;j<player.length;j++){
                        list.push({id:player[j].id,name:player[j].name,cardlist:[]})
                    }
                    let progress = {addiction:{list:list},karma:{list:list},aftertable:{list:list},discussionK:{list:list},discussionM:{cardid:null,voteid:null},prisoner:{list:list},upkeep:{rich:list,upkeep:list}}
                    game.settings.set("satasupe", "afterplayprogress", progress);
                    progresslist = progress;
                }
                let $content = $appwindow.children('section').children('div.dialog-content').children('form')
                for(let [key,value] of Object.entries(progresslist)){
                    switch (key){
                        case "addiction":{
                            let selectlist = value.list.filter((i) => i.cardlist.length > 0);
                            let total_n = 0;
                            let total_s = 0;
                            if(selectlist.length>0){
                                for(let j=0;j<selectlist.length;j++){
                                    let cardlist = selectlist[j].cardlist.filter((k)=>k.select == true);
                                    total_s += cardlist.length;
                                    total_n += selectlist[j].cardlist.length;
                                }
                                let percent = Math.round((total_s/total_n)*100);
                                SatasupeChatCard._progressrender(percent, key, $content)
                            }else if(value.created){
                                SatasupeChatCard._progressrender(100, key, $content)
                            }else{
                                SatasupeChatCard._progressrender(0, key, $content)
                            }
                            break;
                        }
                        case "karma":{
                            let selectlist = value.list.filter((i) => i.cardlist.length > 0);
                            let total_n = 0;
                            let total_s = 0;
                            if(selectlist.length>0){
                                for(let j=0;j<selectlist.length;j++){
                                    let cardlist = selectlist[j].cardlist.filter((k)=>k.select == true);
                                    total_s += cardlist.length;
                                    total_n += selectlist[j].cardlist.length;
                                }
                                let percent = Math.round((total_s/total_n)*100);
                                SatasupeChatCard._progressrender(percent, key, $content)
                            }else if(value.created){
                                SatasupeChatCard._progressrender(100, key, $content)
                            }else{
                                SatasupeChatCard._progressrender(0, key, $content)
                            }
                            break;
                        }
                        case "prisoner":{
                            let selectlist = value.list.filter((i) => i.cardlist.length > 0);
                            let total_n = 0;
                            let total_s = 0;
                            if(selectlist.length>0){
                                for(let j=0;j<selectlist.length;j++){
                                    let cardlist = selectlist[j].cardlist.filter((k)=>k.select == true);
                                    total_s += cardlist.length;
                                    total_n += selectlist[j].cardlist.length;
                                }
                                let percent = Math.round((total_s/total_n)*100);
                                SatasupeChatCard._progressrender(percent, key, $content)
                            }else if(value.created){
                                SatasupeChatCard._progressrender(100, key, $content)
                            }else{
                                SatasupeChatCard._progressrender(0, key, $content)
                            }
                            break;
                        }
                        case "aftertable":{
                            let selectlist = value.list.filter((i) => i.cardlist.length > 0);
                            let total_n = 0;
                            let total_s = 0;
                            if(selectlist.length>0){
                                for(let j=0;j<selectlist.length;j++){
                                    let cardlist = selectlist[j].cardlist.filter((k)=>k.select == true);
                                    total_s += cardlist.length;
                                    total_n += selectlist[j].cardlist.length;
                                }
                                let percent = Math.round((total_s/total_n)*100);
                                SatasupeChatCard._progressrender(percent, key, $content)
                            }else if(value.created){
                                SatasupeChatCard._progressrender(100, key, $content)
                            }else{
                                SatasupeChatCard._progressrender(0, key, $content)
                            }
                            break;
                        }
                        case "discussionK":{
                            let selectlist = value.list.filter((i) => i.cardlist.length > 0);
                            let total_n = 0;
                            let total_s = 0;
                            if(selectlist.length>0){
                                for(let j=0;j<selectlist.length;j++){
                                    let cardlist = selectlist[j].cardlist.filter((k)=>k.select == true);
                                    total_s += cardlist.length;
                                    total_n += selectlist[j].cardlist.length;
                                }
                                let percent = Math.round((total_s/total_n)*100);
                                SatasupeChatCard._progressrender(percent, key, $content)
                            }else if(value.created){
                                SatasupeChatCard._progressrender(100, key, $content)
                            }else{
                                SatasupeChatCard._progressrender(0, key, $content)
                            }
                            break;
                        }
                        case "discussionM":{
                            let percent = 0;
                            if(value.select==true) percent=100;
                            SatasupeChatCard._progressrender(percent, key, $content)
                            break;
                        }
                        case "upkeep":{
                            let selectlist = value.rich.filter((i) => i.cardlist.length > 0);
                            let total_n = 0;
                            let total_s = 0;
                            if(selectlist.length>0){
                                for(let j=0;j<selectlist.length;j++){
                                    let cardlist = selectlist[j].cardlist.filter((k)=>k.select == true);
                                    total_s += cardlist.length;
                                    total_n += selectlist[j].cardlist.length;
                                }
                            }
                            let selectlist2 = value.upkeep.filter((i) => i.cardlist.length > 0);
                            let total_n2 = 0;
                            let total_s2 = 0;
                            if(selectlist2.length>0){
                                for(let l=0;l<selectlist2.length;l++){
                                    let cardlist2 = selectlist2[l].cardlist.filter((k)=>k.select == true);
                                    total_s2 += cardlist2.length;
                                    total_n2 += selectlist2[l].cardlist.length;
                                }
                            }
                            let percent = 0;

                            if((total_s+total_s2)>0){ 
                                percent = Math.round(((total_s+total_s2)/(total_n+total_n2))*100);
                                SatasupeChatCard._progressrender(percent, key, $content)
                            }else if(value.ricreated && value.upcreated){
                                SatasupeChatCard._progressrender(100, key, $content)
                            }else{
                                SatasupeChatCard._progressrender(percent, key, $content)
                            }
                            break;
                        }
                    }
                }
            })
        }
    }

    static async _deleteItem(itemid,actorid){
        const actor = game.actors.get(actorid);
        /*let newkeep = actor.data.data.exp.upkeep.value == null ? 0 : actor.data.data.exp.upkeep.value;
        let item = actor.data.items.find((i) => i.id == itemid);
        if(item.data.typew){
            if(item.data.weapon.upkeep) newkeep = newkeep - 1;
        }
        if(item.data.typev){
            if(item.data.vehicle.upkeep) newkeep = newkeep - 1;
        }
        if(item.data.typep){
            if(item.data.props.upkeep) newkeep = newkeep - 1;
        }
        await actor.update({'data.exp.upkeep.value' : newkeep});*/
        await actor.deleteEmbeddedDocuments("Item", [itemid]);
    }

    static async _tablebutton(event){
        event.preventDefault();
        let actorid = event.currentTarget.dataset.actor;
        const actor = game.actors.get(actorid)
        let cardid = event.currentTarget.closest('li.chat-message').dataset.messageId;
        const tname = event.currentTarget.dataset.tname;
        var id = "";
        let change = false;
        const rule = game.settings.get("satasupe", "originaltable");
        if(tname!="origin"){
          let tablelist = Array.from(game.tables);
          for(let i=0; i < tablelist.length; i++){
            if(tablelist[i].name == event.currentTarget.value){
              id = tablelist[i]._id;
              change = true;
            }
          }
        }
        if(tname=="origin"){
          id = event.currentTarget.name;
          const table = game.tables.get(id);
          event.currentTarget.disabled = true;
          let tableRoll = await table.roll();
          await table.draw(tableRoll);
          event.currentTarget.disabled = false;
        }else if(change && rule){
          const table = game.tables.get(id);
          event.currentTarget.disabled = true;
          let tableRoll = await table.roll();
          await table.draw(tableRoll);
          event.currentTarget.disabled = false;
        }else{
            await SatasupeChatCard._bcdicesend(event, tname, 0, actor);
        }
        return true;
      }

    static async _rollbutton(event, actorData, option, def, cardid){
        if(!game.messages.get(cardid).getFlag('satasupe', 'activate')){
            const char = option;
            const actor = actorData.data;
            const copy = duplicate(actorData.data.data);
            let setting = {nobpwound:false,nompwound:false,nooverwork:false,killstop:false,nompcost:true,defdifficult:def};
            if(actor.data.settings){
            setting = actor.data.settings;
            setting.defdifficult = def;
            }
        
            let value = "";
            if(char == "crime"){
            value = actor.data.circumstance.crime.value;
            }else if(char == "life"){
            value = actor.data.circumstance.life.value;
            }else if(char == "love"){
            value = actor.data.circumstance.love.value;
            }else if(char == "culture"){
            value = actor.data.circumstance.cluture.value;
            }else if(char == "combat"){
            value = actor.data.circumstance.combat.value;
            }else if(char == "body"){
            value = actor.data.aptitude.body.value;
            }else if(char == "mind"){
            value = actor.data.aptitude.mind.value;
            }else if(char == "arms"){
            value = actor.data.combat.arms.value;
            }else if(char == "generic"){
            value = 0;
            }else if(char == "alignment"){
            value = actor.data.attribs.alignment.value;
            }
            const indata = await CheckDialog._createCheckdialog(char, value, setting);
            const fumble = actor.data.status.fumble.value;
            var bpwounds = 0;
            var mpwounds = 0;
            var overwork = 0;
            if(Number(indata.get('overwork')) == 1){
            overwork = 0;
            copy.settings.nooverwork = true;
            }else{
            overwork = Number(actor.data.status.sleep.value);
            copy.settings.nooverwork = false;
            }
            if(Number(indata.get('bpwound')) == 1){
            bpwounds = 0;
            copy.settings.nobpwound = true;
            }else if(actor.data.attribs.bp.value <= 5){
            bpwounds = 1;
            copy.settings.nobpwound = false;
            }else{
            bpwounds = 0;
            copy.settings.nobpwound = false;
            }
            if(Number(indata.get('mpwound')) == 1){
            bpwounds = 0;
            copy.settings.nompwound = true;
            }else if(actor.data.attribs.mp.value <= 5){
            bpwounds = 1;
            copy.settings.nompwound = false;
            }else{
            bpwounds = 0;
            copy.settings.nompwound = false;
            }
            var text = ""
            var kill = "";
            if(Number(indata.get('kill'))!=0){
            kill = Number(indata.get('kill'));
            }
            if(Number(indata.get('killstop')) == 1){
            copy.settings.killstop = true;
            }else{
            copy.settings.killstop = false;
            }
        
            if(Number(indata.get('cost')) != 1){
            copy.settings.nompcost = false;
            copy.attribs.mp.value -= Number(indata.get('boost'));
            await actorData.update({'data' : copy});
            }else{
            copy.settings.nompcost = true;
            await actorData.update({'data' : copy});
            }
        
            if(char == "generic"){
            if((Number(indata.get('killstop'))==1)&&(kill != "")){
                text = `${value+Number(indata.get('roll'))+Number(indata.get('boost'))-bpwounds-mpwounds-overwork}R>=${Number(indata.get('difficulty'))}[${Number(indata.get('success'))},${Number(indata.get('fumble'))+fumble},${kill}S]`;
            }else if(kill != ""){
                text = `${value+Number(indata.get('roll'))+Number(indata.get('boost'))-bpwounds-mpwounds-overwork}R>=${Number(indata.get('difficulty'))}[${Number(indata.get('success'))},${Number(indata.get('fumble'))+fumble},${kill}]`;
            }else{
                text = `${value+Number(indata.get('roll'))+Number(indata.get('boost'))-bpwounds-mpwounds-overwork}R>=${Number(indata.get('difficulty'))}[${Number(indata.get('success'))},${Number(indata.get('fumble'))+fumble}]`;
            }
        
            }else if(char == "alignment"){
            if(Number(indata.get('roll'))>0){
                text = `SR${value}+${Number(indata.get('roll'))}`
            }else if(Number(indata.get('roll'))<0){
                text = `SR${value}${Number(indata.get('roll'))}`
            }else{
                text = `SR${value}`
            }
            }else if(char == "arms"){
            if((Number(indata.get('killstop'))==1)&&(kill != "")){
                text = `${value+Number(indata.get('roll'))+Number(indata.get('boost'))-bpwounds-mpwounds-overwork}R>=${Number(indata.get('difficulty'))}[${Number(indata.get('success'))},${Number(indata.get('fumble'))+fumble},${kill}S]`;
            }else if(kill != ""){
                text = `${value+Number(indata.get('roll'))+Number(indata.get('boost'))-bpwounds-mpwounds-overwork}R>=${Number(indata.get('difficulty'))}[${Number(indata.get('success'))},${Number(indata.get('fumble'))+fumble},${kill}]`;
            }else{
                text = `${value+Number(indata.get('roll'))+Number(indata.get('boost'))-bpwounds-mpwounds-overwork}R>=${Number(indata.get('difficulty'))}[${Number(indata.get('success'))},${Number(indata.get('fumble'))+fumble}]`;
            }
            }else{
            text = `${value+Number(indata.get('roll'))+Number(indata.get('boost'))-bpwounds-mpwounds-overwork}R>=${Number(indata.get('difficulty'))}[${Number(indata.get('success'))},${Number(indata.get('fumble'))+fumble}]`;
            }
            let result = await SatasupeChatCard._bcdicesend(event, text, char, actorData);
            return result;
        }
      }

      static async _bcdicesend(event, text, char, actorData){
        event.preventDefault();
        const actor = duplicate(actorData.data);
        const speaker = actorData;
        const user = actorData.user ? actorData.user : game.user;
        const asyncFunc = function(){
          return new Promise(function(resolve, reject){
            var request = new XMLHttpRequest();
            var param = "command=" + text;
            var server = game.settings.get("satasupe", "BCDice");
            var url = server + "/game_system/Satasupe/roll?" + param;
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
                var text_line = data.text.replace(/\r?\n/g,"<br>");
                var contenthtml = "<div><div style=\"word-break : break-all;\">" + text_line + "</div><div class=\"dice-roll\"><div class=\"dice-result\"><div class=\"dice-formula\">" + text + "</div><div class=\"dice-tooltip\" style=\"display:none;\">"+ belowtext + "</section></div></div>"; 
                ChatMessage.create({user:user.id,speaker: ChatMessage.getSpeaker({actor : speaker}),content:contenthtml},{});
                if(char = "alignment"){
                  if((data.rands[0].value == 6) && (data.rands[1].value == 6)){
                    actor.data.attribs.alignment.value -= 1;
                    actorData.update({'data': actor.data});
                  }else if((data.rands[0].value == 1) && (data.rands[1].value == 1)){
                    actor.data.attribs.alignment.value += 1;
                    actorData.update({'data': actor.data});
                  }
                }
                resolve(data);
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
                var text_line = data2.text.replace(/\r?\n/g,"<br>");
                var contenthtml = "<div><div style=\"word-break : break-all;\">" + text_line + "</div><div class=\"dice-roll\"><div class=\"dice-result\"><div class=\"dice-formula\">" + text + "</div><div class=\"dice-tooltip\" style=\"display:none;\">"+ belowtext + "</section></div></div>"; 
                ChatMessage.create({user:user.id,speaker: ChatMessage.getSpeaker({actor : speaker}),content:contenthtml},{});
                if(char = "alignment"){
                  if((data2.rands[0].value == 6) && (data2.rands[1].value == 6)){
                    actor.data.attribs.alignment.value -= 1;
                    actorData.update({'data': actor.data});
                  }else if((data2.rands[0].value == 1) && (data2.rands[1].value == 1)){
                    actor.data.attribs.alignment.value += 1;
                    actorData.update({'data': actor.data});
                  }
                }
                resoleve(data2);
              }
            };
              request2.onerror=function(){
                reject(false);
              }
              request2.send();
            };
          })
        }
        let reData = await asyncFunc()
        return reData;
      }
}