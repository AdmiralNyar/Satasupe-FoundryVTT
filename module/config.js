export const SATASUPE = {};

SATASUPE.circumstance = {
    'crime' : 'CRIME',
    'life'  : 'LIFE',
    'love' : 'LOVE',
    'cluture':'CLUTURE',
    'combat' : 'CIRCUMSTANCE.COMBAT'
};

SATASUPE.apitude = {
    'body' : 'BODY',
    'mind' : 'MIND'
};

SATASUPE.check = {
    crime : 'CRIME',
    life  : 'LIFE',
    love : 'LOVE',
    cluture :'CLUTURE',
    combat : 'CIRCUMSTANCE.COMBAT',
    body : 'BODY',
    mind : 'MIND'
};

SATASUPE.abilityType = {
    talent : 'INOU',
    compensation : 'DAISYO',
    heteromorph : 'HETEROMORPH'
};

SATASUPE.karmaType = {
    basic : 'BASIC KARMA',
    advanced : 'ADVANCED KARMA',
    monster : 'MONSTER KARMA',
    alliance : 'ALLIANCE KARMA',
    wideuse : 'WIDEUSE KARMA',
    bad : 'BAD KARMA',
    team : 'TEAM KARMA',
    booster : 'BOOSTER KARMA',
    deadman : 'HETEROMORPH',
    newbie : 'NEWBIE KARMA'
}

SATASUPE.checkType = {
    circumstance : 'SCORE',
    aptitude : 'APTITUDE',
    alignment : 'ALIGNMENT'
};

SATASUPE.alignment = {
    calm : 'CALM',
    dither : 'DITHER',
    desire : 'DESIRE'
}

SATASUPE.target = {
    own :'OWN',
    other:'OTHER',
    team:'TEAM',
    area:'AREA',
    item:'ITEM'
}

SATASUPE.timing = {
    passive:'PASSIVE EFFECT',
    planning : 'PLANNING EFFECT',
    support : 'SUPPORT EFFECT',
    auxiliary : 'AUXILIARY EFFECT',
    interrupt : 'INTERRUPT EFFECT',
    prologue : 'PROLOGUE EFFECT',
    spilogue : 'EPILOGUE EFFECT'
}

SATASUPE.newKarmaName = 'New Karma';

SATASUPE.newChatpaletteName = 'New Chatpalette';

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