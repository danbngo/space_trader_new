/**
 * Represents a type of news event that can occur in the game.
 * @class NewsType
 */
class NewsType {
    /**
     * @param {string} name - The name of the news type.
     * @param {NewsFlavor} newsFlavor - The flavor associated with this news type.
     * @param {number} weight - This event's likelihood relative to the others
     * @param {number} minYears - The minimum duration in years this news event can last.
     * @param {number} maxYears - The maximum duration in years this news event can last.
     * @param {number} displayPriority - The display priority when multiple news events occur in the same year.
     * @param {GovernmentType[]} forbiddenGovs - Government types that cannot have this news event.
     * @param {GovernmentType[]} favoriteGovs - Government types that are more likely to have this news event.
     * @param {GovernmentType[]} immuneGovs - Government types that are immune to this news event.
     */
    constructor(
        name = '', newsFlavor = NF_ALL[0], weight = 1.0, minYears = null, maxYears = null, displayPriority = 0, 
        forbiddenGovs = [], favoriteGovs = [], immuneGovs = []
    ) {
        /** @type {string} */
        this.name = name
        /** @type {NewsFlavor} */
        this.newsFlavor = newsFlavor
        /** @type {number} */
        this.weight = weight;
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
    }
}

const NT = {
    ADDICTION: new NewsType('Addiction', NF.HEALTH_HAZARD, 1, 3, 8, 1, [], [], [GT.POLICE_STATE]),
    ALLIANCE: new NewsType('Alliance', NF.PEACE, 1, 10, 40, 1, [GT.ANARCHY, GT.PUPPET_STATE], [GT.DEMOCRACY], []), //two neutral planets become allies
    ARMS_DEAL: new NewsType('Arms Deal', NF.MILITARY, 1, 2, 5, 1, [GT.ANARCHY, GT.PUPPET_STATE], [GT.CORPORATISM], []), //one planet sends military equipment to another
    CIVIL_STRIFE: new NewsType('Civil Strife', NF.UNREST, 1, 3, 8, 1, [GT.POLICE_STATE], [], []),
    CIVIL_WAR: new NewsType('Civil War', NF.WAR, 1, 3, 15, 1, [GT.ANARCHY, GT.PUPPET_STATE], [], []),
    COALITION: new NewsType('Coalition', NF.POLITICS, 1, 10, 30, 300, [GT.PUPPET_STATE], [], []),
    COLONIZATION: new NewsType('Colonization', NF.EXPLORATION, 1, 7, 15, 1, [GT.PUPPET_STATE], [GT.ARISTOCRACY, GT.TECHNOCRACY], []),
    CONSCRIPTION: new NewsType('Conscription', NF.MILITARY, 1, 3, 8, 1, [GT.ANARCHY, GT.PUPPET_STATE], [GT.POLICE_STATE, GT.ARISTOCRACY], []),
    CONSTRUCTION: new NewsType('Construction', NF.LABOR, 1, 3, 8, 1, [], [GT.CORPORATISM, GT.TECHNOCRACY], []),
    COUP_DETAT: new NewsType('Coup d\'Etat', NF.ESPIONAGE, 1, 2, 5, 1, [GT.ANARCHY, GT.PUPPET_STATE], [], []),
    CRACKDOWN: new NewsType('Crackdown', NF.CRIME, 1, 3, 8, 1, [GT.ANARCHY], [GT.POLICE_STATE], []),
    CRIME_WAVE: new NewsType('Crime Wave', NF.CRIME, 1, 3, 8, 1, [GT.POLICE_STATE], [GT.ANARCHY], []),
    CULTURAL_PURGE: new NewsType('Cultural Purge', NF.OPPRESSION, 1, 5, 15, 1, [GT.DEMOCRACY, GT.ANARCHY], [GT.POLICE_STATE, GT.THEOCRACY], []),
    CULTURAL_RENAISSANCE: new NewsType('Cultural Renaissance', NF.CULTURE, 1, 5, 12, 1, [], [GT.DEMOCRACY, GT.ARISTOCRACY], []),
    CYBER_WARFARE: new NewsType('Cyber Warfare', NF.ESPIONAGE, 1, 3, 10, 1, [GT.ANARCHY, GT.PUPPET_STATE], [GT.TECHNOCRACY], []),
    DEPRESSION: new NewsType('Depression', NF.ECONOMY, 1, 7, 15, 1, [], [GT.DEMOCRACY, GT.CORPORATISM], []),
    DISARMAMENT: new NewsType('Disarmament', NF.PEACE, 1, 5, 10, 1, [GT.POLICE_STATE], [], []),
    ECONOMIC_BOOM: new NewsType('Economic Boom', NF.ECONOMY, 1, 5, 10, 1, [], [GT.CORPORATISM], []),
    BLOCKADE: new NewsType('Blockade', NF.ECONOMY, 1, 3, 30, 1, [GT.ANARCHY, GT.PUPPET_STATE, GT.CORPORATISM], [], []),
    CLONING: new NewsType('Cloning', NF.SCIENCE, 1, 5, 15, 1, [GT.DEMOCRACY, GT.THEOCRACY], [GT.TECHNOCRACY, GT.CORPORATISM], []),
    ENSLAVEMENT: new NewsType('Enslavement', NF.OPPRESSION, 1, 10, 30, 1, [GT.ANARCHY, GT.PUPPET_STATE, GT.DEMOCRACY], [GT.POLICE_STATE, GT.ARISTOCRACY], []),
    EUGENICS: new NewsType('Eugenics', NF.OPPRESSION, 1, 5, 15, 1, [GT.DEMOCRACY, GT.ANARCHY], [GT.POLICE_STATE, GT.TECHNOCRACY, GT.ARISTOCRACY], []),
    ENVIRONMENTAL_DISASTER: new NewsType('Environmental Disaster', NF.HEALTH_HAZARD, 1, 2, 6, 1, [], [], []),
    ENVIRONMENTALISM: new NewsType('Environmentalism', NF.CULTURE, 1, 5, 15, 1, [GT.CORPORATISM], [GT.DEMOCRACY, GT.THEOCRACY], []),
    EXPLORATION: new NewsType('Exploration', NF.EXPLORATION, 1, 5, 15, 1, [], [GT.TECHNOCRACY], []),
    FESTIVAL: new NewsType('Festival', NF.CULTURE, 1, 2, 5, 1, [GT.POLICE_STATE], [], []),
    FORCED_LABOR: new NewsType('Forced Labor', NF.OPPRESSION, 1, 10, 30, 1, [GT.DEMOCRACY, GT.ANARCHY], [GT.POLICE_STATE, GT.COMMUNISM, GT.CORPORATISM], []),
    FOREIGN_AID: new NewsType('Foreign Aid', NF.PEACE, 1, 3, 8, 1, [], [GT.DEMOCRACY, GT.THEOCRACY], []),
    GENOCIDE: new NewsType('Genocide', NF.WAR, 1, 5, 15, 1, [GT.ANARCHY, GT.DEMOCRACY], [GT.POLICE_STATE, GT.ARISTOCRACY], []),
    IMMIGRATION: new NewsType('Immigration', NF.CULTURE, 1, 5, 10, 1, [], [GT.DEMOCRACY, GT.CORPORATISM], [GT.POLICE_STATE, GT.COMMUNISM]),
    INDUSTRIAL_ACCIDENT: new NewsType('Industrial Accident', NF.HEALTH_HAZARD, 1, 2, 5, 1, [], [GT.CORPORATISM], []),
    INQUISITION: new NewsType('Inquisition', NF.OPPRESSION, 1, 5, 12, 1, [GT.DEMOCRACY, GT.ANARCHY], [GT.THEOCRACY, GT.POLICE_STATE], []),
    BANKRUPTCY: new NewsType('Bankruptcy', NF.ECONOMY, 1, 3, 8, 1, [GT.COMMUNISM], [GT.CORPORATISM, GT.DEMOCRACY], []),
    LAND_GRAB: new NewsType('Imperialism', NF.POLITICS, 1, 10, 30, 1, [GT.ANARCHY, GT.PUPPET_STATE], [GT.ARISTOCRACY, GT.POLICE_STATE, GT.THEOCRACY], []),
    INVESTMENT: new NewsType('Investment', NF.ECONOMY, 1, 5, 10, 1, [], [GT.CORPORATISM], []),
    ISOLATIONISM: new NewsType('Isolationism', NF.POLITICS, 1, 5, 15, 1, [GT.ANARCHY, GT.PUPPET_STATE], [GT.POLICE_STATE, GT.THEOCRACY, GT.COMMUNISM], []),
    LUDDITISM: new NewsType('Ludditism', NF.UNREST, 1, 3, 8, 1, [GT.TECHNOCRACY, GT.CORPORATISM], [GT.THEOCRACY], []),
    MILITARY_BUILDUP: new NewsType('Military Buildup', NF.MILITARY, 1, 5, 10, 1, [GT.ANARCHY, GT.PUPPET_STATE], [GT.POLICE_STATE, GT.ARISTOCRACY], []),
    OLIGARCHY: new NewsType('Oligarchy', NF.ESPIONAGE, 1, 5, 15, 1, [GT.COMMUNISM], [GT.CORPORATISM], []),
    ORGANIZED_CRIME: new NewsType('Organized Crime', NF.CRIME, 1, 3, 8, 1, [GT.POLICE_STATE], [GT.ANARCHY, GT.CORPORATISM], []),
    PLAGUE: new NewsType('Plague', NF.HEALTH_HAZARD, 1, 2, 6, 1, [], [], []),
    POLICY_CHANGE: new NewsType('Policy Change', NF.POLITICS, 1, 3, 8, 1, [GT.ANARCHY, GT.PUPPET_STATE], [], []),
    RAIDING: new NewsType('Raiding', NF.MILITARY, 1, 15, 30, 1, [GT.DEMOCRACY, GT.PUPPET_STATE], [GT.ANARCHY, GT.ARISTOCRACY, GT.THEOCRACY], []),
    RESEARCH_AGREEMENT: new NewsType('Research Agreement', NF.SCIENCE, 1, 2, 8, 1, [], [GT.TECHNOCRACY, GT.DEMOCRACY], []),
    RELIGION_REVIVAL: new NewsType('Religious Revival', NF.RELIGION, 1, 10, 20, 1, [GT.TECHNOCRACY], [GT.THEOCRACY], []),
    REVOLUTION: new NewsType('Revolution', NF.POLITICS, 1, 3, 8, 1, [GT.PUPPET_STATE], [], []),
    SANCTIONS: new NewsType('Sanctions', NF.ECONOMY, 1, 3, 15, 1, [GT.ANARCHY, GT.PUPPET_STATE, GT.CORPORATISM], [GT.DEMOCRACY], []),
    SCARCITY: new NewsType('Scarcity', NF.HEALTH_HAZARD, 1, 3, 8, 1, [], [], []),
    SCIENTIFIC_BREAKTHROUGH: new NewsType('Scientific Breakthrough', NF.SCIENCE, 1, 1, 4, 1, [], [GT.TECHNOCRACY], []),
    STOCK_MARKET_CRASH: new NewsType('Stock Market Crash', NF.ECONOMY, 1, 3, 8, 1, [GT.COMMUNISM], [GT.CORPORATISM], []),
    SURPLUS: new NewsType('Surplus', NF.LABOR, 1, 3, 8, 1, [], [], []), 
    TERRORISM: new NewsType('Terrorism', NF.ESPIONAGE, 1, 5, 15, 1, [GT.DEMOCRACY, GT.PUPPET_STATE], [GT.POLICE_STATE, GT.THEOCRACY, GT.ANARCHY], [GT.POLICE_STATE]),
    TENSIONS: new NewsType('Tensions', NF.UNREST, 1, 5, 40, 1, [GT.PUPPET_STATE, GT.ANARCHY], [], []), //two neutral planets have relations changed to hostile
    TERRAFORMING: new NewsType('Terraforming', NF.LABOR, 1, 5, 40, 1, [], [GT.TECHNOCRACY, GT.CORPORATISM], []), //two neutral planets have relations changed to hostile
    TOURISM: new NewsType('Tourism', NF.CULTURE, 1, 3, 8, 1, [], [GT.DEMOCRACY, GT.CORPORATISM], []),
    TRADE_AGREEMENT: new NewsType('Trade Agreement', NF.ECONOMY, 1, 10, 20, 1, [], [GT.CORPORATISM, GT.DEMOCRACY], []), //two neutral or allied planets have improved trade relations
    WAR_ALLY: new NewsType('War Ally', NF.WAR, 1, 3, 15, 150, [], [GT.ARISTOCRACY, GT.DEMOCRACY], []),
    WAR_BOMBARDMENT: new NewsType('War: Bombardment', NF.WAR, 1, 0.1, 0.5, 200, [], [GT.TECHNOCRACY], []), //the target planet loses some buildings (temporarily disabled)
    WAR_HUMAN_WAVE: new NewsType('War: Human Wave', NF.WAR, 1, 0.5, 2, 150, [GT.DEMOCRACY], [GT.POLICE_STATE, GT.COMMUNISM], []),
    WAR_INVASION: new NewsType('War: Invasion', NF.WAR, 1, 1, 5, 150, [], [GT.POLICE_STATE, GT.ARISTOCRACY], []),
    WAR: new NewsType('War', NF.WAR, 1, 5, 20, 100, [GT.ANARCHY, GT.PUPPET_STATE], [GT.POLICE_STATE, GT.ARISTOCRACY], []), //two planets where at least one was hostile go to war
    WAR_OFFENSIVE: new NewsType('War: Offensive', NF.WAR, 1, 1, 5, 150, [], [], []),
    WAR_SABOTAGE: new NewsType('War: Sabotage', NF.WAR, 1, 0.5, 2, 150, [], [GT.TECHNOCRACY, GT.ANARCHY], []),
    WAR_SCORCHED_EARTH: new NewsType('War: Scorched Earth', NF.WAR, 1, 0.5, 2, 150, [], [GT.COMMUNISM], []),
    WAR_SUBJUGATION: new NewsType('War: Subjugation', NF.WAR, 1, 25, 100, 200, [], [GT.POLICE_STATE, GT.ARISTOCRACY, GT.COMMUNISM], []),
    WAR_SURRENDER: new NewsType('War: Surrender', NF.WAR, 1, 0.1, 0.5, 250, [], [], []),
    //more to come later: environmental disasters, terraforming, etc.
}

