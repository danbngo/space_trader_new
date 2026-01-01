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
    const blockedBuildings = planet.civilization.governmentType.blockedBuildings || []
    
    if (settlement.shipyard) {
        const isBlocked = blockedBuildings.includes(BUILDING_TYPES.SHIPYARD)
        options.push(["Shipyard", () => showShipyardBuyMenu(settlement.shipyard), isBlocked]);
    }
    if (settlement.market) {
        const isBlocked = blockedBuildings.includes(BUILDING_TYPES.MARKET)
        options.push(["Market", () => showMarketMenu(settlement.market), isBlocked]);
    }
    if (settlement.blackMarket) {
        const isBlocked = blockedBuildings.includes(BUILDING_TYPES.BLACK_MARKET)
        options.push(["Black Market", () => showMarketMenu(settlement.blackMarket), isBlocked]);
    }
    if (settlement.guild) {
        const isBlocked = blockedBuildings.includes(BUILDING_TYPES.GUILD)
        options.push(["Guild", () => showGuildMenu(settlement.guild), isBlocked]);
    }
    if (settlement.bank) {
        const isBlocked = blockedBuildings.includes(BUILDING_TYPES.BANK)
        options.push(["Bank", () => showBankMenu(settlement.bank), isBlocked]);
    }
    if (settlement.courthouse) {
        const isBlocked = blockedBuildings.includes(BUILDING_TYPES.COURTHOUSE)
        options.push(["Courthouse", () => showCourthouseMenu(settlement.courthouse), isBlocked]);
    }
    if (settlement.academy) {
        const isBlocked = blockedBuildings.includes(BUILDING_TYPES.ACADEMY)
        options.push(["Academy", () => showAcademyMenu(settlement.academy), isBlocked]);
    }
    if (settlement.tavern) {
        const isBlocked = false // No building type for tavern yet
        options.push(["Tavern", () => showAcademyMenu(settlement.tavern), isBlocked]);
    }
    if (settlement.cyberSurgeon) {
        const isBlocked = blockedBuildings.includes(BUILDING_TYPES.CYBER_SURGEON)
        options.push(["Cyber Surgeon", () => showCyberSurgeonBuyMenu(settlement.cyberSurgeon), isBlocked]);
    }
    if (settlement.palace) {
        const hasBounty = gs.captain.calcBountyForPlanet(planet) > 0
        const hasInfamy = gs.captain.calcInfamyForPlanet(planet) > 0
        const playerRank = gs.captain.ranks.get(planet) || RANK_TYPES.NO_RANK
        const isElite = playerRank === RANK_TYPES.ELITE
        const isBlocked = blockedBuildings.includes(BUILDING_TYPES.PALACE)
        const canEnter = !hasBounty && (!hasInfamy || isElite) && !isBlocked
        options.push(["Palace", () => showPalaceMenu(settlement.palace), !isDocked || !canEnter]);
    }
    if (settlement.temple) {
        const isBlocked = blockedBuildings.includes(BUILDING_TYPES.TEMPLE)
        options.push(["Temple", () => showModal("Temple", "The temple is quiet and serene.", [["Close", () => showPlanetMenu(planet)]]), isBlocked]);
    }
    if (settlement.casino) {
        const isBlocked = blockedBuildings.includes(BUILDING_TYPES.CASINO)
        options.push(["Casino", () => showCasinoMenu(settlement.casino), isBlocked]);
    }
    if (settlement.armory) {
        const isBlocked = blockedBuildings.includes(BUILDING_TYPES.ARMORY)
        options.push(["Armory", () => showArmoryMenu(settlement.armory), isBlocked]);
    }
    if (settlement.outfitter) {
        const isBlocked = blockedBuildings.includes(BUILDING_TYPES.OUTFITTER)
        options.push(["Outfitter", () => showOutfitterMenu(settlement.outfitter), isBlocked]);
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
    
    // Build overview section
    let overviewContent = `<u>Overview</u><br/>`
    overviewContent += `Government: ${coloredName(governmentType)}<br/>`
    if (settlement && settlement.settlementType) {
        overviewContent += `Settlement: ${colorSpan(settlement.settlementType.name, settlement.settlementType.color)}<br/>`
    }
    
    // Build policies section
    let policiesContent = `<u>Policies</u><br/>`
    policiesContent += `${policies.economic.flavor.symbol} Economic: ${colorSpan(policies.economic.name, policies.economic.color)}<br/>`
    policiesContent += `${policies.labor.flavor.symbol} Labor: ${colorSpan(policies.labor.name, policies.labor.color)}<br/>`
    policiesContent += `${policies.social.flavor.symbol} Social: ${colorSpan(policies.social.name, policies.social.color)}<br/>`
    policiesContent += `${policies.foreign.flavor.symbol} Foreign: ${colorSpan(policies.foreign.name, policies.foreign.color)}<br/>`
    
    // Build left ratings column
    const leftColumnRatings = ['population', 'territory', 'army', 'navy', 'industry', 'economy', 'security', 'culture']
    let leftRatingsContent = ''
    for (const ratingName of leftColumnRatings) {
        const rating = CIVILIZATION_RATINGS_ALL.find(r => r.name.toLowerCase() === ratingName)
        if (!rating) continue
        const value = civilization[ratingName]
        
        if (value !== undefined) {
            let displayValue = describeRating(value)
            
            // Use specific describe functions where available
            switch(ratingName) {
                case 'population': displayValue = describePopulation(value); break;
                case 'territory': displayValue = describeTerritory(value); break;
                case 'army': displayValue = describeArmy(value); break;
                case 'navy': displayValue = describeNavy(value); break;
                case 'industry': displayValue = describeIndustry(value); break;
                case 'economy': displayValue = describeEconomy(value); break;
                case 'security': displayValue = describeSecurity(value); break;
                case 'culture': displayValue = describeCulture(value); break;
            }
            
            leftRatingsContent += `${rating.symbol} ${rating.name}: ${displayValue}<br/>`
        }
    }
    
    // Build right ratings column
    const rightColumnRatings = ['technology', 'education', 'wealth', 'reserves', 'crime', 'corruption', 'inflation', 'taxes', 'prestige']
    let rightRatingsContent = ''
    for (const ratingName of rightColumnRatings) {
        const rating = CIVILIZATION_RATINGS_ALL.find(r => r.name.toLowerCase() === ratingName)
        if (!rating) continue
        const value = civilization[ratingName]
        
        if (value !== undefined) {
            let displayValue = describeRating(value)
            
            // Use specific describe functions where available
            switch(ratingName) {
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
            
            rightRatingsContent += `${rating.symbol} ${rating.name}: ${displayValue}<br/>`
        }
    }
    
    // Create layout using createColumnLayout
    const topSection = createColumnLayout([overviewContent, policiesContent])
    const hr = ce({tag: 'hr', style: {margin: '20px 0', border: `1px solid ${rgbArrayToString(COLORS.Gray)}`}})
    const ratingsHeader = ce({children: ['<u>Ratings</u>']})
    const ratingsSection = createColumnLayout([leftRatingsContent, rightRatingsContent])
    
    const content = ce({
        children: [topSection, hr, ratingsHeader, ratingsSection]
    })
    
    showPlanetModal(planet, `${coloredName(planet)} - Society`, content, [
        ["Demographics", () => showPlanetDemographicsMenu(planet)],
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
    const {temperature, atmosphericPressure, gravity, oceanCoverage, geologicalActivity, magnetosphere, radiationLevel, asteroidImpact} = climate
    
    // Build left column: Physical Properties and Composition
    let leftContent = `<u>Physical Properties</u><br/>`
    leftContent += `Type: ${coloredName(planet.planetType)}<br/>`
    leftContent += `Radius: ${roundToPlaces(planet.radius, 2)} Earth radii<br/>`
    leftContent += `Day Length: ${roundToPlaces(planet.dayLength, 2)} Earth days<br/>`
    if (planet.orbit) {
        leftContent += `Orbital Distance: ${roundToPlaces(planet.orbit.radius, 2)} AU<br/>`
        leftContent += `Orbital Period: ${roundToPlaces(planet.orbit.calcPeriod(), 2)} years<br/>`
    }
    leftContent += `<br/>`
    
    // Composition
    leftContent += `<u>Composition</u><br/>`
    if (planet.climate.atmosphereType) {
        leftContent += `Atmosphere: ${colorSpan(planet.climate.atmosphereType.name, planet.climate.atmosphereType.color)}<br/>`
    }
    if (planet.climate.oceanType) {
        leftContent += `Ocean: ${colorSpan(planet.climate.oceanType.name, planet.climate.oceanType.color)}<br/>`
    }
    if (planet.climate.geologyType) {
        leftContent += `Geology: ${colorSpan(planet.climate.geologyType.name, planet.climate.geologyType.color)}<br/>`
    }
    
    // Build right column: Climate Data
    let rightContent = `<u>Climate Data</u><br/>`
    rightContent += `Temperature: ${temperature.coloredName}<br/>`
    rightContent += `Atmosphere: ${atmosphericPressure.coloredName}<br/>`
    rightContent += `Gravity: ${gravity.coloredName}<br/>`
    rightContent += `Ocean Coverage: ${oceanCoverage.coloredName}<br/>`
    rightContent += `Geological Activity: ${geologicalActivity.coloredName}<br/>`
    rightContent += `Magnetosphere: ${magnetosphere.coloredName}<br/>`
    rightContent += `Radiation Level: ${radiationLevel.coloredName}<br/>`
    rightContent += `Asteroid Impacts: ${asteroidImpact.coloredName}<br/>`
    
    // Create column layout
    const columnLayout = createColumnLayout([leftContent, rightContent])
    
    // Planet features (outside the columns)
    const features = ce({children: []})
    if (planet.features && planet.features.length > 0) {
        features.appendChild(ce({tag: 'br'}))
        features.appendChild(ce({children: ['<u>Notable Features</u><br/>']}))
        for (const feature of planet.features) {
            features.appendChild(ce({
                children: [`${colorSpan('●', feature.color)} ${colorSpan(feature.name, feature.color)}: ${feature.description}<br/>`]
            }))
        }
    }
    
    const content = ce({
        children: [columnLayout, features]
    })
    
    showPlanetModal(planet, `${coloredName(planet)} - Climate`, content, [
        ["Society", () => showPlanetSocietyMenu(planet)],
        ["Back", () => showPlanetMenu(planet)]
    ], 'planet_climate', (nextPlanet) => showPlanetClimateMenu(nextPlanet));
}
