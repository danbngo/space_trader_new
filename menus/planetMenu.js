/**
 * Displays the main planet menu with access to all buildings.
 * @param {Planet} planet - The planet to interact with.
 */
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
        if (damagedShips.length > 0) msg += colorSpan(`Your ships receive complementary repairs courtesy of the dock's nanite swarm.<br/>`, COLORS.LightGreen, true)
        for (const s of damagedShips) s.repairHull()
        msg += `What would you like to do?<br/>`
    }

    const options = [[`Overview`, () => showPlanetOverviewMenu(planet)]];
    options.push(["News", () => showNewsTimelineMenu(planet, () => showPlanetMenu(planet))]);
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
    options.push([isDocked ? "Depart" : "Stop Scanning", () => closeModal()]);

    showModal(coloredName(planet), msg, options);
}
/**
 * Displays detailed information about a planet's culture and statistics.
 * @param {Planet} planet - The planet to display information for.
 */
function showPlanetOverviewMenu(planet = new Planet()) {
    const {culture} = planet
    const {territory, population, military, security, commerce, industry, crime} = culture
    let msg = ''
    msg += `Population: ${describePopulation(population)}<br/>`
    msg += `Territory: ${describeTerritory(territory)}<br/>`
    msg += `GovernmentType: ${coloredName(culture.governmentType)}<br/>`
    msg += `Military: ${describeRating(military)}<br/>`
    msg += `Security: ${describeRating(security)}<br/>`
    msg += `Commerce: ${describeRating(commerce)}<br/>`
    msg += `Industry: ${describeRating(industry)}<br/>`
    msg += `Crime: ${describeRating(crime, true)}<br/>`
    msg += `Ships: ${describeRating(culture.shipQuality)}<br/>`
    msg += `Officers: ${describeRating(culture.officerQuality)}<br/>`
    showModal(`${coloredName(planet)} - Overview`, msg, [["Back", () => showPlanetMenu(planet)]]);
}
