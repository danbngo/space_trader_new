/**
 * Represents a type of news event that can occur in the game.
 * @class NewsType
 */
class NewsType {
    /**
     * @param {string} name - The name of the news type.
     * @param {NewsFlavor} newsFlavor - The flavor associated with this news type.
     * @param {number} minYears - The minimum duration in years this news event can last.
     * @param {number} maxYears - The maximum duration in years this news event can last.
     * @param {number} displayPriority - The display priority when multiple news events occur in the same year.
     * @param {GovernmentType[]} forbiddenGovs - Government types that cannot have this news event.
     * @param {GovernmentType[]} favoriteGovs - Government types that are more likely to have this news event.
     * @param {GovernmentType[]} immuneGovs - Government types that are immune to this news event.
     */
    constructor(
        name = '', newsFlavor = NF_ALL[0], minYears = null, maxYears = null, displayPriority = 0, 
        forbiddenGovs = [], favoriteGovs = [], immuneGovs = []
    ) {
        /** @type {string} */
        this.name = name
        /** @type {NewsFlavor} */
        this.newsFlavor = newsFlavor
        /** @type {number} */
        this.minYears = minYears
        /** @type {number} */
        this.maxYears = maxYears
        /** @type {number} */
        this.displayPriority = displayPriority //if multiple news occur in the same year, which to show first
        /** @type {GovernmentType[]} */
        this.forbiddenGovs = forbiddenGovs //cannot initiate the event
        /** @type {GovernmentType[]} */
        this.favoriteGovs = favoriteGovs //more likely to initiate the event
        /** @type {GovernmentType[]} */
        this.immuneGovs = immuneGovs //cannot be the target/victim/planet who fares less well of the event
        this.weight = this.newsFlavor.weight
    }
}