const NT_ALL = Object.values(NT)
//dont include tensions below, not hostile enough
const NT_WARLIKE = [NT.WAR, NT.WAR_ALLY, NT.WAR_BOMBARDMENT, NT.WAR_HUMAN_WAVE, NT.WAR_INVASION, NT.WAR_OFFENSIVE, NT.WAR_SABOTAGE, NT.WAR_SCORCHED_EARTH, NT.WAR_SUBJUGATION, NT.WAR_SURRENDER]
const NT_COOPERATION_PREVENTING = [...NT_WARLIKE, NT.BLOCKADE, NT.TENSIONS, NT.COUP_DETAT, NT.PLAGUE]
const NT_COOPERATIVE = [NT.ALLIANCE, NT.TRADE_AGREEMENT, NT.RESEARCH_AGREEMENT, NT.INVESTMENT, NT.ARMS_DEAL]
const NT_MARTIAL = [...NT_WARLIKE, NT.MILITARY_BUILDUP, NT.BLOCKADE, NT.CIVIL_WAR, NT.ARMS_DEAL, NT.COUP_DETAT]
const NT_DANGEROUS = [...NT_WARLIKE, NT.CIVIL_WAR, NT.CIVIL_STRIFE, NT.COUP_DETAT, NT.PLAGUE, NT.ENVIRONMENTAL_DISASTER]
const NT_ECONOMY_PREVENTING = [NT.DEPRESSION, NT.SCARCITY, NT.PLAGUE, NT.ENVIRONMENTAL_DISASTER, NT.BLOCKADE, NT.STOCK_MARKET_CRASH]
const NT_ECONOMY_BOOSTING = [NT.ECONOMIC_BOOM, NT.SCIENTIFIC_BREAKTHROUGH, NT.INVESTMENT, NT.SURPLUS, NT.FOREIGN_AID]
const NT_CRIME_PREVENTING = [NT.CRACKDOWN, NT.GENOCIDE]
const NT_GOVERNANCE_PREVENTING = [NT.REVOLUTION, NT.CIVIL_WAR]

const META_NT = {
    SYSTEM_AT_WAR: new NewsType('System at War', NF.WAR, 1, 10, 30, 1000),
    SYSTEM_WIDE_PLAGUE: new NewsType('System Wide Plague', NF.HEALTH_HAZARD, 1, 5, 15, 1000),
}
const META_NT_ALL = Object.values(META_NT)