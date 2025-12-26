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
    [NEWS_TYPES.ENVIRONMENTAL_DISASTER, EnvironmentalDisasterNews],
    [NEWS_TYPES.IMMIGRATION, ImmigrationNews],
    [NEWS_TYPES.INFLATION, InflationNews],
    [NEWS_TYPES.INVESTMENT, InvestmentNews],
    [NEWS_TYPES.DISARMAMENT, DisarmamentNews],
    [NEWS_TYPES.MILITARY_BUILDUP, MilitaryBuildupNews],
    [NEWS_TYPES.PLAGUE, PlagueNews],
    [NEWS_TYPES.RESEARCH_AGREEMENT, ResearchAgreementNews],
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


//unlike other generators this one can return null even if generation was possible, its rng basically
//unlike other simulators, this one operates directly on gs.system
function generateNews() {
    const planets = PLANETS
    const planet = rndMember(planets)
    const targetPlanet = rndMember(PLANETS.filter(p=>(p !== planet)))
    const cls = rndMember([...NEWS_TYPE_CLASSES_ARRAY])
    const news = new cls(planet, targetPlanet)
    const isValid = news.isValid()
    if (!isValid) return null
    return news
}


//simulate news for a given time period
//unlike other simulators, this one operates directly on gs.system
function addHistory(startYear = 3000, endYear = 3000) {
    for (let y = startYear; y < endYear; y += 1/365) {
        gs.year = y
        if (Math.random() < NEWS_CHANCE_PER_DAY) {
            const news = generateNews()
            if (!news) continue
            gs.system.news.push(news)
            news.start()
        }
        for (const n of gs.system.news) {
            // @ts-ignore
            if (n.started && !n.ended && n.expired && (!n.isValidEnd || n.isValidEnd())) {
                n.end()
            }
        }
    }
}