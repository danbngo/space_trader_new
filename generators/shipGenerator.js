function generateShip(planet = new Planet(), shipType = rndMember(SHIP_TYPES_ALL)) {
    const {culture} = planet
    const {shipQuality} = culture

    let maxHull =    Math.round(AVERAGE_SHIP_HULL*rng(2, 0.5, false)*shipType.hull*shipQuality) 
    let maxShields = Math.round(AVERAGE_SHIP_SHIELDS*rng(2, 0.5, false)*shipType.shields*shipQuality)
    let lasers =     Math.round(rng(2, 0.5, false)*shipType.lasers*shipQuality)
    let thrusters =  Math.round(rng(2, 0.5, false)*shipType.thrusters*shipQuality)
    let cargoSpace = Math.round(rng(2, 0.5, false)*shipType.cargoSpace*shipQuality)

    const shields = [maxShields, maxShields]
    const hull = [maxHull, maxHull]

    const name = `${planet.name} ${shipType.name}`

    return new Ship(name, '#ccc', hull, shields, lasers, thrusters, cargoSpace, new CountsMap());
}
