function showPlanetMenu(planet = new Planet()) {
    const isDocked = gameState.fleet.location == planet
    const {settlement} = planet

    let msg = isDocked ?
        `You have arrived at ${coloredName(planet)}.<br/>`
        : `You are scanning ${coloredName(planet)}.<br/>`

    if (isDocked) {
        const damagedShips = gameState.fleet.ships.filter(s=>s.isDamaged()) 
        if (damagedShips.length > 0) msg += `Your ships receive complementary repairs courtesy of the dock's nanite swarm.<br/>`
        for (const s of damagedShips) s.repairHull()
        msg += `What would you like to do?<br/>`
    }

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

    showModal(coloredName(planet), msg, options);
}


function departPlanet(planet) {
    showStarMap(planet)
}
