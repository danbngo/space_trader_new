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
    tickPlanets(elapsedYears)
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
    //console.log(`✨ Anomaly detected: ${anomaly.name} at (${anomaly.x.toFixed(1)}, ${anomaly.y.toFixed(1)})`);
    
    return true;
}


function checkDebtCollections(elapsedDays = 1) {
    //console.log('checkDebtCollections', { elapsedDays });
    //check for bank bounty collection
    const outstandingDebts = gs.captain.calcTotalDebts(true)
    if (outstandingDebts <= 0) return
    const baseChance = Math.pow(BANK_BOUNTY_CHANCE_PER_DAY, 1/(elapsedDays))
    if (Math.random() > baseChance) return

    //console.log('🚨 DEBT COLLECTION TRIGGERED', { outstandingDebts, baseChance });
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
 * @param {Map<Planet, CountsMap>} planetMaxFleets - Optional pre-calculated max fleets per planet (for performance during simulation).
 */
function checkForFleetSpawning(elapsedDays = 1, planetMaxFleets = null) {
    if (!gs.system || !gs.system.planets) return
    
    const allPlanets = [...gs.system.planets]
    for (const planet of allPlanets) {
        if (!planet.civilization) continue

        // Calculate existing fleet counts per faction for this planet
        const existingNumFleetsPerFaction = new Map()
        for (const fleet of gs.system.fleets) {
            if (fleet.planet !== planet) continue
            const faction = fleet.factionType
            if (!existingNumFleetsPerFaction.has(faction)) {
                existingNumFleetsPerFaction.set(faction, 0)
            }
            existingNumFleetsPerFaction.set(faction, existingNumFleetsPerFaction.get(faction)+1)
        }

        // Use pre-calculated max fleets if provided, otherwise calculate dynamically
        const maxNumFleetsPerFaction = planetMaxFleets && planetMaxFleets.has(planet)
            ? planetMaxFleets.get(planet)
            : calculateMaxFleetsForPlanet(planet)

        // Spawn fleets based on calculated weights
        for (const [faction, weight] of maxNumFleetsPerFaction.counts) {
            const numExisting = existingNumFleetsPerFaction.get(faction) || 0
            if ((numExisting >= weight)) {
                continue
            }
            if (calcOccurrencesPerTimespan(FLEET_SPAWN_CHANCE_PER_DAY, Math.min(weight/(1+numExisting), weight-numExisting)*elapsedDays)) {
                // Spawn the fleet
                const fleetType = rndMember(faction.fleetTypes)
                const spawnAt = calcRandomSpawnPlanet(fleetType, faction, planet)
                const fleet = generateFleet(fleetType, faction, planet, spawnAt)
                fleet.color = planet.color
                fleet.x = planet.x
                fleet.y = planet.y
                gs.system.fleets.push(fleet)
                //console.log(`✨ Spawned ${fleetType.name} fleet from ${planet.name}`, fleet)
            }
        }
    }
}

/**
 * @param {FleetType} fleetType 
 * @param {FactionType} faction 
 * @param {Planet} planet 
 * @returns 
 */
function calcRandomSpawnPlanet(fleetType, faction, planet) {
    // Bounty hunters: spawn at any planet, dwarf planet, or space station
    if (faction.cloaked) {
        const options = [...gs.system.planets, ...gs.system.dwarfPlanets, ...gs.system.spaceStations]
        return rndMember(options)
    }
    
    // Criminal factions: 75% chance to spawn at asteroids, 25% at dwarf planets/stations/home
    if (faction.criminal) {
        if (Math.random() < 0.75 && gs.system.asteroids.length > 0) {
            return rndMember(gs.system.asteroids)
        }
        const options = [...gs.system.dwarfPlanets, planet, ...gs.system.spaceStations]
        return rndMember(options)
    }

    //otherwise spawn at home    
    return planet
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


function tickPlanets(elapsedYears = 1) {
    //for planets and dwarf planets, apply some gradual bonuses over time based on GovernmentType civBonuses
    //dont apply to dwarf planets yet - we dont have a disasters, etc mechanism to balance their growth
    const allPlanets = [...gs.system.planets]
    for (const planet of allPlanets) {
        if (!planet.civilization || !planet.civilization.governmentType) continue
        const govBonuses = planet.civilization.governmentType.civBonuses
        for (const [key, value] of Object.entries(govBonuses)) {
            if (planet.c[key] !== undefined) {
                // @ts-ignore
                planet.c[key] *= (1 + value * CIVILIZATION_BONUS_RATE_PER_YEAR * elapsedYears) // very small gradual bonus
            }
        }
        //convert some of our planetary culture to our culture
        for (const [key,value] of planet.c.cultures.counts) {
            if (value < CIVILIZATION_CULTURE_DISAPPEAR_THRESHOLD) {
                planet.c.cultures.setAmount(key, 0)
                continue
            }
            const convertAmount = value * CIVILIZATION_CONVERT_CULTURE_PER_YEAR * elapsedYears
            planet.c.cultures.increment(key, -convertAmount)
        }
        for (const [key,value] of planet.c.religions.counts) {
            if (value < CIVILIZATION_CULTURE_DISAPPEAR_THRESHOLD) {
                planet.c.religions.setAmount(key, 0)
                continue
            }
        }
        for (const [key,value] of planet.c.races.counts) {
            if (value < CIVILIZATION_CULTURE_DISAPPEAR_THRESHOLD) {
                planet.c.races.setAmount(key, 0)
                continue
            }
        }
        planet.c.cultures.normalize()
    }
}


/**
 * Calculates the maximum allowed fleets per faction for a given planet.
 * @param {Planet} planet - The planet to calculate fleet limits for.
 * @returns {CountsMap} A CountsMap with faction -> max fleet count.
 */
function calculateMaxFleetsForPlanet(planet) {
    if (!planet || !planet.civilization) return new CountsMap()
    
    const c = planet.civilization
    const maxNumFleetsPerFaction = new CountsMap()
    
    for (const factionType of FACTION_TYPES_ALL) {
        // Skip religious factions if planet has no state religion
        if (factionType.religious && !c.stateReligion) {
            continue
        }
        
        let maxNumFleets = c.population
        //modify based on policies
        for (const p of c.policies.all) {
            if (p.factionSpawnModifiers && p.factionSpawnModifiers.has(factionType)) {
                maxNumFleets *= p.factionSpawnModifiers.get(factionType)
            }
        }
        maxNumFleetsPerFaction.setAmount(factionType, maxNumFleets)
    }
    // Apply civilization-specific multipliers to max fleet counts (alphabetical order)
    maxNumFleetsPerFaction.multiply(FACTION_TYPES.BOUNTY_HUNTERS, c.security*c.crime)
    maxNumFleetsPerFaction.multiply(FACTION_TYPES.COLONISTS, c.population/c.economy)
    maxNumFleetsPerFaction.multiply(FACTION_TYPES.DIPLOMATS, c.prestige)
    maxNumFleetsPerFaction.multiply(FACTION_TYPES.EXPLORERS, c.prestige*c.education)
    maxNumFleetsPerFaction.multiply(FACTION_TYPES.HACKERS, c.technology*c.corruption)
    maxNumFleetsPerFaction.multiply(FACTION_TYPES.INQUISITORS, 1/c.corruption)
    maxNumFleetsPerFaction.multiply(FACTION_TYPES.MERCENARIES, c.army*c.wealth) // Mercenaries spawn 60% as often as soldiers
    maxNumFleetsPerFaction.multiply(FACTION_TYPES.MERCHANTS, c.economy)
    maxNumFleetsPerFaction.multiply(FACTION_TYPES.MINERS, c.industry/c.reserves)
    maxNumFleetsPerFaction.multiply(FACTION_TYPES.MISSIONARIES, c.culture*c.education)
    maxNumFleetsPerFaction.multiply(FACTION_TYPES.PERFORMERS, c.culture)
    maxNumFleetsPerFaction.multiply(FACTION_TYPES.PILGRIMS, c.culture*c.wealth)
    maxNumFleetsPerFaction.multiply(FACTION_TYPES.PIRATES, c.crime)
    maxNumFleetsPerFaction.multiply(FACTION_TYPES.POLICE, c.navy*c.security)
    maxNumFleetsPerFaction.multiply(FACTION_TYPES.REBELS, c.army/(c.security*c.culture))
    maxNumFleetsPerFaction.multiply(FACTION_TYPES.REFUGEES, c.population/c.score)
    maxNumFleetsPerFaction.multiply(FACTION_TYPES.SALVAGERS, c.inflation/c.reserves)
    maxNumFleetsPerFaction.multiply(FACTION_TYPES.SCIENTISTS, c.technology*c.education)
    maxNumFleetsPerFaction.multiply(FACTION_TYPES.SLAVERS, c.corruption/c.security)
    maxNumFleetsPerFaction.multiply(FACTION_TYPES.SMUGGLERS, c.taxes*c.corruption)
    maxNumFleetsPerFaction.multiply(FACTION_TYPES.SOLDIERS, c.navy*c.army)
    maxNumFleetsPerFaction.multiply(FACTION_TYPES.SYNDICATES, c.crime*c.corruption)
    maxNumFleetsPerFaction.multiply(FACTION_TYPES.TAX_COLLECTORS, c.taxes)
    maxNumFleetsPerFaction.multiply(FACTION_TYPES.TOURISTS, c.wealth)

    // a few types are less common, a bit exotic
    for (const ft of [FACTION_TYPES.INQUISITORS, FACTION_TYPES.PILGRIMS, FACTION_TYPES.MISSIONARIES, FACTION_TYPES.PERFORMERS, FACTION_TYPES.DIPLOMATS]) {
        maxNumFleetsPerFaction.multiply(ft, 1/3)
    }

    // a few types are more common, throwback to OG space trader
    for (const ft of [FACTION_TYPES.MERCHANTS, FACTION_TYPES.POLICE, FACTION_TYPES.PIRATES, FACTION_TYPES.MINERS]) {
        maxNumFleetsPerFaction.multiply(ft, 3)
    }
    
    //sqrt the values to make them more reasonable
    for (const [key,value] of maxNumFleetsPerFaction.counts) {
        maxNumFleetsPerFaction.setAmount(key, Math.sqrt(value))
    }
    
    return maxNumFleetsPerFaction
}