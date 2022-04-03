export class SatasupeGiveItem{
    static receiveTrade(tradeData) {
        let d = new Dialog({
            title: game.i18n.localize("SATASUPEMESSAGE.TRADETITLE"),
            content: `<p>`+game.i18n.format('SATASUPEMESSAGE.ACCEPTORNOT',{Actor: tradeData.sendActor.name,Item:tradeData.currentItem.name})+`</p>`,
            buttons: {
                one: {
                    icon: '<i class="fas fa-check"></i>',
                    label: game.i18n.localize("SATASUPE.CONFIRMITEM"),
                    callback: () => this.tradeConfirmed(tradeData)
                },
                two: {
                    icon: '<i class="fas fa-times"></i>',
                    label: game.i18n.localize("SATASUPE.DENYITEM"),
                    callback: () => this.tradeDenied(tradeData)
                }
            },
            default: "",
        });
        d.render(true);
    }

    static denyTrade(tradeData) {
        ui.notifications.notify(game.i18n.format('NOTIFYMESSAFE.REJECTITEM',{Actor: tradeData.sendActor.name}));
    }

    static tradeDenied(tradeData) {
        game.socket.emit('system.satasupe', {
            data: tradeData,
            receiveActorId: tradeData.sendActor.id,
            sendActorId: tradeData.receiveActor.id,
            type: "denied"
        });
    }

    static tradeConfirmed(tradeData){
        this.receiveItem(tradeData);
        this.sendMessageToGM(tradeData);
        game.socket.emit('system.satasupe', {
            data: tradeData,
            receiveActorId: tradeData.sendActor.id,
            sendActorId: tradeData.receiveActor.id,
            type: "accepted"
        });
    }

    static async receiveItem({sendActor,receiveActor,currentItem}){
        const duplicatedItem = duplicate(currentItem);
        duplicatedItem.data.storage = "";
        //if(duplicatedItem.data.props.upkeep) duplicatedItem.data.props.upkeep = false
        //if(duplicatedItem.data.weapon.upkeep) duplicatedItem.data.weapon.upkeep = false
        //if(duplicatedItem.data.vehicle.upkeep) duplicatedItem.data.vehicle.upkeep = false
        receiveActor.createEmbeddedDocuments("Item", [duplicatedItem]);
    }

    static async completeTrade(tradeData) {
        this.giveItem(tradeData);
        ui.notifications.notify(game.i18n.format('NOTIFYMESSAFE.ACCEPTITEM',{Actor: tradeData.sendActor.name}));
    }

    static giveItem({sendActor,receiveActor,currentItem}) {
        let id;
        if(currentItem._id) {id = currentItem._id;}else{id=currentItem.id}
        receiveActor.deleteEmbeddedDocuments("Item", [id]);
    }
    

    static sendMessageToGM(tradeData) {
        let chatMessage = {
            user: game.userId,
            speaker: ChatMessage.getSpeaker(),
            content: game.i18n.format('SATASUPEMESSAGE.ITEMTRADEFGM',{sendActor: tradeData.sendActor.name,receiveActor:tradeData.receiveActor.name,Item:tradeData.currentItem.name}),
            whisper: game.users.contents.filter(u => u.isGM).map(u => u.id)
        };
    
        chatMessage.whisper.push(tradeData.sendActor.id);
    
        ChatMessage.create(chatMessage);
    }

    static async sendMessageToPL(tradeData) {
        let chatMessage = {
            user: game.userId,
            speaker: ChatMessage.getSpeaker(),
            content: game.i18n.format('SATASUPEMESSAGE.ITEMTRADEFGM',{sendActor: tradeData.sendActor.name,receiveActor:tradeData.receiveActor.name,Item:tradeData.currentItem.name}),
            whisper: game.users.contents.filter(u => u.isGM).map(u => u.id).concat(game.users.contents.filter(u => u.character.id == tradeData.sendActor.id).map(u => u.id)).concat(game.users.contents.filter(u => u.character.id == tradeData.receiveActor.id).map(u => u.id))
        };
    
        chatMessage.whisper = Array.from(new Set(chatMessage.whisper));

        ChatMessage.create(chatMessage);
    }
}


