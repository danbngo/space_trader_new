/**
 * Generates a random mission for the guild.
 * @param {Planet} planet - The planet where the mission originates.
 * @returns {Mission} The generated mission.
 */
function generateMission(planet = new Planet()) {
    // Select random mission type
    const selectedType = rndMember(MISSION_TYPES_ALL)
    
    // Generate mission parameters based on type
    const otherPlanets = gs.system.planets.filter(p => p !== planet)
    const targetPlanet = otherPlanets.length > 0 ? rndMember(otherPlanets) : null
    
    // Generate amount within range
    const amount = Math.round(rng(selectedType.maxAmount, selectedType.minAmount))
    
    // Generate duration within range
    const duration = rng(selectedType.maxDuration, selectedType.minDuration, false)
    const expirationDate = gs.year + duration
    
    // Calculate reward using MissionType's formula
    let reward = selectedType.calcReward(amount, duration)
    
    // Apply civilization modifiers to reward
    reward = Math.round(reward * planet.c.wealth * (1 + planet.c.inflationRate))
    
    // Determine cargo type if needed
    let cargoType = null
    if (selectedType === MISSION_TYPES.CARGO_DELIVERY) {
        cargoType = rndMember(CARGO_TYPES_ALL)
    }
    
    return new Mission(
        selectedType,
        planet,
        targetPlanet,
        expirationDate,
        cargoType,
        amount,
        reward,
    )
}
