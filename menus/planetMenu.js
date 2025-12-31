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

    // Check if planet is closed
    if (planet.closed) {
        msg += colorSpan(`⚠ ${planet.name} is currently inaccessible!<br/>`, COLORS.Orange)
    }

    // Check for closed moons
    const planetMoons = planet.children ? planet.children.filter(child => child instanceof Moon) : []
    for (const moon of planetMoons) {
        if (moon.closed) {
            msg += colorSpan(`⚠ ${moon.name} is currently inaccessible!<br/>`, COLORS.Orange)
        }
    }

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
    if (settlement.palace) {
        const hasBounty = gs.captain.calcBountyForPlanet(planet) > 0
        const hasInfamy = gs.captain.calcInfamyForPlanet(planet) > 0
        const playerRank = gs.captain.ranks.get(planet) || RANK_TYPES.NO_RANK
        const isElite = playerRank === RANK_TYPES.ELITE
        const canEnter = !hasBounty && (!hasInfamy || isElite)
        options.push(["Palace", () => showPalaceMenu(settlement.palace), !isDocked || !canEnter]);
    }
    options.push(ce({tag:'br'}));
    options.push(["News", () => showNewsTimelineMenu(planet, () => showPlanetMenu(planet))]);
    options.push([`Overview`, () => showPlanetSocietyMenu(planet)]);
    if (planet.children && planet.children.length > 0) {
        options.push(["Moons", () => showMoonsMenu(planet)]);
    }
    options.push([isDocked ? "Depart" : "Stop Scanning", () => closeModal()]);
    showPlanetModal(planet, `${coloredName(planet)}`, msg, options, 'planet_menu', (nextPlanet) => showPlanetMenu(nextPlanet));
}

/**
 * Displays a menu listing all moons of a planet.
 * @param {Planet} planet - The planet whose moons to display.
 */
function showMoonsMenu(planet = new Planet()) {
    let msg = `${coloredName(planet)} has ${planet.children.length} major moon${planet.children.length > 1 ? 's' : ''}:<br/><br/>`
    
    const options = []
    for (const moon of planet.children) {
        options.push([moon.name, () => showPlanetMenu(moon)])
    }
    options.push(ce({tag:'br'}))
    options.push(["Back", () => showPlanetMenu(planet)])
    
    showModal(`${coloredName(planet)} - Moons`, msg, options)
}
/**
 * Displays detailed information about a planet's civilization and statistics.
 * @param {Planet} planet - The planet to display information for.
 */
function showPlanetSocietyMenu(planet = new Planet()) {
    const {civilization, settlement} = planet
    const {governmentType, policies} = civilization
    let msg = ''
    msg += `<u>Overview</u><br/>`
    msg += `Government: ${coloredName(governmentType)}<br/>`
    
    // Settlement type
    if (settlement && settlement.settlementType) {
        msg += `Settlement: ${colorSpan(settlement.settlementType.name, settlement.settlementType.color)}<br/>`
        msg += `<span style="font-size: 0.9em; opacity: 0.8;">${settlement.settlementType.description}</span><br/>`
    }
    msg += `<br/>`
    
    // Loop through all civilization ratings dynamically
    for (const rating of CIVILIZATION_RATINGS_ALL) {
        const key = rating.name.toLowerCase()
        const value = civilization[key]
        if (value !== undefined) {
            let displayValue = describeRating(value)
            
            // Use specific describe functions where available
            switch(key) {
                case 'population': displayValue = describePopulation(value); break;
                case 'territory': displayValue = describeTerritory(value); break;
                case 'army': displayValue = describeArmy(value); break;
                case 'navy': displayValue = describeNavy(value); break;
                case 'industry': displayValue = describeIndustry(value); break;
                case 'economy': displayValue = describeEconomy(value); break;
                case 'security': displayValue = describeSecurity(value); break;
                case 'culture': displayValue = describeCulture(value); break;
                case 'technology': displayValue = describeTechnology(value); break;
                case 'education': displayValue = describeEducation(value); break;
                case 'wealth': displayValue = describeWealth(value); break;
                case 'reserves': displayValue = describeReserves(value); break;
                case 'crime': displayValue = describeCrime(value); break;
                case 'corruption': displayValue = describeCorruption(value); break;
                case 'inflation': displayValue = describeInflation(value); break;
                case 'taxes': displayValue = describeTaxes(value); break;
                case 'prestige': displayValue = describePrestige(value); break;
            }
            
            msg += `${rating.symbol} ${rating.name}: ${displayValue}<br/>`
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
    if (planet.climate.atmosphereType) {
        msg += `Atmosphere: ${colorSpan(planet.climate.atmosphereType.name, planet.climate.atmosphereType.color)}<br/>`
        msg += `<span style="font-size: 0.9em; opacity: 0.8;">${planet.climate.atmosphereType.description}</span><br/>`
    }
    if (planet.climate.oceanType) {
        msg += `Ocean: ${colorSpan(planet.climate.oceanType.name, planet.climate.oceanType.color)}<br/>`
        msg += `<span style="font-size: 0.9em; opacity: 0.8;">${planet.climate.oceanType.description}</span><br/>`
    }
    if (planet.climate.geologyType) {
        msg += `Geology: ${colorSpan(planet.climate.geologyType.name, planet.climate.geologyType.color)}<br/>`
        msg += `<span style="font-size: 0.9em; opacity: 0.8;">${planet.climate.geologyType.description}</span><br/>`
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
