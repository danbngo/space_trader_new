
function checkForCollisionEncounter() {
    console.log('1a')
    // Don't trigger while docked, in encounter, or during immunity/denial periods
    if (gs.location || gs.encounter) return false
    console.log('2a')
    if (gs.year < gs.encounterImmunityUntilYear) return false
    console.log('3a')

    // Check for fleet collisions first
    const fleetCollision = checkForFleetCollision(FLEET_COLLISION_DISTANCE)
    if (fleetCollision) return true
    console.log('4a')
    
    // Check for abandoned fleet collisions
    const abandonedFleetCollision = checkForAbandonedFleetCollision(FLEET_COLLISION_DISTANCE)
    if (abandonedFleetCollision) return true
    console.log('5a')
    
    return false
}

/**
 * Check for collision with other fleets
 * @param {number} collisionDistance - Distance threshold for collision
 * @returns {boolean} Whether a fleet collision encounter was triggered
 */
function checkForFleetCollision(collisionDistance) {
    const playerFleet = gs.fleet
    
    // Check if player is near any planet - if so, they're safe from collisions
    const nearPlanet = gs.system.planets.some(planet => {
        const distance = calcDistance(playerFleet.x, playerFleet.y, planet.x, planet.y)
        return distance < FLEET_COLLISION_DISTANCE
    })
    
    if (nearPlanet) {
        console.log('Player near planet - safe from fleet collisions')
        return false
    }
    
    const nearbyFleets = gs.system.fleets.filter(fleet => {
        if (fleet === playerFleet) return false
        const distance = calcDistance(playerFleet.x, playerFleet.y, fleet.x, fleet.y)
        return distance < collisionDistance
    })
    
    // Debug logging
    if (gs.system.fleets.length > 1) {
        const closestFleet = gs.system.fleets
            .filter(f => f !== playerFleet)
            .reduce((closest, fleet) => {
                const dist = calcDistance(playerFleet.x, playerFleet.y, fleet.x, fleet.y)
                const closestDist = closest ? calcDistance(playerFleet.x, playerFleet.y, closest.x, closest.y) : Infinity
                return dist < closestDist ? fleet : closest
            }, null)
        
        if (closestFleet) {
            const closestDist = calcDistance(playerFleet.x, playerFleet.y, closestFleet.x, closestFleet.y)
            console.log(`Closest fleet: ${closestFleet.name} at distance ${closestDist.toFixed(4)} AU (collision at ${collisionDistance.toFixed(4)} AU)`)
        }
    }
    
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
    // REMOVED: Encounter system deleted - will be rewritten
    // const encounter = generateEncounterForFleet(targetFleet)
    // encounter.startEncounter()
    console.error('Encounter system deleted - fleet collision detected but no encounter created')
    
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
    
    // Check if crew is still aboard
    const hasCrew = abandonedFleet.officers && abandonedFleet.officers.length > 0
    
    if (hasCrew) {
        // Crew rescue encounter - player can rescue or attack
        const encounterType = ENCOUNTER_TYPES.NEUTRALS // Use neutral type as base
        // REMOVED: Encounter system deleted - will be rewritten
        // const encounter = new CrewRescueEncounter(encounterType, abandonedFleet.planet, abandonedFleet, [], null)
        // encounter.startEncounter()
        console.error('Encounter system deleted - crew rescue encounter detected but not created')
    } else {
        // No crew - can be trap or free loot
        // 25% chance for trap, 75% chance for normal loot
        const isTrap = Math.random() < 0.25
        
        if (isTrap) {
            // Spring a trap - pirates or slavers ambush
            const isPirates = Math.random() < 0.5
            const randomPlanet = rndMember([...gs.system.planets, ...gs.system.dwarfPlanets])
            
            // REMOVED: Encounter system deleted - will be rewritten
            // Generate encounter with random planet's pirates/slavers
            // const encounterType = isPirates ? ENCOUNTER_TYPES.PIRATES : ENCOUNTER_TYPES.SLAVERS
            // const encounter = generateRandomEncounter(encounterType, randomPlanet)
            // 
            // // Manually add abandoned fleet's ships to enemy fleet so player sees them
            // for (const ship of abandonedFleet.ships) {
            //     encounter.fleet.addShip(ship)
            // }
            // 
            // // Use appropriate trap encounter class
            // const TrapEncounterClass = isPirates ? PirateTrapEncounter : SlaverTrapEncounter
            // encounter.constructor = TrapEncounterClass
            // Object.setPrototypeOf(encounter, TrapEncounterClass.prototype)
            // 
            // encounter.startEncounter()
            console.error('Encounter system deleted - trap encounter detected but not created')
        } else {
            // Normal loot - no trap, no crew
            // REMOVED: Encounter system deleted - will be rewritten
            // const encounter = generateEncounterForFleet(abandonedFleet)
            // encounter.startEncounter()
            console.error('Encounter system deleted - abandoned fleet loot encounter detected but not created')
        }
    }
    
    return true
}
