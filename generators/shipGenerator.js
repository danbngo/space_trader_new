/**
 * Generates a ship with stats based on planet quality and ship type.
 * @param {Planet} planet - The planet determining ship quality.
 * @param {ShipType} shipType - The type of ship to generate.
 * @returns {Ship|AsteroidShip} The generated ship.
 */
function generateShip(planet = new Planet(), shipType = rndMember(SHIP_TYPES_ALL)) {
    const technology = planet ? planet.c.technology : 1

    let maxHull =    Math.ceil(AVERAGE_SHIP_HULL*rng(2, 0.5, false)*shipType.hull*technology) 
    let maxShields = Math.ceil(AVERAGE_SHIP_SHIELDS*rng(2, 0.5, false)*shipType.shields*technology)
    let maxLasers =     Math.ceil(AVERAGE_SHIP_LASERS*rng(2, 0.5, false)*shipType.lasers*technology)
    let radars =     Math.ceil(AVERAGE_SHIP_RADARS*rng(2, 0.5, false)*shipType.radars*technology)
    let engine =  Math.ceil(AVERAGE_SHIP_ENGINE*rng(2, 0.5, false)*shipType.engine*technology)
    let cargoSpace = Math.ceil(AVERAGE_SHIP_CARGO_SPACE*rng(2, 0.5, false)*shipType.cargoSpace*technology)
    let fuelCapacity = Math.ceil(AVERAGE_SHIP_FUEL_CAPACITY*rng(2, 0.5, false)*shipType.fuelCapacity*technology)
    const shields = [maxShields, maxShields]
    const hull = [maxHull, maxHull]
    const lasers = [maxLasers,maxLasers]
    const maxActionsPerTurn = shipType.maxActionsPerTurn || SHIP_NUM_MOVES_PER_TURN

    const name = planet ? `${coloredIanName(planet)} ${shipType.name}` : shipType.name

    // Check if this is an asteroid ship type
    const isAsteroid = ASTEROID_SHIP_TYPES_ALL.includes(shipType);
    
    if (isAsteroid) {
        return new AsteroidShip(name, shipType, COLORS.LightGray, hull, shields, lasers, engine, cargoSpace, radars, fuelCapacity, maxActionsPerTurn);
    } else {
        return new Ship(name, shipType, COLORS.LightGray, hull, shields, lasers, engine, cargoSpace, radars, fuelCapacity, maxActionsPerTurn);
    }
}
