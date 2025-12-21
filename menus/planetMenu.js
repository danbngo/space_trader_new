function showPlanetMenu(planet = new Planet()) {
    const isDocked = gs.location == planet
    const {settlement} = planet

    let msg = isDocked ?
        `You have arrived at ${coloredName(planet)}.<br/>`
        : `You are scanning ${coloredName(planet)}.<br/>`

    msg += `Population: ${roundToPlaces(planet.culture.population * 1000,2)}M<br/>`
    msg += `Territory: ~${roundToPlaces(planet.culture.territory,2)}AU<br/>`
    msg += `Government Rating: ${roundToPlaces(planet.culture.governmentRating,2)}x<br/>`
    msg += `Security Rating: ${roundToPlaces(planet.culture.securityRating,2)}x<br/>`
    msg += `Commercial Rating: ${roundToPlaces(planet.culture.commercialRating,2)}x<br/>`
    msg += `Industrial Rating: ${roundToPlaces(planet.culture.industrialRating,2)}x<br/>`
    msg += `Crime Rating: ${roundToPlaces(planet.culture.crimeRating,2)}x<br/>`

    if (isDocked) {
        console.log('1')
        const damagedShips = gs.fleet.ships.filter(s=>s.isDamaged())
        console.log('2:',damagedShips,gs.fleet.ships)
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
    if (settlement.bank) {
        options.push(["Bank", () => showBankMenu(settlement.bank)]);
    }
    options.push([isDocked ? "Depart" : "Stop Scanning", () => departPlanet(planet)]);

    showModal(coloredName(planet), msg, options);
}


function departPlanet(planet) {
    closeModal()
}
