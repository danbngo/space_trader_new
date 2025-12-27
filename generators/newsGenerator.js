

//WARNING: unlike other simulators, this one operates directly on gs.system


// @ts-ignore
const NEWS_TYPE_CLASSES = new Map([
    [NEWS_TYPES.ADDICTION, AddictionNews],
    [NEWS_TYPES.ALLIANCE, AllianceNews],
    [NEWS_TYPES.BOMBARDMENT, BombardmentNews],
    [NEWS_TYPES.CIVIL_STRIFE, CivilStrifeNews],
    [NEWS_TYPES.CIVIL_WAR, CivilWarNews],
    [NEWS_TYPES.COLONIZATION, ColonizationNews],
    [NEWS_TYPES.CONSTRUCTION, ConstructionNews],
    [NEWS_TYPES.CRACKDOWN, CrackdownNews],
    [NEWS_TYPES.CRIME_WAVE, CrimeWaveNews],
    [NEWS_TYPES.DEPRESSION, DepressionNews],
    [NEWS_TYPES.ECONOMIC_BOOM, EconomicBoomNews],
    [NEWS_TYPES.EMBARGO, EmbargoNews],
    [NEWS_TYPES.ENVIRONMENTAL_DISASTER, EnvironmentalDisasterNews],
    [NEWS_TYPES.ENVIRONMENTALISM, Environmentalism],
    [NEWS_TYPES.FOREIGN_AID, ForeignAidNews],
    [NEWS_TYPES.IMMIGRATION, ImmigrationNews],
    [NEWS_TYPES.IMPERIALISM, ImperialismNews],
    [NEWS_TYPES.INFLATION, InflationNews],
    [NEWS_TYPES.INVESTMENT, InvestmentNews],
    [NEWS_TYPES.ISOLATIONISM, IsolationismNews],
    [NEWS_TYPES.DISARMAMENT, DisarmamentNews],
    [NEWS_TYPES.MILITARY_BUILDUP, MilitaryBuildupNews],
    [NEWS_TYPES.PLAGUE, PlagueNews],
    [NEWS_TYPES.RESEARCH_AGREEMENT, ResearchAgreementNews],
    [NEWS_TYPES.REVIVAL, RevivalNews],
    [NEWS_TYPES.REVOLUTION, RevolutionNews],
    [NEWS_TYPES.SCARCITY, ScarcityNews],
    [NEWS_TYPES.SCIENTIFIC_BREAKTHROUGH, ScientificBreakthroughNews],
    [NEWS_TYPES.SUBJUGATION, SubjugationNews],
    [NEWS_TYPES.SURPLUS, SurplusNews],
    [NEWS_TYPES.TENSIONS, TensionsNews],
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