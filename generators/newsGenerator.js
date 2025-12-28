

//WARNING: unlike other simulators, this one operates directly on gs.system


// @ts-ignore
const NEWS_TYPE_CLASSES = new Map([
    [NEWS_TYPES.ADDICTION, AddictionNews],
    [NEWS_TYPES.ALLIANCE, AllianceNews],
    [NEWS_TYPES.ARMS_DEAL, ArmsDealNews],
    [NEWS_TYPES.BOMBARDMENT, BombardmentNews],
    [NEWS_TYPES.CIVIL_STRIFE, CivilStrifeNews],
    [NEWS_TYPES.CIVIL_WAR, CivilWarNews],
    [NEWS_TYPES.COLONIZATION, ColonizationNews],
    [NEWS_TYPES.CONSTRUCTION, ConstructionNews],
    [NEWS_TYPES.CONSCRIPTION, ConscriptionNews],
    [NEWS_TYPES.CRACKDOWN, CrackdownNews],
    [NEWS_TYPES.CRIME_WAVE, CrimeWaveNews],
    [NEWS_TYPES.DEPRESSION, DepressionNews],
    [NEWS_TYPES.DISARMAMENT, DisarmamentNews],
    [NEWS_TYPES.ECONOMIC_BOOM, EconomicBoomNews],
    [NEWS_TYPES.EMBARGO, EmbargoNews],
    [NEWS_TYPES.ENSLAVEMENT, EnslavementNews],
    [NEWS_TYPES.ENVIRONMENTAL_DISASTER, EnvironmentalDisasterNews],
    [NEWS_TYPES.ENVIRONMENTALISM, EnvironmentalismNews],
    [NEWS_TYPES.EXPLORATION, ExplorationNews],
    [NEWS_TYPES.FORCED_LABOR, ForcedLaborNews],
    [NEWS_TYPES.FESTIVAL, FestivalNews],
    [NEWS_TYPES.FOREIGN_AID, ForeignAidNews],
    [NEWS_TYPES.GENOCIDE, GenocideNews],
    [NEWS_TYPES.IMMIGRATION, ImmigrationNews],
    [NEWS_TYPES.IMPERIALISM, ImperialismNews],
    [NEWS_TYPES.INVESTMENT, InvestmentNews],
    [NEWS_TYPES.ISOLATIONISM, IsolationismNews],
    [NEWS_TYPES.MILITARY_BUILDUP, MilitaryBuildupNews],
    [NEWS_TYPES.PLAGUE, PlagueNews],
    [NEWS_TYPES.RAIDING, RaidingNews],
    [NEWS_TYPES.RESEARCH_AGREEMENT, ResearchAgreementNews],
    [NEWS_TYPES.REVIVAL, RevivalNews],
    [NEWS_TYPES.REVOLUTION, RevolutionNews],
    [NEWS_TYPES.SANCTIONS, SanctionsNews],
    [NEWS_TYPES.SCARCITY, ScarcityNews],
    [NEWS_TYPES.SCIENTIFIC_BREAKTHROUGH, ScientificBreakthroughNews],
    [NEWS_TYPES.STOCK_MARKET_CRASH, StockMarketCrashNews],
    [NEWS_TYPES.SUBJUGATION, SubjugationNews],
    [NEWS_TYPES.SURPLUS, SurplusNews],
    [NEWS_TYPES.TENSIONS, TensionsNews],
    [NEWS_TYPES.TOURISM, TourismNews],
    [NEWS_TYPES.TRADE_AGREEMENT, TradeAgreementNews],
    [NEWS_TYPES.WAR, WarNews],
])

const NEWS_TYPE_CLASSES_ARRAY = Object.freeze(Array.from(NEWS_TYPE_CLASSES.values()))

// @ts-ignore
const META_NEWS_TYPE_CLASSES = new Map([
    [META_NEWS_TYPES.SYSTEM_AT_WAR, SystemAtWarNews],
    [META_NEWS_TYPES.SYSTEM_WIDE_PLAGUE, SystemWidePlague],
])

const META_NEWS_TYPE_CLASSES_ARRAY = Object.freeze(Array.from(META_NEWS_TYPE_CLASSES.values()))

/**
 * Generates a random news event that affects planets.
 * @param {number} attemptsRemaining - Maximum attempts to generate valid news.
 * @returns {News|null} The generated news event or null if unable to generate.
 */
function generateNews(attemptsRemaining = 100) {
    const planets = PLANETS
    const planet = rndMember(planets)
    const targetPlanet = rndMember(PLANETS.filter(p=>(p !== planet)))
    const cls = rndMember(NEWS_TYPE_CLASSES_ARRAY)
    const news = new cls(planet, targetPlanet)
    const isValid = news.isValid()
    if (!isValid) {
        if (attemptsRemaining <= 0) return null
        return generateNews(attemptsRemaining - 1)
    }
    return news
}
/**
 * Generates system-wide meta news events.
 * @param {Function[]} newsTypesAttempted - Array of news types already attempted.
 * @returns {News|null} The generated meta news event or null.
 */
function generateMetaNews(newsTypesAttempted = []) {
    if (newsTypesAttempted.length >= META_NEWS_TYPE_CLASSES_ARRAY.length) return null
    const newsTypesNotAttempted = META_NEWS_TYPE_CLASSES_ARRAY.filter(cls=>(!newsTypesAttempted.includes(cls)))
    const cls = rndMember([...newsTypesNotAttempted])
    newsTypesAttempted.push(cls)
    const news = new cls()
    const isValid = news.isValid()
    if (!isValid) return null
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