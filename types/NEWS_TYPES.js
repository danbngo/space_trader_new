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
    ALLIANCE: new NewsType('Alliance', COLORS.Green, 10, 40, 1), //two neutral planets become allies
    EMBARGO: new NewsType('Embargo', COLORS.LightRed, 3, 30, 1), //a hostile planet places a blockade on another planet
    WAR: new NewsType('War', COLORS.Red, 3, 12, 100), //two planets where at least one was hostile go to war
    TENSIONS: new NewsType('Tensions', COLORS.Yellow, 5, 40, 1), //two neutral planets have relations changed to hostile
    BOMBARDMENT: new NewsType('Bombardment', COLORS.Red, 0.1, 0.5, 200), //the target planet loses some buildings (temporarily disabled)
    TRADE_AGREEMENT: new NewsType('Trade Agreement', COLORS.LightGreen, 10, 20, 1), //two neutral or allied planets have improved trade relations
    ECONOMIC_BOOM: new NewsType('Economic Boom', COLORS.LightGreen, 5, 10, 1), //prices go up and availability goes up
    DEPRESSION: new NewsType('Depression', COLORS.Orange, 7, 15, 1), //prices go down and availability goes down
    SCARCITY: new NewsType('Scarcity', COLORS.Orange, 3, 8, 1), //decreases availability of goods, but increases price
    REVOLUTION: new NewsType('Revolution', COLORS.Yellow, 3, 8, 1), //changes political system
    CIVIL_WAR: new NewsType('Civil War', COLORS.Red, 3, 15, 1), //temporary anarchy and lose some buildings
    SUBJUGATION: new NewsType('Subjugation', COLORS.LightPurple, 25, 100, 200), //for conquering planets, make the target planet a puppet state
    IMMIGRATION: new NewsType('Immigration', COLORS.LightGray, 5, 10, 1), //influx of population to the planet
    CONSTRUCTION: new NewsType('Construction', COLORS.Green, 3, 8, 1), //enables some buildings on the target planet
    COLONIZATION: new NewsType('Colonization', COLORS.LightGreen, 7, 15, 1), //establishes a new colony on an uninhabited planet
    INFLATION: new NewsType('Inflation', COLORS.Orange, 3, 8, 1), //prices go up across the board
    SCIENTIFIC_BREAKTHROUGH: new NewsType('Scientific Breakthrough', COLORS.Green, 1, 4, 1), //improves industrial and commercial ratings
    CRACKDOWN: new NewsType('Crackdown', COLORS.LightGray, 3, 8, 1), //temporary increase in security and decrease in crime
    CRIME_WAVE: new NewsType('Crime Wave', COLORS.Orange, 3, 8, 1), //temporary increase in crime and decrease in security
    CIVIL_STRIFE: new NewsType('Civil Strife', COLORS.Yellow, 3, 8, 1), //temporary increase in crime and decrease in security
    MILITARY_BUILDUP: new NewsType('Military Buildup', COLORS.LightRed, 5, 10, 1), //temporary increase in military rating
    INVESTMENT: new NewsType('Investment', COLORS.LightGreen, 5, 10, 1), //one planet invests in another
    DISARMAMENT: new NewsType('Disarmament', COLORS.LightGreen, 5, 10, 1), //gets rid of some excess military/territory for prestige 
    ENVIRONMENTAL_DISASTER: new NewsType('Environmental Disaster', COLORS.Orange, 2, 6, 1), //temporary decrease in population and industrial rating
    PLAGUE: new NewsType('Plague', COLORS.Red, 2, 6, 1), 
    SURPLUS: new NewsType('Surplus', COLORS.Green, 3, 8, 1), 
    RESEARCH_AGREEMENT: new NewsType('Research Agreement', COLORS.LightGreen, 2, 8, 1), 
    REVIVAL: new NewsType('Religious Revival', COLORS.White, 10, 20, 1),
    ISOLATIONISM: new NewsType('Isolationism', COLORS.DimGray, 5, 15, 1),
    //more to come later: environmental disasters, terraforming, etc.
}

const NEWS_TYPES_ALL = Object.values(NEWS_TYPES)
//dont include tensions below, not hostile enough
const NEWS_TYPES_HOSTILE = [NEWS_TYPES.WAR, NEWS_TYPES.BOMBARDMENT, NEWS_TYPES.EMBARGO]
const NEWS_TYPES_COOPERATIVE = [NEWS_TYPES.ALLIANCE, NEWS_TYPES.TRADE_AGREEMENT, NEWS_TYPES.RESEARCH_AGREEMENT, NEWS_TYPES.INVESTMENT]
const NEWS_TYPES_MARTIAL = [NEWS_TYPES.MILITARY_BUILDUP, NEWS_TYPES.WAR, NEWS_TYPES.EMBARGO, NEWS_TYPES.BOMBARDMENT, NEWS_TYPES.CIVIL_WAR]
const NEWS_TYPES_DANGEROUS = [NEWS_TYPES.WAR, NEWS_TYPES.BOMBARDMENT, NEWS_TYPES.CIVIL_WAR, NEWS_TYPES.CIVIL_STRIFE]
const NEWS_TYPES_ECONOMY_PREVENTING = [NEWS_TYPES.DEPRESSION, NEWS_TYPES.SCARCITY, NEWS_TYPES.PLAGUE, NEWS_TYPES.ENVIRONMENTAL_DISASTER, NEWS_TYPES.EMBARGO]
const NEWS_TYPES_ECONOMY_BOOSTING = [NEWS_TYPES.ECONOMIC_BOOM, NEWS_TYPES.SCIENTIFIC_BREAKTHROUGH, NEWS_TYPES.INVESTMENT, NEWS_TYPES.SURPLUS]
const NEWS_TYPES_CRIME_PREVENTING = [NEWS_TYPES.CRACKDOWN, NEWS_TYPES.REVOLUTION, NEWS_TYPES.CIVIL_WAR]


const META_NEWS_TYPES = {
    SYSTEM_AT_WAR: new NewsType('System at War', COLORS.Red, 10, 30, 1000),
    SYSTEM_WIDE_PLAGUE: new NewsType('System Wide Plague', COLORS.Red, 5, 15, 1000),
}
const META_NEWS_TYPES_ALL = Object.values(META_NEWS_TYPES)