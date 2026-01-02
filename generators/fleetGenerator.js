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
 * Generates a complete fleet with ships and cargo.
 * @param {FleetType} fleetType - The type of fleet to generate.
 * @param {FactionType|null} factionType - The faction the fleet belongs to.
 * @param {Planet} planet - The planet the fleet is associated with.
 * @returns {Fleet} The generated fleet.
 */
function generateFleet(fleetType = FLEET_TYPES_ALL[0], factionType = null, planet = new Planet()) {
    console.log('generating a fleet:',fleetType.name,factionType.name,planet.name)
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
    const fleet = new Fleet(`${planet ? planet.ianName+' ' : ''}${fleetType.name}`, planet, fleetType, factionType, planet ? planet.color : COLORS.DarkGray, planet.x, planet.y)
    ships.forEach(s=>fleet.addShip(s))
    
    fleet.cargo = generateFleetCargo(fleet, fleetType)
    
    // Assign AI to fleet
    const fleetAIType = getFleetAITypeForFleetType(fleetType)
    if (fleetAIType) {
        fleet.fleetAI = new fleetAIType.aiClass(fleet, planet)
    }

    return fleet
}

/**
 * Simulates fleet activity over a period to populate the map with active fleets.
 * @param {number} numYears - Number of years to simulate fleet activity.
 * @param {Object} progress - Progress tracking object with completePercentage property.
 */
async function addFleetActivity(numYears = 2, progress = {completePercentage: 0}) {
    console.log(`Starting fleet activity simulation: ${numYears} years (${numYears * 52} weeks)`)
    let weeksSinceYield = 0
    const YIELD_EVERY_WEEKS = 5 // Yield control every 5 weeks
    const WEEKS_PER_YEAR = 52
    const YEARS_PER_WEEK = 1 / WEEKS_PER_YEAR
    const DAYS_PER_WEEK = 7
    const totalWeeks = numYears * WEEKS_PER_YEAR
    let currentWeek = 0
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
    
    for (let w = 0; w < totalWeeks; w++) {
        currentWeek++
        weeksSinceYield++
        
        // Increment game year during simulation
        gs.year += YEARS_PER_WEEK
        
        // Spawn fleets from planets (using pre-calculated max fleets for performance)
        const fleetCountBefore = gs.system.fleets.length
        checkForFleetSpawning(DAYS_PER_WEEK, planetMaxFleets)
        fleetsSpawned += (gs.system.fleets.length - fleetCountBefore)
        
        // Tick NPC fleet AI (move fleets around)
        tickNPCFleets(YEARS_PER_WEEK)
        
        // Reposition planets every 4 weeks (once per month)
        if (w % 4 === 0) {
            gs.system.refreshPositions(gs.year)
        }
        
        // Update progress and yield control for smooth UI
        if (weeksSinceYield >= YIELD_EVERY_WEEKS) {
            weeksSinceYield = 0
            progress.completePercentage = (currentWeek / totalWeeks) * 100
            await new Promise(resolve => setTimeout(resolve, 0))
        }
    }
    
    // Final update to 100%
    progress.completePercentage = 100
    
    console.log(`Fleet activity simulation complete:`)
    console.log(`  Duration: ${numYears} years (${totalWeeks} weeks)`)
    console.log(`  Fleets spawned: ${fleetsSpawned}`)
    console.log(`  Starting fleets: ${initialFleetCount}`)
    console.log(`  Final active fleets: ${gs.system.fleets.length}`)
    console.log(`  Net change: +${gs.system.fleets.length - initialFleetCount} fleets`)
}

