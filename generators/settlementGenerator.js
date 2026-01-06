/**
 * Determines the settlement type for a space station.
 * @param {SpaceStation} station - The space station to analyze.
 * @returns {SettlementType} The appropriate settlement type for the station.
 */
function determineSpaceStationSettlementType(station) {
    // Only use space station settlement types
    const spaceStationTypes = [
        SETTLEMENT_TYPES.TORUS_STATION, SETTLEMENT_TYPES.ROTATING_DRUM, 
        SETTLEMENT_TYPES.TETHERED_STATION, SETTLEMENT_TYPES.SPOKED_WHEEL,
        SETTLEMENT_TYPES.BERNAL_SPHERE, SETTLEMENT_TYPES.O_NEILL_CYLINDER,
        SETTLEMENT_TYPES.STANFORD_TORUS, SETTLEMENT_TYPES.MODULAR_STATION,
        SETTLEMENT_TYPES.HABITAT_RING, SETTLEMENT_TYPES.CRYSTAL_PALACE
    ]
    return rndMember(spaceStationTypes)
}

/**
 * Determines the most appropriate settlement type for a planet based on its characteristics.
 * @param {Planet | DwarfPlanet} planet - The planet to analyze.
 * @returns {SettlementType} The most appropriate settlement type.
 */
function determinePlanetSettlementType(planet) {
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
function generateSettlement(planet) {
    console.log('generating settlement for planet:',planet)
    // Determine settlement type based on planet characteristics
    const settlementType = 
        (planet.objectType == OBJECT_TYPES.PLANET || 
         planet.objectType == OBJECT_TYPES.DWARF_PLANET || 
         planet.objectType == OBJECT_TYPES.MOON) ? determinePlanetSettlementType(planet) :
        determineSpaceStationSettlementType(planet)

    console.log('generating buildings...')
    
    const shipyard = new Shipyard(planet)
    
    const market =  new Market(planet, false)
    
    const blackMarket =  new Market(planet, true) 
    
    const guild =  new Guild(planet)    
    const bank =  new Bank(planet) 
    
    const courthouse = new Courthouse(planet)
    
    const academy = new Academy(planet)
    
    const tavern = new Tavern(planet, true)
    
    const cyberSurgeon = new CyberSurgeon(planet)
    
    const geneticist = new Geneticist(planet)
    
    const palace = new Palace(planet)
    
    const temple = new Temple(planet)
    
    const casino = new Casino(planet)
    

    console.log('disabling some buildings...')

    // Different body types have different chances of having buildings
    // Planets: 0% disabled (all buildings available)
    // Moons/Dwarf planets: 40% disabled
    // Space stations: 80% disabled
    const disableChance = planet.objectType == OBJECT_TYPES.PLANET ? 0 :
                          planet.objectType == OBJECT_TYPES.MOON || planet.objectType == OBJECT_TYPES.DWARF_PLANET ? 0.4 :
                          0.8
    const buildings = [shipyard, market, blackMarket, guild, bank, courthouse, academy, tavern, cyberSurgeon, geneticist, palace, temple, casino]
    for (const building of buildings) {
        if (Math.random() < disableChance) building.exists = false
        // Randomize building level from 1-3
        building.level = Math.floor(Math.random() * 3) + 1
    }

    return new Settlement({planet, settlementType, shipyard, market, blackMarket, guild, bank, courthouse, academy, tavern, cyberSurgeon, geneticist, palace, temple, casino})
}
