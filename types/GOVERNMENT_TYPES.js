/**
 * Represents a type of government for a planet's civilization.
 * @class GovernmentType
 */
class GovernmentType {
    /**
     * @param {string} name - The name of the government type.
     * @param {number[]} color - The color associated with this government type.
     * @param {BuildingType[]} blockedBuildings - Array of building types that are inaccessible under this government.
     * @property {GovernmentType|null} opposingType - The opposing government type (if any).
     */
    constructor(name = '', color = COLORS.White, blockedBuildings = []) {
        /** @type {string} */
        this.name = name
        /** @type {number[]} */
        this.color = color
        /** @type {BuildingType[]} */
        this.blockedBuildings = blockedBuildings
        /** @type {GovernmentType|null} */
        this.opposingType = null
    }
}

const GT = {
    DEMOCRACY: new GovernmentType('Democracy', COLORS.LightBlue, []), //the boring, stable default
    ARISTOCRACY: new GovernmentType('Aristocracy', COLORS.Purple, [BUILDING_TYPES.GUILD]),

    COMMUNISM: new GovernmentType('Communism', COLORS.Red, [BUILDING_TYPES.BANK, BUILDING_TYPES.BLACK_MARKET, BUILDING_TYPES.CASINO]), //fleets and stores carry no CR, no merchants
    CORPORATISM: new GovernmentType('Corporatism', COLORS.Yellow, []), //all store fees doubled

    THEOCRACY: new GovernmentType('Theocracy', COLORS.White, [BUILDING_TYPES.CYBER_SURGEON, BUILDING_TYPES.CASINO]),
    TECHNOCRACY: new GovernmentType('Technocracy', COLORS.Blue, [BUILDING_TYPES.TEMPLE]),

    POLICE_STATE: new GovernmentType('Police State', COLORS.Brown, [BUILDING_TYPES.BLACK_MARKET, BUILDING_TYPES.CASINO]), //no pirates or smugglers
    ANARCHY: new GovernmentType('Anarchy', COLORS.Green, [BUILDING_TYPES.COURTHOUSE, BUILDING_TYPES.PALACE, BUILDING_TYPES.ACADEMY]), //no police or war fleets

    PUPPET_STATE: new GovernmentType('Puppet State', COLORS.LightGray, [BUILDING_TYPES.PALACE]),
}
const GT_ALL = Object.values(GT)

for (const pairing of [
    [GT.DEMOCRACY, GT.ARISTOCRACY],
    [GT.COMMUNISM, GT.CORPORATISM],
    [GT.THEOCRACY, GT.TECHNOCRACY],
    [GT.POLICE_STATE, GT.ANARCHY],
]) {
    pairing[0].opposingType = pairing[1]
    pairing[1].opposingType = pairing[0]
}