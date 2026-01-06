/**
 * Displays the game's title screen with main menu options.
 */
function showTitleScreen() {
    showBackgroundMap()
    showModal(
        "Space Game",
        "A text‑based space adventure.",
        [
            ["New Game", () => startNewGame()],
            ["Continue", () => continueGame()],
            ["Debug Mode", () => {
                DEBUG_MODE = true
                startNewGame()
            }],
            ["About", () => showAbout()]
        ]
    );
}

/**
 * Simulates galactic history with progress tracking.
 * @param {number} numYears - Number of years of history to generate.
 */
async function simulateHistory(numYears) {
    const progressBar = new ProgressBar({width: 50,})

    const elapsedTimeElement = ce({
        id: 'elapsed_time',
        style: 'text-align: center; margin-top: 10px;',
        children: ['Elapsed time: 0.0s']
    })

    const activeNewsCountElement = ce({
        tag: 'div',
        id: 'active_news_count',
        style: 'text-align: center; margin-top: 5px;',
        children: ['Active News Events: 0']
    })

    const historicalNewsCountElement = ce({
        tag: 'div',
        id: 'historical_news_count',
        style: 'text-align: center; margin-top: 5px;',
        children: ['Historical News Events: 0']
    })
    
    showModal(
        'Loading Game',
        ce({children: [
            `Generating ${numYears} years of galactic history...`,
            ce({tag:'br'}),
            progressBar.container,
            ce({tag:'br'}),
            elapsedTimeElement,
            activeNewsCountElement,
            historicalNewsCountElement
        ]}),
        []
    )
    
    // Wait a frame to ensure modal is displayed
    await new Promise(resolve => setTimeout(resolve, 10))
    
    // Generate history with progress tracking
    const progress = {completePercentage: 0}
    const startTime = performance.now()
    
    const progressUpdateInterval = setInterval(() => {
        const elapsedSeconds = (performance.now() - startTime) / 1000
        progressBar.update(progress.completePercentage)
        const elapsedEl = document.getElementById('elapsed_time')
        if (elapsedEl) {
            elapsedEl.textContent = `Elapsed time: ${elapsedSeconds.toFixed(1)}s`
        }
        const newsCountEl = document.getElementById('active_news_count')
        if (newsCountEl) {
            newsCountEl.textContent = `Active News Events: ${gs.system.news ? gs.system.news.length : 0}`
        }
        const historyCountEl = document.getElementById('historical_news_count')
        if (historyCountEl) {
            historyCountEl.textContent = `Historical News Events: ${gs.system.history ? gs.system.history.length : 0}`
        }
    }, 50)
    
    await addHistory(GAME_START_YEAR - numYears, GAME_START_YEAR, progress)
    
    clearInterval(progressUpdateInterval)
    closeModal()
}

/**
 * Simulates fleet activity with progress tracking.
 * @param {number} numYears - Number of years of fleet activity to simulate.
 */
