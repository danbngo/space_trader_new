/**
 * Displays the game's title screen with main menu options.
 */
function showTitleScreen() {
    showBackgroundMap()
    
    // Check if save exists
    const hasSave = SaveManager.hasSave();
    
    /** @type {ButtonData[]} */
    const buttons = [
        ["New Game", () => startNewGame()],
    ];
    
    if (hasSave) {
        buttons.push(["Load Game", () => loadSavedGame()]);
    } else {
        buttons.push(["Continue", () => continueGame()]);
    }
    
    buttons.push(
        ["Debug Mode", () => {
            DEBUG_MODE = true
            startNewGame()
        }],
        ["About", () => showAbout()]
    );
    
    showModal(
        "Space Game",
        "A text‑based space adventure.",
        buttons,
        '',
        null,
        0.25  // Lighter background for title screen
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
 * Initializes and starts a new game with default settings.
 */
async function startNewGame() {
    gs = new GameState()
    gs.year = GAME_START_YEAR
    gs.system = SOLAR_SYSTEM

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

    gs.system.updatePositions(gs.year)

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
    

    // Create captain
    const captain = new Officer("Captain", rndMember(gs.system.planets), MINIMUM_OFFICER_AGE, STARTING_CREDITS);
    
    const playerShip = new Ship("Starting Ship", SHIP_TYPES.COURIER, COLORS.LightGray, [30,30], [20,20], 10, 10, 10, 10, 10)
    
    // Give player all modules for testing (only in debug mode)
    if (DEBUG_MODE) {
        playerShip.localModules = [
  
        ]
    }

    // Create fleet
    gs.fleet = new Fleet(
        "Player Fleet",
        null,
        PLAYER_FLEET_TYPE,
        COLORS.LightGray,
    )

    gs.fleet.addShip(playerShip)
    gs.fleet.addOfficer(captain)
    gs.fleet.fuel = gs.fleet.totalFuelCapacity // Start with full fuel tank

    
    // Auto-assign captain to starting ship
    gs.fleet.autoAssignPilots()
    
    // Update positions again now that fleet exists to mark nearby objects as seen
    gs.system.updatePositions(gs.year)

    console.log("New game started.",gs);
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

/**
 * Load a saved game from localStorage
 */
function loadSavedGame() {
    // Show the load menu instead of loading a single save
    showLoadMenu(showTitleScreen);
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