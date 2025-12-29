/**
 * Represents a type of policy for a planet's culture.
 * @class PolicyType
 */
class PolicyType {
    /**
     * @param {string} name - The name of the policy type.
     * @param {number[]} color - The color associated with this policy type.
     * @param {GovernmentType[]} forbiddenGovs - Government types that cannot adopt this policy.
     * @param {GovernmentType[]} favoriteGovs - Government types that are more likely to adopt this policy.
     * @param {NewsType[]} forbiddenNewsTypes - News types that cannot occur on this planet when policy is active.
     * @param {NewsType[]} favoriteNewsTypes - News types that are 3x more likely when policy is active.
     * @param {NewsType[]} immuneNewsTypes - News types that cannot target this planet when policy is active.
     */
    constructor(name = '', color = COLORS.White, forbiddenGovs = [], favoriteGovs = [], forbiddenNewsTypes = [], favoriteNewsTypes = [], immuneNewsTypes = []) {
        /** @type {string} */
        this.name = name
        /** @type {number[]} */
        this.color = color
        /** @type {GovernmentType[]} */
        this.forbiddenGovs = forbiddenGovs
        /** @type {GovernmentType[]} */
        this.favoriteGovs = favoriteGovs
        /** @type {NewsType[]} */
        this.forbiddenNewsTypes = forbiddenNewsTypes
        /** @type {NewsType[]} */
        this.favoriteNewsTypes = favoriteNewsTypes
        /** @type {NewsType[]} */
        this.immuneNewsTypes = immuneNewsTypes
    }
}

