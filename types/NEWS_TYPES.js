class NewsType {
    constructor(handlerClass, name = '', color = COLORS.White, minYears = null, maxYears = null) {
        this.handlerClass = handlerClass
        this.name = name
        this.color = color;
        this.minYears = minYears
        this.maxYears = maxYears
    }
}

const NEWS_TYPES = {
    ALLIANCE: new NewsType(AllianceNews, 'Alliance', COLORS.Green, 10, 50), //two neutral planets become allies
    EMBARGO: new NewsType(EmbargoNews, 'Embargo', COLORS.LightRed, 3, 50), //a hostile planet places a blockade on another planet
    WAR: new NewsType(WarNews, 'War', COLORS.Red, 3, 15), //two planets where at least one was hostile go to war
    TENSIONS: new NewsType(TensionsNews, 'Tensions', COLORS.Yellow, 5, 50), //two neutral planets have relations changed to hostile
    BOMBARDMENT: new NewsType(BombardmentNews, 'Bombardment', COLORS.Red, 0.1, 0.5), //the target planet loses some buildings (temporarily disabled)
    TRADE_AGREEMENT: new NewsType(TradeAgreementNews, 'Trade Agreement', COLORS.LightGreen, 20, 50), //two neutral or allied planets have improved trade relations
    ECONOMIC_BOOM: new NewsType(EconomicBoomNews, 'Economic Boom', COLORS.LightGreen, 5, 15), //prices go up and availability goes up
    DEPRESSION: new NewsType(DepressionNews, 'Depression', COLORS.Orange, 7, 20), //prices go down and availability goes down
    SCARCITY: new NewsType(ScarcityNews, 'Scarcity', COLORS.Orange, 3, 8), //decreases availability of goods, but increases price
    REVOLUTION: new NewsType(RevolutionNews, 'Revolution', COLORS.Yellow, 3, 10), //changes political system
    CIVIL_WAR: new NewsType(CivilWarNews, 'Civil War', COLORS.Red, 3, 15), //temporary anarchy and lose some buildings
    SUBJUGATION: new NewsType(SubjugationNews, 'Subjugation', COLORS.LightPurple, 25, 100), //for conquering planets, make the target planet a puppet state
    IMMIGRATION: new NewsType(ImmigrationNews, 'Immigration', COLORS.LightGray, 5, 10), //influx of population to the planet
    CONSTRUCTION: new NewsType(ConstructionNews, 'Construction', COLORS.Green, 3, 7), //enables some buildings on the target planet
    COLONIZATION: new NewsType(ColonizationNews, 'Colonization', COLORS.LightGreen, 5, 15), //establishes a new colony on an uninhabited planet
    INFLATION: new NewsType(InflationNews, 'Inflation', COLORS.Orange, 5, 15), //prices go up across the board
    SCIENTIFIC_BREAKTHROUGH: new NewsType(ScientificBreakthroughNews, 'Scientific Breakthrough', COLORS.Green, 1, 4), //improves industrial and commercial ratings
    CRACKDOWN: new NewsType(CrackdownNews, 'Crackdown', COLORS.LightGray, 3, 7), //temporary increase in security and decrease in crime
    CRIME_WAVE: new NewsType(CrimeWaveNews, 'Crime Wave', COLORS.Orange, 3, 7), //temporary increase in crime and decrease in security
    CIVIL_STRIFE: new NewsType(CivilStrifeNews, 'Civil Strife', COLORS.Yellow, 3, 7), //temporary increase in crime and decrease in security
    MILITARY_BUILDUP: new NewsType(MilitaryBuildupNews, 'Military Buildup', COLORS.LightRed, 5, 10), //temporary increase in military rating
    INVESTMENT: new NewsType(InvestmentNews, 'Investment', COLORS.LightGreen, 5, 10), //one planet invests in another
    DISARMAMENT: new NewsType(DisarmamentNews, 'Disarmament', COLORS.LightGreen, 5, 10), //gets rid of some excess military/territory for prestige 
    ENVIRONMENTAL_DISASTER: new NewsType(EnvironmentalDisasterNews, 'Environmental Disaster', COLORS.Orange, 2, 6), //temporary decrease in population and industrial rating
    PLAGUE: new NewsType(PlagueNews, 'Plague', COLORS.Red, 2, 6), 
    SURPLUS: new NewsType(SurplusNews, 'Surplus', COLORS.Green, 3, 8), 
    RESEARCH_AGREEMENT: new NewsType(ResearchAgreementNews, 'Research Agreement', COLORS.LightGreen, 2, 8), 
    //more to come later: environmental disasters, terraforming, etc.
}

const NEWS_TYPES_ALL = Object.values(NEWS_TYPES)
const NEWS_TYPES_HOSTILE = [NEWS_TYPES.WAR, NEWS_TYPES.TENSIONS, NEWS_TYPES.BOMBARDMENT, NEWS_TYPES.EMBARGO]
const NEWS_TYPES_COOPERATIVE = [NEWS_TYPES.ALLIANCE, NEWS_TYPES.TRADE_AGREEMENT, NEWS_TYPES.RESEARCH_AGREEMENT, NEWS_TYPES.INVESTMENT]
const NEWS_TYPES_MARTIAL = [NEWS_TYPES.MILITARY_BUILDUP, NEWS_TYPES.WAR, NEWS_TYPES.EMBARGO, NEWS_TYPES.BOMBARDMENT, NEWS_TYPES.CIVIL_WAR]
const NEWS_TYPES_PROGRESS_PREVENTING = [NEWS_TYPES.WAR, NEWS_TYPES.TENSIONS, NEWS_TYPES.BOMBARDMENT, NEWS_TYPES.EMBARGO, NEWS_TYPES.DEPRESSION, NEWS_TYPES.SCARCITY, NEWS_TYPES.CIVIL_WAR, NEWS_TYPES.PLAGUE, NEWS_TYPES.ENVIRONMENTAL_DISASTER]
const NEWS_TYPES_ECONOMY_BOOSTING = [NEWS_TYPES.ECONOMIC_BOOM, NEWS_TYPES.SCIENTIFIC_BREAKTHROUGH, NEWS_TYPES.INVESTMENT, NEWS_TYPES.SURPLUS]
const NEWS_TYPES_CRIME_PREVENTING = [NEWS_TYPES.CRACKDOWN, NEWS_TYPES.REVOLUTION, NEWS_TYPES.CIVIL_WAR]

const META_NEWS_TYPES = {
    SYSTEM_AT_WAR: new NewsType(SystemAtWarNews, 'System at War', COLORS.Red, 10, 30),
}