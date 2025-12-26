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


function generateFleet(fleetType = rndMember(FLEET_TYPES_ALL), planet = new Planet()) {
    const ships = []
    const populationMod = planet ? planet.culture.population : 1
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


