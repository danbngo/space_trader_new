/**
 * Generates a ship with stats based on planet quality and ship type.
 * @param {Planet} planet - The planet determining ship quality.
 * @param {ShipType} shipType - The type of ship to generate.
 * @returns {Ship} The generated ship.
 */
function generateShip(planet = new Planet(), shipType = rndMember(SHIP_TYPES_ALL)) {
    const shipQuality = planet ? planet.culture.shipQuality : 1

    let maxHull =    Math.ceil(AVERAGE_SHIP_HULL*rng(2, 0.5, false)*shipType.hull*shipQuality) 
    let maxShields = Math.ceil(AVERAGE_SHIP_SHIELDS*rng(2, 0.5, false)*shipType.shields*shipQuality)
    let lasers =     Math.ceil(AVERAGE_SHIP_LASERS*rng(2, 0.5, false)*shipType.lasers*shipQuality)
    let radars =     Math.ceil(AVERAGE_SHIP_RADARS*rng(2, 0.5, false)*shipType.radars*shipQuality)
    let engine =  Math.ceil(AVERAGE_SHIP_ENGINE*rng(2, 0.5, false)*shipType.engine*shipQuality)
    let cargoSpace = Math.ceil(AVERAGE_SHIP_CARGO_SPACE*rng(2, 0.5, false)*shipType.cargoSpace*shipQuality)
    const shields = [maxShields, maxShields]
    const hull = [maxHull, maxHull]
    const maxActionsPerTurn = shipType.maxActionsPerTurn || SHIP_NUM_MOVES_PER_TURN

    const name = planet ? `${coloredIanName(planet)} ${shipType.name}` : shipType.name

    return new Ship(name, shipType, COLORS.LightGray, hull, shields, lasers, engine, cargoSpace, radars, maxActionsPerTurn);
}