const NT = {
    ADDICTION: new NewsType('Addiction', NF.HEALTH_HAZARD, 3, 8, 1, [], [], [GT.POLICE_STATE]),
    ALLIANCE: new NewsType('Alliance', NF.GEOPOLITICS, 10, 40, 1, [GT.ANARCHY, GT.PUPPET_STATE], [GT.DEMOCRACY], []), //two neutral planets become allies
    ALLIANCE_RELIGIOUS: new NewsType('Religious Alliance', NF.GEOPOLITICS, 10, 40, 1, [GT.ANARCHY, GT.PUPPET_STATE], [GT.THEOCRACY, GT.DEMOCRACY], []), //two neutral planets with same state religion
    ALLIANCE_GOVERNMENT: new NewsType('Political Alliance', NF.GEOPOLITICS, 10, 40, 1, [GT.ANARCHY, GT.PUPPET_STATE], [GT.DEMOCRACY, GT.ARISTOCRACY], []), //two neutral planets with same government type
    ALLIANCE_ETHNIC: new NewsType('Ethnic Alliance', NF.GEOPOLITICS, 10, 40, 1, [GT.ANARCHY, GT.PUPPET_STATE], [GT.DEMOCRACY], []), //two neutral planets with same majority ethnicity
    ARMS_DEAL: new NewsType('Arms Deal', NF.GEOPOLITICS, 2, 5, 1, [GT.ANARCHY, GT.PUPPET_STATE], [GT.CORPORATISM], []), //one planet sends military equipment to another
    CIVIL_STRIFE: new NewsType('Civil Strife', NF.UNREST, 3, 8, 1, [GT.POLICE_STATE], [], []),
    CIVIL_WAR: new NewsType('Civil War', NF.UNREST, 3, 15, 1, [GT.ANARCHY, GT.PUPPET_STATE], [], []),
    COALITION: new NewsType('Coalition', NF.GEOPOLITICS, 10, 30, 300, [GT.PUPPET_STATE], [], []),
    COLONIZATION: new NewsType('Colonization', NF.EXPLORATION, 7, 15, 1, [GT.PUPPET_STATE], [GT.ARISTOCRACY, GT.TECHNOCRACY], []),
    CONSCRIPTION: new NewsType('Conscription', NF.MILITARY, 3, 8, 1, [GT.ANARCHY, GT.PUPPET_STATE], [GT.POLICE_STATE, GT.ARISTOCRACY], []),
    CONSTRUCTION: new NewsType('Construction', NF.LABOR, 3, 8, 1, [], [GT.CORPORATISM, GT.TECHNOCRACY], []),
    COUP_DETAT: new NewsType('Coup d\'Etat', NF.POLITICS, 2, 5, 1, [GT.ANARCHY, GT.PUPPET_STATE], [], []),
    CRACKDOWN: new NewsType('Crackdown', NF.OPPRESSION, 3, 8, 1, [GT.ANARCHY], [GT.POLICE_STATE], []),
    CRIME_WAVE: new NewsType('Crime Wave', NF.CRIME, 3, 8, 1, [GT.POLICE_STATE], [GT.ANARCHY], []),
    CULTURAL_PURGE: new NewsType('Cultural Purge', NF.OPPRESSION, 5, 15, 1, [GT.DEMOCRACY, GT.ANARCHY], [GT.POLICE_STATE, GT.THEOCRACY], []),
    CULTURAL_RENAISSANCE: new NewsType('Cultural Renaissance', NF.CULTURE, 5, 12, 1, [], [GT.DEMOCRACY, GT.ARISTOCRACY], []),
    CYBER_WARFARE: new NewsType('Cyber Warfare', NF.GEOPOLITICS, 3, 10, 1, [GT.ANARCHY, GT.PUPPET_STATE], [GT.TECHNOCRACY], []),
    DEPRESSION: new NewsType('Depression', NF.ECONOMY, 7, 15, 1, [], [GT.DEMOCRACY, GT.CORPORATISM], []),
    DISARMAMENT: new NewsType('Disarmament', NF.GEOPOLITICS, 5, 10, 1, [GT.POLICE_STATE], [], []),
    ECONOMIC_BOOM: new NewsType('Economic Boom', NF.ECONOMY, 5, 10, 1, [], [GT.CORPORATISM], []),
    BLOCKADE: new NewsType('Blockade', NF.GEOPOLITICS, 3, 30, 1, [GT.ANARCHY, GT.PUPPET_STATE, GT.CORPORATISM], [], []),
    CLONING: new NewsType('Cloning', NF.SCIENCE, 5, 15, 1, [GT.DEMOCRACY, GT.THEOCRACY], [GT.TECHNOCRACY, GT.CORPORATISM], []),
    ENSLAVEMENT: new NewsType('Enslavement', NF.GEOPOLITICS, 10, 30, 1, [GT.ANARCHY, GT.PUPPET_STATE, GT.DEMOCRACY], [GT.POLICE_STATE, GT.ARISTOCRACY], []),
    EUGENICS: new NewsType('Eugenics', NF.OPPRESSION, 5, 15, 1, [GT.DEMOCRACY, GT.ANARCHY], [GT.POLICE_STATE, GT.TECHNOCRACY, GT.ARISTOCRACY], []),
    ENVIRONMENTAL_DISASTER: new NewsType('Environmental Disaster', NF.DISASTER, 2, 6, 1, [], [], []),
    ENVIRONMENTALISM: new NewsType('Environmentalism', NF.POLITICS, 5, 15, 1, [GT.CORPORATISM], [GT.DEMOCRACY, GT.THEOCRACY], []),
    EXPLORATION: new NewsType('Exploration', NF.EXPLORATION, 5, 15, 1, [], [GT.TECHNOCRACY], []),
    FESTIVAL: new NewsType('Festival', NF.CULTURE, 2, 5, 1, [GT.POLICE_STATE], [], []),
    FORCED_LABOR: new NewsType('Forced Labor', NF.OPPRESSION, 10, 30, 1, [GT.DEMOCRACY, GT.ANARCHY], [GT.POLICE_STATE, GT.COMMUNISM, GT.CORPORATISM], []),
    FOREIGN_AID: new NewsType('Foreign Aid', NF.GEOPOLITICS, 3, 8, 1, [], [GT.DEMOCRACY, GT.THEOCRACY], []),
    GENOCIDE: new NewsType('Genocide', NF.OPPRESSION, 5, 15, 1, [GT.ANARCHY, GT.DEMOCRACY], [GT.POLICE_STATE, GT.ARISTOCRACY], []),
    IMMIGRATION: new NewsType('Immigration', NF.CULTURE, 5, 10, 1, [], [GT.DEMOCRACY, GT.CORPORATISM], [GT.POLICE_STATE, GT.COMMUNISM]),
    REFUGEES: new NewsType('Refugees', NF.CULTURE, 3, 10, 1, [], [GT.DEMOCRACY, GT.THEOCRACY], [GT.POLICE_STATE]),
    DEPORTATION: new NewsType('Deportation Campaign', NF.OPPRESSION, 3, 8, 1, [GT.DEMOCRACY, GT.ANARCHY], [GT.POLICE_STATE, GT.ARISTOCRACY], []),
    ASYLUM_POLICY: new NewsType('Asylum Policy', NF.CULTURE, 5, 12, 1, [GT.ANARCHY], [GT.DEMOCRACY], [GT.POLICE_STATE]),
    DIASPORA_RETURNS: new NewsType('Diaspora Returns', NF.CULTURE, 5, 15, 1, [], [GT.DEMOCRACY, GT.CORPORATISM], []),
    INDUSTRIAL_ACCIDENT: new NewsType('Industrial Accident', NF.HEALTH_HAZARD, 2, 5, 1, [], [GT.CORPORATISM], []),
    RELIGION_INQUISITION: new NewsType('Inquisition', NF.RELIGION, 5, 12, 1, [GT.DEMOCRACY, GT.ANARCHY], [GT.THEOCRACY, GT.POLICE_STATE], []),
    BANKRUPTCY: new NewsType('Bankruptcy', NF.ECONOMY, 3, 8, 1, [GT.COMMUNISM], [GT.CORPORATISM, GT.DEMOCRACY], []),
    LAND_GRAB: new NewsType('Imperialism', NF.GEOPOLITICS, 10, 30, 1, [GT.ANARCHY, GT.PUPPET_STATE], [GT.ARISTOCRACY, GT.POLICE_STATE, GT.THEOCRACY], []),
    INVESTMENT: new NewsType('Investment', NF.ECONOMY, 5, 10, 1, [], [GT.CORPORATISM], []),
    LUDDITISM: new NewsType('Ludditism', NF.UNREST, 3, 8, 1, [GT.TECHNOCRACY, GT.CORPORATISM], [GT.THEOCRACY], []),
    MILITARY_BUILDUP: new NewsType('Military Buildup', NF.MILITARY, 5, 10, 1, [GT.ANARCHY, GT.PUPPET_STATE], [GT.POLICE_STATE, GT.ARISTOCRACY], []),
    OLIGARCHY: new NewsType('Oligarchy', NF.POLITICS, 5, 15, 1, [GT.COMMUNISM], [GT.CORPORATISM], []),
    ORGANIZED_CRIME: new NewsType('Organized Crime', NF.CRIME, 3, 8, 1, [GT.POLICE_STATE], [GT.ANARCHY, GT.CORPORATISM], []),
    PLAGUE: new NewsType('Plague', NF.HEALTH_HAZARD, 2, 6, 1, [], [], []),
    LIFE_EXTENSION: new NewsType('Life Extension', NF.SCIENCE, 8, 20, 1, [GT.ANARCHY, GT.THEOCRACY], [GT.TECHNOCRACY, GT.CORPORATISM], []),
    BIOWEAPON: new NewsType('Bioweapon Development', NF.MILITARY, 5, 12, 1, [GT.DEMOCRACY, GT.ANARCHY], [GT.POLICE_STATE, GT.ARISTOCRACY], []),
    PLAGUE_SPREAD: new NewsType('Plague Spread', NF.HEALTH_HAZARD, 2, 6, 1, [], [], []),
    PLAGUE_VACCINE: new NewsType('Plague Vaccine', NF.SCIENCE, 5, 15, 1, [GT.ANARCHY, GT.PUPPET_STATE], [GT.DEMOCRACY, GT.TECHNOCRACY], []),
    POLICY_CHANGE: new NewsType('Policy Change', NF.POLITICS, 3, 8, 1, [GT.ANARCHY, GT.PUPPET_STATE], [], []),
    RAIDING: new NewsType('Raiding', NF.GEOPOLITICS, 15, 30, 1, [GT.DEMOCRACY, GT.PUPPET_STATE], [GT.ANARCHY, GT.ARISTOCRACY, GT.THEOCRACY], []),
    RESEARCH_AGREEMENT: new NewsType('Research Agreement', NF.GEOPOLITICS, 2, 8, 1, [], [GT.TECHNOCRACY, GT.DEMOCRACY], []),
    RELIGION_REVIVAL: new NewsType('Religious Revival', NF.RELIGION, 10, 20, 1, [GT.TECHNOCRACY], [GT.THEOCRACY], []),
    RELIGION_PROSELYTIZE: new NewsType('Religious Proselytization', NF.RELIGION, 5, 15, 1, [GT.TECHNOCRACY], [GT.THEOCRACY, GT.ARISTOCRACY], []),
    RELIGION_HOLY_WAR: new NewsType('Holy War', NF.RELIGION, 10, 30, 100, [GT.TECHNOCRACY, GT.DEMOCRACY, GT.PUPPET_STATE], [GT.THEOCRACY, GT.ARISTOCRACY], []),
    RELIGION_GRAND_COUNCIL: new NewsType('Grand Religious Council', NF.RELIGION, 2, 8, 1, [GT.TECHNOCRACY], [GT.THEOCRACY], []),
    RELIGION_CONQUEST: new NewsType('Religious Conquest', NF.RELIGION, 15, 40, 150, [GT.TECHNOCRACY, GT.DEMOCRACY, GT.PUPPET_STATE, GT.ANARCHY], [GT.THEOCRACY, GT.ARISTOCRACY, GT.POLICE_STATE], []),
    RELIGIOUS_TURMOIL: new NewsType('Religious Turmoil', NF.RELIGION, 5, 15, 1, [GT.TECHNOCRACY, GT.DEMOCRACY], [GT.THEOCRACY, GT.POLICE_STATE], []),
    RELIGIOUS_CONVERSION: new NewsType('Religious Conversion', NF.RELIGION, 8, 20, 1, [GT.TECHNOCRACY], [GT.THEOCRACY, GT.ARISTOCRACY], []),
    REVOLUTION: new NewsType('Revolution', NF.POLITICS, 3, 8, 1, [GT.PUPPET_STATE], [], []),
    SANCTIONS: new NewsType('Sanctions', NF.GEOPOLITICS, 3, 15, 1, [GT.ANARCHY, GT.PUPPET_STATE, GT.CORPORATISM], [GT.DEMOCRACY], []),
    SCARCITY: new NewsType('Scarcity', NF.ECONOMY, 3, 8, 1, [], [], []),
    SCIENTIFIC_BREAKTHROUGH: new NewsType('Scientific Breakthrough', NF.SCIENCE, 1, 4, 1, [], [GT.TECHNOCRACY], []),
    SUPER_SOLDIERS: new NewsType('Super Soldiers', NF.MILITARY, 7, 15, 1, [GT.DEMOCRACY, GT.ANARCHY], [GT.POLICE_STATE, GT.TECHNOCRACY], []),
    COLONY_SHIP: new NewsType('Colony Ship', NF.SCIENCE, 10, 30, 1, [GT.ANARCHY, GT.PUPPET_STATE], [GT.TECHNOCRACY, GT.CORPORATISM], []),
    MEGA_AI: new NewsType('Mega AI', NF.SCIENCE, 5, 15, 1, [GT.ANARCHY, GT.THEOCRACY], [GT.TECHNOCRACY], []),
    ADVANCED_NANITES: new NewsType('Advanced Nanites', NF.SCIENCE, 5, 12, 1, [], [GT.TECHNOCRACY, GT.CORPORATISM], []),
    SPACE_STATION: new NewsType('Space Station', NF.SCIENCE, 10, 25, 1, [GT.ANARCHY, GT.PUPPET_STATE], [GT.TECHNOCRACY, GT.DEMOCRACY], []),
    STOCK_MARKET_CRASH: new NewsType('Stock Market Crash', NF.ECONOMY, 3, 8, 1, [GT.COMMUNISM], [GT.CORPORATISM], []),
    SURPLUS: new NewsType('Surplus', NF.LABOR, 3, 8, 1, [], [], []),
    PLANETARY_DEFENSE: new NewsType('Planetary Defense Platform', NF.LABOR, 5, 15, 1, [GT.ANARCHY, GT.PUPPET_STATE], [GT.POLICE_STATE, GT.ARISTOCRACY], []),
    SPACE_ELEVATOR: new NewsType('Space Elevator', NF.LABOR, 8, 20, 1, [GT.ANARCHY, GT.PUPPET_STATE], [GT.TECHNOCRACY, GT.CORPORATISM], []),
    ANTIMATTER_GRID: new NewsType('Antimatter Power Grid', NF.LABOR, 8, 20, 1, [GT.ANARCHY, GT.THEOCRACY], [GT.TECHNOCRACY, GT.CORPORATISM], []),
    MEGACITY: new NewsType('Megacity', NF.LABOR, 10, 25, 1, [GT.ANARCHY, GT.PUPPET_STATE], [GT.CORPORATISM, GT.DEMOCRACY], []),
    LABOR_STRIKES: new NewsType('Labor Strikes', NF.LABOR, 2, 8, 1, [GT.PUPPET_STATE], [GT.DEMOCRACY, GT.CORPORATISM], []),
    AUTOMATION_CRISIS: new NewsType('Automation Crisis', NF.LABOR, 3, 10, 1, [GT.ANARCHY, GT.PUPPET_STATE], [GT.TECHNOCRACY, GT.CORPORATISM], []),
    ARTIFACTS_DISCOVERED: new NewsType('Artifacts Discovered', NF.EXPLORATION, 4, 12, 1, [GT.ANARCHY, GT.PUPPET_STATE], [GT.TECHNOCRACY], []),
    ALIEN_LIFE_DISCOVERED: new NewsType('Alien Life Discovered', NF.EXPLORATION, 3, 10, 1, [GT.ANARCHY, GT.PUPPET_STATE], [GT.TECHNOCRACY, GT.DEMOCRACY], []),
    RUINS_DISCOVERED: new NewsType('Ruins Discovered', NF.EXPLORATION, 5, 15, 1, [GT.ANARCHY, GT.PUPPET_STATE], [GT.TECHNOCRACY], []),
    INDOCTRINATION_PROGRAM: new NewsType('Indoctrination Program', NF.OPPRESSION, 3, 10, 1, [GT.DEMOCRACY, GT.ANARCHY], [GT.POLICE_STATE, GT.THEOCRACY], []),
    BRAIN_DRAIN: new NewsType('Brain Drain', NF.GEOPOLITICS, 4, 12, 1, [GT.PUPPET_STATE], [GT.POLICE_STATE, GT.THEOCRACY], [GT.ANARCHY, GT.TECHNOCRACY, GT.DEMOCRACY]),
    PHILOSOPHICAL_DEBATES: new NewsType('Philosophical Debates', NF.CULTURE, 3, 8, 1, [GT.POLICE_STATE, GT.ANARCHY], [GT.DEMOCRACY, GT.ARISTOCRACY], []),
    KNOWLEDGE_CODEX: new NewsType('Knowledge Codex', NF.SCIENCE, 5, 15, 1, [GT.ANARCHY, GT.PUPPET_STATE], [GT.TECHNOCRACY, GT.DEMOCRACY], []),
    PROPAGANDA_CAMPAIGN: new NewsType('Propaganda Campaign', NF.POLITICS, 3, 10, 1, [GT.ANARCHY, GT.PUPPET_STATE], [GT.POLICE_STATE, GT.CORPORATISM], []),
    SOLAR_HARVESTERS: new NewsType('Solar Harvesters', NF.SCIENCE, 8, 20, 1, [GT.ANARCHY, GT.PUPPET_STATE], [GT.TECHNOCRACY, GT.CORPORATISM], []),
    EXPERIMENTAL_ENERGY: new NewsType('Experimental Energy', NF.SCIENCE, 5, 15, 1, [GT.ANARCHY, GT.PUPPET_STATE], [GT.TECHNOCRACY], []),
    BLACK_MARKET: new NewsType('Black Market', NF.CRIME, 5, 12, 1, [GT.ANARCHY], [GT.POLICE_STATE, GT.THEOCRACY], []),
    GUNBOAT_DIPLOMACY: new NewsType('Gunboat Diplomacy', NF.GEOPOLITICS, 3, 10, 1, [GT.ANARCHY, GT.PUPPET_STATE, GT.DEMOCRACY], [GT.POLICE_STATE, GT.ARISTOCRACY], []),
    OPPRESSED_MINORITY: new NewsType('Oppressed Minority', NF.OPPRESSION, 5, 15, 1, [GT.ANARCHY, GT.PUPPET_STATE], [GT.POLICE_STATE, GT.THEOCRACY], []),
    SPY_NETWORK: new NewsType('Spy Network', NF.ESPIONAGE, 5, 15, 1, [GT.ANARCHY, GT.PUPPET_STATE, GT.DEMOCRACY], [GT.POLICE_STATE, GT.TECHNOCRACY], []),
    SURVEILLANCE_NETWORK: new NewsType('Surveillance Network', NF.ESPIONAGE, 3, 10, 1, [GT.DEMOCRACY, GT.ANARCHY], [GT.POLICE_STATE, GT.TECHNOCRACY], []),
    WAR_CODE_BREAK: new NewsType('War Code Break', NF.ESPIONAGE, 2, 8, 1, [GT.ANARCHY, GT.PUPPET_STATE], [GT.TECHNOCRACY], []),
    DISASTER_FLARE: new NewsType('Solar Flare', NF.DISASTER, 1, 3, 1, [], [], []),
    DISASTER_ASTEROID: new NewsType('Asteroid Impact', NF.DISASTER, 2, 5, 1, [], [], []),
    DISASTER_VOLCANO: new NewsType('Volcanic Eruptions', NF.DISASTER, 2, 6, 1, [], [], []),
    DISASTER_EARTHQUAKES: new NewsType('Earthquakes', NF.DISASTER, 2, 5, 1, [], [], []),
    DISASTER_GREENHOUSE: new NewsType('Greenhouse Effect', NF.DISASTER, 5, 15, 1, [], [GT.CORPORATISM], []),
    DISASTER_STORM: new NewsType('Mega-Storm', NF.DISASTER, 2, 6, 1, [], [], []),
    DISASTER_TSUNAMI: new NewsType('Tsunami', NF.DISASTER, 1, 4, 1, [], [], []),
    PIRATE_HAVEN: new NewsType('Pirate Haven', NF.CRIME, 5, 20, 1, [GT.POLICE_STATE], [GT.ANARCHY, GT.PUPPET_STATE], []),
    PIRATE_ARMADA: new NewsType('Pirate Armada', NF.CRIME, 3, 10, 1, [GT.ANARCHY], [GT.CORPORATISM, GT.ARISTOCRACY], []),
    MUTATIONS: new NewsType('Mutations', NF.HEALTH_HAZARD, 5, 15, 1, [], [], []),
    TERRORISM: new NewsType('Terrorism', NF.CRIME, 5, 15, 1, [GT.DEMOCRACY, GT.PUPPET_STATE], [GT.POLICE_STATE, GT.THEOCRACY, GT.ANARCHY], [GT.POLICE_STATE]),
    TENSIONS: new NewsType('Tensions', NF.GEOPOLITICS, 5, 40, 1, [GT.PUPPET_STATE, GT.ANARCHY], [], []), //two neutral planets have relations changed to hostile
    TENSIONS_RELIGIOUS: new NewsType('Religious Tensions', NF.GEOPOLITICS, 5, 40, 1, [GT.PUPPET_STATE, GT.ANARCHY], [], []), //two neutral planets with different state religions and majority religions
    TENSIONS_ETHNIC: new NewsType('Ethnic Tensions', NF.GEOPOLITICS, 5, 40, 1, [GT.PUPPET_STATE, GT.ANARCHY], [], []), //two neutral planets with different majority races
    TENSIONS_ECONOMIC: new NewsType('Economic Tensions', NF.GEOPOLITICS, 5, 40, 1, [GT.PUPPET_STATE, GT.ANARCHY], [], []), //the two strongest economies clash
    TENSIONS_BORDERS: new NewsType('Border Tensions', NF.GEOPOLITICS, 5, 40, 1, [GT.PUPPET_STATE, GT.ANARCHY], [], []), //two nearby planets with large territories
    TERRAFORMING: new NewsType('Terraforming', NF.SCIENCE, 5, 40, 1, [], [GT.TECHNOCRACY, GT.CORPORATISM], []), //two neutral planets have relations changed to hostile
    TOURISM: new NewsType('Tourism', NF.CULTURE, 3, 8, 1, [], [GT.DEMOCRACY, GT.CORPORATISM], []),
    TRADE_AGREEMENT: new NewsType('Trade Agreement', NF.GEOPOLITICS, 10, 20, 1, [], [GT.CORPORATISM, GT.DEMOCRACY], []), //two neutral or allied planets have improved trade relations
    WAR: new NewsType('War', NF.WAR, 5, 20, 100, [GT.ANARCHY, GT.PUPPET_STATE], [GT.POLICE_STATE, GT.ARISTOCRACY], []), //two planets where at least one was hostile go to war
    WAR_ALLY: new NewsType('War Ally', NF.WAR, 3, 15, 150, [], [GT.ARISTOCRACY, GT.DEMOCRACY], []),
    WAR_BOMBARDMENT: new NewsType('War: Bombardment', NF.WAR, 0.1, 0.5, 200, [], [GT.TECHNOCRACY], []), //the target planet loses some buildings (temporarily disabled)
    WAR_CONVERT_INDUSTRY: new NewsType('War Industry', NF.WAR, 999, 999, 1, [], [], []),
    WAR_HUMAN_WAVE: new NewsType('War: Human Wave', NF.WAR, 0.5, 2, 150, [GT.DEMOCRACY], [GT.POLICE_STATE, GT.COMMUNISM], []),
    WAR_INVASION: new NewsType('War: Invasion', NF.WAR, 1, 5, 150, [], [GT.POLICE_STATE, GT.ARISTOCRACY], []),
    WAR_OFFENSIVE: new NewsType('War: Offensive', NF.WAR, 1, 5, 150, [], [], []),
    WAR_SABOTAGE: new NewsType('War: Sabotage', NF.WAR, 0.5, 2, 150, [], [GT.TECHNOCRACY, GT.ANARCHY], []),
    WAR_SCORCHED_EARTH: new NewsType('War: Scorched Earth', NF.WAR, 0.5, 2, 150, [], [GT.COMMUNISM], []),
    WAR_SUBJUGATION: new NewsType('War: Subjugation', NF.WAR, 25, 100, 200, [], [GT.POLICE_STATE, GT.ARISTOCRACY, GT.COMMUNISM], []),
    WAR_SURRENDER: new NewsType('War: Surrender', NF.WAR, 0.1, 0.5, 250, [], [], []),
    //more to come later: environmental disasters, terraforming, etc.
}

