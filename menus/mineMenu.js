/**
 * Handles manual mining operations from the star map
 */

/**
 * Check if player fleet is near any asteroid
 * @returns {{belt: AsteroidBelt, asteroid: Asteroid}|null} The nearest asteroid and its belt if within mining range, null otherwise
 */
function checkNearbyAsteroid() {
    const playerFleet = gs.fleet
    const asteroids = gs.system.asteroids
    
    if (!asteroids || asteroids.length === 0) return null
    
    // Find asteroids the player is close enough to mine
    const nearbyAsteroids = []
    for (const asteroid of asteroids) {
        const distance = calcDistance(playerFleet.x, playerFleet.y, asteroid.x, asteroid.y)
        if (distance < ASTEROID_MINING_DISTANCE) {
            nearbyAsteroids.push({asteroid, distance})
        }
    }
    
    if (nearbyAsteroids.length === 0) return null
    
    // Return the closest asteroid and its belt
    const closest = nearbyAsteroids.sort((a, b) => a.distance - b.distance)[0]
    return {belt: closest.asteroid.belt, asteroid: closest.asteroid}
}

/**
 * Initiate mining operation at nearby asteroid belt
 */
function startMining() {
    const nearbyData = checkNearbyAsteroid()
    
    if (!nearbyData) {
        showModal('No Asteroids Nearby', 
            `You need to be near an asteroid belt to mine.<br/>Navigate closer to an asteroid field on the star map.`,
            [['OK', () => closeModal()]]
        )
        return
    }
    
    const {belt, asteroid} = nearbyData
    console.log('🪨 STARTING MINING OPERATION', {belt, asteroid, asteroidBeltType: belt.asteroidBeltType})
    
    const encounterType = rndMember(belt.encounterTypes)
    
    console.log('Mining encounter type:', encounterType.name)
    
    // Generate the mining encounter
    const encounter = generateRandomEncounter(encounterType, null)
    
    // Store reference to the asteroid being mined so we can randomize it after the encounter
    encounter.minedAsteroid = asteroid
    
    // Start the encounter
    encounter.startEncounter()
}
