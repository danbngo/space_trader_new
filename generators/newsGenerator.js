

//WARNING: unlike other simulators, this one operates directly on gs.system


/** @type {[NewsType, any][]} */
const NEWS_TYPE_CLASSES = [
    [NT.ADDICTION, AddictionNews],
    [NT.ALLIANCE, AllianceNews],
    [NT.ARMS_DEAL, ArmsDealNews],
    [NT.CIVIL_STRIFE, CivilStrifeNews],
    [NT.CIVIL_WAR, CivilWarNews],
    [NT.COALITION, CoalitionNews],
    [NT.COUP_DETAT, CoupDetatNews],
    [NT.COLONIZATION, ColonizationNews],
    [NT.CONSTRUCTION, ConstructionNews],
    [NT.CONSCRIPTION, ConscriptionNews],
    [NT.CRACKDOWN, CrackdownNews],
    [NT.CRIME_WAVE, CrimeWaveNews],
    [NT.DEPRESSION, DepressionNews],
    [NT.DISARMAMENT, DisarmamentNews],
    [NT.ECONOMIC_BOOM, EconomicBoomNews],
    [NT.EMBARGO, EmbargoNews],
    [NT.ENSLAVEMENT, EnslavementNews],
    [NT.ENVIRONMENTAL_DISASTER, EnvironmentalDisasterNews],
    [NT.ENVIRONMENTALISM, EnvironmentalismNews],
    [NT.EXPLORATION, ExplorationNews],
    [NT.FORCED_LABOR, ForcedLaborNews],
    [NT.FESTIVAL, FestivalNews],
    [NT.FOREIGN_AID, ForeignAidNews],
    [NT.GENOCIDE, GenocideNews],
    [NT.IMMIGRATION, ImmigrationNews],
    [NT.IMPERIALISM, ImperialismNews],
    [NT.INVESTMENT, InvestmentNews],
    [NT.ISOLATIONISM, IsolationismNews],
    [NT.LUDDITISM, LudditismNews],
    [NT.MILITARY_BUILDUP, MilitaryBuildupNews],
    [NT.OLIGARCHY, OligarchyNews],
    [NT.ORGANIZED_CRIME, OrganizedCrimeNews],
    [NT.PLAGUE, PlagueNews],
    [NT.RAIDING, RaidingNews],
    [NT.RESEARCH_AGREEMENT, ResearchAgreementNews],
    [NT.REVIVAL, RevivalNews],
    [NT.REVOLUTION, RevolutionNews],
    [NT.SANCTIONS, SanctionsNews],
    [NT.SCARCITY, ScarcityNews],
    [NT.SCIENTIFIC_BREAKTHROUGH, ScientificBreakthroughNews],
    [NT.STOCK_MARKET_CRASH, StockMarketCrashNews],
    [NT.SURPLUS, SurplusNews],
    [NT.TENSIONS, TensionsNews],
    [NT.TERRAFORMING, TerraformingNews],
    [NT.TOURISM, TourismNews],
    [NT.TRADE_AGREEMENT, TradeAgreementNews],
    [NT.WAR, WarNews],
    [NT.WAR_ALLY, WarAllyNews],
    [NT.WAR_BOMBARDMENT, WarBombardmentNews],
    [NT.WAR_HUMAN_WAVE, WarHumanWaveNews],
    [NT.WAR_INVASION, WarInvasionNews],
    [NT.WAR_OFFENSIVE, WarOffensiveNews],
    [NT.WAR_SABOTAGE, WarSabotageNews],
    [NT.WAR_SCORCHED_EARTH, WarScorchedEarthNews],
    [NT.WAR_SUBJUGATION, WarSubjugationNews],
    [NT.WAR_SURRENDER, WarSurrenderNews],
]

const NEWS_TYPE_CLASSES_ARRAY = Object.freeze(NEWS_TYPE_CLASSES.map(pair => pair[1]))

// @ts-ignore
const META_NEWS_TYPE_CLASSES = [
    [META_NT.SYSTEM_AT_WAR, SystemAtWarNews],
    [META_NT.SYSTEM_WIDE_PLAGUE, SystemWidePlague],
]

const META_NEWS_TYPE_CLASSES_ARRAY = Object.freeze(META_NEWS_TYPE_CLASSES.map(pair => pair[1]))

/**
 * Generates a random news event that affects planets.
 * @param {number} attemptsRemaining - Maximum attempts to generate valid news.
 * @returns {News|null} The generated news event or null if unable to generate.
 */
function generateNews(attemptsRemaining = 100, weights = []) {//only needs to be computed once) {
    const planets = PLANETS
    const planet = rndMember(planets)
    const targetPlanet = rndMember(PLANETS.filter(p=>(p !== planet)))
    
    // Use weighted selection based on news type weights, with 3x multiplier for favorite govs
    if (weights.length == 0) weights = NEWS_TYPE_CLASSES.map(([newsType, cls]) => {
        let weight = newsType.weight || 1
        // Triple the weight if this planet's government is a favorite for this news type
        if (newsType.favoriteGovs.includes(planet.culture.governmentType)) {
            weight *= 3
        }
        return weight
    })
    const index = rndIndexWeighted(weights)
    const [newsType, cls] = NEWS_TYPE_CLASSES[index]
    
    if (!newsType.forbiddenGovs.includes(planet.culture.governmentType)) {
        if (!newsType.immuneGovs.includes(targetPlanet.culture.governmentType)) {
            /** @ts-ignore */
            const news = new cls(planet, targetPlanet)
            if (news.isValid()) return news
        }
    }
    if (attemptsRemaining <= 0) return null
    return generateNews(attemptsRemaining - 1, weights)
}
/**
 * Generates system-wide meta news events.
 * @param {any[]} newsTypesAttempted - Array of news types already attempted.
 * @returns {News|null} The generated meta news event or null.
 */
function generateMetaNews(newsTypesAttempted = []) {
    if (newsTypesAttempted.length >= META_NEWS_TYPE_CLASSES_ARRAY.length) return null
    const newsTypesNotAttempted = META_NEWS_TYPE_CLASSES_ARRAY.filter(cls=>(!newsTypesAttempted.includes(cls)))
    const cls = rndMember([...newsTypesNotAttempted])
    newsTypesAttempted.push(cls)
    // @ts-ignore
    const news = new cls()
    if (!news.isValid()) return null
    return news
}

/**
 * Generates historical news events for a time period.
 * @param {number} startYear - The starting year for history generation.
 * @param {number} endYear - The ending year for history generation.
 */
function addHistory(startYear = 3000, endYear = 3000) {
    for (let y = startYear; y < endYear; y += 1/365) {
        gs.year = y
        if (Math.random() < NEWS_CHANCE_PER_DAY) {
            const news = generateNews()
            if (!news) continue
            news.start()
        }
        /*if (Math.random() < META_NEWS_CHANCE_PER_DAY) {
            const news = generateMetaNews()
            if (!news) continue
            news.start()
        }*/
        News.processNews(1/365)
    }
}