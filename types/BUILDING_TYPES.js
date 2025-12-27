/**
 * Represents a type of building that can exist on a planet.
 * @class BuildingType
 */
class BuildingType {
    /**
     * @param {string} name - The name of the building type.
     * @param {number[]} color - The color associated with this building type.
     * @param {boolean} illegal - Whether this building type is illegal (e.g., black market).
     */
    constructor(name = '', color = COLORS.White, illegal = false) {
        /** @type {string} */
        this.name = name
        /** @type {number[]} */
        this.color = color;
        /** @type {boolean} */
        this.illegal = illegal
    }
}

const BUILDING_TYPES = {
    SHIPYARD: new BuildingType('Shipyard', COLORS.LightGray, false),
    MARKET: new BuildingType('Market', COLORS.LightBlue, false),
    BANK: new BuildingType('Bank', COLORS.Yellow, false),
    BLACK_MARKET: new BuildingType('Black Market', COLORS.Red, true),
    GUILD: new BuildingType('Guild', COLORS.Purple, false),
    ACADEMY: new BuildingType('Academy', COLORS.Green, false),
    COURTHOUSE: new BuildingType('Court House', COLORS.Brown, false),
}
const BUILDING_TYPES_ALL = Object.values(BUILDING_TYPES)