const PT = {
    // Economic Policies
    DECENTRALIZATION: new PolicyType('Decentralization', COLORS.LightGreen, [GT.COMMUNISM], [GT.ANARCHY], 
        [], [], [NT.STOCK_MARKET_CRASH]),
    PROTECTIONISM: new PolicyType('Protectionism', COLORS.Orange, [GT.ANARCHY], [GT.ARISTOCRACY, GT.POLICE_STATE], 
        [NT.TRADE_AGREEMENT], [NT.SCARCITY, NT.SURPLUS], [NT.EMBARGO, NT.SANCTIONS]),
    CENTRAL_PLANNING: new PolicyType('Central Planning', COLORS.Red, [GT.ANARCHY, GT.CORPORATISM], [GT.COMMUNISM, GT.TECHNOCRACY], 
        [NT.STOCK_MARKET_CRASH], [NT.CONSTRUCTION], []),
    FREE_TRADE: new PolicyType('Free Trade', COLORS.Green, [GT.COMMUNISM], [GT.CORPORATISM, GT.DEMOCRACY], 
        [NT.ISOLATIONISM], [NT.TRADE_AGREEMENT, NT.INVESTMENT, NT.TOURISM], []),
    
    // Labor Policies
    FORCED_LABOR: new PolicyType('Forced Labor', COLORS.Red, [GT.DEMOCRACY, GT.ANARCHY], [GT.POLICE_STATE, GT.COMMUNISM], 
        [], [NT.CONSTRUCTION], [NT.CIVIL_STRIFE]),
    FEUDALISM: new PolicyType('Feudalism', COLORS.LightGreen, [GT.COMMUNISM, GT.ANARCHY], [GT.ARISTOCRACY], 
        [], [NT.RAIDING, NT.IMPERIALISM], [NT.DEMOCRACY_MOVEMENT]),
    LAISSEZ_FAIRE: new PolicyType('Laissez Faire', COLORS.Cyan, [], [GT.TECHNOCRACY, GT.CORPORATISM], 
        [NT.FORCED_LABOR], [NT.ECONOMIC_BOOM, NT.TRADE_AGREEMENT, NT.STOCK_MARKET_CRASH, NT.DEPRESSION], []),
    LABOR_UNIONS: new PolicyType('Labor Unions', COLORS.Blue, [], [GT.DEMOCRACY, GT.COMMUNISM], 
        [NT.FORCED_LABOR], [], []),
    
    // Social/Cultural Policies
    ETHNIC_NATIONALISM: new PolicyType('Ethnic Nationalism', COLORS.DarkRed, [GT.ANARCHY], [GT.POLICE_STATE, GT.ARISTOCRACY], 
        [NT.IMMIGRATION], [NT.GENOCIDE, NT.IMPERIALISM, NT.CRACKDOWN], []),
    STATE_RELIGION: new PolicyType('State Religion', COLORS.White, [GT.TECHNOCRACY], [GT.THEOCRACY, GT.ARISTOCRACY], 
        [], [NT.REVIVAL, NT.CRACKDOWN, NT.LUDDITISM], []),
    TOTALITARIANISM: new PolicyType('Totalitarianism', COLORS.DimGray, [GT.DEMOCRACY, GT.ANARCHY], [GT.POLICE_STATE], 
        [NT.REVOLUTION, NT.CRIME_WAVE], [NT.CRACKDOWN, NT.CONSCRIPTION, NT.FORCED_LABOR], []),
    LIBERALISM: new PolicyType('Liberalism', COLORS.Green, [GT.THEOCRACY, GT.POLICE_STATE], [GT.DEMOCRACY, GT.TECHNOCRACY], 
        [NT.CRACKDOWN, NT.GENOCIDE, NT.ENSLAVEMENT], [NT.IMMIGRATION, NT.TOURISM], []),
    
    // Military/Foreign Policy
    IMPERIALISM: new PolicyType('Imperialism', COLORS.Red, [GT.ANARCHY, GT.PUPPET_STATE], [GT.POLICE_STATE, GT.ARISTOCRACY], 
        [NT.DISARMAMENT, NT.ISOLATIONISM], [NT.COLONIZATION, NT.WAR, NT.MILITARY_BUILDUP, NT.ENSLAVEMENT], []),
    ISOLATIONISM: new PolicyType('Isolationism', COLORS.Gray, [GT.PUPPET_STATE], [GT.POLICE_STATE, GT.THEOCRACY], 
        [NT.ALLIANCE, NT.TRADE_AGREEMENT, NT.FOREIGN_AID, NT.WAR, NT.EMBARGO, NT.SANCTIONS], [NT.DISARMAMENT], []),
    COMMERCIALISM: new PolicyType('Commercialism', COLORS.Yellow, [], [GT.DEMOCRACY, GT.CORPORATISM], 
        [NT.ISOLATIONISM, NT.EMBARGO], [NT.TRADE_AGREEMENT, NT.INVESTMENT, NT.TOURISM], []),
    UNIVERSALISM: new PolicyType('Universalism', COLORS.LightGreen, [GT.POLICE_STATE], [GT.DEMOCRACY, GT.THEOCRACY], 
        [NT.GENOCIDE, NT.IMPERIALISM, NT.ENSLAVEMENT], [NT.ALLIANCE, NT.FOREIGN_AID, NT.IMMIGRATION], []),
}

const PT_ALL = Object.values(PT)

/** @type {PolicyType[]} */
const ECONOMIC_POLICIES = [PT.DECENTRALIZATION, PT.PROTECTIONISM, PT.CENTRAL_PLANNING, PT.FREE_TRADE]

/** @type {PolicyType[]} */
const LABOR_POLICIES = [PT.FORCED_LABOR, PT.FEUDALISM, PT.LAISSEZ_FAIRE, PT.LABOR_UNIONS]

/** @type {PolicyType[]} */
const SOCIAL_POLICIES = [PT.ETHNIC_NATIONALISM, PT.STATE_RELIGION, PT.TOTALITARIANISM, PT.LIBERALISM]

/** @type {PolicyType[]} */
const FOREIGN_POLICIES = [PT.IMPERIALISM, PT.ISOLATIONISM, PT.COMMERCIALISM, PT.UNIVERSALISM]


class Policies {
    constructor(economic = ECONOMIC_POLICIES[0], labor = LABOR_POLICIES[0], social = SOCIAL_POLICIES[0], foreign = FOREIGN_POLICIES[0]) {
        /** @type {PolicyType} */
        this.economic = economic
        /** @type {PolicyType} */
        this.labor = labor
        /** @type {PolicyType} */
        this.social = social
        /** @type {PolicyType} */
        this.foreign = foreign
    }
}