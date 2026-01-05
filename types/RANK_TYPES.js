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
    constructor(name = '', color = COLORS.White, level = 0, upgradeFee = 0, description = '') {
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
    }
}

const RANK_TYPES = {
    OUTLAW: new RankType('Outlaw', COLORS.Red, -1, 0,`No access to any services.`),
    NO_RANK: new RankType('No Rank', COLORS.Gray, 0, 100, 'No official status with this planet.'),
    VISA: new RankType('Visa', COLORS.Green, 1, 1000, 'Licensed to trade and do business on this planet.'),
    CITIZEN: new RankType('Citizen', COLORS.LightBlue, 2, 10000, 'Recognized citizen with basic rights and privileges.'),
    ELITE: new RankType('Elite', COLORS.Gold, 3, 100000, 'Distinguished individual with special privileges and respect.'),
}

const RANK_TYPES_ALL = Object.values(RANK_TYPES)
