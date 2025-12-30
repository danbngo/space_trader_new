/**
 * Generates a complete settlement with all buildings for a planet.
 * @param {Planet} planet - The planet to generate settlement for.
 * @returns {Settlement} The generated settlement.
 */
function generateSettlement(planet = new Planet()) {
    // Get moons for this planet (children that are Moon instances)
    const planetMoons = planet.children ? planet.children.filter(child => child instanceof Moon) : []
    
    // Helper function to randomly assign a moon or null
    const getRandomMoon = () => {
        if (planetMoons.length === 0) return null
        // 50% chance to be on a moon if moons exist
        return Math.random() < 0.5 ? rndMember(planetMoons) : null
    }
    
    const shipyard = new Shipyard(planet, getRandomMoon())
    const market =  new Market(planet, false, getRandomMoon())
    const blackMarket =  new Market(planet, true, getRandomMoon()) 
    const guild =  new Guild(planet, getRandomMoon()) 
    const bank =  new Bank(planet, getRandomMoon()) 
    const courthouse = new Courthouse(planet, getRandomMoon())
    const academy = new Academy(planet, false, getRandomMoon())
    const tavern = new Academy(planet, true, getRandomMoon())
    const cyberSurgeon = new CyberSurgeon(planet, getRandomMoon())
    const palace = new Palace(planet, getRandomMoon())

    // Dwarf planets have much lower chance of having buildings (95% disabled vs 80% for others)
    const disableChance = isDwarfPlanet(planet) ? 0.95 : 0.8
    const buildings = [shipyard, market, blackMarket, guild, bank, courthouse, academy, tavern, cyberSurgeon, palace]
    for (const building of buildings) if (Math.random() < disableChance) building.enabled = false

    return new Settlement(planet, shipyard, market, blackMarket, guild, bank, courthouse, academy, tavern, cyberSurgeon, palace)
}
