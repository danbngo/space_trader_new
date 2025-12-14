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
    gameState = new GameState(SOLAR_SYSTEM)
    console.log("New game started.");
    createCharacter()
}

function createCharacter() {
    showCaptainCreationMenu(gameState.captain, ()=>showStarMap())
}

function continueGame() {
    gameState.load()
    console.log("Game continued:", gameState);
    displayStarMap()
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