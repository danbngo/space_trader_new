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
    const count = rng(5, 1)
    const ships = [];
    for(let i=0;i<count;i++) {
        ships.push(generateShip(planet));
    }
    
    // Generate modules
    const moduleCount = rng(4, 1)
    const modules = []
    for(let i=0;i<moduleCount;i++) {
        modules.push(generateShipModule(planet))
    }
    
    const rake = rng(2, 0.5, false)
    const credits = rng(200*1000, 10*1000);
    return new Shipyard(planet, ships, modules, credits, rake);
}

function generateMarket(planet = new Planet(), blackMarket = false) {
    const marketCargo = new CountsMap();
    for (const ct of CARGO_TYPES_ALL) {
        marketCargo.setAmount(ct, Math.random() > .2 ? rng(MARKET_MAX_CARGO_PER_TYPE) : 0)
    }
    const credits = rng(MARKET_MAX_CREDITS, MARKET_MAX_CREDITS/10);
    const rake = rng(2, 0.5, false);
    return new Market(planet, blackMarket, marketCargo, credits, rake);
}

function generateGuild(planet = new Planet()) {
    const count = rng(5, 1)
    const officers = [];
    for(let i=0;i<count;i++) {
        officers.push(generateOfficer(planet));
    }
    const rake = rng(2, 0.5, false);
    return new Guild(planet, officers, rake);
}

function generateBank(planet = new Planet()) {
    const rake = rng(2, 0.5, false);
    const credits = rng(1000*1000, 50*1000);
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