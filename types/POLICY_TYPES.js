/**
 * Represents a type of policy for a planet's civilization.
 * @class PolicyType
 */
class PolicyType {
    /**
     * @param {string} name - The name of the policy type.
     * @param {NewsFlavor} flavor - The news flavor associated with this policy type.
     * @param {number[]} color - The color associated with this policy type.
     * @param {GovernmentType[]} forbiddenGovs - Government types that cannot adopt this policy.
     * @param {GovernmentType[]} favoriteGovs - Government types that are more likely to adopt this policy.
     * @param {NewsType[]} forbiddenNewsTypes - News types that cannot occur on this planet when policy is active.
     * @param {NewsType[]} favoriteNewsTypes - News types that are 3x more likely when policy is active.
     * @param {NewsType[]} immuneNewsTypes - News types that cannot target this planet when policy is active.
     * @param {Map<FactionType, number>} factionSpawnModifiers - Modifiers to fleet spawn rates for factions under this policy.
     */
    constructor(name = '', flavor = new NewsFlavor(), color = COLORS.White, forbiddenGovs = [], favoriteGovs = [], forbiddenNewsTypes = [], favoriteNewsTypes = [], immuneNewsTypes = [], factionSpawnModifiers = new Map()) {
        /** @type {string} */
        this.name = name
        /** @type {NewsFlavor} */
        this.flavor = flavor
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
        /** @type {Map<FactionType, number>} */
        this.factionSpawnModifiers = factionSpawnModifiers
    }
}

