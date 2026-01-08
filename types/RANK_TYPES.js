/**
 * Represents a rank type that an officer can have with a planet.
 * @class RankType
 */
class RankType {
    /**
     * @param {string} name - The name of the rank.
     * @param {number[]} color - The color associated with this rank.
     * @param {number} level
     * @param {number} upgradeFee
     * @param {string} description - A description of the rank's benefits or status.
     */
    constructor(name = '', color = COLORS.White, level = 0, upgradeFee = 0, upgradeReputation = 0, description = '') {
        /** @type {string} */
        this.name = name
        /** @type {number} */
        this.level = level
        /** @type {number[]} */
        this.color = color;
        /** @type {string} */
        this.description = description
        /** @type {number} */
        this.upgradeFee = upgradeFee
        /** @type {number} */
        this.upgradeReputation = upgradeReputation
    }
}

const RANK_TYPES = {
    OUTLAW: new RankType('Outlaw', COLORS.Red, -1, 0, 0, 'Wanted criminal with no access to planetary services. Clear your bounty to regain standing.'),
    NO_RANK: new RankType('No Rank', COLORS.Gray, 0, 100, 0, 'No official status with this planet. You can dock and trade, but have no special privileges or legal protections.'),
    VISA: new RankType('Visa', COLORS.Green, 1, 1000, 0, 'Temporary authorization to conduct business. Grants access to markets and basic services, but limited legal standing.'),
    CITIZEN: new RankType('Citizen', COLORS.LightBlue, 2, 10000, 25, 'Full citizenship with voting rights and legal protections. Eligible for government missions and preferred trade rates.'),
    ELITE: new RankType('Elite', COLORS.Gold, 3, 100000, 100, 'Distinguished status reserved for the most influential individuals. Grants access to exclusive facilities, VIP treatment, and significant political influence.'),
}

const RANK_TYPES_ALL = Object.values(RANK_TYPES)
