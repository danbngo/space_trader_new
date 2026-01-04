/**
 * Represents a rank type that an officer can have with a planet.
 * @class RankType
 */
class RankType {
    /**
     * @param {string} name - The name of the rank.
     * @param {number[]} color - The color associated with this rank.
     * @param {string} description - A description of the rank's benefits or status.
     */
    constructor(name = '', color = COLORS.White, description = '') {
        /** @type {string} */
        this.name = name
        /** @type {number[]} */
        this.color = color;
        /** @type {string} */
        this.description = description
    }
}

const RANK_TYPES = {
    NO_RANK: new RankType('No Rank', COLORS.Gray, 'No official status with this planet.'),
    CITIZEN: new RankType('Citizen', COLORS.LightBlue, 'Recognized citizen with basic rights and privileges.'),
    ELITE: new RankType('Elite', COLORS.Gold, 'Distinguished individual with special privileges and respect.'),
}

const RANK_TYPES_ALL = Object.values(RANK_TYPES)
