
function checkForCollisionEncounter() {
    // Don't trigger while docked, in encounter, or during immunity/denial periods
    if (gs.location || gs.encounter) return false
    if (gs.year < gs.encounterImmunityUntilYear) return false
    if (gs.year < gs.encounterDeniedUntilYear) return false

    // Check for fleet collisions first
    const fleetCollision = checkForFleetCollision(FLEET_COLLISION_DISTANCE)
    if (fleetCollision) return true
    
    // Check for abandoned fleet collisions
    const abandonedFleetCollision = checkForAbandonedFleetCollision(FLEET_COLLISION_DISTANCE)
    if (abandonedFleetCollision) return true
    
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
    
    // Pause the game
    // Create encounter from existing fleet
    const encounter = generateEncounterForFleet(targetFleet)
    encounter.startEncounter()
    
    return true
}

/**
 * Check for collision with abandoned fleets
 * @param {number} collisionDistance - Distance threshold for collision
 * @returns {boolean} Whether an abandoned fleet collision encounter was triggered
 */
function checkForAbandonedFleetCollision(collisionDistance) {
    const playerFleet = gs.fleet
    const nearbyAbandonedFleets = gs.system.abandonedFleets.filter(fleet => {
        const distance = calcDistance(playerFleet.x, playerFleet.y, fleet.x, fleet.y)
        return distance < collisionDistance
    })
    
    if (nearbyAbandonedFleets.length === 0) return false
    
    // Get the closest abandoned fleet
    const abandonedFleet = nearbyAbandonedFleets.reduce((closest, fleet) => {
        const distToFleet = calcDistance(playerFleet.x, playerFleet.y, fleet.x, fleet.y)
        const distToClosest = calcDistance(playerFleet.x, playerFleet.y, closest.x, closest.y)
        return distToFleet < distToClosest ? fleet : closest
    })
    
    console.log('🚨 COLLISION WITH ABANDONED FLEET', {abandonedFleet, distance: calcDistance(playerFleet.x, playerFleet.y, abandonedFleet.x, abandonedFleet.y)})
    
    // 25% chance for trap, 75% chance for normal loot
    const isTrap = Math.random() < 0.25
    
    if (isTrap) {
        // Spring a trap - pirates or slavers ambush
        const isPirates = Math.random() < 0.5
        const randomPlanet = rndMember([...gs.system.planets, ...gs.system.dwarfPlanets])
        
        // Generate encounter with random planet's pirates/slavers
        const encounterType = isPirates ? ENCOUNTER_TYPES.PIRATES : ENCOUNTER_TYPES.SLAVERS
        const encounter = generateRandomEncounter(encounterType, randomPlanet)
        
        // Manually add abandoned fleet's ships to enemy fleet so player sees them
        for (const ship of abandonedFleet.ships) {
            encounter.fleet.addShip(ship)
        }
        
        // Use appropriate trap encounter class
        const TrapEncounterClass = isPirates ? PirateTrapEncounter : SlaverTrapEncounter
        encounter.constructor = TrapEncounterClass
        Object.setPrototypeOf(encounter, TrapEncounterClass.prototype)
        
        encounter.startEncounter()
    } else {
        // Normal loot - no trap
        const encounter = generateEncounterForFleet(abandonedFleet)
        encounter.startEncounter()
    }
    
    return true
}
