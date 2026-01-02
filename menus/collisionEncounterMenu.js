/**
 * Checks for collision-based encounters with fleets or asteroids
 * @returns {boolean} Whether a collision encounter was triggered
 */
function checkForCollisionEncounter() {
    // Don't trigger while docked, in encounter, or during immunity/denial periods
    if (gs.location || gs.encounter) return false
    if (gs.year < gs.encounterImmunityUntilYear) return false
    if (gs.year < gs.encounterDeniedUntilYear) return false

    // Check for fleet collisions first
    const fleetCollision = checkForFleetCollision(FLEET_COLLISION_DISTANCE)
    if (fleetCollision) return true
    
    // Check for asteroid collisions
    //const asteroidCollision = checkForAsteroidCollision(FLEET_COLLISION_DISTANCE)
    //if (asteroidCollision) return true
    
    return false
}

/**
 * Check for collision with other fleets
 * @param {number} collisionDistance - Distance threshold for collision
 * @returns {boolean} Whether a fleet collision encounter was triggered
 */
function checkForFleetCollision(collisionDistance) {
    const playerFleet = gs.fleet
    const nearbyFleets = gs.system.fleets.filter(fleet => {
        if (fleet === playerFleet) return false
        const distance = calcDistance(playerFleet.x, playerFleet.y, fleet.x, fleet.y)
        return distance < collisionDistance
    })
    
    if (nearbyFleets.length === 0) return false
    
    // Get the closest fleet
    const targetFleet = nearbyFleets.reduce((closest, fleet) => {
        const distToFleet = calcDistance(playerFleet.x, playerFleet.y, fleet.x, fleet.y)
        const distToClosest = calcDistance(playerFleet.x, playerFleet.y, closest.x, closest.y)
        return distToFleet < distToClosest ? fleet : closest
    })
    
    console.log('🚨 COLLISION WITH FLEET', {targetFleet, distance: calcDistance(playerFleet.x, playerFleet.y, targetFleet.x, targetFleet.y)})
    
    // Determine encounter type based on fleet type
    const encounterType = getEncounterTypeForFleet(targetFleet)
    if (!encounterType) {
        console.warn('Could not determine encounter type for fleet:', targetFleet)
        return false
    }
    
    // Pause the game
    // Create encounter from existing fleet
    const encounter = createEncounterFromFleet(encounterType, targetFleet)
    
    // Show modal asking player if they want to engage
    showModal(`Encountered ${coloredName(targetFleet)}`, 
        `You've crossed paths with a ${targetFleet.fleetType.name} fleet!<br/>What do you want to do?`,
        [
            ['Engage', () => {
                encounter.startEncounter()
            }],
            ['Avoid', () => {
                // Set denial period
                gs.encounterDeniedUntilYear = gs.year + (ENCOUNTER_DENIED_DAYS / 365)
                closeModal()
            }]
        ]
    )
    
    return true
}

/**
 * Check for collision with asteroids
 */
/*function checkForAsteroidCollision(collisionDistance) {
    const playerFleet = gs.fleet
    const asteroids = gs.system.asteroids
    
    // Find asteroids the player is very close to
    const nearbyAsteroids = []
    for (const asteroid of asteroids) {
        // Calculate distance from player to asteroid's orbital path
        const distance = calcDistance(playerFleet.x, playerFleet.y, asteroid.x, asteroid.y)
        // Check if within the asteroid belt's width
        if (distance < collisionDistance) {
            nearbyAsteroids.push({asteroid, distance})
        }
    }
    
    if (nearbyAsteroids.length === 0) return false
    
    // Get the closest asteroid belt
    const closest = nearbyAsteroids.sort((a, b) => a.distance - b.distance)[0]
    const asteroid = closest.asteroid
    const belt = asteroid.belt
    
    console.log('🚨 COLLISION WITH ASTEROID BELT', {asteroid, belt, distance: closest.distance})
    
    // Select appropriate encounter type based on belt type
    const encounterType = rndMember(belt.encounterTypes)
    
    // Pause the game
    // Generate the hazard encounter
    const encounter = generateEncounter(encounterType, null, belt.effectTypes)
    
    // Show modal asking player if they want to mine or avoid
    showModal(`Encountered ${belt.name}`, 
        `You've entered a ${belt.beltType.name} asteroid belt!<br/>What do you want to do?`,
        [
            ['Mine', () => {
                encounter.startEncounter()
            }],
            ['Avoid', () => {
                // Set denial period
                gs.encounterDeniedUntilYear = gs.year + (ENCOUNTER_DENIED_DAYS / 365)
                closeModal()
            }]
        ]
    )
    
    return true
}
*/

/**
 * Get appropriate encounter type for a given fleet
 * @param {Fleet} fleet - The fleet to get encounter type for
 * @returns {EncounterType|null} The matching encounter type
 */
function getEncounterTypeForFleet(fleet) {
    const fleetTypeName = fleet.fleetType.name.toUpperCase().replace(/ /g, '_')
    
    // Direct mapping from fleet type to encounter type
    const encounterType = ENCOUNTER_TYPES[fleetTypeName]
    if (encounterType) return encounterType
    
    // Fallback: try to match by fleet type object reference
    for (const [key, encType] of Object.entries(ENCOUNTER_TYPES)) {
        if (encType.fleetType === fleet.fleetType) {
            return encType
        }
    }
    
    return null
}

/**
 * Create an encounter from an existing NPC fleet
 * @param {EncounterType} encounterType - The encounter type
 * @param {Fleet} npcFleet - The NPC fleet to encounter
 * @returns {Encounter} The created encounter
 */
function createEncounterFromFleet(encounterType, npcFleet) {
    // Set AI type for all ships in the fleet
    for (const ship of npcFleet.ships) {
        ship.aiType = encounterType.aiType
    }
    
    // Get the encounter class from the encounterType
    const EncounterClass = encounterType.encounterClass || Encounter
    
    // Find nearest planet for context
    //const nearestPlanet = findNearestPlanet(npcFleet.x, npcFleet.y)
    
    // Create the encounter with the existing fleet
    const encounter = new EncounterClass(encounterType, npcFleet.planet, npcFleet, [])
    
    // Randomly choose formation for certain encounter types
    if ((encounterType === ENCOUNTER_TYPES.PIRATES || encounterType === ENCOUNTER_TYPES.SLAVERS) && Math.random() < 0.5) {
        encounter.encounterType.formationType = FORMATION_TYPES.PlayerEncircled
    }
    
    console.log('Created encounter from existing fleet:', {encounter, encounterType, npcFleet})
    
    return encounter
}

/**
 * Find the nearest planet to given coordinates
 */
/*
function findNearestPlanet(x, y) {
    const planets = gs.system.planets
    if (planets.length === 0) return null
    
    return planets.reduce((nearest, planet) => {
        const distToPlanet = calcDistance(x, y, planet.x, planet.y)
        const distToNearest = calcDistance(x, y, nearest.x, nearest.y)
        return distToPlanet < distToNearest ? planet : nearest
    })
}*/
