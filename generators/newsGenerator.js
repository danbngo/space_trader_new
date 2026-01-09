

//WARNING: unlike other simulators, this one operates directly on gs.system


/** @type {[NewsType, any][]} */
const NEWS_TYPE_CLASSES = [
    [NT.ADDICTION, AddictionNews],
    [NT.ALLIANCE, AllianceNews],
    [NT.ALLIANCE_GOVERNMENT, AllianceGovernmentNews],
    [NT.ARMS_DEAL, ArmsDealNews],
    [NT.BLOCKADE, BlockadeNews],
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
    [NT.EUGENICS, EugenicsNews],
    [NT.ENVIRONMENTAL_DISASTER, EnvironmentalDisasterNews],
    [NT.ENVIRONMENTALISM, EnvironmentalismNews],
    [NT.EXPLORATION, ExplorationNews],
    [NT.FORCED_LABOR, ForcedLaborNews],
    [NT.FESTIVAL, FestivalNews],
    [NT.FOREIGN_AID, ForeignAidNews],
    [NT.GENOCIDE, GenocideNews],
    [NT.IMMIGRATION, ImmigrationNews],
    [NT.REFUGEES, RefugeesNews],
    [NT.DEPORTATION, DeportationNews],
    [NT.ASYLUM_POLICY, AsylumPolicyNews],
    [NT.DIASPORA_RETURNS, DiasporaReturnsNews],
    [NT.INDUSTRIAL_ACCIDENT, IndustrialAccidentNews],
    [NT.BANKRUPTCY, BankruptcyNews],
    [NT.LAND_GRAB, LandGrabNews],
    [NT.INVESTMENT, InvestmentNews],
    [NT.LUDDITISM, LudditismNews],
    [NT.MILITARY_BUILDUP, MilitaryBuildupNews],
    [NT.OLIGARCHY, OligarchyNews],
    [NT.ORGANIZED_CRIME, OrganizedCrimeNews],
    [NT.PLAGUE, PlagueNews],
    [NT.LIFE_EXTENSION, LifeExtensionNews],
    [NT.ARTIFICIAL_WOMBS, ArtificialWombsNews],
    [NT.LEGALLY_ASSISTED_DEATH, LegallyAssistedDeathNews],
    [NT.VIRTUAL_REALITY_CHAMBERS, VirtualRealityChambersNews],
    [NT.ARTIFICIAL_LIFE, ArtificialLifeNews],
    [NT.BIOWEAPON, BioweaponNews],
    [NT.PLAGUE_SPREAD, PlagueSpreadNews],
    [NT.PLAGUE_VACCINE, PlagueVaccineNews],
    [NT.RAIDING, RaidingNews],
    [NT.RESEARCH_AGREEMENT, ResearchAgreementNews],
    [NT.REVOLUTION, RevolutionNews],
    [NT.SANCTIONS, SanctionsNews],
    [NT.SCARCITY, ScarcityNews],
    [NT.SCIENTIFIC_BREAKTHROUGH, ScientificBreakthroughNews],
    [NT.COLONY_SHIP, ColonyShipNews],
    [NT.MEGA_AI, MegaAINews],
    [NT.ADVANCED_NANITES, AdvancedNanitesNews],
    [NT.SPACE_STATION, SpaceStationNews],
    [NT.STOCK_MARKET_CRASH, StockMarketCrashNews],
    [NT.SUPER_SOLDIERS, SuperSoldiersNews],
    [NT.SURPLUS, SurplusNews],
    [NT.PLANETARY_DEFENSE, PlanetaryDefenseNews],
    [NT.SPACE_ELEVATOR, SpaceElevatorNews],
    [NT.ANTIMATTER_GRID, AntimatterGridNews],
    [NT.MEGACITY, MegacityNews],
    [NT.LABOR_STRIKES, LaborStrikesNews],
    [NT.AUTOMATION_CRISIS, AutomationCrisisNews],
    [NT.ARTIFACTS_DISCOVERED, ArtifactsDiscoveredNews],
    [NT.ALIEN_LIFE_DISCOVERED, AlienLifeDiscoveredNews],
    [NT.RUINS_DISCOVERED, RuinsDiscoveredNews],
    [NT.INDOCTRINATION_PROGRAM, IndoctrinationProgramNews],
    [NT.BRAIN_DRAIN, BrainDrainNews],
    [NT.PHILOSOPHICAL_DEBATES, PhilosophicalDebatesNews],
    [NT.KNOWLEDGE_CODEX, KnowledgeCodexNews],
    [NT.PROPAGANDA_CAMPAIGN, PropagandaCampaignNews],
    [NT.SOLAR_HARVESTERS, SolarHarvestersNews],
    [NT.EXPERIMENTAL_ENERGY, ExperimentalEnergyNews],
    [NT.BLACK_MARKET, BlackMarketNews],
    [NT.GUNBOAT_DIPLOMACY, GunboatDiplomacyNews],
    [NT.OPPRESSED_MINORITY, OppressedMinorityNews],
    [NT.SPY_NETWORK, SpyNetworkNews],
    [NT.SURVEILLANCE_NETWORK, SurveillanceNetworkNews],
    [NT.WAR_CODE_BREAK, WarCodeBreakNews],
    [NT.WAR_CONVERT_INDUSTRY, WarConvertIndustryNews],
    [NT.DISASTER_FLARE, DisasterFlareNews],
    [NT.DISASTER_ASTEROID, DisasterAsteroidNews],
    [NT.DISASTER_VOLCANO, DisasterVolcanoNews],
    [NT.DISASTER_EARTHQUAKES, DisasterEarthquakesNews],
    [NT.DISASTER_GREENHOUSE, DisasterGreenhouseNews],
    [NT.DISASTER_STORM, DisasterStormNews],
    [NT.DISASTER_TSUNAMI, DisasterTsunamiNews],
    [NT.PIRATE_HAVEN, PirateHavenNews],
    [NT.PIRATE_ARMADA, PirateArmadaNews],
    [NT.MUTATIONS, MutationsNews],
    [NT.TERRORISM, TerrorismNews],
    [NT.TENSIONS, TensionsNews],
    [NT.TENSIONS_ECONOMIC, TensionsEconomicNews],
    [NT.TENSIONS_BORDERS, TensionsBordersNews],
    [NT.TERRAFORMING, TerraformingNews],
    [NT.TOURISM, TourismNews],
    [NT.SPORTS_EVENT, SportsEventNews],
    [NT.HOLO_CULTURE, HoloCultureNews],
    [NT.SOCIAL_MEDIA, SocialMediaNews],
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
    [NT.MINOR_MISSILE_CRISIS, MinorMissileCrisisNews],
    [NT.MINOR_RESOURCE_CONCESSION_TREATY, MinorResourceConcessionTreatyNews],
    [NT.MINOR_DEBT_TRAP_RESTRUCTURING, MinorDebtTrapRestructuringNews],
    [NT.MINOR_JOINT_STOCK_COMPANY, MinorJointStockCompanyNews],
    [NT.MINOR_FORCED_DEMILITARIZATION, MinorForcedDemilitarizationNews],
    [NT.ANNEXATION_REFERENDUM, AnnexationReferendumNews],
    [NT.DIPLOMATIC_RECOGNITION_CRISIS, DiplomaticRecognitionCrisisNews],
    [NT.MINOR_CULTURAL_INTEGRATION_PROGRAM, MinorCulturalIntegrationProgramNews],
    [NT.MINOR_COLOR_REVOLUTION, MinorColorRevolutionNews],
    [NT.MINOR_IDEALOGICAL_SPREAD, MinorIdealogicalSpreadNews],
]

