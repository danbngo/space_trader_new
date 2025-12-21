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


function generateFleet(planet = new Planet(), fleetType = rndMember(FLEET_TYPES_ALL)) {
    console.log('Generating fleet of type:', fleetType.name, 'for planet:', planet.name)
    const ships = []
    const numShips = rng(fleetType.minShips, fleetType.maxShips)
    for (let i = 0; i < numShips; i++) {
        const shipType = i == 0 ? fleetType.shipTypes[0] : rndMember(fleetType.shipTypes)
        ships.push(generateShip(planet, shipType))
        console.log('generated ship:',ships[ships.length-1])
    }
    const fleet = new Fleet(fleetType.name, planet.color, 0, 0)
    ships.forEach(s=>fleet.addShip(s))
    
    fleet.cargo = generateFleetCargo(fleet, fleetType)

    return fleet
}


