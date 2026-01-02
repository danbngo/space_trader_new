/**
 * Generates a space station with appropriate characteristics.
 * @param {string} name - The name of the space station.
 * @param {LagrangePoint} lagrangePoint - The Lagrange point where the station is located.
 * @param {AsteroidBelt[]} asteroidBelts - Asteroid belts in the system.
 * @returns {SpaceStation}
 */
function generateSpaceStation(name = "Station", lagrangePoint, asteroidBelts = []) {
    const stationType = determineSpaceStationSettlementType(null) // Station not created yet, function doesn't use parameter
    const color = stationType.color
    const radius = 0.001 // Small radius for stations
    
    // Copy orbit from lagrange point
    const orbit = lagrangePoint.orbit.clone()
    
    // Generate climate based on distance and type
    const distanceFromSun = orbit.radius
    const climate = generateStationClimate(distanceFromSun, asteroidBelts, stationType)
    
    // Day length (stations can rotate independently)
    const dayLength = rng(24, 1, false) / 24 // 1-24 hours converted to Earth days
    
    // Some stations might have artificial magnetosphere
    const magnetosphereRadius = stationType === SETTLEMENT_TYPES.BERNAL_SPHERE || 
                                 stationType === SETTLEMENT_TYPES.O_NEILL_CYLINDER
        ? 0.001 
        : 0
    
    const station = new SpaceStation(
        name,
        color,
        radius,
        orbit,
        stationType,
        null, // settlement - will be generated after station is created
        null, // civilization - will be generated after station is created
        climate,
        [], // features
        dayLength,
        magnetosphereRadius
    )
    
    // Generate civilization and settlement (like planets/dwarf planets)
    // Must be done after station is created so they can reference it
    station.civilization = generateCivilization(station)
    station.settlement = generateSettlement(station)
    return station
}

/**
 * Generates climate for a space station based on location and type.
 * @param {number} distanceFromSun - Distance from the sun in AU.
 * @param {AsteroidBelt[]} asteroidBelts - Asteroid belts in the system.
 * @param {SettlementType} stationType - The structural type of space station.
 * @returns {Climate}
 */
