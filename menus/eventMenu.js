/**
 * Checks for random events (news, encounters, debt collections) during time passage.
 * @param {number} elapsedYears - The amount of game time that has passed in years.
 */
function checkForEvents(elapsedYears = 1) {
    //console.log('checkForEvents', { elapsedYears });
    const elapsedDays = elapsedYears*365
    if (checkGameOver()) return
    checkForNews()
    if (checkForEncounter(elapsedDays)) return
    if (checkDebtCollections(elapsedDays)) return
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

function checkForExpiredNews() {

}
/**
 * Checks if a space encounter should occur.
 * @param {number} elapsedDays - Days that have elapsed.
 * @returns {boolean} Whether an encounter was triggered.
 */
function checkForEncounter(elapsedDays = 1) {
    //console.log('checkForEncounter', { elapsedDays, location: gs.location, encounter: gs.encounter });
    //dont have encounters while docked or already in an encounter
    if (gs.location || gs.encounter) return
    return checkForPlanetEncounters(elapsedDays) || checkForAsteroidBeltEncounters(elapsedDays)
}

function checkForAsteroidBeltEncounters(elapsedDays = 1) {
    //console.log('checkForAsteroidBeltEncounters', { elapsedDays });
    //dont have encounters while docked or already in an encounter
    if (gs.location || gs.encounter) return
    
    const asteroids = gs.system.asteroids
    const fleet = gs.fleet
    
    // Calculate cumulative proximity factor from all nearby asteroids
    let totalProximityFactor = 0
    let proximityFactors = []
    
    for (const asteroid of asteroids) {
        const proximityFactor = calcAsteroidProximityFactor(fleet, asteroid)
        totalProximityFactor += proximityFactor
        proximityFactors.push(proximityFactor)
    }
    
    // Check if encounter is triggered
    if (!calcOccurrencesPerTimespan(ASTEROIDS_ENCOUNTER_CHANCE_PER_DAY, elapsedDays * totalProximityFactor)) return false
    
    // Select a random nearby belt to determine encounter type
    const selectedAsteroidIndex = rndIndexWeighted(proximityFactors)
    const selectedAsteroid = asteroids[selectedAsteroidIndex]
    const selectedBelt = selectedAsteroid.belt
    const encounterType = rndMember(selectedBelt.encounterTypes)
    
    console.log(`🚨 ASTEROID ENCOUNTER TRIGGERED`, {selectedAsteroidIndex, selectedAsteroid, selectedBelt, encounterType, proximityFactors, totalProximityFactor});
    
    // Start the encounter
    if (currentMap && currentMap.togglePause) currentMap.togglePause(true)
    const encounter = generateEncounter(encounterType, null, selectedBelt.effectTypes)
    startEncounter(encounter)
    return true
}

function checkForPlanetEncounters(elapsedDays = 1) {
    //console.log('checkForPlanetEncounters', { elapsedDays });
    //dont have encounters while docked or already in an encounter
    if (gs.location || gs.encounter) return
    
    const planets = [...gs.system.planets]
    const fleet = gs.fleet

    const sortedPlanetsByProximity = planets.sort((a, b) => {
        const distA = calcDistance(fleet.x, fleet.y, a.x, a.y)
        const distB = calcDistance(fleet.x, fleet.y, b.x, b.y)
        return distA - distB
    })
    
    for (const planet of sortedPlanetsByProximity) {
        if (!planet.civilization) continue
        
        const distance = calcDistance(fleet.x, fleet.y, planet.x, planet.y)
        const territory = planet.civilization.territory
        
        // Calculate proximity factor using 1/(1+d/t) formula
        // At planet (d=0): factor = 1.0
        // At edge (d=territory): factor = 0.5
        // Beyond edge: factor approaches 0 but never reaches it
        const proximityFactor = 1 / (1 + distance / territory)
        
        // Base encounter chance influenced by civilization properties
        const {army, navy, security, culture, economy, industry, crime} = planet.civilization
        
        // Build weighted encounter type array based on civilization
        const encounterWeights = []
        
        // Police (influenced by government and security)
        encounterWeights.push({type: ENCOUNTER_TYPES.POLICE, weight: (navy + security) * 2})
        
        // Pirates (influenced by crime, reduced by security)
        encounterWeights.push({type: ENCOUNTER_TYPES.PIRATES, weight: crime * 3 / security})
        
        // Smugglers (influenced by crime and commercial)
        encounterWeights.push({type: ENCOUNTER_TYPES.SMUGGLERS, weight: ((crime + economy) * 1.5) / security})
        
        // Merchants (influenced by commercial)
        encounterWeights.push({type: ENCOUNTER_TYPES.MERCHANTS, weight: economy * 3})
        
        // Miners (influenced by industrial)
        encounterWeights.push({type: ENCOUNTER_TYPES.MINERS, weight: industry * 2})
        
        // Tourists (influenced by commercial and government)
        encounterWeights.push({type: ENCOUNTER_TYPES.TOURISTS, weight: (economy + culture)})
        
        // Calculate total weight
        const totalWeight = encounterWeights.reduce((sum, e) => sum + e.weight, 0)
        if (totalWeight <= 0) continue
        
        // Adjust base chance by civilization activity level
        const activityLevel = totalWeight / encounterWeights.length
        if (!calcOccurrencesPerTimespan(PLANET_ENCOUNTER_CHANCE_PER_DAY, elapsedDays * activityLevel * proximityFactor)) continue
        
        // Select encounter type using weighted random
        const roll = Math.random() * totalWeight
        let cumulative = 0
        let selectedType = encounterWeights[0].type
        
        for (const {type, weight} of encounterWeights) {
            cumulative += weight
            if (roll <= cumulative) {
                selectedType = type
                break
            }
        }
        
        console.log(`🚨 PLANET ENCOUNTER TRIGGERED: ${coloredName(planet)} (${selectedType.name})`);
        
        // Start the encounter with the selected type
        if (currentMap && currentMap.togglePause) currentMap.togglePause(true)
        const effectTypes = rollEncounterEffectTypes()
        const encounter = generateEncounter(selectedType, planet, effectTypes)
        startEncounter(encounter)
        return true
    }
    
    return false
}

function rollEncounterEffectTypes() {
    //check for proximity to individual asteroids and give the player different effects based on their belts
    const nearbyEffectTypes = []
    const fleet = gs.fleet
    
    for (const asteroid of gs.system.asteroids) {
        if (!asteroid.belt) continue
        // Calculate proximity factor using 1/(1+d/r) formula
        const proximityFactor = calcAsteroidProximityFactor(fleet, asteroid)
        if (proximityFactor < Math.random()) continue
        // Add effect types from the asteroid's belt
        for (const et of asteroid.belt.effectTypes) {
            nearbyEffectTypes.push(et)
        }
    }
    return nearbyEffectTypes
}

function calcAsteroidProximityFactor(fleet = new Fleet(), asteroid = new Asteroid(), threshold = 0.01) {
        const distance = calcDistance(fleet.x, fleet.y, asteroid.x, asteroid.y)
        const asteroidRadius = 0.01*(asteroid.radius || 1) // Apply a modifier, asteroid "radii" are based on screen pixels
        // Calculate proximity factor using 1/(1+d/r) formula
        const proximityFactor = 1 / (1 + distance / asteroidRadius)
        return threshold && proximityFactor < threshold ? 0 : proximityFactor
}

function checkDebtCollections(elapsedDays = 1) {
    //console.log('checkDebtCollections', { elapsedDays });
    //check for bank bounty collection
    const outstandingDebts = gs.captain.calcTotalDebts(true)
    if (outstandingDebts <= 0) return
    const baseChance = Math.pow(BANK_BOUNTY_CHANCE_PER_DAY, 1/(elapsedDays))
    if (Math.random() > baseChance) return

    console.log('🚨 DEBT COLLECTION TRIGGERED', { outstandingDebts, baseChance });
    const totalDebts = gs.captain.calcTotalDebts(true)
    const convertedAmt = Math.min(totalDebts, 100 + rng( Math.ceil(totalDebts/3), Math.ceil(totalDebts/6) ))
    const fees = Math.ceil(convertedAmt * 0.5)
    const overdueLoans = gs.captain.loans.filter(l=>l.overdue && l.outstandingBalance > 0)
    const affectedLoan = overdueLoans.length > 0 ? rndMember(overdueLoans) : null
    const bountyPlanet = affectedLoan?.planet || gs.location // Use loan's planet or current location
    payDebtsRandomly(gs.captain, convertedAmt)
    if (bountyPlanet) gs.captain.bounty.increment(bountyPlanet, Math.ceil(convertedAmt + fees))
    let msg = `The bank isn't happy that you haven't paid your overdue loans of ${totalDebts}CR.<br/>`
    msg += `They have passed a portion of your debt, plus fees on to some rather ruthless collection agencies.<br/>`
    msg += `Your new bounty${bountyPlanet ? ` on ${coloredName(bountyPlanet)}` : ''}: ${bountyPlanet ? gs.captain.bounty.getAmount(bountyPlanet) : gs.captain.bounty.total}CR<br/>`
    msg += `Your new total overdue debt: ${outstandingDebts-convertedAmt}CR<br/>`
    if (currentMap && currentMap.togglePause) currentMap.togglePause(true)
    showModal('Bank: Collections', msg, [['Continue', ()=> closeModal()]])
    return true
}


function payDebtsRandomly(officer = new Officer(), amount = 0) {
    const overdueLoans = officer.loans.filter(l=>l.overdue && l.outstandingBalance > 0)
    if (overdueLoans.length == 0) return
    const loan = rndMember(overdueLoans)
    loan.repay(Math.min(amount, loan.outstandingBalance))
    payDebtsRandomly(officer, amount - Math.min(amount, loan.outstandingBalance))
}

function checkGameOver() {
    if (gs.year < GAME_END_YEAR) return
    //game over - reached end of time period
    if (currentMap && currentMap.togglePause) currentMap.togglePause(true)
    let msg = ''
    msg += `Congratulations, you have reached the end of the year ${GAME_END_YEAR}!<br/>Thank you for playing!<br/>`
    const scoreDetails = calcPlayerScore()
    msg += `Your final score is ${scoreDetails.total} points.<br/>`
    msg += `Score breakdown:<br/>`
    msg += `* Ships: ${scoreDetails.shipsScore}<br/>`
    msg += `* Credits: ${scoreDetails.creditsScore}<br/>`
    msg += `* Officers: ${scoreDetails.officerScore}<br/>`
    msg += `* Cargo: ${scoreDetails.cargoScore}<br/>`
    msg += `* Fame: ${scoreDetails.fameScore}<br/>`
    msg += `* Infamy: ${scoreDetails.infamyScore}<br/>`
    msg += `* Bounty: ${scoreDetails.bountyScore}<br/>`
    showModal('Game Over', msg, [['Restart Game', ()=> startNewGame()]])
    return true
}


function calcPlayerScore() {
    let shipsScore = 0;
    for (const ship of gs.fleet.ships) {
        shipsScore += Math.round(ship.value);
    }

    let creditsScore = gs.credits;

    let officerScore = 0;
    for (const officer of gs.captain.fleet.officers) {
        officerScore += Math.round(officer.value);
    }

    let cargoScore = 0;
    for (const [ct,amt] of gs.fleet.cargo.counts) {
        console.log('ct, amt:', ct, amt);
        cargoScore += (ct.value || 0) * (amt || 0);
    }

    const fameScore = gs.captain.fame.total * 10;
    const infamyScore = gs.captain.infamy.total * -10;
    const bountyScore = gs.captain.bounty.total * -1;

    const total = shipsScore + creditsScore + officerScore + fameScore + infamyScore + bountyScore + cargoScore;
    return { total, shipsScore, creditsScore, officerScore, fameScore, infamyScore, bountyScore, cargoScore };
}