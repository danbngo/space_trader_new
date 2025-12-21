function checkForEvents(elapsedYears = 1) {
    //console.log('checkForEvents', { elapsedYears });
    const elapsedDays = elapsedYears*365
    if (checkGameOver()) return
    if (checkForEncounter(elapsedDays)) return
    if (checkDebtCollections(elapsedDays)) return
}

function checkForEncounter(elapsedDays = 1) {
    //console.log('checkForEncounter', { elapsedDays, location: gs.location, encounter: gs.encounter });
    //dont have encounters while docked or already in an encounter
    if (gs.location || gs.encounter) return
    if (!checkForPlanetEncounters(elapsedDays)) {
        checkForAsteroidBeltEncounters(elapsedDays)
    }
}

function checkForAsteroidBeltEncounters(elapsedDays = 1) {
    //console.log('checkForAsteroidBeltEncounters', { elapsedDays });
    //dont have encounters while docked or already in an encounter
    if (gs.location || gs.encounter) return
    
    const asteroidBelts = gs.system.asteroidBelts
    const fleet = gs.fleet
    
    for (const belt of asteroidBelts) {
        // Get the belt's center distance from the sun
        const beltCenterDistance = belt.orbit.radius
        
        // Get the belt's territory radius
        const beltRadius = belt.radius
        
        // Calculate fleet's distance from the sun
        const fleetDistanceFromSun = calcDistance(fleet.x, fleet.y, 0, 0)
        
        // Calculate distance from the belt's center ring
        const distanceFromBeltCenter = Math.abs(fleetDistanceFromSun - beltCenterDistance)
        
        // Calculate proximity factor using 1/(1+d/r) formula
        // In the middle of belt (d=0): factor = 1.0
        // At edge (d=beltRadius): factor = 0.5
        // Beyond edge: factor approaches 0 but never reaches it
        const proximityFactor = 1 / (1 + distanceFromBeltCenter / beltRadius)
        
        // Base encounter chance
        const baseChance = Math.pow(ASTEROIDS_ENCOUNTER_CHANCE_PER_DAY, 1/(elapsedDays * proximityFactor))
        
        /*console.log(`Checking ${belt.name}:`, {
            beltCenterDistance,
            beltRadius,
            fleetDistanceFromSun,
            distanceFromBeltCenter,
            proximityFactor: proximityFactor.toFixed(3),
            baseChance: baseChance.toFixed(4)
        });*/
        
        // Check if encounter happens
        if (Math.random() > baseChance) continue
        
        // Determine encounter type based on belt type
        let encounterType
        if (belt.beltType === ASTEROID_BELT_TYPES.Rocky) {
            encounterType = ENCOUNTER_TYPES.ASTEROIDS
        } else if (belt.beltType === ASTEROID_BELT_TYPES.Icy) {
            encounterType = ENCOUNTER_TYPES.CRYOIDS
        } else if (belt.beltType === ASTEROID_BELT_TYPES.Plasma) {
            encounterType = ENCOUNTER_TYPES.PLASMOIDS
        } else {
            continue // Unknown belt type, skip
        }
        
        console.log(`🚨 ASTEROID ENCOUNTER TRIGGERED: ${belt.name} (${encounterType.name})`);
        
        // Start the encounter
        if (currentMap && currentMap.togglePause) currentMap.togglePause(true)
        const encounter = generateEncounter(encounterType, null)
        startEncounter(encounter)
        return true
    }
    
    return false
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
        if (!planet.culture) continue
        
        const distance = calcDistance(fleet.x, fleet.y, planet.x, planet.y)
        const territory = planet.culture.territory
        
        // Calculate proximity factor using 1/(1+d/t) formula
        // At planet (d=0): factor = 1.0
        // At edge (d=territory): factor = 0.5
        // Beyond edge: factor approaches 0 but never reaches it
        const proximityFactor = 1 / (1 + distance / territory)
        
        // Base encounter chance influenced by culture properties
        const {governmentRating, securityRating, crimeRating, commercialRating, industrialRating} = planet.culture
        
        const baseChance = Math.pow(PLANET_ENCOUNTER_CHANCE_PER_DAY, 1/(elapsedDays * proximityFactor))
        
        // Build weighted encounter type array based on culture
        const encounterWeights = []
        
        // Police (influenced by government and security)
        encounterWeights.push({type: ENCOUNTER_TYPES.POLICE, weight: (governmentRating + securityRating) * 2})
        
        // Pirates (influenced by crime, reduced by security)
        encounterWeights.push({type: ENCOUNTER_TYPES.PIRATES, weight: crimeRating * 3 / securityRating})
        
        // Smugglers (influenced by crime and commercial)
        encounterWeights.push({type: ENCOUNTER_TYPES.SMUGGLERS, weight: ((crimeRating + commercialRating) * 1.5) / securityRating})
        
        // Merchants (influenced by commercial)
        encounterWeights.push({type: ENCOUNTER_TYPES.MERCHANTS, weight: commercialRating * 3})
        
        // Miners (influenced by industrial)
        encounterWeights.push({type: ENCOUNTER_TYPES.MINERS, weight: industrialRating * 2})
        
        // Tourists (influenced by commercial and government)
        encounterWeights.push({type: ENCOUNTER_TYPES.TOURISTS, weight: (commercialRating + governmentRating)})
        
        // Calculate total weight
        const totalWeight = encounterWeights.reduce((sum, e) => sum + e.weight, 0)
        if (totalWeight <= 0) continue
        
        // Adjust base chance by culture activity level
        const activityLevel = (governmentRating + securityRating + crimeRating + commercialRating + industrialRating) / 5
        const encounterChance = baseChance * activityLevel
        
        /*console.log(`Checking ${planet.name}:`, {
            distance: distance.toFixed(2),
            territory: territory.toFixed(2),
            proximityFactor: proximityFactor.toFixed(3),
            activityLevel: activityLevel.toFixed(2),
            encounterChance: encounterChance.toFixed(4),
            totalWeight: totalWeight.toFixed(2)
        });*/
        
        // Check if encounter happens
        if (Math.random() > encounterChance) continue
        
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
        
        console.log(`🚨 PLANET ENCOUNTER TRIGGERED: ${planet.name} (${selectedType.name})`);
        
        // Start the encounter with the selected type
        if (currentMap && currentMap.togglePause) currentMap.togglePause(true)
        const encounter = generateEncounter(selectedType, planet)
        startEncounter(encounter)
        return true
    }
    
    return false
}

