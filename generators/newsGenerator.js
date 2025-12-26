// @ts-ignore
const NEWS_TYPE_CLASSES = new Map([
    [NEWS_TYPES.ALLIANCE, AllianceNews],
    [NEWS_TYPES.BOMBARDMENT, BombardmentNews],
    [NEWS_TYPES.CIVIL_STRIFE, CivilStrifeNews],
    [NEWS_TYPES.COLONIZATION, ColonizationNews],
    [NEWS_TYPES.CONSTRUCTION, ConstructionNews],
    [NEWS_TYPES.CRACKDOWN, CrackdownNews],
    [NEWS_TYPES.CRIME_WAVE, CrimeWaveNews],
    [NEWS_TYPES.DEPRESSION, DepressionNews],
    [NEWS_TYPES.ECONOMIC_BOOM, EconomicBoomNews],
    [NEWS_TYPES.EMBARGO, EmbargoNews],
    [NEWS_TYPES.IMMIGRATION, ImmigrationNews],
    [NEWS_TYPES.INFLATION, InflationNews],
    [NEWS_TYPES.REVOLUTION, RevolutionNews],
    [NEWS_TYPES.SCARCITY, ScarcityNews],
    [NEWS_TYPES.SCIENTIFIC_BREAKTHROUGH, ScientificBreakthroughNews],
    [NEWS_TYPES.SUBJUGATION, SubjugationNews],
    [NEWS_TYPES.TENSIONS, TensionsNews],
    [NEWS_TYPES.TRADE_AGREEMENT, TradeAgreementNews],
    [NEWS_TYPES.WAR, WarNews],
])


//unlike other generators this one can return null even if generation was possible, its rng basically
function generateNews(year = gs.year) {
    const planets = PLANETS
    const planet = rndMember(planets)
    const targetPlanet = rndMember(PLANETS.filter(p=>(p !== planet)))
    const [type,cls] = rndMember(Array.from(NEWS_TYPE_CLASSES.entries()))
    if (!cls.isValid(planet, targetPlanet)) return null
    const news = new cls(planet, year, targetPlanet)
    return news
}


//simulate news for a given time period
function generateHistory(startYear = 2500, endYear = 3000) {
    let activeNews = []
    const completedNews = []
    const years = endYear-startYear
    for (let dayInYear = 0; dayInYear <= years*365; dayInYear += 1/365) {
        if (Math.random() < NEWS_CHANCE_PER_DAY) {
            const news = generateNews(startYear + dayInYear/365)
            if (!news) continue
            activeNews.push(news)
            news.start()
        }
        for (const n of activeNews) {
            if (n.calcIsExpired()) {
                n.end()
                completedNews.push(n)
            }
        }
        activeNews = activeNews.filter(n => !n.ended)
    }
    const news = [...activeNews, ...completedNews]
    //sort news oldest to newest
    news.sort((a,b)=>{ return a.startYear - b.startYear })
    return news
}