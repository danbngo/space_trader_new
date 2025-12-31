

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
    [NT.CULTURAL_PURGE, CulturalPurgeNews],
    [NT.CULTURAL_RENAISSANCE, CulturalRenaissanceNews],
    [NT.CYBER_WARFARE, CyberWarfareNews],
    [NT.DEPRESSION, DepressionNews],
    [NT.DISARMAMENT, DisarmamentNews],
    [NT.ECONOMIC_BOOM, EconomicBoomNews],
    [NT.BLOCKADE, BlockadeNews],
    [NT.CLONING, CloningNews],
    [NT.ENSLAVEMENT, EnslavementNews],
    [NT.EUGENICS, EugenicsNews],
    [NT.ENVIRONMENTAL_DISASTER, EnvironmentalDisasterNews],
    [NT.ENVIRONMENTALISM, EnvironmentalismNews],
    [NT.EXPLORATION, ExplorationNews],
    [NT.FORCED_LABOR, ForcedLaborNews],
    [NT.FESTIVAL, FestivalNews],
    [NT.FOREIGN_AID, ForeignAidNews],
    [NT.GENOCIDE, GenocideNews],
    [NT.IMMIGRATION, ImmigrationNews],
    [NT.INDUSTRIAL_ACCIDENT, IndustrialAccidentNews],
    [NT.RELIGION_INQUISITION, ReligionInquisitionNews],
    [NT.BANKRUPTCY, BankruptcyNews],
    [NT.LAND_GRAB, LandGrabNews],
    [NT.INVESTMENT, InvestmentNews],
    [NT.LUDDITISM, LudditismNews],
    [NT.MILITARY_BUILDUP, MilitaryBuildupNews],
    [NT.OLIGARCHY, OligarchyNews],
    [NT.ORGANIZED_CRIME, OrganizedCrimeNews],
    [NT.PLAGUE, PlagueNews],
    [NT.RAIDING, RaidingNews],
    [NT.RESEARCH_AGREEMENT, ResearchAgreementNews],
    [NT.RELIGION_REVIVAL, ReligionRevivalNews],
    [NT.RELIGION_PROSELYTIZE, ReligionProselytizeNews],
    [NT.RELIGION_HOLY_WAR, ReligionHolyWarNews],
    [NT.RELIGION_GRAND_COUNCIL, ReligionGrandCouncilNews],
    [NT.RELIGION_CONQUEST, ReligionConquestNews],
    [NT.RELIGIOUS_TURMOIL, ReligiousTurmoilNews],
    [NT.RELIGIOUS_CONVERSION, ReligiousConversionNews],
    [NT.REVOLUTION, RevolutionNews],
    [NT.SANCTIONS, SanctionsNews],
    [NT.SCARCITY, ScarcityNews],
    [NT.SCIENTIFIC_BREAKTHROUGH, ScientificBreakthroughNews],
    [NT.STOCK_MARKET_CRASH, StockMarketCrashNews],
    [NT.SURPLUS, SurplusNews],
    [NT.TERRORISM, TerrorismNews],
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
    // Exclude dwarf planets - they are small outposts that don't trigger major news events
    const planets = PLANETS.filter(p => !isDwarfPlanet(p))
    if (planets.length === 0) return null // No valid planets
    const planet = rndMember(planets)
    const targetPlanet = rndMember(planets.filter(p=>(p !== planet)))
    
    // Use weighted selection based on news type weights, with 3x multiplier for favorite govs and policies
    if (weights.length == 0) weights = NEWS_TYPE_CLASSES.map(([newsType, cls]) => {
        let weight = newsType.weight || 1
        
        // Triple the weight if this planet's government is a favorite for this news type
        if (newsType.favoriteGovs.includes(planet.c.governmentType)) {
            weight *= 3
        }
        
        // Check if any of the planet's policies favor or forbid this news type
        const policies = planet.c.policies.all
        for (const policy of policies) {
            if (policy.favoriteNewsTypes.includes(newsType)) {
                weight *= 3
            }
            if (policy.forbiddenNewsTypes.includes(newsType)) {
                weight = 0
            }
        }
        
        return weight
    })
    const index = rndIndexWeighted(weights)
    const [newsType, cls] = NEWS_TYPE_CLASSES[index]
    
    if (!newsType.forbiddenGovs.includes(planet.c.governmentType)) {
        if (!newsType.immuneGovs.includes(targetPlanet.c.governmentType)) {
            if (!News.hasNews(newsType, planet)) {
                /** @ts-ignore */
                const news = new cls(planet, targetPlanet)
                if (news.isValid()) return news
            }
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
    //danmod we will eventually need to check if there's already meta news of this type ongoing, or maybe any meta news at all.
    if (!news.isValid()) return null
    return news
}

/**
 * Generates historical news events for a time period.
 * @param {number} startYear - The starting year for history generation.
 * @param {number} endYear - The ending year for history generation.
 * @param {Object} progress - Progress tracking object with completePercentage property.
 */
async function addHistory(startYear = 3000, endYear = 3000, progress = {completePercentage: 0}) {
    const totalYears = endYear - startYear
    let currentYear = startYear
    
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
        
        // Update progress every year and yield control to browser
        if (Math.floor(y) > currentYear) {
            currentYear = Math.floor(y)
            progress.completePercentage = ((y - startYear) / totalYears) * 100
            // Yield control to allow UI updates
            await new Promise(resolve => setTimeout(resolve, 0))
        }
    }
    progress.completePercentage = 100
}