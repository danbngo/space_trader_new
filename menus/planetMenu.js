function showPlanetMenu(planet = new Planet()) {
    const isDocked = gameState.fleet.location == planet
    const {settlement} = planet

    let msg = isDocked ?
        `You have arrived at ${coloredName(planet)}.<br/>`
        : `You are scanning ${coloredName(planet)}.<br/>`

    if (isDocked) {
        console.log('1')
        const damagedShips = gameState.fleet.ships.filter(s=>s.isDamaged())
        console.log('2:',damagedShips,gameState.fleet.ships)
        if (damagedShips.length > 0) msg += colorSpan(`Your ships receive complementary repairs courtesy of the dock's nanite swarm.<br/>`, 'lightgreen', true)
        for (const s of damagedShips) s.repairHull()
        msg += `What would you like to do?<br/>`
    }

    const options = [];
    if (settlement.shipyard) {
        options.push(["Shipyard", () => showShipyardBuyMenu(settlement.shipyard)]);
    }
    if (settlement.market) {
        options.push(["Market", () => showMarketMenu(settlement.market)]);
    }
    if (settlement.blackMarket) {
        options.push(["Black Market", () => showMarketMenu(settlement.blackMarket)]);
    }
    if (settlement.guild) {
        options.push(["Guild", () => showGuildMenu(settlement.guild)]);
    }
    options.push([isDocked ? "Depart" : "Stop Scanning", () => departPlanet(planet)]);

    showModal(coloredName(planet), msg, options);
}


function departPlanet(planet) {
    closeModal()
}