const NEWS_TYPE_CLASSES_ARRAY = Object.freeze(NEWS_TYPE_CLASSES.map(pair => pair[1]))

/**
 * Generates a random news event that affects planets.
 * @param {number} attemptsRemaining - Maximum attempts to generate valid news.
 * @returns {News|null} The generated news event or null if unable to generate.
 */
function generateNews(attemptsRemaining = 100, weights = []) {//only needs to be computed once) {
    // Get all celestial bodies that can participate in news events (planets, dwarf planets, moons)
    const allBodies = [...gs.system.planets, ...gs.system.dwarfPlanets, ...gs.system.moons]
    if (allBodies.length === 0) return null // No valid bodies
    const planet = rndMember(allBodies)
    const targetPlanet = rndMember(allBodies.filter(p=>(p !== planet)))
    
    // Use weighted selection based on news type weights, with 3x multiplier for favorite govs
    if (weights.length == 0) weights = NEWS_TYPE_CLASSES.map(([newsType, cls]) => {
        let weight = newsType.weight || 1
        
        // Triple the weight if this planet's government is a favorite for this news type
        if (newsType.favoriteGovs.includes(planet.c.governmentType)) {
            weight *= 3
        }
        
        // Check if the planet's settlement type favors or forbids this news type
        if (planet.settlement.settlementType) {
            if (planet.settlement.settlementType.favoriteNewsTypes.includes(newsType)) {
                weight *= 3
            }
            if (planet.settlement.settlementType.forbiddenNewsTypes.includes(newsType)) {
                weight = 0
            }
        }
        
        return weight
    })
    const index = rndIndexWeighted(weights)
    const [newsType, cls] = NEWS_TYPE_CLASSES[index]
    
    // Check if the initiator planet's object type is allowed for this news type
    if (newsType.planetObjectTypes && !newsType.planetObjectTypes.includes(planet.objectType)) {
        if (attemptsRemaining <= 0) return null
        return generateNews(attemptsRemaining - 1, weights)
    }
    
    // Check if the target planet's object type is allowed for this news type
    if (newsType.targetPlanetObjectTypes && !newsType.targetPlanetObjectTypes.includes(targetPlanet.objectType)) {
        if (attemptsRemaining <= 0) return null
        return generateNews(attemptsRemaining - 1, weights)
    }
    
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
 * Generates historical news events for a time period.
 * @param {number} startYear - The starting year for history generation.
 * @param {number} endYear - The ending year for history generation.
 * @param {Object} progress - Progress tracking object with completePercentage property.
 */
async function addHistory(startYear = 3000, endYear = 3000, progress = {completePercentage: 0}) {
    const totalYears = endYear - startYear
    let currentYear = startYear
    let weeksSinceYield = 0
    const YIELD_EVERY_WEEKS = 10 // Yield control every 10 weeks (balance between speed and smoothness)
    const WEEKS_PER_YEAR = 52
    const YEARS_PER_WEEK = 1 / WEEKS_PER_YEAR
    
    for (let y = startYear; y < endYear; y += YEARS_PER_WEEK) {
        const previousYear = Math.floor(gs.year);
        gs.year = y;
        
        // Reset savedThisTick flag when year changes
        currentYear = Math.floor(gs.year);
        if (currentYear !== previousYear) {
            gs.savedThisTick = false;
        }
        
        weeksSinceYield++
        
        // Process news 7 times per week (once per day equivalent)
        for (let day = 0; day < 7; day++) {
            if (Math.random() < NEWS_CHANCE_PER_DAY) {
                const news = generateNews()
                if (!news) continue
                news.start()
            }
        }

        if (gs.system.news.length > 3000) {
            throw new Error('TOO MANY ACTIVE NEWS!!!!!!!!!!!!!!!!!!!!!!')
        }

        News.processNews(YEARS_PER_WEEK)
        
        // Update progress and yield control more frequently for smooth animations
        if (weeksSinceYield >= YIELD_EVERY_WEEKS) {
            weeksSinceYield = 0
            progress.completePercentage = ((y - startYear) / totalYears) * 100
            // Yield control to allow UI updates and animations
            await new Promise(resolve => setTimeout(resolve, 0))
        }
        
        // Also update progress every year
        if (Math.floor(y) > currentYear) {
            currentYear = Math.floor(y)
            progress.completePercentage = ((y - startYear) / totalYears) * 100
        }
    }
    progress.completePercentage = 100
}