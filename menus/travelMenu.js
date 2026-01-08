/**
 * Shows modal warning player they don't have enough fuel for the route
 * @param {Route} route - The route being attempted
 * @param {*} obj - The destination object
 * @param {Function} onProceed - Callback to proceed with route anyway
 */
function showInsufficientFuelModal(route, obj, onProceed) {
    const fuelRequired = route.path.distance * FUEL_COST_PER_1_AU
    const targetName = obj.name || 'waypoint'
    showModal(
        '⚠️ Insufficient Fuel',
        ce({
            children: [
                `Your route to ${targetName} requires ${roundToPlaces(fuelRequired, 1)} fuel, but you only have ${roundToPlaces(gs.fleet.fuel, 1)}.`,
                `You may become stranded. Do you want to proceed?`,
            ]
        }),
        [
            ['Cancel Travel', () => closeModal(), false, 'highlighted'],
            ['Travel Anyway', () => {
                closeModal()
                onProceed()
            }]
        ]
    )
}

/**
 * Shows modal warning player they may become stranded at destination
 * @param {Route} route - The route being attempted
 * @param {*} obj - The destination object
 * @param {number} fuelAfterArrival - Fuel remaining after arrival
 * @param {number} nearestStationDistance - Distance to nearest refueling station
 * @param {Function} onProceed - Callback to proceed with route anyway
 */
function showFuelWarningModal(route, obj, fuelAfterArrival, nearestStationDistance, onProceed) {
    const targetName = obj.name || 'waypoint'
    const fuelToNearestStation = nearestStationDistance * FUEL_COST_PER_1_AU
    showModal(
        '⚠️ Fuel Warning',
        ce({
            children: [
                `After reaching ${targetName}, you will have ${roundToPlaces(fuelAfterArrival, 1)} fuel remaining.`,
                `The nearest known refueling station is ${roundToPlaces(nearestStationDistance, 1)} AU away (${roundToPlaces(fuelToNearestStation, 1)} fuel required).`,
                `You may become stranded. Do you want to proceed?`
            ]
        }),
        [
            ['Cancel Travel', () => closeModal(), false, 'highlighted'],
            ['Travel Anyway', () => {
                closeModal()
                onProceed()
            }]
        ]
    )
}

/**
 * Shows modal warning player their route passes too close to the sun
 * @param {*} obj - The destination object
 * @param {Function} onProceed - Callback to proceed with route anyway
 */
function showSunWarningModal(obj, onProceed) {
    const targetName = obj.name || 'waypoint'
    showModal(
        '⚠️ Dangerous Route',
        ce({
            children: [
                `Your route to ${targetName} passes dangerously close to the sun's core.`,
                `This path is extremely hazardous. Do you want to proceed anyway?`
            ]
        }),
        [
            ['Cancel', () => closeModal()],
            ['Proceed', () => {
                closeModal()
                onProceed()
            }]
        ]
    )
}

/**
 * Shows modal warning player that intercepting a fleet will take a long time
 * @param {Fleet} targetFleet - The fleet being intercepted
 * @param {Route} route - The interception route
 * @param {Function} onProceed - Callback to proceed with interception anyway
 */
function showLongInterceptionWarningModal(targetFleet, route, onProceed) {
    const targetName = targetFleet.name || 'fleet'
    const eta = describeTimespan(route.travelTime, 1)
    showModal(
        '⚠️ Long Interception Route',
        ce({
            children: [
                `Intercepting ${targetName} will take ${eta}.`,
                'This is a long journey. Do you want to proceed?',
            ]
        }),
        [
            ['Cancel', () => closeModal()],
            ['Proceed', () => {
                closeModal()
                onProceed()
            }]
        ]
    )
}

function  checkPlayerStranded() {
    if (!gs.fleet.stranded) return
    console.log('checkPlayerStranded');
    
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

    let msg = outOfFuel && noWorkingShips ? 
        `You have no working ships and no fuel remaining, so you have to call a tow ship.<br/>` :
        outOfFuel ? `You have run out of fuel, so you have to call a tow ship.<br/>` :
        `You have no working ships remaining, so you have to call a tow ship.<br/>`
    if (canAfford) msg += `The operator charges you a fee of ${creditCost}CR.<br/>`

    else if (noCredits) msg += `The operator complains bitterly after realizing you have no credits, but tows you anyway.<br/>`
    else msg += `The fee is ${creditCost}CR, but you only have ${gs.credits}CR.<br/>Grumbling, the operator confiscates your few remaining credits and tows you anyway.<br/>`
    msg += `You spend ${describeTimespan(dayCost/365)} being dragged through space.<br/>`
    currentMap.refresh()

    showModal(`Stranded`, msg, [['Continue', ()=>showPlanetMenu(towDestination)]])
}