function generateStationClimate(distanceFromSun = 1.0, asteroidBelts = [], stationType) {
    // Temperature based on distance from sun
    let temperature
    if (distanceFromSun < 0.5) {
        temperature = TEMPERATURES.EXTREMELY_HIGH
    } else if (distanceFromSun < 1.5) {
        temperature = TEMPERATURES.HIGH
    } else if (distanceFromSun < 3.0) {
        temperature = TEMPERATURES.LOW
    } else {
        temperature = TEMPERATURES.EXTREMELY_LOW
    }
    
    // Most stations have controlled atmosphere
    const atmosphericPressure = ATMOSPHERIC_PRESSURES.MEDIUM
    
    // Artificial gravity varies by station type
    let gravity
    if (stationType === SETTLEMENT_TYPES.O_NEILL_CYLINDER || 
        stationType === SETTLEMENT_TYPES.STANFORD_TORUS ||
        stationType === SETTLEMENT_TYPES.BERNAL_SPHERE) {
        gravity = GRAVITIES.MEDIUM
    } else if (stationType === SETTLEMENT_TYPES.ROTATING_DRUM ||
               stationType === SETTLEMENT_TYPES.SPOKED_WHEEL ||
               stationType === SETTLEMENT_TYPES.HABITAT_RING) {
        gravity = GRAVITIES.LOW
    } else {
        gravity = GRAVITIES.EXTREMELY_LOW
    }
    
    // Ocean coverage - only certain station types might have artificial water features
    let oceanCoverage = OCEAN_COVERAGES.NONE
    let oceanType = null
    if (stationType === SETTLEMENT_TYPES.O_NEILL_CYLINDER || 
        stationType === SETTLEMENT_TYPES.BERNAL_SPHERE) {
        if (Math.random() < 0.3) { // 30% chance of having water features
            oceanCoverage = OCEAN_COVERAGES.MEDIUM
            oceanType = PLANET_OCEAN_TYPES.WATER
        }
    }
    
    // Geological activity - stations don't have natural geology
    const geologicalActivity = GEOLOGICAL_ACTIVITIES.NONE
    const geologyType = PLANET_GEOLOGY_TYPES.METALLIC // Stations are built from metal
    
    // Magnetosphere depends on station design
    let magnetosphere = MAGNETOSPHERES.NONE
    if (stationType === SETTLEMENT_TYPES.BERNAL_SPHERE || 
        stationType === SETTLEMENT_TYPES.O_NEILL_CYLINDER) {
        magnetosphere = MAGNETOSPHERES.LOW
    }
    
    // Radiation level based on distance and nearby asteroid belts
    let radiationLevel = RADIATION_LEVELS.LOW
    if (distanceFromSun < 0.5) {
        radiationLevel = RADIATION_LEVELS.HIGH
    }
    // Check if near asteroid belt
    for (const belt of asteroidBelts) {
        const distanceToBelt = Math.abs(distanceFromSun - belt.orbit.radius)
        if (distanceToBelt < 0.5) {
            radiationLevel = RADIATION_LEVELS.MEDIUM
            break
        }
    }
    
    // Asteroid impact risk based on proximity to belts
    let asteroidImpact = ASTEROID_IMPACTS.LOW
    for (const belt of asteroidBelts) {
        const distanceToBelt = Math.abs(distanceFromSun - belt.orbit.radius)
        if (distanceToBelt < 0.2) {
            asteroidImpact = ASTEROID_IMPACTS.VERY_HIGH
            break
        } else if (distanceToBelt < 0.5) {
            asteroidImpact = ASTEROID_IMPACTS.MEDIUM
        }
    }
    
    // Pollution - stations generally have low pollution due to advanced life support
    const pollution = POLLUTION_LEVELS.VERY_LOW
    
    // Atmosphere type - stations typically have breathable air
    const atmosphereType = PLANET_ATMOSPHERE_TYPES.OXYGEN_NITROGEN
    
    return new Climate(
        temperature,
        atmosphericPressure,
        gravity,
        oceanCoverage,
        geologicalActivity,
        magnetosphere,
        radiationLevel,
        asteroidImpact,
        pollution,
        atmosphereType,
        oceanType,
        geologyType
    )
}

/**
 * Generates multiple space stations for a star system.
 * @param {number} count - Number of stations to generate (default 3-5).
 * @param {LagrangePoint[]} lagrangePoints - Available Lagrange points to place stations at.
 * @param {AsteroidBelt[]} asteroidBelts - Asteroid belts in the system.
 * @returns {SpaceStation[]}
 */
function generateSpaceStations(count = rng(5, 3), lagrangePoints = [], asteroidBelts = []) {
    const stations = []
    const stationNames = [
        "Nexus Station", "Gateway Station", "Horizon Hub", "Orbital Nexus",
        "Celestial Station", "Stellar Outpost", "Deep Space Nine", "Babylon Station",
        "Aurora Station", "Prometheus Hub", "Elysium Station", "Meridian Outpost",
        "Solaris Station", "Nova Hub", "Zenith Station", "Eclipse Outpost",
        "Olympus Station", "Helios Hub", "Arcturus Station", "Cassiopeia Outpost"
    ]
    
    // Shuffle names and take the first 'count' names
    const shuffledNames = [...stationNames].sort(() => Math.random() - 0.5)
    
    // Shuffle lagrange points to get random selection
    const shuffledLagrangePoints = [...lagrangePoints].sort(() => Math.random() - 0.5)
    
    // Limit count to available lagrange points
    const actualCount = Math.min(count, shuffledLagrangePoints.length)
    
    for (let i = 0; i < actualCount; i++) {
        const name = shuffledNames[i] || `Station ${i + 1}`
        const lagrangePoint = shuffledLagrangePoints[i] // Use unique lagrange point for each station
        
        const station = generateSpaceStation(name, lagrangePoint, asteroidBelts)
        stations.push(station)
    }
    
    return stations
}
