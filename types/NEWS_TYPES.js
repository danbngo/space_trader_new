/**
 * Represents a type of news event that can occur in the game.
 * @class NewsType
 */
class NewsType {
    /**
     * @param {string} name - The name of the news type.
     * @param {number[]} color - The color associated with this news type.
     * @param {number} minYears - The minimum duration in years this news event can last.
     * @param {number} maxYears - The maximum duration in years this news event can last.
     * @param {number} displayPriority - The display priority when multiple news events occur in the same year.
     */
    constructor(name = '', color = COLORS.White, minYears = null, maxYears = null, displayPriority = 0) {
        /** @type {string} */
        this.name = name
        /** @type {number[]} */
        this.color = color;
        /** @type {number} */
        this.minYears = minYears
        /** @type {number} */
        this.maxYears = maxYears
        this.displayPriority = displayPriority //if multiple news occur in the same year, which to show first
    }
}

const NEWS_TYPES = {
    ADDICTION: new NewsType('Addiction', COLORS.Orange, 3, 8, 1),
    ALLIANCE: new NewsType('Alliance', COLORS.Green, 10, 40, 1), //two neutral planets become allies
    ARMS_DEAL: new NewsType('Arms Deal', COLORS.LightOrange, 3, 8, 1), //one planet sends military equipment to another
    BOMBARDMENT: new NewsType('Bombardment', COLORS.Red, 0.1, 0.5, 200), //the target planet loses some buildings (temporarily disabled)
    CIVIL_STRIFE: new NewsType('Civil Strife', COLORS.Yellow, 3, 8, 1), //temporary increase in crime and decrease in security
    CIVIL_WAR: new NewsType('Civil War', COLORS.Red, 3, 15, 1), //temporary anarchy and lose some buildings
    COLONIZATION: new NewsType('Colonization', COLORS.LightGreen, 7, 15, 1), //establishes a new colony on an uninhabited planet
    CONSCRIPTION: new NewsType('Conscription', COLORS.LightRed, 3, 8, 1), //temporary increase in military rating, decrease in economy and industry
    CONSTRUCTION: new NewsType('Construction', COLORS.Green, 3, 8, 1), //enables some buildings on the target planet
    CRACKDOWN: new NewsType('Crackdown', COLORS.LightGray, 3, 8, 1), //temporary increase in security and decrease in crime
    CRIME_WAVE: new NewsType('Crime Wave', COLORS.Orange, 3, 8, 1), //temporary increase in crime and decrease in security
    DEPRESSION: new NewsType('Depression', COLORS.Orange, 7, 15, 1), //prices go down and availability goes down
    DISARMAMENT: new NewsType('Disarmament', COLORS.LightGreen, 5, 10, 1), //gets rid of some excess military/territory for prestige 
    ECONOMIC_BOOM: new NewsType('Economic Boom', COLORS.LightGreen, 5, 10, 1), //prices go up and availability goes up
    EMBARGO: new NewsType('Embargo', COLORS.LightRed, 3, 30, 1), //a hostile planet places a blockade on another planet
    ENSLAVEMENT: new NewsType('Enslavement', COLORS.Purple, 10, 30, 1), //planet enslaves a portion of its population for industry boost
    ENVIRONMENTAL_DISASTER: new NewsType('Environmental Disaster', COLORS.Orange, 2, 6, 1), //temporary decrease in population and industrial rating
    ENVIRONMENTALISM: new NewsType('Environmentalism', COLORS.LightGreen, 5, 15, 1),
    EXPLORATION: new NewsType('Exploration', COLORS.LightBlue, 5, 15, 1), //planet undertakes exploration missions, temporarily lowering guild officers and shipyard capacity
    FESTIVAL: new NewsType('Festival', COLORS.LightCyan, 2, 5, 1), //planet holds a festival, boosting prestige but hurting economy temporarily
    FORCED_LABOR: new NewsType('Forced Labor', COLORS.Purple, 10, 30, 1), //planet forces a portion of its population to work for economy boost
    FOREIGN_AID: new NewsType('Foreign Aid', COLORS.LightBlue, 3, 8, 1),
    GENOCIDE: new NewsType('Genocide', COLORS.DarkRed, 5, 15, 1), //planet purges part of
    IMMIGRATION: new NewsType('Immigration', COLORS.LightGray, 5, 10, 1), //influx of population to the planet
    IMPERIALISM: new NewsType('Imperialism', COLORS.Purple, 10, 30, 1),
    INVESTMENT: new NewsType('Investment', COLORS.LightGreen, 5, 10, 1), //one planet invests in another
    ISOLATIONISM: new NewsType('Isolationism', COLORS.DimGray, 5, 15, 1),
    LUDDITISM: new NewsType('Ludditism', COLORS.DimGray, 3, 8, 1),
    MILITARY_BUILDUP: new NewsType('Military Buildup', COLORS.LightRed, 5, 10, 1), //temporary increase in military rating
    ORGANIZED_CRIME: new NewsType('Organized Crime', COLORS.Orange, 3, 8, 1), //increase in crime and black market activity
    PLAGUE: new NewsType('Plague', COLORS.Red, 2, 6, 1),
    RAIDING: new NewsType('Raiding', COLORS.Orange, 15, 30, 1), //one planet raids another for goods/credits 
    RESEARCH_AGREEMENT: new NewsType('Research Agreement', COLORS.LightGreen, 2, 8, 1), 
    REVIVAL: new NewsType('Religious Revival', COLORS.White, 10, 20, 1),
    REVOLUTION: new NewsType('Revolution', COLORS.Yellow, 3, 8, 1), //changes political system
    SANCTIONS: new NewsType('Sanctions', COLORS.LightRed, 3, 15, 1), //one planet places economic sanctions on another
    SCARCITY: new NewsType('Scarcity', COLORS.Orange, 3, 8, 1), //decreases availability of goods, but increases price
    SCIENTIFIC_BREAKTHROUGH: new NewsType('Scientific Breakthrough', COLORS.Green, 1, 4, 1), //improves industrial and commercial ratings
    STOCK_MARKET_CRASH: new NewsType('Stock Market Crash', COLORS.Red, 3, 8, 1), //financial crash damages economy and credits
    SUBJUGATION: new NewsType('Subjugation', COLORS.LightPurple, 25, 100, 200), //for conquering planets, make the target planet a puppet state
    SURPLUS: new NewsType('Surplus', COLORS.Green, 3, 8, 1), 
    TENSIONS: new NewsType('Tensions', COLORS.Yellow, 5, 40, 1), //two neutral planets have relations changed to hostile
    TOURISM: new NewsType('Tourism', COLORS.LightCyan, 3, 8, 1),
    TRADE_AGREEMENT: new NewsType('Trade Agreement', COLORS.LightGreen, 10, 20, 1), //two neutral or allied planets have improved trade relations
    WAR: new NewsType('War', COLORS.Red, 3, 12, 100), //two planets where at least one was hostile go to war
    //more to come later: environmental disasters, terraforming, etc.
}

