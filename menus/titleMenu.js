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
 * Initializes and starts a new game with default settings.
 */
async function startNewGame() {
    gs = new GameState()
    gs.year = GAME_START_YEAR
    gs.system = SOLAR_SYSTEM

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

    gs.system.refreshPositions(gs.year)

    // Show loading modal with progress bar
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

    const HISTORY_NUM_YEARS = 10
    
    showModal(
        'Loading Game',
        ce({children: [
            `Generating ${HISTORY_NUM_YEARS} years of galactic history...`,
            ce({tag:'br'}),
            progressBar.container,
            ce({tag:'br'}),
            elapsedTimeElement
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
    }, 50)
    
    await addHistory(GAME_START_YEAR - HISTORY_NUM_YEARS, GAME_START_YEAR, progress)
    
    clearInterval(progressUpdateInterval)
    closeModal()
    
    // Show new modal for fleet activity simulation
    const FLEET_ACTIVITY_YEARS = 2
    const activityProgressBar = new ProgressBar({id: 'fleet_activity_progress', label: 'Fleet Activity', value: 0})
    const activityElapsedTimeElement = ce({tag: 'div', id: 'fleet_elapsed_time', children: ['Elapsed time: 0.0s']})
    
    showModal(
        'Generating Fleet Activity',
        ce({children: [
            `Simulating ${FLEET_ACTIVITY_YEARS} years of fleet movement...`,
            ce({tag:'br'}),
            activityProgressBar.container,
            ce({tag:'br'}),
            activityElapsedTimeElement
        ]}),
        []
    )
    
    // Wait a frame to ensure modal is displayed
    await new Promise(resolve => setTimeout(resolve, 10))
    
    // Simulate fleet activity with progress tracking
    const activityProgress = {completePercentage: 0}
    const activityStartTime = performance.now()
    
    const activityProgressInterval = setInterval(() => {
        const elapsedSeconds = (performance.now() - activityStartTime) / 1000
        activityProgressBar.update(activityProgress.completePercentage)
        const elapsedEl = document.getElementById('fleet_elapsed_time')
        if (elapsedEl) {
            elapsedEl.textContent = `Elapsed time: ${elapsedSeconds.toFixed(1)}s`
        }
    }, 50)
    
    await addFleetActivity(FLEET_ACTIVITY_YEARS, activityProgress)
    
    clearInterval(activityProgressInterval)
    closeModal()

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
        COLORS.LightGray,
        0, 0,
    )

    gs.fleet.addShip(playerShip)
    gs.fleet.addOfficer(captain)
    
    // Auto-assign captain to starting ship
    gs.fleet.autoAssignPilots()

    // Add player's fleet to system
    gs.system.fleets = [gs.fleet];
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