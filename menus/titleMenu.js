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

    for (const planet of gs.system.planets) {
        //dont modify order, settlement depends on civilization
        planet.civilization = generateCivilization(planet)
        planet.settlement = generateSettlement(planet)
        //begin as neutral
        for (const p of gs.system.planets) { 
            planet.c.relationships.set(p, RELATIONSHIP_TYPES.NEUTRAL)
        }
    }

    gs.system.refreshPositions(gs.year)

    // Show loading modal with progress bar
    const progressBarContainer = ce({
        style: 'width: 400px; margin: 20px auto;'
    })
    const progressBarFill = ce({
        id: 'history_progress_bar',
        style: 'width: 0%; height: 30px; background-color: ' + rgbArrayToString(COLORS.Green) + '; transition: width 0.1s;'
    })
    const progressBarBg = ce({
        style: 'width: 100%; height: 30px; background-color: ' + rgbArrayToString(COLORS.DarkGray) + '; border: 2px solid ' + rgbArrayToString(COLORS.White) + ';',
        children: [progressBarFill]
    })
    const progressText = ce({
        id: 'history_progress_text',
        style: 'text-align: center; margin-top: 10px; color: ' + rgbArrayToString(COLORS.White) + ';',
        children: ['Generating history: 0%']
    })
    progressBarContainer.appendChild(progressBarBg)
    progressBarContainer.appendChild(progressText)
    
    showModal(
        'Loading Game',
        ce({children: [
            'Generating 100 years of galactic history...',
            progressBarContainer
        ]}),
        []
    )
    
    // Wait a frame to ensure modal is displayed
    await new Promise(resolve => setTimeout(resolve, 10))
    
    // Generate history with progress tracking
    const progress = {completePercentage: 0}
    const progressUpdateInterval = setInterval(() => {
        const progressBar = document.getElementById('history_progress_bar')
        const progressTextEl = document.getElementById('history_progress_text')
        if (progressBar && progressTextEl) {
            progressBar.style.width = progress.completePercentage + '%'
            progressTextEl.textContent = 'Generating history: ' + Math.round(progress.completePercentage) + '%'
        }
    }, 50)
    
    await addHistory(GAME_START_YEAR - 100, GAME_START_YEAR, progress)
    
    clearInterval(progressUpdateInterval)

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