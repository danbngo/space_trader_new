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
    constructor(name = '', color = COLORS.White, baseCredits = 1, illegal = false) {
        /** @type {string} */
        this.name = name
        /** @type {number[]} */
        this.color = color;
        /** @type {number} */
        this.baseCredits = baseCredits
        /** @type {boolean} */
        this.illegal = illegal
    }
}

const BUILDING_TYPES = {
    SHIPYARD: new BuildingType('Shipyard', COLORS.LightGray, 20*1000, false),
    MARKET: new BuildingType('Market', COLORS.LightBlue, 30*1000, false),
    BANK: new BuildingType('Bank', COLORS.Yellow, 50*1000, false),
    BLACK_MARKET: new BuildingType('Black Market', COLORS.Red, 10*1000, true),
    GUILD: new BuildingType('Guild', COLORS.Purple, 10*1000, false),
    ACADEMY: new BuildingType('Academy', COLORS.Green, 10*1000, false),
    COURTHOUSE: new BuildingType('Court House', COLORS.Brown, 10*1000, false),
    CYBER_SURGEON: new BuildingType('Cyber Surgeon', COLORS.Cyan, 15*1000, false),
}
const BUILDING_TYPES_ALL = Object.values(BUILDING_TYPES)