function showPlanetMenu(planet = new Planet()) {
    const isDocked = gameState.fleet.location == planet
    const {settlement} = planet

    const options = [];
    if (settlement.shipyard) {
        options.push(["Shipyard", () => showShipyardBuyMenu(planet)]);
    }
    if (settlement.market) {
        options.push(["Market", () => showMarketMenu(planet, false)]);
    }
    if (settlement.blackMarket) {
        options.push(["Black Market", () => showMarketMenu(planet, true)]);
    }
    if (settlement.guild) {
        options.push(["Guild", () => showGuildMenu(planet)]);
    }
    options.push([isDocked ? "Depart" : "Stop Scanning", () => departPlanet(planet)]);

    showPanel(
        colorSpan(planet.name, planet.graphics.color),
        isDocked ?
            `You have arrived at ${coloredName(planet, false)}. What would you like to do?`
            : `You are scanning ${coloredName(planet)}.`,
        options
    );
}


function departPlanet(planet) {
    showStarMap(planet)
}
