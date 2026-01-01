class FameLevel {
    constructor(name = '', minReputation = 0, color = COLORS.White) {
        /** @type {string} */
        this.name = name;
        /** @type {number} */
        this.minReputation = minReputation;
        /** @type {number[]} */
        this.color = color;
    }

    static hasFameLevel(officer = new Officer(), planet = new Planet(), fameLevel = FAME_LEVELS.UNKNOWN) {
        return officer.fame.getAmount(planet) >= fameLevel.minReputation;
    }
    static hasInfamyLevel(officer = new Officer(), planet = new Planet(),  infamyLevel = INFAMY_LEVELS.UNKNOWN) {
        return officer.infamy.getAmount(planet) >= infamyLevel.minReputation;
    }
    static hasFameOrInfamyLevel(officer = new Officer(), planet = new Planet(), fameOrInfamyLevel = FAME_LEVELS.UNKNOWN) {
        return officer.fame.getAmount(planet) >= fameOrInfamyLevel.minReputation || officer.infamy.getAmount(planet) >= fameOrInfamyLevel.minReputation;
    }
}

const FAME_LEVELS = {
    UNKNOWN: new FameLevel('Unknown', 0, COLORS.LightGray),
    LIKED: new FameLevel('Liked', 1, COLORS.LightGreen),
    REPUTABLE: new FameLevel('Reputable', 10, COLORS.YellowGreen),
    RENOWNED: new FameLevel('Renowned', 50, COLORS.Green),
    LOVED: new FameLevel('Loved', 100, COLORS.Yellow),
    LEGENDARY: new FameLevel('Legendary', 200, COLORS.Gold),
}

const INFAMY_LEVELS = {
    UNKNOWN: new FameLevel('Unknown', 0, COLORS.LightGray),
    DISLIKED: new FameLevel('Disliked', 1, COLORS.Orange),
    DISREPUTABLE: new FameLevel('Disreputable', 10, COLORS.OrangeRed),
    NOTORIOUS: new FameLevel('Notorious', 50, COLORS.OrangeRed),
    HATED: new FameLevel('Hated', 100, COLORS.Red),
    VILIFIED: new FameLevel('Vilified', 200, COLORS.DarkRed),
}