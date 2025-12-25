function showPlanetMenu(planet = new Planet()) {
    const isDocked = gs.location == planet
    const {settlement} = planet

    let msg = isDocked ?
        `You have arrived at ${coloredName(planet)}.<br/>`
        : `You are scanning ${coloredName(planet)}.<br/>`

        if (isDocked) {
        console.log('1')
        const damagedShips = gs.fleet.ships.filter(s=>s.isDamaged())
        console.log('2:',damagedShips,gs.fleet.ships)
        if (damagedShips.length > 0) msg += colorSpan(`Your ships receive complementary repairs courtesy of the dock's nanite swarm.<br/>`, 'lightgreen', true)
        for (const s of damagedShips) s.repairHull()
        msg += `What would you like to do?<br/>`
    }

    const options = [[`Overview`, () => showPlanetOverviewMenu(planet)]];
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
    if (settlement.courthouse) {
        options.push(["Courthouse", () => showCourthouseMenu(settlement.courthouse)]);
    }
    if (settlement.academy) {
        options.push(["Academy", () => showAcademyMenu(settlement.academy)]);
    }
    options.push([isDocked ? "Depart" : "Stop Scanning", () => departPlanet(planet)]);

    showModal(coloredName(planet), msg, options);
}

function showPlanetOverviewMenu(planet = new Planet()) {
    const {culture} = planet
    const {territory, population, governmentRating, securityRating, commercialRating, industrialRating, crimeRating} = culture
    let msg = `<h3>${coloredName(planet)} Overview</h3>`    
    msg += `Population: ${statColorSpan(describeLargeNumber(Math.pow(1000,1+population)), population, true)}<br/>`
    msg += `Territory: ~${statColorSpan(roundToPlaces(territory,2), territory, true)}AU<br/>`
    msg += `Government Rating: ${statColorSpan(roundToPlaces(governmentRating,2), governmentRating, true)}x<br/>`
    msg += `Security Rating: ${statColorSpan(roundToPlaces(securityRating,2), securityRating, true)}x<br/>`
    msg += `Commercial Rating: ${statColorSpan(roundToPlaces(commercialRating,2), commercialRating, true)}x<br/>`
    msg += `Industrial Rating: ${statColorSpan(roundToPlaces(industrialRating,2), industrialRating, true)}x<br/>`
    msg += `Crime Rating: ${statColorSpan(roundToPlaces(crimeRating,2), 1/crimeRating, true)}x<br/>`
    showModal(coloredName(planet), msg, [["Back", () => showPlanetMenu(planet)]]);
}


function departPlanet(planet) {
    closeModal()
}