async function simulateFleetActivity(numYears) {
    const activityProgressBar = new ProgressBar({value: 0, width: 50})
    const activityElapsedTimeElement = ce({tag: 'div', id: 'fleet_elapsed_time', children: ['Elapsed time: 0.0s']})
    const activeFleetCountElement = ce({tag: 'div', id: 'active_fleet_count', style: 'text-align: center; margin-top: 5px;', children: ['Active Fleets: 0']})
    const abandonedFleetCountElement = ce({tag: 'div', id: 'abandoned_fleet_count', style: 'text-align: center; margin-top: 5px;', children: ['Abandoned Fleets: 0']})
    const totalFleetsEverElement = ce({tag: 'div', id: 'total_fleets_ever', style: 'text-align: center; margin-top: 5px;', children: ['Total Fleets Ever: 0']})
    const activeAnomalyCountElement = ce({tag: 'div', id: 'active_anomaly_count', style: 'text-align: center; margin-top: 5px;', children: ['Active Anomalies: 0']})
    
    const displayYears = numYears < 1 ? `${Math.round(numYears * 12)} months` : `${numYears} years`
    
    showModal(
        'Generating Fleet Activity',
        ce({children: [
            `Simulating ${displayYears} of fleet movement...`,
            ce({tag:'br'}),
            activityProgressBar.container,
            ce({tag:'br'}),
            activityElapsedTimeElement,
            activeFleetCountElement,
            abandonedFleetCountElement,
            totalFleetsEverElement,
            activeAnomalyCountElement
        ]}),
        []
    )
    
    // Wait a frame to ensure modal is displayed
    await new Promise(resolve => setTimeout(resolve, 10))
    
    // Simulate fleet activity with progress tracking
    console.log('Beginning fleet activity simulation...')
    const activityProgress = {completePercentage: 0}
    const activityStartTime = performance.now()
    
    const activityProgressInterval = setInterval(() => {
        const elapsedSeconds = (performance.now() - activityStartTime) / 1000
        activityProgressBar.update(activityProgress.completePercentage)
        const elapsedEl = document.getElementById('fleet_elapsed_time')
        if (elapsedEl) {
            elapsedEl.textContent = `Elapsed time: ${elapsedSeconds.toFixed(1)}s`
        }
        const fleetCountEl = document.getElementById('active_fleet_count')
        if (fleetCountEl) {
            const activeFleets = gs.system.fleets.filter(f => !f.destroyed).length
            fleetCountEl.textContent = `Active Fleets: ${activeFleets}`
        }
        const abandonedCountEl = document.getElementById('abandoned_fleet_count')
        if (abandonedCountEl) {
            abandonedCountEl.textContent = `Abandoned Fleets: ${gs.system.abandonedFleets ? gs.system.abandonedFleets.length : 0}`
        }
        const totalFleetsEl = document.getElementById('total_fleets_ever')
        if (totalFleetsEl) {
            totalFleetsEl.textContent = `Total Fleets Ever: ${Fleet.numFleetsEver}`
        }
        const anomalyCountEl = document.getElementById('active_anomaly_count')
        if (anomalyCountEl) {
            anomalyCountEl.textContent = `Active Anomalies: ${gs.system.anomalies ? gs.system.anomalies.length : 0}`
        }
    }, 50)
    
    await addFleetActivity(numYears, activityProgress)
    
    // Refresh positions one final time to ensure all objects are correctly positioned
    gs.system.updatePositions(gs.year)
    
    console.log('Fleet activity simulation finished')
    clearInterval(activityProgressInterval)
    closeModal()
}

/**
 * Initializes and starts a new game with default settings.
 */
