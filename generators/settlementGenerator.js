/**
 * Generates a complete settlement with all buildings for a planet.
 * @param {Planet} planet - The planet to generate settlement for.
 * @returns {Settlement} The generated settlement.
 */
function generateSettlement(planet = new Planet()) {
    const shipyard = generateShipyard(planet)
    const market =  generateMarket(planet, false)
    const blackMarket =  generateMarket(planet, true) 
    const guild =  generateGuild(planet) 
    const bank =  generateBank(planet) 
    const courthouse = generateCourthouse(planet)
    const academy = generateAcademy(planet)

    const buildings = [shipyard, market, blackMarket, guild, bank, courthouse, academy]
    for (const building of buildings) if (Math.random() > .8) building.enabled = false

    return new Settlement(planet, shipyard, market, blackMarket, guild, bank, courthouse, academy)
}
/**
 * Generates a ship module with quality based on planet.
 * @param {Planet} planet - The planet determining module quality.
 * @param {ShipModuleType} moduleType - The type of module to generate.
 * @returns {ShipModule} The generated ship module.
 */
function generateShipModule(planet = new Planet(), moduleType = rndMember(SHIP_MODULE_TYPES_ALL)) {
    const technology = planet ? planet.civilization.technology : 1
    const quality = rng(2, 0.5, false)*technology
    return new ShipModule(moduleType, quality)
}

/**
 * Generates a shipyard building with ships and modules for sale.
 * @param {Planet} planet - The planet the shipyard is on.
 * @returns {Shipyard} The generated shipyard.
 */
function generateShipyard(planet = new Planet()) {
    const count = Math.round(SHIPYARD_AVERAGE_NUM_SHIPS * rng(2,0,false))
    const ships = [];
    for(let i=0;i<count;i++) {
        ships.push(generateShip(planet));
    }
    
    // Generate modules
    const moduleCount = Math.round(SHIPYARD_AVERAGE_NUM_MODULES * rng(2,0,false))
    const modules = []
    for(let i=0;i<moduleCount;i++) {
        modules.push(generateShipModule(planet))
    }
    
    const rake = rng(2, 0.5, false)
    const credits = Math.round(BANK_AVERAGE_CREDITS * rng(2,0,false));
    return new Shipyard(planet, ships, modules, credits, rake);
}
/**
 * Generates a market building with cargo inventory.
 * @param {Planet} planet - The planet the market is on.
 * @param {boolean} blackMarket - Whether this is a black market.
 * @returns {Market} The generated market.
 */
function generateMarket(planet = new Planet(), blackMarket = false) {
    const marketCargo = new CountsMap();
    for (const ct of CARGO_TYPES_ALL) {
        marketCargo.setAmount(ct, Math.round(MARKET_AVERAGE_CARGO_PER_TYPE * rng(2,0,false)))
    }
    const credits = Math.round(MARKET_AVERAGE_CREDITS * rng(2,0,false));
    const rake = rng(2, 0.5, false);
    return new Market(planet, blackMarket, marketCargo, credits, rake);
}
/**
 * Generates a guild building with officers for hire.
 * @param {Planet} planet - The planet the guild is on.
 * @returns {Guild} The generated guild.
 */
function generateGuild(planet = new Planet()) {
    const count = Math.round(GUILD_AVERAGE_NUM_OFFICERS * rng(2,0,false));
    const officers = [];
    for(let i=0;i<count;i++) {
        officers.push(generateOfficer(planet));
    }
    const rake = rng(2, 0.5, false);
    return new Guild(planet, officers, rake);
}
/**
 * Generates a bank building.
 * @param {Planet} planet - The planet the bank is on.
 * @returns {Bank} The generated bank.
 */
function generateBank(planet = new Planet()) {
    const rake = rng(2, 0.5, false);
    const credits = Math.round(BANK_AVERAGE_CREDITS * rng(2,0,false));
    return new Bank(planet, credits, rake)    
}
/**
 * Generates a courthouse building.
 * @param {Planet} planet - The planet the courthouse is on.
 * @returns {Courthouse} The generated courthouse.
 */
function generateCourthouse(planet = new Planet()) {
    const rake = rng(2, 0.5, false);
    return new Courthouse(planet, rake)    
}
/**
 * Generates an academy building with randomized skill costs.
 * @param {Planet} planet - The planet the academy is on.
 * @returns {Academy} The generated academy.
 */
function generateAcademy(planet = new Planet()) {
    const rake = rng(2, 0.5, false);
    
    // Generate skill cost modifiers (0.5-2.0 range)
    // Some skills will be cheaper, some more expensive at each academy
    const skillCosts = new CountsMap()
    for (const skill of SKILLS_ALL) {
        const costModifier = rng(2, 0.5, false)
        skillCosts.setAmount(skill, costModifier)
    }
    
    return new Academy(planet, skillCosts, rake)
}