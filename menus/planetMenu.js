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
    if (settlement.tavern) {
        options.push(["Tavern", () => showAcademyMenu(settlement.tavern)]);
    }
    if (settlement.cyberSurgeon) {
        options.push(["Cyber Surgeon", () => showCyberSurgeonBuyMenu(settlement.cyberSurgeon)]);
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
    const {civilization} = planet
    const {governmentType, policies} = civilization
    let msg = ''
    msg += `<u>Overview</u><br/>`
    msg += `Government: ${coloredName(governmentType)}<br/>`
    // Loop through all civilization ratings dynamically
    for (const rating of CIVILIZATION_RATINGS_ALL) {
        const key = rating.name.toLowerCase()
        const value = civilization[key]
        if (value !== undefined) {
            msg += `${rating.symbol} ${rating.name}: ${describeRating(value)}<br/>`
        }
    }
    
    // Policies
    msg += `<br/>`
    msg += `<u>Policies</u><br/>`
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
    const {temperature, atmosphericPressure, gravity, oceanCoverage, geologicalActivity, magnetosphere, radiationLevel} = climate
    let msg = ''
    
    // Physical properties
    msg += `<u>Physical Properties</u><br/>`
    msg += `Type: ${coloredName(planet.planetType)}<br/>`
    msg += `Radius: ${roundToPlaces(planet.radius, 2)} Earth radii<br/>`
    msg += `Day Length: ${roundToPlaces(planet.dayLength, 2)} Earth days<br/>`
    if (planet.orbit) {
        msg += `Orbital Distance: ${roundToPlaces(planet.orbit.radius, 2)} AU<br/>`
        msg += `Orbital Period: ${roundToPlaces(planet.orbit.calcPeriod(), 2)} years<br/>`
    }
    msg += `<br/>`
    
    // Climate properties
    msg += `<u>Climate Data</u><br/>`
    msg += `Temperature: ${temperature.coloredName}<br/>`
    msg += `Atmosphere: ${atmosphericPressure.coloredName}<br/>`
    msg += `Gravity: ${gravity.coloredName}<br/>`
    msg += `Ocean Coverage: ${oceanCoverage.coloredName}<br/>`
    msg += `Geological Activity: ${geologicalActivity.coloredName}<br/>`
    msg += `Magnetosphere: ${magnetosphere.coloredName}<br/>`
    msg += `Radiation Level: ${radiationLevel.coloredName}<br/>`
    
    // Composition
    msg += `<br/>`
    msg += `<u>Composition</u><br/>`
    if (planet.atmosphereType) {
        msg += `Atmosphere: ${colorSpan(planet.atmosphereType.name, planet.atmosphereType.color)}<br/>`
        msg += `<span style="font-size: 0.9em; opacity: 0.8;">${planet.atmosphereType.description}</span><br/>`
    }
    if (planet.oceanType) {
        msg += `Ocean: ${colorSpan(planet.oceanType.name, planet.oceanType.color)}<br/>`
        msg += `<span style="font-size: 0.9em; opacity: 0.8;">${planet.oceanType.description}</span><br/>`
    }
    if (planet.geologyType) {
        msg += `Geology: ${colorSpan(planet.geologyType.name, planet.geologyType.color)}<br/>`
        msg += `<span style="font-size: 0.9em; opacity: 0.8;">${planet.geologyType.description}</span><br/>`
    }
    
    // Planet features
    if (planet.features && planet.features.length > 0) {
        msg += `<br/>`
        msg += `<u>Notable Features</u><br/>`
        for (const feature of planet.features) {
            msg += `${colorSpan('●', feature.color)} ${colorSpan(feature.name, feature.color)}: ${feature.description}<br/>`
        }
    }
    
    showPlanetModal(planet, `${coloredName(planet)} - Climate`, msg, [
        ["Society", () => showPlanetSocietyMenu(planet)],
        ["Back", () => showPlanetMenu(planet)]
    ], 'planet_climate', (nextPlanet) => showPlanetClimateMenu(nextPlanet));
}
