
function checkForCollisionEncounter() {
    // Don't trigger while docked, in encounter, or during immunity/denial periods
    if (gs.location || gs.encounter) return false
    if (gs.year < gs.encounterImmunityUntilYear) return false
    if (gs.year < gs.encounterDeniedUntilYear) return false

    // Check for fleet collisions first
    const fleetCollision = checkForFleetCollision(FLEET_COLLISION_DISTANCE)
    if (fleetCollision) return true
    
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

