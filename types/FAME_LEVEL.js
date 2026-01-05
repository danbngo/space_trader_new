class FameLevel {
    constructor(name = '', minReputation = 0, color = COLORS.White) {
        /** @type {string} */
        this.name = name;
        /** @type {number} */
        this.minReputation = minReputation;
        /** @type {number[]} */
        this.color = color;
    }

    static hasFameLevel(officer, planet = new Planet(), fameLevel = FAME_LEVELS.UNKNOWN) {
        return officer.reputation.getAmount(planet) >= fameLevel.minReputation;
    }
    static hasInfamyLevel(officer, planet = new Planet(),  infamyLevel = INFAMY_LEVELS.UNKNOWN) {
        return officer.reputation.getAmount(planet) <= -infamyLevel.minReputation;
    }
    static hasFameOrInfamyLevel(officer, planet = new Planet(), fameOrInfamyLevel = FAME_LEVELS.UNKNOWN) {
        return Math.abs(officer.reputation.getAmount(planet)) >= fameOrInfamyLevel.minReputation;
    }
}

const FAME_LEVELS = {
    UNKNOWN: new FameLevel('Unknown', 0, COLORS.LightGray),
    LIKED: new FameLevel('Liked', 5, COLORS.LightGreen),
    REPUTABLE: new FameLevel('Reputable', 25, COLORS.YellowGreen),
    ADMIRED: new FameLevel('Admired', 100, COLORS.YellowGreen),
    RENOWNED: new FameLevel('Renowned', 250, COLORS.Green),
    LOVED: new FameLevel('Loved', 1000, COLORS.Yellow),
    LEGENDARY: new FameLevel('Legendary', 2500, COLORS.Gold),
}

const INFAMY_LEVELS = {
    UNKNOWN: new FameLevel('Unknown', 0, COLORS.LightGray),
    DISLIKED: new FameLevel('Disliked', 5, COLORS.Orange),
    DISREPUTABLE: new FameLevel('Disreputable', 25, COLORS.OrangeRed),
    LOATHED: new FameLevel('Loathed', 100, COLORS.OrangeRed),
    NOTORIOUS: new FameLevel('Notorious', 250, COLORS.OrangeRed),
    HATED: new FameLevel('Hated', 1000, COLORS.Red),
    VILIFIED: new FameLevel('Vilified', 2500, COLORS.DarkRed),
}