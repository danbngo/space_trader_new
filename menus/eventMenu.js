/**
 * Checks for random events (news, encounters, debt collections) during time passage.
 * @param {number} elapsedYears - The amount of game time that has passed in years.
 */
function checkForEvents(elapsedYears = 1) {
    //console.log('checkForEvents', { elapsedYears });
    const elapsedDays = elapsedYears*365
    if (gs.checkGameOver()) return
    checkForNews()
    checkForAnomalies(elapsedDays)
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

/**
 * Checks if anomalies should spawn and creates them if conditions are met.
 * @param {number} elapsedDays - Days that have elapsed.
 * @returns {boolean} Whether an anomaly was spawned.
 */
function checkForAnomalies(elapsedDays = 1) {
    if (!gs.system.anomalies) gs.system.anomalies = [];
    
    // Don't spawn if at max capacity
    if (gs.system.anomalies.length >= MAX_NUM_ANOMALIES) return false;
    
    // Check if anomaly should spawn based on chance
    if (!calcOccurrencesPerTimespan(ANOMALY_CHANCE_PER_DAY, elapsedDays)) return false;
    
    // Generate and add anomaly
    const anomaly = generateAnomaly();
    gs.system.anomalies.push(anomaly);
    console.log(`✨ Anomaly detected: ${anomaly.name} at (${anomaly.x.toFixed(1)}, ${anomaly.y.toFixed(1)})`);
    
    return true;
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
        
        // Calculate max fleets based on multiple factors
        // Allow roughly 2-3 fleets per faction type that could spawn
        const baseMaxFleets = Math.ceil((c.industry + c.economy + c.security + c.navy) * 2)
        const maxFleets = Math.max(baseMaxFleets, 10) // Minimum 10 fleets per planet
        if (maxFleets <= 0) continue
        
        // Count existing fleets from this planet
        const existingFleets = gs.system.fleets.filter(f => f.fleetAI && f.fleetAI.home === planet)
        if (existingFleets.length >= maxFleets) continue
        
        // Check policies that prevent certain fleet types
        const hasIsolationism = c.policies.all.some(p => p === PT.ISOLATIONISM)
        
        // Define spawn chances for each fleet type based on civilization stats
        const spawnChances = []
        
        // Miners (influenced by industry)
        spawnChances.push({ type: FLEET_TYPES.MINERS, faction: FACTION_TYPES.MINERS, weight: c.industry * 0.15 })
        
        // Merchants (influenced by economy, blocked by isolationism)
        if (!hasIsolationism) {
            spawnChances.push({ type: FLEET_TYPES.MERCHANTS, faction: FACTION_TYPES.MERCHANTS, weight: c.economy * 0.15 })
        }
        
        // Police (influenced by security and navy)
        spawnChances.push({ type: FLEET_TYPES.POLICE, faction: FACTION_TYPES.POLICE, weight: (c.security + c.navy) * 0.10 })
        
        // Soldiers (influenced by army, blocked by isolationism)
        if (!hasIsolationism) {
            spawnChances.push({ type: FLEET_TYPES.SOLDIERS, faction: FACTION_TYPES.SOLDIERS, weight: c.army * 0.08 })
        }
        
        // Pirates (influenced by crime, reduced by security)
        if (c.crime > c.security * 0.5) {
            spawnChances.push({ type: FLEET_TYPES.PIRATES, faction: FACTION_TYPES.PIRATES, weight: (c.crime / c.security) * 0.08 })
        }
        
        // Smugglers (influenced by crime and corruption)
        if (c.crime > 0.3 || c.corruption > 0.3) {
            spawnChances.push({ type: FLEET_TYPES.SMUGGLERS, faction: FACTION_TYPES.SMUGGLERS, weight: (c.crime + c.corruption) * 0.08 })
        }
        
        // Bounty Hunters (influenced by crime)
        if (c.crime > 0.4) {
            spawnChances.push({ type: FLEET_TYPES.BOUNTY_HUNTERS, faction: FACTION_TYPES.BOUNTY_HUNTERS, weight: c.crime * 0.05 })
        }
        
        // Tourists (influenced by culture)
        spawnChances.push({ type: FLEET_TYPES.TOURISTS, faction: FACTION_TYPES.TOURISTS, weight: c.culture * 0.10 })
        
        // Colonists (influenced by population and expansion desire)
        if (c.population > 0.5) {
            spawnChances.push({ type: FLEET_TYPES.COLONISTS, faction: FACTION_TYPES.COLONISTS, weight: c.population * 0.05 })
        }
        
        // Slavers (influenced by crime and corruption, only in highly corrupt systems)
        if (c.crime > 0.7 && c.corruption > 0.5) {
            spawnChances.push({ type: FLEET_TYPES.SLAVERS, faction: FACTION_TYPES.SLAVERS, weight: (c.crime + c.corruption) * 0.05 })
        }
        
        // Religious fleets (only spawn if planet has a state religion)
        if (c.stateReligion) {
            // Pilgrims (influenced by culture and faith, travel to same religion planets)
            spawnChances.push({ type: FLEET_TYPES.PILGRIMS, faction: FACTION_TYPES.PILGRIMS, weight: c.culture * 0.08 })
            
            // Inquisitors (influenced by security and navy, patrol same religion planets)
            spawnChances.push({ type: FLEET_TYPES.INQUISITORS, faction: FACTION_TYPES.INQUISITORS, weight: (c.security + c.navy) * 0.06 })
            
            // Missionaries (influenced by culture and missionary zeal, spread faith to other planets)
            spawnChances.push({ type: FLEET_TYPES.MISSIONARIES, faction: FACTION_TYPES.MISSIONARIES, weight: c.culture * 0.10 })
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
                console.log(`✨ Spawned ${type.name} fleet from ${planet.name}`, fleet)
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