/**
 * Generates a complete settlement with all buildings for a planet.
 * @param {Planet} planet - The planet to generate settlement for.
 * @returns {Settlement} The generated settlement.
 */
function generateSettlement(planet = new Planet()) {
    const shipyard = new Shipyard(planet)
    const market =  new Market(planet, false)
    const blackMarket =  new Market(planet, true) 
    const guild =  new Guild(planet) 
    const bank =  new Bank(planet) 
    const courthouse = new Courthouse(planet)
    const academy = new Academy(planet, false)
    const tavern = new Academy(planet, true)
    const cyberSurgeon = new CyberSurgeon(planet)
    const palace = new Palace(planet)

    const buildings = [shipyard, market, blackMarket, guild, bank, courthouse, academy, tavern, cyberSurgeon, palace]
    for (const building of buildings) if (Math.random() > .8) building.enabled = false

    return new Settlement(planet, shipyard, market, blackMarket, guild, bank, courthouse, academy, tavern, cyberSurgeon, palace)
}
