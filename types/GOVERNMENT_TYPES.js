/**
 * Represents a type of government for a planet's civilization.
 * @class GovernmentType
 */
class GovernmentType {
    /**
     * @param {string} name - The name of the government type.
     * @param {number[]} color - The color associated with this government type.
     * @param {BuildingType[]} blockedBuildings - Array of building types that are inaccessible under this government.
     * @param {string} description - A brief description of this government type.
     * @param {Religion[]} favoredReligions - Array of religions favored by this government.
     * @param {Religion[]} forbiddenReligions - Array of religions forbidden by this government.
     * @property {GovernmentType|null} opposingType - The opposing government type (if any).
     */
    constructor(
        name = '',
        color = COLORS.White,
        blockedBuildings = [],
        description = '',
        favoredReligions = [],
        forbiddenReligions = [],
        civBonuses = {}
    ) {
        /** @type {string} */
        this.name = name
        /** @type {number[]} */
        this.color = color
        /** @type {BuildingType[]} */
        this.blockedBuildings = blockedBuildings
        /** @type {string} */
        this.description = description
        /** @type {Religion[]} */
        this.favoredReligions = favoredReligions
        /** @type {Religion[]} */
        this.forbiddenReligions = forbiddenReligions
        /** @type {GovernmentType|null} */
        this.opposingType = null
        /** @type {CivilizationParams} */
        this.civBonuses = civBonuses
    }
}

const GT = {
    DEMOCRACY: new GovernmentType(
        'Democracy',
        COLORS.LightBlue,
        [],
        'Rule by elected representatives. A stable, balanced government with minimal restrictions.',
        [],
        [],
        {culture: 1, economy: 1}
    ),
    ARISTOCRACY: new GovernmentType(
        'Aristocracy',
        COLORS.LightPurple,
        [BUILDING_TYPES.GUILD],
        'Rule by hereditary nobility. Elite classes control wealth and power.',
        [],
        [],
        {prestige: 1, wealth: 1}
    ),
    COMMUNISM: new GovernmentType(
        'Communism',
        COLORS.LightRed,
        [BUILDING_TYPES.BANK, BUILDING_TYPES.BLACK_MARKET, BUILDING_TYPES.CASINO],
        'Collective ownership of resources. No private banking or gambling, minimal merchant activity.',
        [],
        [],
        {industry: 1, security: 1},
    ),
    CORPORATISM: new GovernmentType(
        'Corporatism',
        COLORS.LightYellow,
        [],
        'Rule by corporate entities. All store fees doubled, profit-driven policies.',
        [],
        [],
        {wealth: 1, economy: 1}
    ),
    THEOCRACY: new GovernmentType(
        'Theocracy',
        COLORS.White,
        [BUILDING_TYPES.CYBER_SURGEON, BUILDING_TYPES.GENETICIST, BUILDING_TYPES.CASINO],
        'Rule by religious authority. Cybernetic enhancement, genetic modification, and gambling forbidden.',
        [],
        [RELIGION_ATHEISM, RELIGION_AGNOSTICISM],
        {population: 1, culture: 1}
    ),
    TECHNOCRACY: new GovernmentType(
        'Technocracy',
        COLORS.LightCyan,
        [BUILDING_TYPES.TEMPLE],
        'Rule by technical experts. Science and efficiency prioritized over faith.',
        [RELIGION_ATHEISM, RELIGION_AGNOSTICISM],
        [],
        {technology: 1, education: 1}
    ),
    POLICE_STATE: new GovernmentType(
        'Police State',
        COLORS.Brown,
        [BUILDING_TYPES.BLACK_MARKET, BUILDING_TYPES.CASINO],
        'Authoritarian surveillance state. Heavy security presence, limited criminal activity.',
        [],
        [],
        {security: 1, army: 1}
    ),
    ANARCHY: new GovernmentType(
        'Anarchy',
        COLORS.LightGreen,
        [BUILDING_TYPES.COURTHOUSE, BUILDING_TYPES.PALACE, BUILDING_TYPES.ACADEMY],
        'Absence of formal government. No police or military, maximum individual freedom.',
        [],
        [],
        {culture: 1, crime: 1}
    ),
    PUPPET_STATE: new GovernmentType(
        'Puppet State',
        COLORS.LightGray,
        [BUILDING_TYPES.PALACE],
        'Nominally independent but controlled by external power.',
        [],
        [],
        {corruption: 1, taxes: 1}
    ),
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