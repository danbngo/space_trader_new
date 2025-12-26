class NewsType {
    constructor(name = '', color = COLORS.White, minYears = 1, maxYears = 1) {
        this.name = name
        this.color = color;
        this.minYears = minYears
        this.maxYears = maxYears
    }
}

const NEWS_TYPES = {
    EMBARGO: new NewsType('Embargo', COLORS.LightRed, 3, 7), //a hostile planet places a blockade on another planet
    WAR: new NewsType('War', COLORS.Red, 3, 15), //two planets where at least one was hostile go to war
    //PEACE_TREATY: new NewsType('Peace Treaty'), //two planets that were at war have relations changed to neutral
    TENSIONS: new NewsType('Tensions', COLORS.Yellow, 5, 15), //two neutral planets have relations changed to hostile
    ALLIANCE: new NewsType('Alliance', COLORS.Green, 20, 40), //two neutral planets become allies
    BOMBARDMENT: new NewsType('Bombardment', COLORS.Red, 0.1, 0.5), //the target planet loses some buildings (temporarily disabled)
    TRADE_AGREEMENT: new NewsType('Trade Agreement', COLORS.LightGreen, 10, 25), //two neutral or allied planets have improved trade relations
    ECONOMIC_BOOM: new NewsType('Economic Boom', COLORS.LightGreen, 5, 15), //prices go up and availability goes up
    DEPRESSION: new NewsType('Depression', COLORS.Orange, 7, 12), //prices go down and availability goes down
    SCARCITY: new NewsType('Scarcity', COLORS.Orange, 3, 8), //decreases availability of goods, but increases price
    REVOLUTION: new NewsType('Revolution', COLORS.Yellow, 2, 6), //changes political system
    //REVOLT: new NewsType('Revolt'), //for subjugated planets, casts off the yoke
    CIVIL_WAR: new NewsType('Civil War', COLORS.Red, 3, 15), //temporary anarchy and lose some buildings
    SUBJUGATION: new NewsType('Subjugation', COLORS.LightPurple, 12, 25), //for conquering planets, make the target planet a puppet state
    IMMIGRATION: new NewsType('Immigration', COLORS.LightGray, 5, 10), //influx of population to the planet
    CONSTRUCTION: new NewsType('Construction', COLORS.Green, 3, 7), //enables some buildings on the target planet
    COLONIZATION: new NewsType('Colonization', COLORS.LightGreen, 5, 15), //establishes a new colony on an uninhabited planet
    INFLATION: new NewsType('Inflation', COLORS.Orange, 5, 15), //prices go up across the board
    SCIENTIFIC_BREAKTHROUGH: new NewsType('Scientific Breakthrough', COLORS.Green, 1, 4), //improves industrial and commercial ratings
    CRACKDOWN: new NewsType('Crackdown', COLORS.LightGray, 3, 7), //temporary increase in security and decrease in crime
    CRIME_WAVE: new NewsType('Crime Wave', COLORS.Orange, 3, 7), //temporary increase in crime and decrease in security
    CIVIL_STRIFE: new NewsType('Civil Strife', COLORS.Yellow, 3, 7), //temporary increase in crime and decrease in security
    //more to come later: environmental disasters, terraforming, etc.
}

const NEWS_TYPES_ALL = Object.values(NEWS_TYPES)