async function startNewGame() {
    gs = new GameState()
    gs.year = GAME_START_YEAR
    gs.system = SOLAR_SYSTEM

    console.log('Adding religions...')
    gs.system.religions = generateReligions()
    console.log('Adding space stations...')
    console.log('Adding ruins...')
    gs.system.ruins = generateRuins(gs.system, rng(8, 4))
    
    console.log("Generated religions:", RELIGIONS)
    console.log("Generated space stations:", SPACE_STATIONS)

    // Generate civilizations and settlements for all planets, dwarf planets, and moons
    const allPlanets = [...gs.system.planets, ...gs.system.dwarfPlanets, ...MOONS_ALL]
    for (const planet of allPlanets) {
        //dont modify order, settlement depends on civilization
        planet.civilization = generateCivilization(planet)
        planet.settlement = generateSettlement(planet)
        //begin as neutral
        for (const p of allPlanets) { 
            planet.c.relationships.set(p, RELATIONSHIP_TYPES.NEUTRAL)
        }
    }
    const numToGenerate = Math.min(rng(12, 6), ALL_LAGRANGE_POINTS.length)
    gs.system.spaceStations = generateSpaceStations(numToGenerate, ALL_LAGRANGE_POINTS, ASTEROID_BELTS_ALL)
    
    // Set parent property for all space stations and add them to SOL as children
    for (const station of gs.system.spaceStations) {
        station.parent = SOL;
    }
    SOL.addChildren(gs.system.spaceStations);

    // Generate civilizations and settlements for space stations
    //presumed to be neutral, we'll dig into this more later
    /*if (gs.system.spaceStations) {
        for (const station of gs.system.spaceStations) {
            // Civilizations and settlements are already generated in generateSpaceStation
            // Just need to set up relationships
            for (const p of allPlanets) {
                station.c.relationships.set(p, RELATIONSHIP_TYPES.NEUTRAL)
                p.c.relationships.set(station, RELATIONSHIP_TYPES.NEUTRAL)
            }
            // Set relationships between stations
            for (const otherStation of gs.system.spaceStations) {
                if (station !== otherStation) {
                    station.c.relationships.set(otherStation, RELATIONSHIP_TYPES.NEUTRAL)
                }
            }
        }
    }*/

    gs.system.updatePositions(gs.year)

    // Initialize anomalies before simulation starts
    console.log('Initializing anomalies...')
    if (!gs.system.anomalies) gs.system.anomalies = [];
    while (gs.system.anomalies.length < MAX_NUM_ANOMALIES) {
        const anomaly = generateAnomaly();
        gs.system.anomalies.push(anomaly);
    }

    // Simulate history
    try {
        await simulateHistory(SIMULATE_HISTORY_NUM_YEARS)
    }
    catch (e) {
        console.error("Error during history simulation:", e)
        alert("An error occurred during history simulation. Please try starting a new game again.")
        console.log(gs.system.news)
        assessPlanets()
        closeModal()
        return
    }
    
    // Simulate fleet activity (daily ticks for better efficiency)

    try {
        await simulateFleetActivity(SIMULATE_FLEET_ACTIVITY_YEARS)
    }
    catch (e) {
        console.error("Error during fleet activity simulation:", e)
        alert("An error occurred during fleet activity simulation. Please try starting a new game again.")
        assessFleets()
        closeModal()
        return
    }

    // Ensure maximum anomalies exist at end of simulation
    console.log('Topping up anomalies after simulation...')
    while (gs.system.anomalies.length < MAX_NUM_ANOMALIES) {
        const anomaly = generateAnomaly();
        gs.system.anomalies.push(anomaly);
    }

    // Create captain
    const captain = new Officer("Captain", rndMember(gs.system.planets), FACTION_TYPES_ALL[0], RACES_ALL[0], RELIGION_AGNOSTICISM, MINIMUM_OFFICER_AGE, STARTING_CREDITS);
    
    // Give captain all cyber implants and genetic modifications for testing (only in debug mode)
    if (DEBUG_MODE) {
        captain.implants = CYBER_IMPLANT_TYPES_ALL.map(implantType => new CyberImplant(implantType, 1.0))
        captain.geneticModifications = GENETIC_MODIFICATION_TYPES_ALL.map(modificationType => new GeneticModification(modificationType, 1.0))
    }
    
    const playerShip = new Ship("Starting Ship", STARTING_SHIP_TYPE, COLORS.LightGray, [30,30], [20,20], 10, 10, 10, 10)
    
    // Give player all modules for testing (only in debug mode)
    if (DEBUG_MODE) {
        playerShip.localModules = [
            new ShipModule(SHIP_MODULE_TYPES.CLOAK, 1),
            new ShipModule(SHIP_MODULE_TYPES.MAGNETIZE, 1),
            new ShipModule(SHIP_MODULE_TYPES.WARHEAD, 1),
            new ShipModule(SHIP_MODULE_TYPES.EMP_PULSE, 1),
            new ShipModule(SHIP_MODULE_TYPES.BLINK, 1),
            new ShipModule(SHIP_MODULE_TYPES.BOOSTER, 1),
            new ShipModule(SHIP_MODULE_TYPES.SMOKE_BOMB, 1),
            new ShipModule(SHIP_MODULE_TYPES.SPEED_MODULE, 1),
            new ShipModule(SHIP_MODULE_TYPES.DRILL, 1),
            new ShipModule(SHIP_MODULE_TYPES.PLASMA_SPRAY, 1),
        ]
    }

    // Create fleet
    gs.fleet = new Fleet(
        "Player Fleet",
        null,
        PLAYER_FLEET_TYPE,
        null,
        COLORS.LightGray,
        0, 0,
    )

    gs.fleet.addShip(playerShip)
    gs.fleet.addOfficer(captain)
    
    // Auto-assign captain to starting ship
    gs.fleet.autoAssignPilots()

    // Add player's fleet to system
    gs.system.fleets.push(gs.fleet);
    
    // Mark initial objects around player as seen
    gs.system.updateDiscoveries();

    console.log("New game started.");
    createCharacter()

    assessPlanets()
    assessFleets()
}

function createCharacter() {
    showCaptainCreationMenu(gs.captain, ()=>showStarMap(gs.fleet))
}
/**
 * Continues a previously saved game.
 */
function continueGame() {
    //gs.load()
    console.log("Game continued:", gs);
    showStarMap()
}

function showAbout() {
    showModal(
        "About This Game",
        "A text-based space adventure where you trade, explore, pirate, and shape your own destiny among the stars.",
        [
            ["Continue", () => showTitleScreen()]
        ]
    );
}