/**
 * Represents a type of government for a planet's culture.
 * @class GovernmentType
 */
class GovernmentType {
    /**
     * @param {string} name - The name of the government type.
     * @param {number[]} color - The color associated with this government type.
     * @type {GovernmentType|null} opposingType - The opposing government type (if any).
     */
    constructor(name = '', color = COLORS.White) {
        /** @type {string} */
        this.name = name
        /** @type {number[]} */
        this.color = color
        /** @type {GovernmentType|null} */
        this.opposingType = null
    }
}

const GOVERNMENT_TYPES = {
    DEMOCRACY: new GovernmentType('Democracy', COLORS.LightBlue), //the boring, stable default
    ARISTOCRACY: new GovernmentType('Aristocracy', COLORS.Purple),

    COMMUNISM: new GovernmentType('Communism', COLORS.Red), //fleets and stores carry no CR, no merchants
    CORPORATISM: new GovernmentType('Corporatism', COLORS.Yellow), //all store fees doubled

    THEOCRACY: new GovernmentType('Theocracy', COLORS.White),
    TECHNOCRACY: new GovernmentType('Technocracy', COLORS.Blue),

    POLICE_STATE: new GovernmentType('Police State', COLORS.Brown), //no pirates or smugglers
    ANARCHY: new GovernmentType('Anarchy', COLORS.Green), //no police or war fleets

    PUPPET_STATE: new GovernmentType('Puppet State', COLORS.LightGray),
}
const GOVERNMENT_TYPES_ALL = Object.values(GOVERNMENT_TYPES)

for (const pairing of [
    [GOVERNMENT_TYPES.DEMOCRACY, GOVERNMENT_TYPES.ARISTOCRACY],
    [GOVERNMENT_TYPES.COMMUNISM, GOVERNMENT_TYPES.CORPORATISM],
    [GOVERNMENT_TYPES.THEOCRACY, GOVERNMENT_TYPES.TECHNOCRACY],
    [GOVERNMENT_TYPES.POLICE_STATE, GOVERNMENT_TYPES.ANARCHY],
]) {
    pairing[0].opposingType = pairing[1]
    pairing[1].opposingType = pairing[0]
}