const PT = {
    // Economic Policies
    DECENTRALIZATION: new PolicyType('Decentralization', NF.ECONOMY, COLORS.LightGreen, [GT.COMMUNISM], [GT.ANARCHY], 
        [], [], [NT.STOCK_MARKET_CRASH], 
        new Map([[FACTION_TYPES.MERCHANTS, 1.2], [FACTION_TYPES.MINERS, 1.3], [FACTION_TYPES.SMUGGLERS, 1.4]])),
    PROTECTIONISM: new PolicyType('Protectionism', NF.ECONOMY, COLORS.Orange, [GT.ANARCHY], [GT.ARISTOCRACY, GT.POLICE_STATE], 
        [NT.TRADE_AGREEMENT], [NT.SCARCITY, NT.SURPLUS], [NT.BLOCKADE, NT.SANCTIONS],
        new Map([[FACTION_TYPES.MERCHANTS, 0.5], [FACTION_TYPES.SMUGGLERS, 1.5], [FACTION_TYPES.POLICE, 1.2]])),
    CENTRAL_PLANNING: new PolicyType('Central Planning', NF.ECONOMY, COLORS.Red, [GT.ANARCHY, GT.CORPORATISM], [GT.COMMUNISM, GT.TECHNOCRACY], 
        [NT.STOCK_MARKET_CRASH, NT.BANKRUPTCY], [NT.CONSTRUCTION], [],
        new Map([[FACTION_TYPES.MINERS, 1.3], [FACTION_TYPES.MERCHANTS, 0.7], [FACTION_TYPES.POLICE, 1.3]])),
    FREE_TRADE: new PolicyType('Free Trade', NF.ECONOMY, COLORS.Green, [GT.COMMUNISM], [GT.CORPORATISM, GT.DEMOCRACY], 
        [NT.ISOLATIONISM], [NT.TRADE_AGREEMENT, NT.INVESTMENT, NT.TOURISM], [],
        new Map([[FACTION_TYPES.MERCHANTS, 1.5], [FACTION_TYPES.TOURISTS, 1.4], [FACTION_TYPES.SMUGGLERS, 0.7]])),
    
    // Labor Policies
    FORCED_LABOR: new PolicyType('Forced Labor', NF.LABOR, COLORS.Red, [GT.DEMOCRACY, GT.ANARCHY], [GT.POLICE_STATE, GT.COMMUNISM], 
        [], [NT.CONSTRUCTION, NT.INDUSTRIAL_ACCIDENT], [NT.CIVIL_STRIFE],
        new Map([[FACTION_TYPES.POLICE, 1.4], [FACTION_TYPES.SLAVERS, 1.8], [FACTION_TYPES.COLONISTS, 0.4]])),
    FEUDALISM: new PolicyType('Feudalism', NF.LABOR, COLORS.LightGreen, [GT.COMMUNISM, GT.ANARCHY], [GT.ARISTOCRACY], 
        [], [NT.RAIDING, NT.LAND_GRAB], [NT.DEMOCRACY_MOVEMENT],
        new Map([[FACTION_TYPES.SOLDIERS, 1.3], [FACTION_TYPES.PIRATES, 1.2], [FACTION_TYPES.MERCHANTS, 0.8]])),
    LAISSEZ_FAIRE: new PolicyType('Laissez Faire', NF.LABOR, COLORS.Cyan, [], [GT.TECHNOCRACY, GT.CORPORATISM], 
        [NT.FORCED_LABOR], [NT.ECONOMIC_BOOM, NT.TRADE_AGREEMENT, NT.STOCK_MARKET_CRASH, NT.DEPRESSION, NT.BANKRUPTCY, NT.INDUSTRIAL_ACCIDENT], [],
        new Map([[FACTION_TYPES.MERCHANTS, 1.4], [FACTION_TYPES.MINERS, 1.3], [FACTION_TYPES.PIRATES, 1.2]])),
    LABOR_UNIONS: new PolicyType('Labor Unions', NF.LABOR, COLORS.Blue, [], [GT.DEMOCRACY, GT.COMMUNISM], 
        [NT.FORCED_LABOR], [], [],
        new Map([[FACTION_TYPES.MINERS, 1.2], [FACTION_TYPES.SLAVERS, 0.3], [FACTION_TYPES.POLICE, 0.9]])),
    
    // Social/Cultural Policies
    ETHNIC_NATIONALISM: new PolicyType('Ethnic Nationalism', NF.CULTURE, COLORS.DarkRed, [GT.ANARCHY], [GT.POLICE_STATE, GT.ARISTOCRACY], 
        [NT.IMMIGRATION], [NT.GENOCIDE, NT.LAND_GRAB, NT.CRACKDOWN, NT.EUGENICS], [],
        new Map([[FACTION_TYPES.SOLDIERS, 1.5], [FACTION_TYPES.POLICE, 1.4], [FACTION_TYPES.TOURISTS, 0.3], [FACTION_TYPES.COLONISTS, 0.5]])),
    STATE_RELIGION: new PolicyType('State Religion', NF.CULTURE, COLORS.White, [GT.TECHNOCRACY], [GT.THEOCRACY, GT.ARISTOCRACY], 
        [], [NT.RELIGION_REVIVAL, NT.CRACKDOWN, NT.LUDDITISM, NT.CULTURAL_PURGE, NT.RELIGION_INQUISITION], [],
        new Map([[FACTION_TYPES.INQUISITORS, 2.5], [FACTION_TYPES.PILGRIMS, 1.8], [FACTION_TYPES.MISSIONARIES, 1.6], [FACTION_TYPES.SCIENTISTS, 0.6]])),
    TOTALITARIANISM: new PolicyType('Totalitarianism', NF.CULTURE, COLORS.DimGray, [GT.DEMOCRACY, GT.ANARCHY], [GT.POLICE_STATE], 
        [NT.REVOLUTION, NT.CRIME_WAVE], [NT.CRACKDOWN, NT.CONSCRIPTION, NT.FORCED_LABOR, NT.CULTURAL_PURGE, NT.EUGENICS, NT.TERRORISM, NT.RELIGION_INQUISITION], [],
        new Map([[FACTION_TYPES.POLICE, 2.0], [FACTION_TYPES.SOLDIERS, 1.8], [FACTION_TYPES.PIRATES, 0.2], [FACTION_TYPES.SMUGGLERS, 0.3], [FACTION_TYPES.TOURISTS, 0.4]])),
    LIBERALISM: new PolicyType('Liberalism', NF.CULTURE, COLORS.Green, [GT.THEOCRACY, GT.POLICE_STATE], [GT.DEMOCRACY, GT.TECHNOCRACY], 
        [NT.CRACKDOWN, NT.GENOCIDE, NT.ENSLAVEMENT, NT.CULTURAL_PURGE, NT.EUGENICS, NT.RELIGION_INQUISITION], [NT.IMMIGRATION, NT.TOURISM, NT.CLONING, NT.CULTURAL_RENAISSANCE], [],
        new Map([[FACTION_TYPES.TOURISTS, 1.6], [FACTION_TYPES.MERCHANTS, 1.3], [FACTION_TYPES.COLONISTS, 1.4], [FACTION_TYPES.SLAVERS, 0.2], [FACTION_TYPES.INQUISITORS, 0.3]])),
    
    // Military/Foreign Policy
    IMPERIALISM: new PolicyType('Imperialism', NF.POLITICS, COLORS.Red, [GT.ANARCHY, GT.PUPPET_STATE], [GT.POLICE_STATE, GT.ARISTOCRACY], 
        [NT.DISARMAMENT, NT.ISOLATIONISM], [NT.COLONIZATION, NT.WAR, NT.MILITARY_BUILDUP, NT.ENSLAVEMENT], [],
        new Map([[FACTION_TYPES.SOLDIERS, 2.0], [FACTION_TYPES.COLONISTS, 1.5], [FACTION_TYPES.SLAVERS, 1.4], [FACTION_TYPES.TOURISTS, 0.6]])),
    ISOLATIONISM: new PolicyType('Isolationism', NF.POLITICS, COLORS.Gray, [GT.PUPPET_STATE], [GT.POLICE_STATE, GT.THEOCRACY], 
        [NT.ALLIANCE, NT.TRADE_AGREEMENT, NT.FOREIGN_AID, NT.WAR, NT.BLOCKADE, NT.SANCTIONS, NT.TERRORISM], [NT.DISARMAMENT], [],
        new Map([[FACTION_TYPES.MERCHANTS, 0.3], [FACTION_TYPES.SOLDIERS, 0.4], [FACTION_TYPES.TOURISTS, 0.3], [FACTION_TYPES.COLONISTS, 0.5], [FACTION_TYPES.MINERS, 1.2], [FACTION_TYPES.SCIENTISTS, 1.1]])),
    COMMERCIALISM: new PolicyType('Commercialism', NF.POLITICS, COLORS.Yellow, [], [GT.DEMOCRACY, GT.CORPORATISM], 
        [NT.ISOLATIONISM, NT.BLOCKADE], [NT.TRADE_AGREEMENT, NT.INVESTMENT, NT.TOURISM], [],
        new Map([[FACTION_TYPES.MERCHANTS, 1.8], [FACTION_TYPES.TOURISTS, 1.5], [FACTION_TYPES.SOLDIERS, 0.7], [FACTION_TYPES.PIRATES, 1.2]])),
    UNIVERSALISM: new PolicyType('Universalism', NF.POLITICS, COLORS.LightGreen, [GT.POLICE_STATE], [GT.DEMOCRACY, GT.THEOCRACY], 
        [NT.GENOCIDE, NT.LAND_GRAB, NT.ENSLAVEMENT, NT.TERRORISM], [NT.ALLIANCE, NT.FOREIGN_AID, NT.IMMIGRATION], [],
        new Map([[FACTION_TYPES.COLONISTS, 1.4], [FACTION_TYPES.MISSIONARIES, 1.5], [FACTION_TYPES.TOURISTS, 1.3], [FACTION_TYPES.SOLDIERS, 0.8], [FACTION_TYPES.SLAVERS, 0.2]])),

    //Religious policy
    POLYTHEISM: new PolicyType('Polytheism', NF.RELIGION, COLORS.Orange, [], [GT.DEMOCRACY, GT.ARISTOCRACY], 
        [NT.RELIGION_INQUISITION], [NT.RELIGION_REVIVAL, NT.IMMIGRATION], [],
        new Map([[FACTION_TYPES.PILGRIMS, 1.4], [FACTION_TYPES.MISSIONARIES, 1.2], [FACTION_TYPES.INQUISITORS, 0.5], [FACTION_TYPES.TOURISTS, 1.2]])),
    MONOTHEISM: new PolicyType('Monotheism', NF.RELIGION, COLORS.LightBlue, [], [GT.THEOCRACY, GT.ARISTOCRACY], 
        [], [NT.RELIGION_REVIVAL, NT.RELIGION_INQUISITION, NT.CULTURAL_PURGE], [],
        new Map([[FACTION_TYPES.INQUISITORS, 1.8], [FACTION_TYPES.PILGRIMS, 1.6], [FACTION_TYPES.MISSIONARIES, 1.7], [FACTION_TYPES.SCIENTISTS, 0.7]])),
    SECULARISM: new PolicyType('Secularism', NF.RELIGION, COLORS.Blue, [GT.THEOCRACY], [GT.DEMOCRACY, GT.TECHNOCRACY], 
        [NT.RELIGION_REVIVAL, NT.RELIGION_INQUISITION], [NT.CULTURAL_RENAISSANCE, NT.SCIENTIFIC_BREAKTHROUGH], [],
        new Map([[FACTION_TYPES.SCIENTISTS, 1.5], [FACTION_TYPES.PILGRIMS, 0.5], [FACTION_TYPES.INQUISITORS, 0.3], [FACTION_TYPES.MISSIONARIES, 0.4]])),
    ATHEISM: new PolicyType('Atheism', NF.RELIGION, COLORS.Gray, [GT.THEOCRACY], [GT.COMMUNISM, GT.TECHNOCRACY], 
        [NT.RELIGION_REVIVAL, NT.RELIGION_INQUISITION], [NT.LUDDITISM, NT.SCIENTIFIC_BREAKTHROUGH], [],
        new Map([[FACTION_TYPES.SCIENTISTS, 1.6], [FACTION_TYPES.PILGRIMS, 0.2], [FACTION_TYPES.INQUISITORS, 0.1], [FACTION_TYPES.MISSIONARIES, 0.2]])),
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