const NT_ALL = Object.values(NT)
//dont include tensions below, not hostile enough
const NT_WARLIKE = [NT.WAR, NT.WAR_ALLY, NT.WAR_BOMBARDMENT, NT.WAR_HUMAN_WAVE, NT.WAR_INVASION, NT.WAR_OFFENSIVE, NT.WAR_SABOTAGE, NT.WAR_SCORCHED_EARTH, NT.WAR_SUBJUGATION, NT.WAR_SURRENDER]
const NT_TENSIONS_ALL = [NT.TENSIONS, NT.TENSIONS_RELIGIOUS, NT.TENSIONS_ETHNIC, NT.TENSIONS_ECONOMIC, NT.TENSIONS_BORDERS]
const NT_ALLIANCE_ALL = [NT.ALLIANCE, NT.ALLIANCE_RELIGIOUS, NT.ALLIANCE_GOVERNMENT, NT.ALLIANCE_ETHNIC]
const NT_COOPERATION_PREVENTING = [...NT_WARLIKE, NT.BLOCKADE, ...NT_TENSIONS_ALL, NT.COUP_DETAT, NT.PLAGUE, NT.PLAGUE_SPREAD, NT.DEPORTATION]
const NT_COOPERATIVE = [...NT_ALLIANCE_ALL, NT.TRADE_AGREEMENT, NT.RESEARCH_AGREEMENT, NT.INVESTMENT, NT.ARMS_DEAL, NT.SPACE_STATION]
const NT_MARTIAL = [...NT_WARLIKE, NT.MILITARY_BUILDUP, NT.BLOCKADE, NT.CIVIL_WAR, NT.ARMS_DEAL, NT.COUP_DETAT]
const NT_DANGEROUS = [...NT_WARLIKE, NT.CIVIL_WAR, NT.CIVIL_STRIFE, NT.COUP_DETAT, NT.PLAGUE, NT.PLAGUE_SPREAD, NT.ENVIRONMENTAL_DISASTER]
const NT_ECONOMY_PREVENTING = [NT.DEPRESSION, NT.SCARCITY, NT.PLAGUE, NT.ENVIRONMENTAL_DISASTER, NT.BLOCKADE, NT.STOCK_MARKET_CRASH, NT.LABOR_STRIKES]
const NT_ECONOMY_BOOSTING = [NT.ECONOMIC_BOOM, NT.SCIENTIFIC_BREAKTHROUGH, NT.INVESTMENT, NT.SURPLUS, NT.FOREIGN_AID]
const NT_CRIME_PREVENTING = [NT.CRACKDOWN, NT.GENOCIDE]
const NT_GOVERNANCE_PREVENTING = [NT.REVOLUTION, NT.CIVIL_WAR]

const META_NT = {
    SYSTEM_AT_WAR: new NewsType('System at War', NF.WAR, 10, 30, 1000),
    SYSTEM_WIDE_PLAGUE: new NewsType('System Wide Plague', NF.HEALTH_HAZARD, 5, 15, 1000),
}
const META_NT_ALL = Object.values(META_NT)