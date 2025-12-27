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

function startNewGame() {
    gs = new GameState()
    gs.year = GAME_START_YEAR
    gs.system = SOLAR_SYSTEM

    for (const planet of gs.system.planets) {
        //dont modify order, settlement depends on culture
        planet.culture = generateCulture(planet)
        planet.settlement = generateSettlement(planet)
        //begin as neutral
        for (const p of gs.system.planets) { 
            planet.culture.relationships.set(p, RELATIONSHIP_TYPES.NEUTRAL)
        }
    }

    gs.system.refreshPositions(gs.year)

    //gs.system.news = generateHistory(GAME_START_YEAR - 10, GAME_START_YEAR)
    addHistory(GAME_START_YEAR - 1000, GAME_START_YEAR)

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