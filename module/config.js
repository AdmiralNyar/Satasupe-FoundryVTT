export const SATASUPE = {};

SATASUPE.circumstance = {
    crime : 'CIRCUMSTANCE.CRIME',
    life  : 'CIRCUMSTANCE.LIFE',
    love : 'CIRCUMSTANCE.LOVE',
    cluture :'CIRCUMSTANCE.CULTURE',
    combat : 'CIRCUMSTANCE.COMBAT'
};

SATASUPE.apitude = {
    body : 'APTITUDE.BODY',
    mind : 'APTITUDE.MIND'
};

SATASUPE.check = {
    crime : 'CIRCUMSTANCE.CRIME',
    life  : 'CIRCUMSTANCE.LIFE',
    love : 'CIRCUMSTANCE.LOVE',
    cluture :'CIRCUMSTANCE.CULTURE',
    combat : 'CIRCUMSTANCE.COMBAT',
    body : 'APTITUDE.BODY',
    mind : 'APTITUDE.MIND'
};

SATASUPE.abilityType = {
    talent : 'SATASUPE.Talent',
    compensation : 'SATASUPE.COMPENSATION',
    heteromorph : 'SATASUPE.HETEROMORPH'
};

SATASUPE.karmaType = {
    basic : 'KARMA.BASIC',
    advanced : 'KARMA.ADVANCED',
    monster : 'KARMA.MONSTER',
    alliance : 'KARMA.ALLIANCE',
    wideuse : 'KARMA.WIDEUSE',
    bad : 'KARMA.BAD',
    team : 'KARMA.TEAM',
    booster : 'KARMA.BOOSTER',
    deadman : 'KARMA.HETEROMORPH',
    newbie : 'KARMA.NEWBIE',
    gamer : 'KARMA.GAMER'
}

SATASUPE.checkType = {
    circumstance : 'SATASUPE.CRICUMSTANCE',
    aptitude : 'SATASUPE.APTITUDE',
    alignment : 'SATASUPE.ALIGNMENT'
};

SATASUPE.alignment = {
    calm : 'ALIGNMENT.CALM',
    dither : 'ALIGNMENT.DITHER',
    desire : 'ALIGNMENT.DESIRE'
}

SATASUPE.target = {
    own :'SATASUPE.Own',
    other:'SATASUPE.Other',
    team:'SATASUPE.Team',
    area:'SATASUPE.Area',
    item:'SATASUPE.Item'
}

SATASUPE.timing = {
    passive:'SATASUPE.Passive',
    planning : 'SATASUPE.Planning',
    support : 'SATASUPE.Support',
    auxiliary : 'SATASUPE.Auxiliary',
    interrupt : 'SATASUPE.Interrupt',
    prologue : 'SATASUPE.Prologue',
    epilogue : 'SATASUPE.Epilogue'
}

SATASUPE.newKarmaName = 'SATASUPE.NewKarmaName';

SATASUPE.newChatpaletteName = 'SATASUPE.NewChatPaletteName';

SATASUPE.newItemName = 'SATASUPE.NewItemName';

SATASUPE.referenceable = {
    crime : 'this.actor.data.data.circumstance.crime.value',
    life  : 'this.actor.data.data.circumstance.life.value',
    love : 'this.actor.data.data.circumstance.love.value',
    cluture :'this.actor.data.data.circumstance.cluture.value',
    combat : 'this.actor.data.data.circumstance.combat.value',
    body : 'this.actor.data.data.aptitude.body.value',
    mind : 'this.actor.data.data.aptitude.mind.value',
    alignment : 'this.actor.data.data.attribs.alignment.value',
    majorWoundsOffset : 'this.actor.data.data.status.majorWoundsOffset.value',
    fumble : 'this.actor.data.data.status.fumble.value',
    arms : 'this.actor.data.data.combat.arms.value',
    damage : 'this.actor.data.data.combat.damage.value',
    drp : 'this.actor.data.data.attribs.drp.value',
    trauma : 'this.actor.data.data.status.trauma.value',
    bp : 'this.actor.data.data.attribs.bp.value',
    mp : 'this.actor.data.data.attribs.mp.value',
    reflex : 'this.actor.data.data.combat.reflex.value',
    wallet : 'this.actor.data.data.attribs.wallet.value',
}

SATASUPE.range = {
    melee : 'SATASUPE.MELEE',
    shot : 'SATASUPE.SHOT'
}

SATASUPE.times ={
    normal : 'SATASUPE.TIME',
    consumable : 'SATASUPE.SONSUMABLE',
    unlimit : 'SATASUPE.UNLIMIT'
}