function checkDebtCollections(elapsedDays = 1) {
    //console.log('checkDebtCollections', { elapsedDays });
    //check for bank bounty collection
    const outstandingDebts = gs.captain.calcTotalDebts(true)
    if (outstandingDebts <= 0) return
    const baseChance = Math.pow(BANK_BOUNTY_CHANCE_PER_DAY, 1/(elapsedDays))
    if (Math.random() > baseChance) return

    console.log('🚨 DEBT COLLECTION TRIGGERED', { outstandingDebts, bountyChance });
    const totalDebts = gs.captain.calcTotalDebts(true)
    const convertedAmt = Math.min(totalDebts, 100 + rng( Math.ceil(totalDebts/3), Math.ceil(totalDebts/6) ))
    const fees = Math.ceil(convertedAmt * 0.5)
    payDebtsRandomly(gs.captain, convertedAmt)
    gs.bounty += (convertedAmt + fees)
    let msg = `The bank isn't happy that you haven't paid your overdue loans of ${totalDebts}CR.<br/>`
    msg += `They have passed a portion of your debt, plus fees on to some rather ruthless collection agencies.<br/>`
    msg += `Your new bounty: ${gs.captain.bounty}CR<br/>`
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

    const fameScore = gs.captain.fame * 10;
    const infamyScore = gs.captain.infamy * -10;
    const bountyScore = gs.captain.bounty * -1;

    const total = shipsScore + creditsScore + officerScore + fameScore + infamyScore + bountyScore + cargoScore;
    return { total, shipsScore, creditsScore, officerScore, fameScore, infamyScore, bountyScore, cargoScore };
}