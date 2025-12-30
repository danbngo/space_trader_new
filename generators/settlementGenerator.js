/**
 * Determines the most appropriate settlement type for a planet based on its characteristics.
 * @param {Planet} planet - The planet to analyze.
 * @returns {SettlementType} The most appropriate settlement type.
 */
function determineSettlementType(planet = new Planet()) {
    const climate = planet.climate
    const planetType = planet.planetType
    
    // Gas giants and gas dwarfs -> Cloud cities
    if (planetType === PLANET_TYPES.GAS_GIANT || planetType === PLANET_TYPES.GAS_DWARF) {
        return SETTLEMENT_TYPES.CLOUD_CITY
    }
    
    // Ice giants -> Ice cities
    if (planetType === PLANET_TYPES.ICE_GIANT || planetType === PLANET_TYPES.ICE_DWARF) {
        return SETTLEMENT_TYPES.ICE_CITY
    }
    
    // Check for tidally locked planets (very long day length suggests tidal locking)
    if (planet.dayLength > 50) {
        return SETTLEMENT_TYPES.TWILIGHT_REGION_CITY
    }
    
    // Earthlike planets with ideal conditions -> Planetary megacities
    if (planetType === PLANET_TYPES.EARTHLIKE) {
        const isIdeal = climate.temperature === TEMPERATURES.MEDIUM &&
                       climate.atmosphericPressure === ATMOSPHERIC_PRESSURES.MEDIUM &&
                       climate.gravity === GRAVITIES.MEDIUM &&
                       climate.radiationLevel === RADIATION_LEVELS.VERY_LOW
        if (isIdeal) {
            return SETTLEMENT_TYPES.PLANETARY_MEGACITY
        }
    }
    
    // Ocean-covered worlds
    if (climate.oceanCoverage === OCEAN_COVERAGES.VERY_HIGH || climate.oceanCoverage === OCEAN_COVERAGES.HIGH) {
        // Deep ocean worlds with subsurface oceans
        if (climate.oceanType === PLANET_OCEAN_TYPES.SUBSURFACE_WATER) {
            return SETTLEMENT_TYPES.SUBMERGED_CITY
        }
        // Extreme pressure -> Ocean trench cities
        if (climate.atmosphericPressure === ATMOSPHERIC_PRESSURES.CRUSHING || 
            climate.gravity === GRAVITIES.EXTREMELY_HIGH || 
            climate.gravity === GRAVITIES.VERY_HIGH) {
            return SETTLEMENT_TYPES.OCEAN_TRENCH_CITY
        }
        // Regular ocean worlds -> Floating cities
        return SETTLEMENT_TYPES.FLOATING_CITY
    }
    
    // Extreme volcanic/geological activity -> Lava cities
    if (climate.geologicalActivity === GEOLOGICAL_ACTIVITIES.EXTREMELY_HIGH ||
        climate.geologicalActivity === GEOLOGICAL_ACTIVITIES.VERY_HIGH) {
        return SETTLEMENT_TYPES.LAVA_CITY
    }
    
    // Hostile surface conditions requiring full protection
    const extremeRadiation = climate.radiationLevel === RADIATION_LEVELS.EXTREMELY_HIGH || 
                            climate.radiationLevel === RADIATION_LEVELS.VERY_HIGH
    const extremeTemperature = climate.temperature === TEMPERATURES.EXTREMELY_HIGH || 
                              climate.temperature === TEMPERATURES.EXTREMELY_LOW ||
                              climate.temperature === TEMPERATURES.MOLTEN
    const extremePressure = climate.atmosphericPressure === ATMOSPHERIC_PRESSURES.CRUSHING ||
                           climate.atmosphericPressure === ATMOSPHERIC_PRESSURES.NONE
    
    // Completely inhospitable -> Orbital platforms
    if ((extremeRadiation && extremeTemperature) || 
        (extremeRadiation && extremePressure && extremeTemperature)) {
        return SETTLEMENT_TYPES.ORBITAL_PLATFORM
    }
    
    // Very hostile but somewhat survivable -> Underground cities
    if (extremeRadiation || extremeTemperature) {
        // Check if planet has canyons or ravines (based on geological activity)
        if (climate.geologicalActivity === GEOLOGICAL_ACTIVITIES.HIGH ||
            climate.geologicalActivity === GEOLOGICAL_ACTIVITIES.MEDIUM) {
            return Math.random() < 0.5 ? SETTLEMENT_TYPES.UNDERGROUND_CITY : SETTLEMENT_TYPES.CANYON_CITY
        }
        return SETTLEMENT_TYPES.UNDERGROUND_CITY
    }
    
    // Harsh but manageable surface -> Domed cities
    if (extremePressure || 
        climate.temperature === TEMPERATURES.VERY_LOW || 
        climate.temperature === TEMPERATURES.VERY_HIGH) {
        return SETTLEMENT_TYPES.DOMED_CITY
    }
    
    // Low atmosphere rocky worlds with canyons
    if ((climate.atmosphericPressure === ATMOSPHERIC_PRESSURES.VERY_LOW ||
         climate.atmosphericPressure === ATMOSPHERIC_PRESSURES.EXTREMELY_LOW) &&
        (climate.geologicalActivity === GEOLOGICAL_ACTIVITIES.MEDIUM ||
         climate.geologicalActivity === GEOLOGICAL_ACTIVITIES.HIGH)) {
        return SETTLEMENT_TYPES.CANYON_CITY
    }
    
    // Default for terrestrial planets with moderate conditions -> Domed cities
    return SETTLEMENT_TYPES.DOMED_CITY
}

/**
 * Generates a complete settlement with all buildings for a planet.
 * @param {Planet} planet - The planet to generate settlement for.
 * @returns {Settlement} The generated settlement.
 */
function generateSettlement(planet = new Planet()) {
    // Determine settlement type based on planet characteristics
    const settlementType = determineSettlementType(planet)
    
    // Get moons for this planet (children that are Moon instances)
    const planetMoons = planet.children ? planet.children.filter(child => child instanceof Moon) : []
    
    // Helper function to randomly assign a moon or null
    const getRandomMoon = () => {
        if (planetMoons.length === 0) return null
        // 50% chance to be on a moon if moons exist
        return Math.random() < 0.5 ? rndMember(planetMoons) : null
    }
    
    const shipyard = new Shipyard(planet, getRandomMoon())
    const market =  new Market(planet, false, getRandomMoon())
    const blackMarket =  new Market(planet, true, getRandomMoon()) 
    const guild =  new Guild(planet, getRandomMoon()) 
    const bank =  new Bank(planet, getRandomMoon()) 
    const courthouse = new Courthouse(planet, getRandomMoon())
    const academy = new Academy(planet, false, getRandomMoon())
    const tavern = new Academy(planet, true, getRandomMoon())
    const cyberSurgeon = new CyberSurgeon(planet, getRandomMoon())
    const palace = new Palace(planet, getRandomMoon())

    // Dwarf planets have much lower chance of having buildings (95% disabled vs 80% for others)
    const disableChance = isDwarfPlanet(planet) ? 0.95 : 0.8
    const buildings = [shipyard, market, blackMarket, guild, bank, courthouse, academy, tavern, cyberSurgeon, palace]
    for (const building of buildings) if (Math.random() < disableChance) building.enabled = false

    return new Settlement(planet, settlementType, shipyard, market, blackMarket, guild, bank, courthouse, academy, tavern, cyberSurgeon, palace)
}
