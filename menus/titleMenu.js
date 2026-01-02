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
            ["About", () => showAbout()]
        ]
    );
}

/**
 * Simulates galactic history with progress tracking.
 * @param {number} numYears - Number of years of history to generate.
 */
async function simulateHistory(numYears) {
    const progressBar = new ProgressBar({
        id: 'history_progress',
        label: '',
        width: 50,
    })

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
    
    showModal(
        'Loading Game',
        ce({children: [
            `Generating ${numYears} years of galactic history...`,
            ce({tag:'br'}),
            progressBar.container,
            ce({tag:'br'}),
            elapsedTimeElement,
            activeNewsCountElement
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
    const activityProgressBar = new ProgressBar({id: 'fleet_activity_progress', value: 0, width: 50})
    const activityElapsedTimeElement = ce({tag: 'div', id: 'fleet_elapsed_time', children: ['Elapsed time: 0.0s']})
    const activeFleetCountElement = ce({tag: 'div', id: 'active_fleet_count', style: 'text-align: center; margin-top: 5px;', children: ['Active Fleets: 0']})
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
            fleetCountEl.textContent = `Active Fleets: ${gs.system.fleets.length}`
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
    gs.system.religions = generateReligions()
    gs.system.spaceStations = generateSpaceStations(rng(5, 3), ALL_LAGRANGE_POINTS, ASTEROID_BELTS_ALL)
    
    console.log("Generated religions:", RELIGIONS)
    console.log("Generated space stations:", SPACE_STATIONS)

    // Generate civilizations and settlements for all planets and dwarf planets
    const allPlanets = [...gs.system.planets, ...gs.system.dwarfPlanets]
    for (const planet of allPlanets) {
        //dont modify order, settlement depends on civilization
        planet.civilization = generateCivilization(planet)
        planet.settlement = generateSettlement(planet)
        //begin as neutral
        for (const p of allPlanets) { 
            planet.c.relationships.set(p, RELATIONSHIP_TYPES.NEUTRAL)
        }
    }

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

    // Simulate history
    const HISTORY_NUM_YEARS = 10
    await simulateHistory(HISTORY_NUM_YEARS)
    
    // Simulate fleet activity (daily ticks for better efficiency)
    const FLEET_ACTIVITY_YEARS = 2
    await simulateFleetActivity(FLEET_ACTIVITY_YEARS)

    // Create captain
    const captain = new Officer("Captain", STARTING_CREDITS);
    const playerShip = new Ship("Starting Ship", STARTING_SHIP_TYPE, COLORS.LightGray, [30,30], [20,20], 100, 10, 10, 10)
    
    // Give player all modules for testing
    playerShip.localModules = [
        new ShipModule(SHIP_MODULE_TYPES.CLOAK, 1),
        new ShipModule(SHIP_MODULE_TYPES.MAGNETIZE, 1),
        new ShipModule(SHIP_MODULE_TYPES.WARHEAD, 1),
        new ShipModule(SHIP_MODULE_TYPES.EMP_PULSE, 1),
        new ShipModule(SHIP_MODULE_TYPES.BLINK, 1),
        new ShipModule(SHIP_MODULE_TYPES.BOOSTER, 1),
        new ShipModule(SHIP_MODULE_TYPES.SMOKE_BOMB, 1),
        new ShipModule(SHIP_MODULE_TYPES.SPEED_MODULE, 1)
    ]

    // Create fleet
    gs.fleet = new Fleet(
        "Player Fleet",
        null,
        PLAYER_FLEET_TYPE,
        PLAYER_FACTION_TYPE,
        COLORS.LightGray,
        0, 0,
    )

    gs.fleet.addShip(playerShip)
    gs.fleet.addOfficer(captain)
    
    // Auto-assign captain to starting ship
    gs.fleet.autoAssignPilots()

    // Add player's fleet to system
    gs.system.fleets.push(gs.fleet);
    // Initial planet setup
    gs.fleet.dock(rndMember(gs.system.planets));

    console.log("New game started.");
    createCharacter()

    assessPlanets()
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