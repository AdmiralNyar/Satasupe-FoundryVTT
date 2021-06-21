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
        game.socket.emit('module.give-item', {
            data: tradeData,
            receiveActorId: tradeData.sendActor.id,
            sendActorId: tradeData.receiveActor.id,
            type: "denied"
        });
    }

    static tradeConfirmed(tradeData){
        this.receiveItem(tradeData);
        this.sendMessageToGM(tradeData);
        game.socket.emit('module.give-item', {
            data: tradeData,
            receiveActorId: tradeData.sendActor.id,
            sendActorId: tradeData.receiveActor.id,
            type: "accepted"
        });
    }

    static receiveItem({sendActor,receiveActor,currentItem}){
        const duplicatedItem = duplicate(currentItem);
        duplicatedItem.data.storage = "";
        receiveActor.createEmbeddedEntity("Item", duplicatedItem);
    }

    static completeTrade(tradeData) {
        this.giveItem(tradeData);
        ui.notifications.notify(game.i18n.format('NOTIFYMESSAFE.ACCEPTITEM',{Actor: tradeData.sendActor.name}));
    }

    static giveItem({sendActor,receiveActor,currentItem}) {
        receiveActor.deleteOwnedItem(currentItem._id);
    }
    

    static sendMessageToGM(tradeData) {
        let chatMessage = {
            user: game.userId,
            speaker: ChatMessage.getSpeaker(),
            content: game.i18n.format('SATASUPEMESSAGE.ITEMTRADEFGM',{sendActor: tradeData.sendActor.name,receiveActor:tradeData.receiveActor.name,Item:tradeData.currentItem.name}),
            whisper: game.users.entities.filter(u => u.isGM).map(u => u._id)
        };
    
        chatMessage.whisper.push(tradeData.sendActor.id);
    
        ChatMessage.create(chatMessage);
    }
}
