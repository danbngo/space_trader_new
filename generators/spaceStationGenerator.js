/**
 * Generates a space station with appropriate characteristics.
 * @param {string} name - The name of the space station.
 * @param {LagrangePoint} lagrangePoint - The Lagrange point where the station is located.
 * @param {AsteroidBelt[]} asteroidBelts - Asteroid belts in the system.
 * @returns {SpaceStation}
 */
function generateSpaceStation(name = "Station", lagrangePoint, asteroidBelts = []) {
    console.log('generating space station:',name,lagrangePoint,asteroidBelts)
    const stationType = determineSpaceStationSettlementType(null) // Station not created yet, function doesn't use parameter
    const color = stationType.color
    const radius = 0.001 // Small radius for stations
    
    console.log('generating station orbit')
    // Copy orbit from lagrange point
    const orbit = lagrangePoint.orbit.clone()
    // Generate climate based on distance and type
    const distanceFromSun = orbit.radius
    console.log('generating station climate')
    const climate = generateStationClimate(distanceFromSun, asteroidBelts, stationType)
    
    // Day length (stations can rotate independently)
    const dayLength = rng(24, 1, false) / 24 // 1-24 hours converted to Earth days
    
    // Some stations might have artificial magnetosphere
    const magnetosphereRadius = stationType === SETTLEMENT_TYPES.BERNAL_SPHERE || 
                                 stationType === SETTLEMENT_TYPES.O_NEILL_CYLINDER
        ? 0.001 
        : 0
    
    console.log('instantiating space station')
    const station = new SpaceStation(
        name,
        color,
        radius,
        orbit,
        null,
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
    
    // Assign this station as a subject of a random major planet
    // This must be done after SOLAR_SYSTEM is created with all planets
    // The actual relationship setup happens in generateSpaceStations after all stations exist
    
    return station
}

/**
 * Generates climate for a space station based on location and type.
 * @param {number} distanceFromSun - Distance from the sun in AU.
 * @param {AsteroidBelt[]} asteroidBelts - Asteroid belts in the system.
 * @param {SettlementType} stationType - The structural type of space station.
 * @returns {null} Climate system has been removed - space stations no longer have climate
 */
function generateStationClimate(distanceFromSun = 1.0, asteroidBelts = [], stationType) {
    // Climate class has been removed from the game
    // Space stations now work without climate data
    return null
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

    console.log('adding # space stations:',actualCount)
    
    for (let i = 0; i < actualCount; i++) {
        const name = shuffledNames[i] || `Station ${i + 1}`
        const lagrangePoint = shuffledLagrangePoints[i] // Use unique lagrange point for each station

        console.log(name,lagrangePoint)
        
        const station = generateSpaceStation(name, lagrangePoint, asteroidBelts)
        stations.push(station)
    }
    
    // Set up relationships for all stations after they're created
    // Each station becomes a subject of a random major planet
    const allBodies = [...gs.system.planets, ...gs.system.dwarfPlanets, ...gs.system.moons]
    
    for (const station of stations) {
        // Pick a random planet to be this station's sovereign
        const sovereign = rndMember(gs.system.planets)
        console.log('sovereign picked for station:',sovereign)
        
        // Set up subject-sovereign relationship
        station.c.relationships.set(sovereign, RELATIONSHIP_TYPES.SUBJECT)
        sovereign.c.relationships.set(station, RELATIONSHIP_TYPES.SOVEREIGN)
        
        // Set neutral relationships with all other bodies
        for (const body of allBodies) {
            if (body !== sovereign && !station.c.relationships.has(body)) {
                station.c.relationships.set(body, RELATIONSHIP_TYPES.NEUTRAL)
            }
        }
        
        console.log(`${station.name} is now a subject of ${sovereign.name}`)
    }
    
    return stations
}
