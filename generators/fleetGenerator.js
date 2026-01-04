/**
 * Generates cargo for a fleet based on its type.
 * @param {Fleet} fleet - The fleet to generate cargo for.
 * @param {FleetType} fleetType - The type of fleet determining cargo types.
 * @returns {CountsMap} The generated cargo inventory.
 */
function generateFleetCargo(fleet = new Fleet(), fleetType = FLEET_TYPES_ALL[0]) {
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
 * @param {FactionType} factionType - The faction type of the crew.
 * @returns {Officer[]} Array of generated officers.
 */
function generateCrew(planet, factionType) {
    const crew = []
    const numCrew = rng(5, 1) // 1-5 crew members
    for (let i = 0; i < numCrew; i++) {
        crew.push(generateOfficer(planet, factionType))
    }
    return crew
}

/**
 * Generates a complete fleet with ships and cargo.
 * @param {FleetType} fleetType - The type of fleet to generate.
 * @param {FactionType|null} factionType - The faction the fleet belongs to.
 * @param {Planet|null} planet - The planet the fleet is associated with.
 * @param {SpaceObject|null} startAt - The planet where the fleet starts its journey.
 * @returns {Fleet} The generated fleet.
 */
function generateFleet(fleetType = FLEET_TYPES_ALL[0], factionType = null, planet = null, startAt = planet) {
    //console.log('generating a fleet:',fleetType,factionType,planet,startAt)
    const ships = []
    const numShips = Math.ceil(0.1 + rng(fleetType.minShips, fleetType.maxShips))
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
        fleetType, factionType, planet ? planet.color : COLORS.DarkGray,
        startAt ? startAt.x : 0, startAt ? startAt.y : 0)
    ships.forEach(s=>fleet.addShip(s))
    
    fleet.cargo = generateFleetCargo(fleet, fleetType)
    
    if (planet) {
        // Generate captain
        fleet.captain = generateOfficer(planet, factionType)
        fleet.captain.credits = rng(fleetType.maxCredits, 0)
        
        // Generate crew members (non-captain officers)
        const crew = generateCrew(planet, factionType)
        fleet.officers = [fleet.captain, ...crew]
    }
    
    // Assign AI to fleet - need to do this after fleet is added to starmap
    const fleetAIType = getFleetAITypeForFleetType(fleetType)
    if (fleetAIType) {
        fleet.fleetAI = new fleetAIType.aiClass(fleet, startAt)
    }

    // Set cloak level if faction has cloaked flag
    if (factionType && factionType.cloaked) {
        fleet.cloakLevel = 1.0
    }

    return fleet
}

/**
 * Simulates fleet activity over a period to populate the map with active fleets.
 * @param {number} numYears - Number of years to simulate fleet activity.
 * @param {Object} progress - Progress tracking object with completePercentage property.
 */
async function addFleetActivity(numYears = 2, progress = {completePercentage: 0}) {
    const DAYS_PER_YEAR = 365
    const totalDays = numYears * DAYS_PER_YEAR
    console.log(`Starting fleet activity simulation: ${numYears} years (${totalDays} days)`)
    
    let daysSinceYield = 0
    const YIELD_EVERY_DAYS = 20 // Yield control every 20 days for smooth UI
    const YEARS_PER_DAY = 1 / DAYS_PER_YEAR
    let currentDay = 0
    let fleetsSpawned = 0
    const initialFleetCount = gs.system.fleets.length
    
    // Pre-calculate max fleets per planet (optimization for simulation loop)
    const planetMaxFleets = new Map()
    for (const planet of gs.system.planets) {
        if (planet.civilization) {
            planetMaxFleets.set(planet, calculateMaxFleetsForPlanet(planet))
        }
    }

    console.log('Pre-calculated max fleets per planet for simulation:', planetMaxFleets)
    
    for (let d = 0; d < totalDays; d++) {
        currentDay++
        daysSinceYield++
        
        // Increment game year during simulation (small daily increments)
        gs.year += YEARS_PER_DAY
        
        // Spawn fleets from planets (using pre-calculated max fleets for performance)
        const fleetCountBefore = gs.system.fleets.length
        checkForFleetSpawning(1, planetMaxFleets) // 1 day at a time
        fleetsSpawned += (gs.system.fleets.length - fleetCountBefore)
        
        // Tick NPC fleet AI (move fleets around with daily time increments)
        tickNPCFleets(YEARS_PER_DAY)
        
        // Reposition planets every 30 days (once per month)
        //if (d % 30 === 0) {
            gs.system.updatePositions(gs.year)
        //}
        
        // Update progress and yield control for smooth UI
        if (daysSinceYield >= YIELD_EVERY_DAYS) {
            daysSinceYield = 0
            progress.completePercentage = (currentDay / totalDays) * 100
            await new Promise(resolve => setTimeout(resolve, 0))
        }
    }
    
    // Final update to 100%
    progress.completePercentage = 100
    
    console.log(`Fleet activity simulation complete:`)
    console.log(`  Duration: ${numYears} years (${totalDays} days)`)
    console.log(`  Fleets spawned: ${fleetsSpawned}`)
    console.log(`  Starting fleets: ${initialFleetCount}`)
    console.log(`  Final active fleets: ${gs.system.fleets.length}`)
    console.log(`  Net change: +${gs.system.fleets.length - initialFleetCount} fleets`)
}

