function generateSettlement(planet = new Planet()) {
    const shipyard = Math.random() > .2 ? generateShipyard(planet) : null;
    const market =  Math.random() > .2 ? generateMarket(planet, false) : null
    const blackMarket =  Math.random() > .2 ? generateMarket(planet, true) : null
    const guild =  Math.random() > .2 ? generateGuild(planet) : null
    const bank =  Math.random() > .2 ? generateBank(planet) : null
    const courthouse = Math.random() > .2 ? generateCourthouse(planet) : null;
    const academy = Math.random() > .2 ? generateAcademy(planet) : null;
    return new Settlement(shipyard, market, blackMarket, guild, bank, courthouse, academy)
}


function generateShipyard(planet = new Planet()) {
    const count = rng(5, 1)
    const ships = [];
    for(let i=0;i<count;i++) {
        ships.push(generateShip(rndMember(SHIP_TYPES_ALL), planet));
    }
    
    // Generate modules
    const moduleCount = rng(4, 1)
    const modules = []
    const allModuleTypes = Object.values(SHIP_MODULE_TYPES)
    for(let i=0;i<moduleCount;i++) {
        const moduleType = rndMember(allModuleTypes)
        const quality = rng(1.5, 0.5, false)
        modules.push(new ShipModule(moduleType, quality))
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