/**
 * Checks for random events (news, encounters, debt collections) during time passage.
 * @param {number} elapsedYears - The amount of game time that has passed in years.
 */
function checkForEvents(elapsedYears = 1) {
    //console.log('checkForEvents', { elapsedYears });
    const elapsedDays = elapsedYears*365
    if (checkGameOver()) return
    checkForNews()
    checkForFleetSpawning(elapsedDays)
    tickNPCFleets(elapsedYears)
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
    encounter.onStart()
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
    
    // Check for magnetosphere and ring hazards first
    for (const planet of sortedPlanetsByProximity) {
        const distance = calcDistance(fleet.x, fleet.y, planet.x, planet.y)
        
        // Check for ring encounters (very close to planet)
        const hasRings = planet.features && (planet.features.includes(PLANET_FEATURE_TYPES.RING_SYSTEM) || planet.features.includes(PLANET_FEATURE_TYPES.FAINT_RINGS))
        if (hasRings && distance < planet.radius * 2.5) {
            // Chance to encounter asteroids in the rings
            const ringDensity = planet.features.includes(PLANET_FEATURE_TYPES.RING_SYSTEM) ? 2.0 : 0.5
            if (calcOccurrencesPerTimespan(ASTEROIDS_ENCOUNTER_CHANCE_PER_DAY * ringDensity, elapsedDays)) {
                console.log(`🚨 RING ENCOUNTER TRIGGERED near ${planet.name}`);
                if (currentMap && currentMap.togglePause) currentMap.togglePause(true)
                const encounterType = rndMember([ENCOUNTER_TYPES.ASTEROIDS_CALM, ENCOUNTER_TYPES.ASTEROIDS_STORM])
                const encounter = generateEncounter(encounterType, planet, [EFFECT_TYPES.DEBRIS_CLOUD])
                encounter.onStart()
                return true
            }
        }
        
        // Check for magnetosphere encounters
        if (planet.magnetosphereRadius > 0 && distance < planet.magnetosphereRadius) {
            const magnetosphereStrength = planet.climate.magnetosphere.value
            // Stronger magnetospheres = higher chance of magnetoid encounters
            const magnetosphereChance = ASTEROIDS_ENCOUNTER_CHANCE_PER_DAY * 0.3 * magnetosphereStrength
            if (calcOccurrencesPerTimespan(magnetosphereChance, elapsedDays)) {
                console.log(`🚨 MAGNETOSPHERE ENCOUNTER TRIGGERED near ${planet.name} (strength: ${magnetosphereStrength})`);
                if (currentMap && currentMap.togglePause) currentMap.togglePause(true)
                const encounterType = magnetosphereStrength > 1.2 ? ENCOUNTER_TYPES.MAGNETOIDS_STORM : ENCOUNTER_TYPES.MAGNETOIDS_CALM
                const encounter = generateEncounter(encounterType, planet, [EFFECT_TYPES.ION_CLOUD, EFFECT_TYPES.PLASMA_TRAIL])
                encounter.onStart()
                return true
            }
        }
    }
    
    // Check for sun encounters (plasmoids very close to sun, magnetoids in corona)
    const sun = gs.system.stars[0]
    if (sun) {
        const distanceToSun = calcDistance(fleet.x, fleet.y, sun.x, sun.y)
        
        // Plasmoids only within sun's actual radius (extremely dangerous)
        if (distanceToSun < sun.radius * 0.01) { // Sun radius is huge, so scale it down
            const plasmoidChance = ASTEROIDS_ENCOUNTER_CHANCE_PER_DAY * 2.0
            if (calcOccurrencesPerTimespan(plasmoidChance, elapsedDays)) {
                console.log(`🚨 PLASMOID ENCOUNTER TRIGGERED near sun (distance: ${distanceToSun})`);
                if (currentMap && currentMap.togglePause) currentMap.togglePause(true)
                const encounterType = Math.random() > 0.5 ? ENCOUNTER_TYPES.PLASMOIDS_STORM : ENCOUNTER_TYPES.PLASMOIDS_CALM
                const encounter = generateEncounter(encounterType, null, [EFFECT_TYPES.ION_CLOUD, EFFECT_TYPES.PLASMA_TRAIL])
                encounter.onStart()
                return true
            }
        }
        // Magnetoids in corona range (still dangerous but less so)
        else if (distanceToSun < 0.1) { // Within corona orbit (0.1 AU)
            const magnetoidChance = ASTEROIDS_ENCOUNTER_CHANCE_PER_DAY * 0.5
            if (calcOccurrencesPerTimespan(magnetoidChance, elapsedDays)) {
                console.log(`🚨 MAGNETOID ENCOUNTER TRIGGERED in corona (distance: ${distanceToSun})`);
                if (currentMap && currentMap.togglePause) currentMap.togglePause(true)
                const encounterType = Math.random() > 0.5 ? ENCOUNTER_TYPES.MAGNETOIDS_STORM : ENCOUNTER_TYPES.MAGNETOIDS_CALM
                const encounter = generateEncounter(encounterType, null, [EFFECT_TYPES.ION_CLOUD, EFFECT_TYPES.PLASMA_TRAIL])
                encounter.onStart()
                return true
            }
        }
    }
    
    // Now check for civilization encounters
    for (const planet of sortedPlanetsByProximity) {
        if (!planet.civilization) continue
        
        const distance = calcDistance(fleet.x, fleet.y, planet.x, planet.y)
        const territory = planet.c.territory
        
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
        encounter.onStart()
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

/**
 * Checks if planets should spawn new NPC fleets based on their civilization stats.
 * @param {number} elapsedDays - Days that have elapsed.
 */
function checkForFleetSpawning(elapsedDays = 1) {
    if (!gs.system || !gs.system.planets) return
    
    const allPlanets = [...gs.system.planets]
    
    for (const planet of allPlanets) {
        if (!planet.civilization) continue
        
        const c = planet.civilization
        
        // Calculate max fleets based on industry (minimum 1 fleet for any civilization > 0.5)
        const maxFleets = c.industry >= 0.5 ? Math.round(c.industry) : (Math.random() < c.industry ? 1 : 0)
        if (maxFleets <= 0) continue
        
        // Count existing fleets from this planet
        const existingFleets = gs.system.fleets.filter(f => f.fleetAI && f.fleetAI.home === planet)
        if (existingFleets.length >= maxFleets) continue
        
        // Check policies that prevent certain fleet types
        const hasIsolationism = c.policies.all.some(p => p === PT.ISOLATIONISM)
        
        // Define spawn chances for each fleet type based on civilization stats
        const spawnChances = []
        
        // Miners (influenced by industry)
        spawnChances.push({ type: FLEET_TYPES.MINERS, faction: FACTION_TYPES.MINERS, weight: c.industry * 0.05 })
        
        // Merchants (influenced by economy, blocked by isolationism)
        if (!hasIsolationism) {
            spawnChances.push({ type: FLEET_TYPES.MERCHANTS, faction: FACTION_TYPES.MERCHANTS, weight: c.economy * 0.05 })
        }
        
        // Police (influenced by security and navy)
        spawnChances.push({ type: FLEET_TYPES.POLICE, faction: FACTION_TYPES.POLICE, weight: (c.security + c.navy) * 0.03 })
        
        // Soldiers (influenced by army, blocked by isolationism)
        if (!hasIsolationism) {
            spawnChances.push({ type: FLEET_TYPES.SOLDIERS, faction: FACTION_TYPES.SOLDIERS, weight: c.army * 0.02 })
        }
        
        // Pirates (influenced by crime, reduced by security)
        if (c.crime > c.security * 0.5) {
            spawnChances.push({ type: FLEET_TYPES.PIRATES, faction: FACTION_TYPES.PIRATES, weight: (c.crime / c.security) * 0.02 })
        }
        
        // Smugglers (influenced by crime and corruption)
        if (c.crime > 0.3 || c.corruption > 0.3) {
            spawnChances.push({ type: FLEET_TYPES.SMUGGLERS, faction: FACTION_TYPES.SMUGGLERS, weight: (c.crime + c.corruption) * 0.025 })
        }
        
        // Bounty Hunters (influenced by crime)
        if (c.crime > 0.4) {
            spawnChances.push({ type: FLEET_TYPES.BOUNTY_HUNTERS, faction: FACTION_TYPES.BOUNTY_HUNTERS, weight: c.crime * 0.015 })
        }
        
        // Tourists (influenced by culture)
        spawnChances.push({ type: FLEET_TYPES.TOURISTS, faction: FACTION_TYPES.TOURISTS, weight: c.culture * 0.03 })
        
        // Colonists (influenced by population and expansion desire)
        if (c.population > 0.5) {
            spawnChances.push({ type: FLEET_TYPES.COLONISTS, faction: FACTION_TYPES.COLONISTS, weight: c.population * 0.01 })
        }
        
        // Slavers (influenced by crime and corruption, only in highly corrupt systems)
        if (c.crime > 0.7 && c.corruption > 0.5) {
            spawnChances.push({ type: FLEET_TYPES.SLAVERS, faction: FACTION_TYPES.SLAVERS, weight: (c.crime + c.corruption) * 0.01 })
        }
        
        // Roll for each potential fleet type
        for (const { type, faction, weight } of spawnChances) {
            if (calcOccurrencesPerTimespan(weight, elapsedDays)) {
                // Spawn the fleet
                const fleet = generateFleet(type, faction, planet)
                fleet.color = planet.color
                fleet.x = planet.x
                fleet.y = planet.y
                gs.system.fleets.push(fleet)
                console.log(`✨ Spawned ${type.name} fleet from ${coloredName(planet)}`, fleet)
            }
        }
    }
}

/**
 * Ticks all NPC fleet AI to update their behavior.
 * @param {number} elapsedYears - Years that have elapsed.
 */
function tickNPCFleets(elapsedYears = 1) {
    if (!gs.system || !gs.system.fleets) return
    
    // Tick all fleet AI
    for (let i = gs.system.fleets.length - 1; i >= 0; i--) {
        const fleet = gs.system.fleets[i]
        if (!fleet.fleetAI) continue
        
        fleet.fleetAI.tick(elapsedYears)
    }
}