function generateShip(type) {
    let maxHull = rng(125, 25)
    let maxShields = rng(125, 25)
    let lasers = rng(25, 5)
    let thrusters = rng(25, 5)
    let cargoSpace = rng(25, 5)

    switch(type) {
        case 'Cargo ship':
            cargoSpace *= 5;
            break;
        case 'Transport':
            thrusters *= 5;
            break;
        case 'Destroyer':
            lasers *= 5;
            break;
        case 'Mining ship':
            maxHull *= 5;
            break;
        case 'War ship':
            maxShields *= 5;
            break;
    }

    const shields = [maxShields, maxShields]
    const hull = [maxHull, maxHull]

    return new Ship(type, hull, shields, lasers, thrusters, cargoSpace, new Cargo());
}

function generateOfficerName() {
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

function generateShipyard() {
    const count = Math.floor(Math.random() * 4);
    const ships = [];
    const types = ['Cargo ship','Transport','Destroyer','Mining ship','War ship'];
    for(let i=0;i<count;i++) {
        ships.push(generateShip(types[rng(types.length-1)]));
    }
    const priceModifier = Math.random() > .5 ? 1/rng(3, 1, false) : rng(3, 1, false)
    const rake = rng(0, 3, false)
    const credits = rng(10000, 200000);
    return new Shipyard(ships, credits, priceModifier, rake);
}

function generateMarket() {
    const marketCargo = new Cargo();
    const cargoPriceModifiers = new Cargo()
    for (const ct of CARGO_TYPES_ALL) {
        marketCargo.setAmount(ct, Math.random() > .2 ? rng(50) : 0)
        cargoPriceModifiers.setAmount(ct, Math.random() > .5 ? 1/rng(5,1,false) : rng(5,1,false))
    }
    const credits = rng(10000, 200000);
    const rake = rng(0, 3, false);
    return new Market(marketCargo, credits, cargoPriceModifiers, rake);
}

function generateGuild() {
    const count = rng()
    const officers = [];
    for(let i=0;i<count;i++) {
        officers.push(generateOfficer());
    }
    const priceModifier = Math.random() > .5 ? 1/rng(5,1,false) : rng(5,1,false)
    const rake = rng(0, 3, false);
    return new Guild(officers, priceModifier, rake);
}