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

SATASUPE.rollbuttonType = {
    crime : 'CIRCUMSTANCE.CRIME',
    life  : 'CIRCUMSTANCE.LIFE',
    love : 'CIRCUMSTANCE.LOVE',
    culture :'CIRCUMSTANCE.CULTURE',
    combat : 'CIRCUMSTANCE.COMBAT',
    body : 'APTITUDE.BODY',
    mind : 'APTITUDE.MIND',
    arms : 'COMBAT.ARMS',
    generic : 'SATASUPE.General',
    alignment : 'ATTRIBS.ALIGNMENTS'
}

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
    calm : 'ALIGNMENTS.CALM',
    dither : 'ALIGNMENTS.DITHER',
    desire : 'ALIGNMENTS.DESIRE'
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
    sleep : 'this.actor.data.data.status.sleep.value',
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

SATASUPE.hobby = {
    abnormal:"HOBBY.Abnormal",
    kawaii:"HOBBY.KAWAII",
    outrageous:"HOBBY.OUTRAGEOUS",
    fanatic:"HOBBY.FANATIC",
    otaku:"HOBBY.OTAKU",
    music:"HOBBY.MUSIC",
    trend:"HOBBY.TREND",
    reading:"HOBBY.READING",
    perform:"HOBBY.PERFORM",
    art:"HOBBY.ART",
    cavil:"HOBBY.CAVIL",
    meddling:"HOBBY.MEDDLING",
    housework:"HOBBY.HOUSEWORK",
    swot:"HOBBY.SWOT",
    health:"HOBBY.HEALTH",
    outdoor:"HOBBY.OUTDOOR",
    craft:"HOBBY.CRAFT",
    sport:"HOBBY.SPORT",
    celebrity:"HOBBY.CELEBRITY",
    travel:"HOBBY.TRAVEL",
    nurture:"HOBBY.NURTURE",
    lonely:"HOBBY.LONELY",
    killtime:"HOBBY.KILLTIME",
    creed:"HOBBY.CREED",
    wabisabi:"HOBBY.WABISABI",
    adult:"HOBBY.ADULT",
    eat:"HOBBY.EAT",
    gamble:"HOBBY.GAMBLE",
    gossip:"HOBBY.GOSSIP",
    fashion:"HOBBY.FASHION"
}

SATASUPE.cteghobby = {
    1 :{
        1:"event",
        2:"abnormal",
        3:"kawaii",
        4:"outrageous",
        5:"fanatic",
        6:"otaku"
    },
    2 :{
        1:"music",
        2:"free",
        3:"trend",
        4:"reading",
        5:"perform",
        6:"art"
    },
    3 :{
        1:"cavil",
        2:"meddling",
        3:"free",
        4:"housework",
        5:"swot",
        6:"health"
    },
    4 :{
        1:"outdoor",
        2:"craft",
        3:"sport",
        4:"same",
        5:"celebrity",
        6:"travel"
    },
    5 :{
        1:"nurture",
        2:"lonely",
        3:"killtime",
        4:"creed",
        5:"same",
        6:"wabisabi"
    },
    6 :{
        1:"adult",
        2:"eat",
        3:"gamble",
        4:"gossip",
        5:"fashion",
        6:"accident"
    }
}