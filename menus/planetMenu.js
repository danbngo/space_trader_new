/**
 * Displays the main planet menu with access to all buildings.
 * @param {Planet} planet - The planet to interact with.
 */
function showPlanetMenu(planet = new Planet()) {
    const isDocked = gs.location == planet
    const {settlement} = planet

    let msg = isDocked ?
        `You have arrived at ${coloredName(planet)}.<br/>`
        : ''+colorSpan(`You are scanning ${coloredName(planet)}.<br/>`, COLORS.Yellow)

        if (isDocked) {
        console.log('1')
        const damagedShips = gs.fleet.ships.filter(s=>s.isDamaged())
        console.log('2:',damagedShips,gs.fleet.ships)
        if (damagedShips.length > 0) msg += colorSpan(`Your ships receive complementary repairs courtesy of the dock's nanite swarm.<br/>`, COLORS.LightGreen)
        for (const s of damagedShips) s.repairHull()
    }

    const options = []
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
    options.push(ce({tag:'br'}));
    options.push(["News", () => showNewsTimelineMenu(planet, () => showPlanetMenu(planet))]);
    options.push([`Overview`, () => showPlanetSocietyMenu(planet)]);
    options.push([isDocked ? "Depart" : "Stop Scanning", () => closeModal()]);
    showPlanetModal(planet, `${coloredName(planet)}`, msg, options, 'planet_menu', (nextPlanet) => showPlanetMenu(nextPlanet));
}
/**
 * Displays detailed information about a planet's civilization and statistics.
 * @param {Planet} planet - The planet to display information for.
 */
function showPlanetSocietyMenu(planet = new Planet()) {
    const {civilization, settlement} = planet
    const {territory, population, military, security, economy, industry, culture} = civilization
    let msg = ''
    msg += `<u>Overview</u><br/>`
    msg += `Government: ${coloredName(civilization.governmentType)}<br/>`
    msg += `Population: ${describePopulation(population)}<br/>`
    msg += `Territory: ${describeTerritory(territory)}<br/>`
    msg += `<br/>`
    msg += `<u>Ratings</u><br/>`
    msg += `Military: ${describeRating(military)}<br/>`
    msg += `Security: ${describeRating(security)}<br/>`
    msg += `Economy: ${describeRating(economy)}<br/>`
    msg += `Industry: ${describeRating(industry)}<br/>`
    msg += `Culture: ${describeRating(culture)}<br/>`
    msg += `Technology: ${describeRating(civilization.technology)}<br/>`
    msg += `Education: ${describeRating(civilization.education)}<br/>`
    
    // Market and settlement info
    if (settlement) {
        if (settlement.shipyard) {
            const shipyardShips = settlement.shipyard.baseNumShips
            const shipyardNormalized = shipyardShips / SHIPYARD_AVERAGE_NUM_SHIPS
            msg += `Navy: ${statColorSpan(roundToPlaces(shipyardNormalized, 2) + 'x', shipyardNormalized)}<br/>`
        }
        if (settlement.guild) {
            const guildOfficers = settlement.guild.baseNumOfficers
            const guildNormalized = guildOfficers / GUILD_AVERAGE_NUM_OFFICERS
            msg += `Army: ${statColorSpan(roundToPlaces(guildNormalized, 2) + 'x', guildNormalized)}<br/>`
        }
        if (settlement.bank) {
            const wealth = settlement.wealth
            msg += `Wealth: ${statColorSpan(describeLargeNumber(settlement.bank.baseCredits)+'CR', wealth)}<br/>`
        }
        if (settlement.market) {
            const marketCargoAvg = settlement.market.baseCargo.average
            const marketCargoNormalized = marketCargoAvg / MARKET_AVERAGE_CARGO_PER_TYPE
            msg += `Goods: ${statColorSpan(roundToPlaces(marketCargoAvg, 1), marketCargoNormalized)} per type<br/>`
            msg += `Inflation: ${statColorSpan(roundToPlaces(settlement.market.inflation, 2) + 'x', settlement.market.inflation)}<br/>`
        }
        if (settlement.blackMarket) {
            const blackMarketCargoAvg = settlement.blackMarket.baseCargo.average
            const blackMarketCargoNormalized = blackMarketCargoAvg / MARKET_AVERAGE_CARGO_PER_TYPE
            msg += `Illegal Goods: ${statColorSpan(roundToPlaces(blackMarketCargoAvg, 1), blackMarketCargoNormalized)} per type<br/>`
            msg += `Illegal Inflation: ${statColorSpan(roundToPlaces(settlement.blackMarket.inflation, 2) + 'x', settlement.blackMarket.inflation)}<br/>`
        }
    }
    
    // Policies
    msg += `<br/>`
    msg += `<u>Policies</u><br/>`
    const policies = civilization.policies
    msg += `${policies.economic.flavor.symbol} ${colorSpan(policies.economic.name, policies.economic.color)}<br/>`
    msg += `${policies.labor.flavor.symbol} ${colorSpan(policies.labor.name, policies.labor.color)}<br/>`
    msg += `${policies.social.flavor.symbol} ${colorSpan(policies.social.name, policies.social.color)}<br/>`
    msg += `${policies.foreign.flavor.symbol} ${colorSpan(policies.foreign.name, policies.foreign.color)}<br/>`
    
    showPlanetModal(planet, `${coloredName(planet)} - Society`, msg, [
        ["Climate", () => showPlanetClimateMenu(planet)],
        ["Back", () => showPlanetMenu(planet)]
    ], 'planet_society', (nextPlanet) => showPlanetSocietyMenu(nextPlanet));
}

/**
 * Displays detailed climate and physical information about a planet.
 * @param {Planet} planet - The planet to display climate information for.
 */
function showPlanetClimateMenu(planet = new Planet()) {
    const {climate} = planet
    let msg = ''
    
    // Physical properties
    msg += `<u>Physical Properties</u><br/>`
    msg += `Type: ${coloredName(planet.planetType)}<br/>`
    msg += `Radius: ${roundToPlaces(planet.radius, 2)} Earth radii<br/>`
    if (planet.orbit) {
        msg += `Orbital Distance: ${roundToPlaces(planet.orbit.radius, 2)} AU<br/>`
        msg += `Orbital Period: ${roundToPlaces(planet.orbit.calcPeriod(), 2)} years<br/>`
    }
    msg += `<br/>`
    
    // Climate properties
    msg += `<u>Climate Data</u><br/>`
    msg += `Temperature: ${climate.temperature.coloredName}<br/>`
    msg += `Atmosphere: ${climate.atmosphericPressure.coloredName}<br/>`
    msg += `Gravity: ${climate.gravity.coloredName}<br/>`
    msg += `Ocean Coverage: ${climate.oceanCoverage.coloredName}<br/>`
    msg += `Geological Activity: ${climate.geologicalActivity.coloredName}<br/>`
    msg += `Magnetosphere: ${climate.magnetosphere.coloredName}<br/>`
    msg += `Radiation Level: ${climate.radiationLevel.coloredName}<br/>`
    showPlanetModal(planet, `${coloredName(planet)} - Climate`, msg, [
        ["Society", () => showPlanetSocietyMenu(planet)],
        ["Back", () => showPlanetMenu(planet)]
    ], 'planet_climate', (nextPlanet) => showPlanetClimateMenu(nextPlanet));
}
