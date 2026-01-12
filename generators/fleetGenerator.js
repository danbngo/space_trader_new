/**
 * Generates cargo for a fleet based on its type.
 * @param {Fleet} fleet - The fleet to generate cargo for.
 * @param {FleetType} fleetType - The type of fleet determining cargo types.
 * @returns {CountsMap} The generated cargo inventory.
 */
function generateFleetCargo(fleet, fleetType) {
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
 * Generates 1-5 crew members (officers) for a fleet.
 * @param {Planet} planet - The planet the crew is from.
 * @returns {Officer[]} Array of generated officers.
 */
function generateCrew(planet) {
    const crew = []
    const numCrew = rng(5, 1) // 1-5 crew members
    for (let i = 0; i < numCrew; i++) {
        crew.push(generateOfficer(planet))
    }
    return crew
}

/**
 * Generates a complete fleet with ships and cargo.
 * @param {FleetType} fleetType - The type of fleet to generate.
 * @param {Planet|null} planet - The planet the fleet is associated with.
 * @param {SpaceObject|null} startAt - The planet where the fleet starts its journey.
 * @returns {Fleet} The generated fleet.
 */
function generateFleet(fleetType = FLEET_TYPES_ALL[0], planet = null, startAt = planet) {
    //console.log('generating a fleet:',fleetType,planet,startAt)
    const ships = []
    let numShips = 1
    const diff = fleetType.maxShips-fleetType.minShips
    if (diff <= 0) numShips = fleetType.minShips
    else {
        numShips = rng(fleetType.minShips, fleetType.maxShips, false)
    }
    numShips = Math.min(numShips, MAX_SHIPS_PER_FLEET)
    for (let i = 0; i < numShips; i++) {
        const shipType = i == 0 ? fleetType.shipTypes[0] : rndMember(fleetType.shipTypes)
        ships.push(generateShip(planet, shipType))
        //console.log('generated ship:',ships[ships.length-1])
    }
    if (ships.length == 0) {
        console.log({ fleetType, planet, numShips})
        throw new Error('generateFleet: No ships generated for fleetType '+fleetType.name)
    }
    const fleet = new Fleet(`${fleetType ? fleetType.name : ''}`, planet,
        fleetType, planet ? planet.color : COLORS.DarkGray,
        startAt ? startAt.x : 0, startAt ? startAt.y : 0)
    ships.forEach(s=>fleet.addShip(s))
    
    fleet.cargo = generateFleetCargo(fleet, fleetType)
    
    if (planet) {
        // Generate captain
        fleet.captain = generateOfficer(planet)
        fleet.captain.credits = rng(fleetType.maxCredits, 0)
        
        // Generate crew members (non-captain officers)
        const crew = generateCrew(planet)
        fleet.officers = [fleet.captain, ...crew]
    }
    
    // REMOVED: FleetAI assignment
    // Assign AI to fleet - need to do this after fleet is added to starmap
    // const fleetAIType = getFleetAITypeForFleetType(fleetType)
    // if (fleetAIType) {
    //     fleet.fleetAI = new fleetAIType.aiClass(fleet, startAt)
    // }

    fleet.fuel = fleet.totalFuelCapacity // Start with full fuel tank

    return fleet
}
