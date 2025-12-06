function generateShip(planet = new Planet(), shipType = rndMember(SHIP_TYPES_ALL)) {
    const {culture} = planet
    const {shipQuality} = culture
    console.log('culture, shipquality:',culture,shipQuality)

    let maxHull =    round(rng(125, 25)*shipType.hull*shipQuality) 
    let maxShields = round(rng(125, 25)*shipType.shields*shipQuality)
    let lasers =     round(rng(25, 5)*shipType.lasers*shipQuality)
    let thrusters =  round(rng(25, 5)*shipType.thrusters*shipQuality)
    let cargoSpace = round(rng(25, 5)*shipType.cargoSpace*shipQuality)

    const shields = [maxShields, maxShields]
    const hull = [maxHull, maxHull]

    const name = `${planet.name} ${shipType.name}`

    return new Ship(name, hull, shields, lasers, thrusters, cargoSpace, new Cargo());
}

function generateOfficerName(planet = new Planet()) {
    const syllables = ["ka", "zo", "ri", "tan", "vek", "shi", "lor", "an", "ex", "qu"];
    let name = "";
    const syllableCount = rng(5,2)
    for(let i=0;i<syllableCount;i++) {
        name += syllables[rng(syllables.length-1)];
    }
    return name.charAt(0).toUpperCase() + name.slice(1);
}

function generateOfficer() {
    return new Officer(generateOfficerName(), rng(100), 0, 0, rng(10), rng(10), rng(10));
}

function generateShipyard(planet = new Planet()) {
    const count = Math.floor(Math.random() * 4);
    const ships = [];
    for(let i=0;i<count;i++) {
        ships.push(generateShip(planet));
    }
    const rake = rng(2, 1, false)
    const credits = rng(200*1000, 10*1000);
    return new Shipyard(planet, ships, credits, rake);
}

function generateMarket(planet = new Planet()) {
    const marketCargo = new Cargo();
    for (const ct of CARGO_TYPES_ALL) {
        marketCargo.setAmount(ct, Math.random() > .2 ? rng(50) : 0)
    }
    const credits = rng(200*1000, 10*1000);
    const rake = rng(2, 1, false);
    return new Market(planet, marketCargo, credits, rake);
}

function generateGuild(planet = new Planet()) {
    const count = rng()
    const officers = [];
    for(let i=0;i<count;i++) {
        officers.push(generateOfficer());
    }
    const rake = rng(2, 1, false);
    return new Guild(planet, officers, rake);
}

function generateCulture(planet = new Planet()) {
    const shipQuality = Math.random() > .5 ? 1/rng(3,1,false) : rng(3,1,false)
    const cargoPriceModifiers = new Cargo()
    for (const ct of CARGO_TYPES_ALL) {
        cargoPriceModifiers.setAmount(ct, Math.random() > .5 ? 1/rng(5,1,false) : rng(5,1,false))
    }
    return new Culture(cargoPriceModifiers, shipQuality, )
}

function generateSettlement(planet = new Planet()) {
    const shipyard = generateShipyard(planet);
    const market = generateMarket(planet);
    const blackMarket = generateMarket(planet);
    const guild = generateGuild(planet);
    return new Settlement(shipyard, market, blackMarket, guild)
}