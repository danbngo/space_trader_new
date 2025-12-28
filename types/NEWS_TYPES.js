/**
 * Represents a type of news event that can occur in the game.
 * @class NewsType
 */
class NewsType {
    /**
     * @param {string} name - The name of the news type.
     * @param {number[]} color - The color associated with this news type.
     * @param {number} weight - This event's likelihood relative to the others
     * @param {number} minYears - The minimum duration in years this news event can last.
     * @param {number} maxYears - The maximum duration in years this news event can last.
     * @param {number} displayPriority - The display priority when multiple news events occur in the same year.
     * @param {GovernmentType[]} forbiddenGovs - Government types that cannot have this news event.
     * @param {GovernmentType[]} favoriteGovs - Government types that are more likely to have this news event.
     * @param {GovernmentType[]} immuneGovs - Government types that are immune to this news event.
     */
    constructor(
        name = '', color = COLORS.White, weight = 1.0, minYears = null, maxYears = null, displayPriority = 0, 
        forbiddenGovs = [], favoriteGovs = [], immuneGovs = []
    ) {
        /** @type {string} */
        this.name = name
        /** @type {number[]} */
        this.color = color;
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
    ADDICTION: new NewsType('Addiction', COLORS.Orange, 1, 3, 8, 1, [], [], [GT.POLICE_STATE]),
    ALLIANCE: new NewsType('Alliance', COLORS.Green, 1, 10, 40, 1, [GT.ANARCHY, GT.PUPPET_STATE], [GT.DEMOCRACY], []), //two neutral planets become allies
    ARMS_DEAL: new NewsType('Arms Deal', COLORS.LightOrange, 1, 3, 8, 1, [GT.ANARCHY, GT.PUPPET_STATE], [GT.CORPORATISM], []), //one planet sends military equipment to another
    CIVIL_STRIFE: new NewsType('Civil Strife', COLORS.Yellow, 1, 3, 8, 1, [GT.POLICE_STATE], [], []),
    CIVIL_WAR: new NewsType('Civil War', COLORS.Red, 1, 3, 15, 1, [GT.ANARCHY, GT.POLICE_STATE, GT.PUPPET_STATE], [], []),
    COALITION: new NewsType('Coalition', COLORS.LightRed, 1, 10, 30, 300, [GT.PUPPET_STATE], [], []),
    COLONIZATION: new NewsType('Colonization', COLORS.LightGreen, 1, 7, 15, 1, [GT.PUPPET_STATE], [GT.ARISTOCRACY, GT.TECHNOCRACY], []),
    CONSCRIPTION: new NewsType('Conscription', COLORS.LightRed, 1, 3, 8, 1, [GT.ANARCHY, GT.PUPPET_STATE], [GT.POLICE_STATE, GT.ARISTOCRACY], []),
    CONSTRUCTION: new NewsType('Construction', COLORS.Green, 1, 3, 8, 1, [], [GT.CORPORATISM, GT.TECHNOCRACY], []),
    COUP_DETAT: new NewsType('Coup d\'Etat', COLORS.Red, 1, 2, 5, 1, [GT.ANARCHY, GT.PUPPET_STATE], [], []),
    CRACKDOWN: new NewsType('Crackdown', COLORS.LightGray, 1, 3, 8, 1, [GT.ANARCHY], [GT.POLICE_STATE], []),
    CRIME_WAVE: new NewsType('Crime Wave', COLORS.Orange, 1, 3, 8, 1, [GT.POLICE_STATE], [GT.ANARCHY], []),
    DEPRESSION: new NewsType('Depression', COLORS.Orange, 1, 7, 15, 1, [], [GT.DEMOCRACY, GT.CORPORATISM], []),
    DISARMAMENT: new NewsType('Disarmament', COLORS.LightGreen, 1, 5, 10, 1, [GT.POLICE_STATE], [], []),
    ECONOMIC_BOOM: new NewsType('Economic Boom', COLORS.LightGreen, 1, 5, 10, 1, [], [GT.CORPORATISM], []),
    EMBARGO: new NewsType('Embargo', COLORS.LightRed, 1, 3, 30, 1, [GT.ANARCHY, GT.PUPPET_STATE, GT.CORPORATISM], [], []),
    ENSLAVEMENT: new NewsType('Enslavement', COLORS.Purple, 1, 10, 30, 1, [GT.ANARCHY, GT.PUPPET_STATE, GT.DEMOCRACY], [GT.POLICE_STATE, GT.ARISTOCRACY], []),
    ENVIRONMENTAL_DISASTER: new NewsType('Environmental Disaster', COLORS.Orange, 1, 2, 6, 1, [], [], []),
    ENVIRONMENTALISM: new NewsType('Environmentalism', COLORS.LightGreen, 1, 5, 15, 1, [GT.CORPORATISM], [GT.DEMOCRACY, GT.THEOCRACY], []),
    EXPLORATION: new NewsType('Exploration', COLORS.LightBlue, 1, 5, 15, 1, [], [GT.TECHNOCRACY], []),
    FESTIVAL: new NewsType('Festival', COLORS.LightCyan, 1, 2, 5, 1, [GT.POLICE_STATE], [], []),
    FORCED_LABOR: new NewsType('Forced Labor', COLORS.Purple, 1, 10, 30, 1, [GT.DEMOCRACY, GT.ANARCHY], [GT.POLICE_STATE, GT.COMMUNISM, GT.CORPORATISM], []),
    FOREIGN_AID: new NewsType('Foreign Aid', COLORS.LightBlue, 1, 3, 8, 1, [], [GT.DEMOCRACY, GT.THEOCRACY], []),
    GENOCIDE: new NewsType('Genocide', COLORS.DarkRed, 1, 5, 15, 1, [GT.ANARCHY, GT.DEMOCRACY], [GT.POLICE_STATE, GT.ARISTOCRACY], []),
    IMMIGRATION: new NewsType('Immigration', COLORS.LightGray, 1, 5, 10, 1, [], [GT.DEMOCRACY, GT.CORPORATISM], [GT.POLICE_STATE, GT.COMMUNISM]),
    IMPERIALISM: new NewsType('Imperialism', COLORS.Purple, 1, 10, 30, 1, [GT.ANARCHY, GT.PUPPET_STATE], [GT.ARISTOCRACY, GT.POLICE_STATE, GT.THEOCRACY], []),
    INVESTMENT: new NewsType('Investment', COLORS.LightGreen, 1, 5, 10, 1, [], [GT.CORPORATISM], []),
    ISOLATIONISM: new NewsType('Isolationism', COLORS.DimGray, 1, 5, 15, 1, [GT.ANARCHY, GT.PUPPET_STATE], [GT.POLICE_STATE, GT.THEOCRACY, GT.COMMUNISM], []),
    LUDDITISM: new NewsType('Ludditism', COLORS.DimGray, 1, 3, 8, 1, [GT.TECHNOCRACY, GT.CORPORATISM], [GT.THEOCRACY], []),
    MILITARY_BUILDUP: new NewsType('Military Buildup', COLORS.LightRed, 1, 5, 10, 1, [GT.ANARCHY, GT.PUPPET_STATE], [GT.POLICE_STATE, GT.ARISTOCRACY], []),
    OLIGARCHY: new NewsType('Oligarchy', COLORS.Yellow, 1, 5, 15, 1, [GT.COMMUNISM], [GT.CORPORATISM], []),
    ORGANIZED_CRIME: new NewsType('Organized Crime', COLORS.Orange, 1, 3, 8, 1, [GT.POLICE_STATE], [GT.ANARCHY, GT.CORPORATISM], []),
    PLAGUE: new NewsType('Plague', COLORS.Red, 1, 2, 6, 1, [], [], []),
    RAIDING: new NewsType('Raiding', COLORS.Orange, 1, 15, 30, 1, [GT.DEMOCRACY, GT.PUPPET_STATE], [GT.ANARCHY, GT.ARISTOCRACY, GT.THEOCRACY], []),
    RESEARCH_AGREEMENT: new NewsType('Research Agreement', COLORS.LightGreen, 1, 2, 8, 1, [], [GT.TECHNOCRACY, GT.DEMOCRACY], []),
    REVIVAL: new NewsType('Religious Revival', COLORS.White, 1, 10, 20, 1, [GT.TECHNOCRACY], [GT.THEOCRACY], []),
    REVOLUTION: new NewsType('Revolution', COLORS.Yellow, 1, 3, 8, 1, [GT.PUPPET_STATE], [], []),
    SANCTIONS: new NewsType('Sanctions', COLORS.LightRed, 1, 3, 15, 1, [GT.ANARCHY, GT.PUPPET_STATE, GT.CORPORATISM], [GT.DEMOCRACY], []),
    SCARCITY: new NewsType('Scarcity', COLORS.Orange, 1, 3, 8, 1, [], [], []),
    SCIENTIFIC_BREAKTHROUGH: new NewsType('Scientific Breakthrough', COLORS.Green, 1, 1, 4, 1, [], [GT.TECHNOCRACY], []),
    STOCK_MARKET_CRASH: new NewsType('Stock Market Crash', COLORS.Red, 1, 3, 8, 1, [GT.COMMUNISM], [GT.CORPORATISM], []),
    SURPLUS: new NewsType('Surplus', COLORS.Green, 1, 3, 8, 1, [], [], []), 
    TENSIONS: new NewsType('Tensions', COLORS.Yellow, 1, 5, 40, 1, [GT.PUPPET_STATE, GT.ANARCHY], [], []), //two neutral planets have relations changed to hostile
    TERRAFORMING: new NewsType('Terraforming', COLORS.Green, 1, 5, 40, 1, [], [GT.TECHNOCRACY, GT.CORPORATISM], []), //two neutral planets have relations changed to hostile
    TOURISM: new NewsType('Tourism', COLORS.LightCyan, 1, 3, 8, 1, [], [GT.DEMOCRACY, GT.CORPORATISM], []),
    TRADE_AGREEMENT: new NewsType('Trade Agreement', COLORS.LightGreen, 1, 10, 20, 1, [], [GT.CORPORATISM, GT.DEMOCRACY], []), //two neutral or allied planets have improved trade relations
    WAR_ALLY: new NewsType('War Ally', COLORS.Red, 1, 3, 15, 150, [], [GT.ARISTOCRACY, GT.DEMOCRACY], []),
    WAR_BOMBARDMENT: new NewsType('Bombardment', COLORS.Red, 1, 0.1, 0.5, 200, [], [GT.TECHNOCRACY], []), //the target planet loses some buildings (temporarily disabled)
    WAR_HUMAN_WAVE: new NewsType('War Human Wave', COLORS.DarkRed, 1, 0.5, 2, 150, [GT.DEMOCRACY], [GT.POLICE_STATE, GT.COMMUNISM], []),
    WAR_INVASION: new NewsType('War Invasion', COLORS.DarkRed, 1, 1, 5, 150, [], [GT.POLICE_STATE, GT.ARISTOCRACY], []),
    WAR: new NewsType('War', COLORS.Red, 1, 5, 20, 100, [GT.ANARCHY, GT.PUPPET_STATE], [GT.POLICE_STATE, GT.ARISTOCRACY], []), //two planets where at least one was hostile go to war
    WAR_OFFENSIVE: new NewsType('War Offensive', COLORS.Red, 1, 1, 5, 150, [], [], []),
    WAR_SABOTAGE: new NewsType('War Sabotage', COLORS.DarkRed, 1, 0.5, 2, 150, [], [GT.TECHNOCRACY, GT.ANARCHY], []),
    WAR_SCORCHED_EARTH: new NewsType('War Scorched Earth', COLORS.DarkRed, 1, 0.5, 2, 150, [], [GT.COMMUNISM], []),
    WAR_SUBJUGATION: new NewsType('Subjugation', COLORS.LightPurple, 1, 25, 100, 200, [], [GT.POLICE_STATE, GT.ARISTOCRACY, GT.COMMUNISM], []),
    WAR_SURRENDER: new NewsType('War Surrender', COLORS.Orange, 1, 0.1, 0.5, 250, [], [], []),
    //more to come later: environmental disasters, terraforming, etc.
}

const NT_ALL = Object.values(NT)
//dont include tensions below, not hostile enough
const NT_COOPERATION_PREVENTING = [NT.WAR, NT.BOMBARDMENT, NT.EMBARGO, NT.TENSIONS, NT.COUP_DETAT]
const NT_COOPERATIVE = [NT.ALLIANCE, NT.TRADE_AGREEMENT, NT.RESEARCH_AGREEMENT, NT.INVESTMENT, NT.ARMS_DEAL]
const NT_MARTIAL = [NT.MILITARY_BUILDUP, NT.WAR, NT.EMBARGO, NT.BOMBARDMENT, NT.CIVIL_WAR, NT.ARMS_DEAL, NT.COUP_DETAT]
const NT_DANGEROUS = [NT.WAR, NT.BOMBARDMENT, NT.CIVIL_WAR, NT.CIVIL_STRIFE, NT.COUP_DETAT, NT.PLAGUE, NT.ENVIRONMENTAL_DISASTER]
const NT_ECONOMY_PREVENTING = [NT.DEPRESSION, NT.SCARCITY, NT.PLAGUE, NT.ENVIRONMENTAL_DISASTER, NT.EMBARGO, NT.STOCK_MARKET_CRASH]
const NT_ECONOMY_BOOSTING = [NT.ECONOMIC_BOOM, NT.SCIENTIFIC_BREAKTHROUGH, NT.INVESTMENT, NT.SURPLUS, NT.FOREIGN_AID]
const NT_CRIME_PREVENTING = [NT.CRACKDOWN, NT.REVOLUTION, NT.CIVIL_WAR, NT.COUP_DETAT]


const META_NT = {
    SYSTEM_AT_WAR: new NewsType('System at War', COLORS.Red, 1, 10, 30, 1000),
    SYSTEM_WIDE_PLAGUE: new NewsType('System Wide Plague', COLORS.Red, 1, 5, 15, 1000),
}
const META_NT_ALL = Object.values(META_NT)