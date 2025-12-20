function generateShip(planet = new Planet(), shipType = rndMember(SHIP_TYPES_ALL)) {
    const {culture} = planet
    const {shipQuality} = culture

    let maxHull =    Math.ceil(AVERAGE_SHIP_HULL*rng(2, 0.5, false)*shipType.hull*shipQuality) 
    let maxShields = Math.ceil(AVERAGE_SHIP_SHIELDS*rng(2, 0.5, false)*shipType.shields*shipQuality)
    let lasers =     Math.ceil(AVERAGE_SHIP_LASERS*rng(2, 0.5, false)*shipType.lasers*shipQuality)
    let radars =     Math.ceil(AVERAGE_SHIP_RADARS*rng(2, 0.5, false)*shipType.radars*shipQuality)
    let thrusters =  Math.ceil(AVERAGE_SHIP_THRUSTERS*rng(2, 0.5, false)*shipType.thrusters*shipQuality)
    let cargoSpace = Math.ceil(AVERAGE_SHIP_CARGO_SPACE*rng(2, 0.5, false)*shipType.cargoSpace*shipQuality)
    const shields = [maxShields, maxShields]
    const hull = [maxHull, maxHull]

    const name = `${planet.name} ${shipType.name}`

    return new Ship(name, shipType, COLORS.LightGray, hull, shields, lasers, thrusters, cargoSpace, radars);
}