const NEWS_TYPES_ALL = Object.values(NEWS_TYPES)
//dont include tensions below, not hostile enough
const NEWS_TYPES_TENSE = [NEWS_TYPES.WAR, NEWS_TYPES.BOMBARDMENT, NEWS_TYPES.EMBARGO]
const NEWS_TYPES_COOPERATIVE = [NEWS_TYPES.ALLIANCE, NEWS_TYPES.TRADE_AGREEMENT, NEWS_TYPES.RESEARCH_AGREEMENT, NEWS_TYPES.INVESTMENT, NEWS_TYPES.ARMS_DEAL]
const NEWS_TYPES_MARTIAL = [NEWS_TYPES.MILITARY_BUILDUP, NEWS_TYPES.WAR, NEWS_TYPES.EMBARGO, NEWS_TYPES.BOMBARDMENT, NEWS_TYPES.CIVIL_WAR, NEWS_TYPES.ARMS_DEAL]
const NEWS_TYPES_DANGEROUS = [NEWS_TYPES.WAR, NEWS_TYPES.BOMBARDMENT, NEWS_TYPES.CIVIL_WAR, NEWS_TYPES.CIVIL_STRIFE]
const NEWS_TYPES_ECONOMY_PREVENTING = [NEWS_TYPES.DEPRESSION, NEWS_TYPES.SCARCITY, NEWS_TYPES.PLAGUE, NEWS_TYPES.ENVIRONMENTAL_DISASTER, NEWS_TYPES.EMBARGO]
const NEWS_TYPES_ECONOMY_BOOSTING = [NEWS_TYPES.ECONOMIC_BOOM, NEWS_TYPES.SCIENTIFIC_BREAKTHROUGH, NEWS_TYPES.INVESTMENT, NEWS_TYPES.SURPLUS]
const NEWS_TYPES_CRIME_PREVENTING = [NEWS_TYPES.CRACKDOWN, NEWS_TYPES.REVOLUTION, NEWS_TYPES.CIVIL_WAR]


const META_NEWS_TYPES = {
    SYSTEM_AT_WAR: new NewsType('System at War', COLORS.Red, 10, 30, 1000),
    SYSTEM_WIDE_PLAGUE: new NewsType('System Wide Plague', COLORS.Red, 5, 15, 1000),
}
const META_NEWS_TYPES_ALL = Object.values(META_NEWS_TYPES)