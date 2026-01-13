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
    const features = planet.features
    const planetType = planet.planetType
    
    // Gas giants and gas dwarfs -> Cloud cities
    if (planetType === PLANET_TYPES.GAS_GIANT || planetType === PLANET_TYPES.GAS_DWARF) {
        return SETTLEMENT_TYPES.CLOUD_CITY
    }
    
    // Ice giants -> Ice cities
    if (planetType === PLANET_TYPES.ICE_GIANT || planetType === PLANET_TYPES.ICE_DWARF) {
        return SETTLEMENT_TYPES.ICE_CITY
    }
    
    // Check for tidally locked planets
    if (features.includes(PLANET_FEATURE_TYPES.TIDALLY_LOCKED)) {
        return SETTLEMENT_TYPES.TWILIGHT_REGION_CITY
    }
    
    // Earthlike planets with ideal conditions -> Planetary megacities
    const isIdeal = planetType === PLANET_TYPES.EARTHLIKE &&
                   features.includes(PLANET_FEATURE_TYPES.THICK_ATMOSPHERE) &&
                   !features.includes(PLANET_FEATURE_TYPES.EXTREMELY_HOT) &&
                   !features.includes(PLANET_FEATURE_TYPES.EXTREMELY_COLD) &&
                   !features.includes(PLANET_FEATURE_TYPES.HIGH_RADIATION) &&
                   !features.includes(PLANET_FEATURE_TYPES.LOW_GRAVITY) &&
                   !features.includes(PLANET_FEATURE_TYPES.HIGH_GRAVITY)
    
    if (isIdeal) {
        return SETTLEMENT_TYPES.PLANETARY_MEGACITY
    }
    
    // Ocean-covered worlds
    if (features.includes(PLANET_FEATURE_TYPES.OCEAN_WORLD)) {
        // Subsurface ocean worlds
        if (features.includes(PLANET_FEATURE_TYPES.SUBSURFACE_OCEAN)) {
            return SETTLEMENT_TYPES.SUBMERGED_CITY
        }
        // High pressure/gravity ocean worlds -> Ocean trench cities
        if (features.includes(PLANET_FEATURE_TYPES.HIGH_GRAVITY) || 
            features.includes(PLANET_FEATURE_TYPES.THICK_ATMOSPHERE)) {
            return SETTLEMENT_TYPES.OCEAN_TRENCH_CITY
        }
        // Regular ocean worlds -> Floating cities
        return SETTLEMENT_TYPES.FLOATING_CITY
    }
    
    // Extreme volcanic activity -> Lava cities
    if (features.includes(PLANET_FEATURE_TYPES.VOLCANIC_ACTIVITY)) {
        return SETTLEMENT_TYPES.LAVA_CITY
    }
    
    // Hostile surface conditions requiring full protection
    const extremeRadiation = features.includes(PLANET_FEATURE_TYPES.HIGH_RADIATION) || 
                            features.includes(PLANET_FEATURE_TYPES.RADIATION_BELTS)
    const extremeTemperature = features.includes(PLANET_FEATURE_TYPES.EXTREMELY_HOT) || 
                              features.includes(PLANET_FEATURE_TYPES.EXTREMELY_COLD)
    const noPressure = features.includes(PLANET_FEATURE_TYPES.NO_ATMOSPHERE)
    
    // Completely inhospitable -> Orbital platforms
    if ((extremeRadiation && extremeTemperature) || 
        (extremeRadiation && noPressure && extremeTemperature)) {
        return SETTLEMENT_TYPES.ORBITAL_PLATFORM
    }
    
    // Very hostile but somewhat survivable -> Underground or canyon cities
    if (extremeRadiation || extremeTemperature) {
        // Check if planet has volcanic activity (likely has canyons/ravines)
        if (features.includes(PLANET_FEATURE_TYPES.VOLCANIC_ACTIVITY)) {
            return Math.random() < 0.5 ? SETTLEMENT_TYPES.UNDERGROUND_CITY : SETTLEMENT_TYPES.CANYON_CITY
        }
        return SETTLEMENT_TYPES.UNDERGROUND_CITY
    }
    
    // Harsh but manageable surface -> Domed cities
    if (noPressure || features.includes(PLANET_FEATURE_TYPES.THIN_ATMOSPHERE)) {
        return SETTLEMENT_TYPES.DOMED_CITY
    }
    
    // Low atmosphere rocky worlds with geological activity -> Canyon cities
    if (features.includes(PLANET_FEATURE_TYPES.THIN_ATMOSPHERE) &&
        features.includes(PLANET_FEATURE_TYPES.VOLCANIC_ACTIVITY)) {
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
    const market =  new Market(planet)
    const courthouse = new Courthouse(planet)
    const guild =  new Guild(planet)    

    console.log('disabling some buildings...')

    // Different body types have different chances of having buildings
    // Planets: 0% disabled (all buildings available)
    // Moons/Dwarf planets: 40% disabled (minimum 2 for dwarf planets)
    // Space stations: 80% disabled (minimum 1)
    const disableChance = planet.objectType == OBJECT_TYPES.PLANET ? 0 :
                          planet.objectType == OBJECT_TYPES.MOON || planet.objectType == OBJECT_TYPES.DWARF_PLANET ? 0.4 :
                          0.8
    // Only Shipyard, Market, Guild remain functional
    const buildings = [shipyard, market, guild].filter(b => b !== null)
    
    // First pass: randomly disable buildings
    for (const building of buildings) {
        if (Math.random() < disableChance) building.exists = false
        // Randomize building level from 1-3
        building.level = 1//Math.floor(Math.random() * 3) + 1
    }
    
    // Enforce minimum buildings for dwarf planets and space stations
    const enabledCount = buildings.filter(b => b.exists).length
    const minBuildings = planet.objectType == OBJECT_TYPES.DWARF_PLANET ? DWARF_PLANET_MIN_BUILDINGS :
                        planet.objectType == OBJECT_TYPES.SPACE_STATION ? SPACE_STATION_MIN_BUILDINGS :
                        0
    
    if (minBuildings > 0 && enabledCount < minBuildings) {
        // Re-enable random disabled buildings until we meet minimum
        const disabledBuildings = buildings.filter(b => !b.exists)
        const needToEnable = minBuildings - enabledCount
        for (let i = 0; i < needToEnable && disabledBuildings.length > 0; i++) {
            const randomIndex = Math.floor(Math.random() * disabledBuildings.length)
            disabledBuildings[randomIndex].exists = true
            disabledBuildings.splice(randomIndex, 1)
        }
    }

    return new Settlement({
        planet, 
        settlementType, 
        shipyard, 
        market, 
        guild,
        courthouse
    })
}
