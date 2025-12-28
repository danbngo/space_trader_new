

//WARNING: unlike other simulators, this one operates directly on gs.system


// @ts-ignore
const NEWS_TYPE_CLASSES = new Map([
    [NT.ADDICTION, AddictionNews],
    [NT.ALLIANCE, AllianceNews],
    [NT.ARMS_DEAL, ArmsDealNews],
    [NT.BOMBARDMENT, BombardmentNews],
    [NT.CIVIL_STRIFE, CivilStrifeNews],
    [NT.CIVIL_WAR, CivilWarNews],
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
    [NT.SUBJUGATION, SubjugationNews],
    [NT.SURPLUS, SurplusNews],
    [NT.TENSIONS, TensionsNews],
    [NT.TOURISM, TourismNews],
    [NT.TRADE_AGREEMENT, TradeAgreementNews],
    [NT.WAR, WarNews],
])

const NEWS_TYPE_CLASSES_ARRAY = Object.freeze(Array.from(NEWS_TYPE_CLASSES.values()))

// @ts-ignore
const META_NEWS_TYPE_CLASSES = new Map([
    [META_NT.SYSTEM_AT_WAR, SystemAtWarNews],
    [META_NT.SYSTEM_WIDE_PLAGUE, SystemWidePlague],
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