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

function generateShipModule(planet = new Planet(), moduleType = rndMember(SHIP_MODULE_TYPES_ALL)) {
    const shipQuality = planet ? planet.culture.shipQuality : 1
    const quality = rng(2, 0.5, false)*shipQuality
    return new ShipModule(moduleType, quality)
}

    
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

function generateMarket(planet = new Planet(), blackMarket = false) {
    const marketCargo = new CountsMap();
    for (const ct of CARGO_TYPES_ALL) {
        marketCargo.setAmount(ct, Math.round(MARKET_AVERAGE_CARGO_PER_TYPE * rng(2,0,false)))
    }
    const credits = Math.round(MARKET_AVERAGE_CREDITS * rng(2,0,false));
    const rake = rng(2, 0.5, false);
    return new Market(planet, blackMarket, marketCargo, credits, rake);
}

function generateGuild(planet = new Planet()) {
    const count = Math.round(GUILD_AVERAGE_NUM_OFFICERS * rng(2,0,false));
    const officers = [];
    for(let i=0;i<count;i++) {
        officers.push(generateOfficer(planet));
    }
    const rake = rng(2, 0.5, false);
    return new Guild(planet, officers, rake);
}

function generateBank(planet = new Planet()) {
    const rake = rng(2, 0.5, false);
    const credits = rng(0.5*BANK_AVERAGE_CREDITS, 2*BANK_AVERAGE_CREDITS);
    return new Bank(planet, credits, rake)    
}

function generateCourthouse(planet = new Planet()) {
    const rake = rng(2, 0.5, false);
    return new Courthouse(planet, rake)    
}

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