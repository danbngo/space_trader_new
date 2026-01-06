/**
 * @class RuinsType
 * @classdesc Represents a type of ancient ruins with specific characteristics.
 * @property {string} name - The name of the ruins type.
 * @property {number[]} color - The color for this ruins type (RGBA array).
 * @property {string} description - Description of the ruins.
 */
class RuinsType {
    /**
     * @param {string} name - The name of the ruins type.
     * @param {number[]} color - The color for this ruins type (RGBA array).
     * @param {string} description - Description of the ruins.
     */
    constructor(name, color, description = '') {
        /** @type {string} */
        this.name = name
        /** @type {number[]} */
        this.color = color
        /** @type {string} */
        this.description = description
    }
}

const RUINS_TYPES = Object.freeze({
    DEAD_SHIP: new RuinsType("Derelict Vessel", COLORS.DarkGray, "An ancient ship drifting in the void, its crew long gone"),
    SLEEPER_ARK: new RuinsType("Sleeper Ark", COLORS.DarkCyan, "A generation ship in cryogenic suspension, destination unknown"),
    ALIEN_SATELLITE: new RuinsType("Alien Satellite", COLORS.DarkGreen, "A mysterious satellite of unknown origin, still transmitting"),
    OBSERVER: new RuinsType("Ancient Probe", COLORS.DarkBlue, "A deteriorating probe from a forgotten civilization"),
    NANITE_BLOB: new RuinsType("Nanite Cloud", COLORS.DarkMagenta, "A mass of dormant self-replicating nanomachines"),
    DEFENSE_PLATFORM: new RuinsType("Defense Platform", COLORS.DarkRed, "A deactivated military installation from a long-dead empire"),
    RESEARCH_STATION: new RuinsType("Research Station", COLORS.DarkYellow, "An abandoned scientific outpost on the edge of civilization"),
});

const RUINS_TYPES_ALL = Object.values(RUINS_TYPES);
