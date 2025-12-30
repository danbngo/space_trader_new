/**
 * Generates cargo for a fleet based on its type.
 * @param {Fleet} fleet - The fleet to generate cargo for.
 * @param {FleetType} fleetType - The type of fleet determining cargo types.
 * @returns {CountsMap} The generated cargo inventory.
 */
function generateFleetCargo(fleet = new Fleet(), fleetType = rndMember(FLEET_TYPES_ALL)) {
    const cargo = new CountsMap()
    const maxCargo = fleet.totalCargoSpace
    //non-repeating is set to false to allow weighted cargo types
    const cargoTypes = rndMembers(fleetType.cargoTypes, rng(fleetType.cargoTypes.length, 1), false)
    const totalCargo = cargoTypes.length > 0 ? rng(1, maxCargo) : 0
    for (let i = 0; i < totalCargo; i++) {
        const ct = rndMember(cargoTypes)
        cargo.increment(ct, 1)
    }
    return cargo
}

/**
 * Generates a complete fleet with ships and cargo.
 * @param {FleetType} fleetType - The type of fleet to generate.
 * @param {Planet} planet - The planet the fleet is associated with.
 * @returns {Fleet} The generated fleet.
 */
function generateFleet(fleetType = rndMember(FLEET_TYPES_ALL), planet = new Planet()) {
    const ships = []
    const populationMod = planet ? planet.c.population : 1
    const numShips = Math.ceil(0.1 + rng(fleetType.minShips*populationMod, fleetType.maxShips*populationMod))
    for (let i = 0; i < numShips; i++) {
        const shipType = i == 0 ? fleetType.shipTypes[0] : rndMember(fleetType.shipTypes)
        ships.push(generateShip(planet, shipType))
        //console.log('generated ship:',ships[ships.length-1])
    }
    if (ships.length == 0) {
        console.log({ fleetType, planet, numShips, populationMod})
        throw new Error('generateFleet: No ships generated for fleetType '+fleetType.name)
    }
    const fleet = new Fleet(fleetType.name, planet ? planet.color : COLORS.DarkGray, 0, 0)
    ships.forEach(s=>fleet.addShip(s))
    
    fleet.cargo = generateFleetCargo(fleet, fleetType)

    return fleet
}


