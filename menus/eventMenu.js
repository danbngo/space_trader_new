/**
 * Checks for random events (news, encounters, debt collections) during time passage.
 * @param {number} elapsedYears - The amount of game time that has passed in years.
 */
function checkForEvents(elapsedYears = 1) {
    //console.log('checkForEvents', { elapsedYears });
    if (gs.checkGameOver()) return
    checkForNews()
    tickPlanets(elapsedYears)
    if (isNaN(gs.credits)) {
        throw new Error('GameState credits is NaN!')
    }
}
/**
 * Checks if a news event should occur and generates it.
 * @param {number} elapsedDays - Days that have elapsed.
 * @returns {boolean} Whether news was generated.
 */
function checkForNews(elapsedDays = 1) {
    //console.log('checkForNews', { elapsedDays });
    if (!calcOccurrencesPerTimespan(NEWS_CHANCE_PER_DAY, elapsedDays)) return false
    const newsEvent = generateNews()
    if (!newsEvent) return
    newsEvent.start()
    gs.system.news.push(newsEvent)
}



function tickPlanets(elapsedYears = 1) {
    //for planets and dwarf planets, apply some gradual bonuses over time based on GovernmentType civBonuses
    const allPlanets = [...gs.system.planets, ...gs.system.dwarfPlanets]
    for (const planet of allPlanets) {
        if (!planet.civilization || !planet.civilization.governmentType) continue
        const govBonuses = planet.civilization.governmentType.civBonuses
        for (const [key, value] of Object.entries(govBonuses)) {
            if (planet.c[key] !== undefined) {
                // @ts-ignore
                planet.c[key] *= (1 + value * CIVILIZATION_BONUS_RATE_PER_YEAR * elapsedYears) // very small gradual bonus
            }
        }
    }
}



/**
 * Rolls which encounter type occurs, with weights skewed by planet economies
 * @param {Planet} previousLocation - Origin planet
 * @param {Planet} destination - Destination planet
 * @returns {EncounterType} The selected encounter type
 */
function rollEncounterType(previousLocation, destination) {
    const encounterTypes = ENCOUNTER_TYPES_ALL
    const weights = []
    
    for (const encounterType of encounterTypes) {
        let weight = encounterType.weight
        
        // Skew weights based on planet economies
        if (encounterType === ENCOUNTER_TYPES.MERCHANTS) {
            const fromEconomy = previousLocation?.c?.economy || 0
            const toEconomy = destination?.c?.economy || 0
            weight *= (fromEconomy + toEconomy)
        }
        
        weights.push(weight)
    }
    
    const selectedIndex = rndIndexWeighted(weights)
    return encounterTypes[selectedIndex]
}

/**
 * Rolls which planet triggered the encounter based on economy/distance ratio
 * @param {EncounterType} encounterType - The type of encounter
 * @param {Planet} previousLocation - Origin planet
 * @param {Planet} destination - Destination planet
 * @param {Fleet} fleet - The fleet traveling
 * @returns {Planet|null} The planet that triggered the encounter
 */
function rollEncounterPlanet(encounterType, previousLocation, destination, fleet) {
    if (!previousLocation || !destination || !fleet) return null
    
    // Calculate distance from fleet to each planet
    const fromDistance = calcDistance(fleet.x, fleet.y, previousLocation.x, previousLocation.y)
    const toDistance = calcDistance(fleet.x, fleet.y, destination.x, destination.y)
    
    // Avoid division by zero
    const fromWeight = fromDistance > 0 ? (previousLocation.c?.economy || 0) / fromDistance : 0
    const toWeight = toDistance > 0 ? (destination.c?.economy || 0) / toDistance : 0
    
    const weights = [fromWeight, toWeight]
    const planets = [previousLocation, destination]
    
    const selectedIndex = rndIndexWeighted(weights)
    return planets[selectedIndex]
}

function handlePlayerStranded() {
    // Find the last visited planet (most recent year in lastVisitedDates)
    let towDestination = null
    let mostRecentYear = -Infinity
    for (const [planet, visitYear] of gs.lastVisitedDates.entries()) {
        if (visitYear > mostRecentYear) {
            mostRecentYear = visitYear
            towDestination = planet
        }
    }
    
    // If no visited planets, fall back to nearest planet
    if (!towDestination) {
        console.log('No visited planets found, using nearest planet as fallback')
        const [nearestPlanet] = gs.system.calcNearestPlanet(gs.fleet)
        towDestination = nearestPlanet
    }
    
    const towDistance = calcDistance(gs.fleet.x, gs.fleet.y, towDestination.x, towDestination.y)
    const creditCost = 100 + rng(500*Math.sqrt(towDistance), 250*Math.sqrt(towDistance), true)
    const canAfford = gs.credits >= creditCost
    const noCredits = gs.credits <= 0
    const dayCost = 1 + rng(1.5*towDistance, 0.75*towDistance, false)
    gs.credits = Math.max(0, gs.credits - creditCost)
    gs.year += dayCost/365

    console.log('player is stranded - towing to:',towDestination.name,towDistance,creditCost,dayCost)

    const outOfFuel = gs.fleet.fuel <= 0
    const noWorkingShips = gs.fleet.ships.filter(s=>(!s.disabled)).length <= 0

    if (!outOfFuel && !noWorkingShips) {
        return
    }

    let msg = outOfFuel && noWorkingShips ? 
        `You have no working ships and no fuel remaining, so you have to call a tow ship.<br/>` :
        outOfFuel ? `You have run out of fuel, so you have to call a tow ship.<br/>` :
        `You have no working ships remaining, so you have to call a tow ship.<br/>`
    if (canAfford) msg += `The operator charges you a fee of ${creditCost}CR.<br/>`

    else if (noCredits) msg += `The operator complains bitterly after realizing you have no credits, but tows you anyway.<br/>`
    else msg += `The fee is ${creditCost}CR, but you only have ${gs.credits}CR.<br/>Grumbling, the operator confiscates your few remaining credits and tows you anyway.<br/>`
    msg += `You spend ${describeTimespan(dayCost/365)} being dragged through space.<br/>`
    if (!currentMap || (!(currentMap instanceof StarMap))) {
        showStarMap()
    }
    else if (currentMap.refresh) currentMap.refresh()
    showModal(`Stranded`, msg, [['Continue', ()=>gs.fleet.dock(towDestination)]])
    return true
}

function handlePlayerOverloaded() {
    const {fleet} = gs
    
    // Check if player is actually overloaded
    if (fleet.cargo.total <= fleet.totalCargoSpace) {
        return false
    }
    
    const excessCargo = fleet.cargo.total - fleet.totalCargoSpace
    
    let msg = `Your cargo hold is overloaded!<br/>`
    msg += `Current cargo: ${fleet.cargo.total} / ${fleet.totalCargoSpace}<br/>`
    msg += `You must dump at least ${excessCargo} units of cargo before you can continue.<br/>`
    
    if (!currentMap || (!(currentMap instanceof StarMap))) {
        showStarMap()
    }
    else if (currentMap.refresh) currentMap.refresh()
    
    // Show loot menu with empty loot (only dumping, no taking)
    const emptyLoot = new CountsMap()
    showLootMenu(emptyLoot, true) // Pass true to indicate overloaded mode
    
    return true
}