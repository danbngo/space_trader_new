const buildingHandlerMapping = [
    {type: BUILDING_TYPES.SHIPYARD, prop: 'shipyard', menu: (b) => showShipyardSellMenu(b)},
    {type: BUILDING_TYPES.COURTHOUSE, prop: 'courthouse', menu: (b) => showCourthouseMenu(b)},
    {type: BUILDING_TYPES.MARKET, prop: 'market', menu: (b) => showMarketMenu(b)},
    {type: BUILDING_TYPES.BLACK_MARKET, prop: 'blackMarket', menu: (b) => showMarketMenu(b)},
    {type: BUILDING_TYPES.TAVERN, prop: 'tavern', menu: (b) => showTavernMenu(b)},
    {type: BUILDING_TYPES.GUILD, prop: 'guild', menu: (b) => showGuildMenu(b)},
    {type: BUILDING_TYPES.ACADEMY, prop: 'academy', menu: (b) => showAcademyMenu(b)},
    {type: BUILDING_TYPES.BANK, prop: 'bank', menu: (b) => showBankMenu(b)},
    {type: BUILDING_TYPES.TEMPLE, prop: 'temple', menu: (b) => showTempleMenu(b), getDisabledReason: (b) => {
        const stateReligion = b.planet.settlement?.government?.stateReligion;
        return stateReligion ? null : 'No state religion in this settlement';
    }},
    {type: BUILDING_TYPES.CASINO, prop: 'casino', menu: (b) => showCasinoMenu(b)},
    {type: BUILDING_TYPES.CYBER_SURGEON, prop: 'cyberSurgeon', menu: (b) => showCyberSurgeonBuyMenu(b)},
    {type: BUILDING_TYPES.GENETICIST, prop: 'geneticist', menu: (b) => showGeneticistBuyMenu(b)},
    {type: BUILDING_TYPES.PALACE, prop: 'palace', menu: (b) => showPalaceMenu(b)},
    {type: BUILDING_TYPES.CARAVANSERY, prop: 'caravansery', menu: (b) => showCaravanseryMenu(b)},
]


/**
 * Displays the main planet menu with access to all buildings.
 * @param {Planet} planet - The planet to interact with.
 */
function showPlanetMenu(planet = new Planet()) {
    console.log('opening planet menu for:',planet)
    const isDocked = gs.location == planet
    const settlement = getDisplaySettlement(planet)
    const hasVisited = gs.lastVisitedDates.has(planet)

    let msg = isDocked ?
        `You have arrived at ${coloredName(planet)}.<br/>`
        : hasVisited ? ''+colorSpan(`You are scanning ${coloredName(planet)}.<br/>`, COLORS.Yellow)
        : ''+colorSpan(`You are scanning an unknown ${planet.objectType.name.toLowerCase()}.<br/>`, COLORS.Yellow)
    
    // Add scanning mode message with last visit date
    msg += getScanningModeMessage(planet)

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
        const disabledShips = gs.fleet.ships.filter(s=>s.disabled)
        if (disabledShips.length > 0) {
            msg += colorSpan(`The dock's nanite swarm restores 1 hull to each disabled ship.<br/>`, COLORS.LightGreen)
            for (const s of disabledShips) {
                s.hull[0] = 1  // Only restore 1 hull to make ship non-disabled
            }
        }
                
        // Refuel up to 50% of total capacity when docking
        const halfCapacity = gs.fleet.totalFuelCapacity * 0.5
        const fuelNeeded = halfCapacity - gs.fleet.fuel
        if (fuelNeeded > 0) {
            gs.fleet.fuel += fuelNeeded
            msg += colorSpan(`The dock provides ${roundToPlaces(fuelNeeded, 1)} units of complimentary fuel (50% capacity).<br/>`, COLORS.LightGreen)
        }
        
        // Check for damaged buildings
        if (settlement) {
            const damagedBuildings = []
            for (const {type, prop} of buildingHandlerMapping) {
                const building = settlement[prop]
                if (building && building.damaged) {
                    damagedBuildings.push(type.name)
                }
            }
            if (damagedBuildings.length > 0) {
                const buildingList = damagedBuildings.join(' and ')
                const verb = damagedBuildings.length === 1 ? 'is' : 'are'
                msg += colorSpan(`The ${buildingList} ${verb} closed for repairs.<br/>`, COLORS.Orange)
            }
        }
    }
    /** @type {(ButtonData|HTMLElement)[]} */
    const options = []
    
    // Check if player has active bounty on this planet
    const activeBounty = gs.captain.bounty.getAmount(planet)
    const hasBounty = activeBounty > 0
    
    // Iterate through all buildings
    if (settlement) for (const {type, prop, menu, getDisabledReason} of buildingHandlerMapping) {
        const building = settlement[prop]
        if (building && building.exists !== false) {
            console.log('building, type:',building, type)
            let accessDeniedReason = BuildingType.getAccessDeniedReason(planet, building)
            
            // Check for active bounty blocking access (unless building allows outlaws)
            if (!accessDeniedReason && hasBounty && !type.allowOutlaw) {
                accessDeniedReason = `You have an active bounty here! (${activeBounty}CR)`
            }
            
            // Check for custom disabled reason
            if (!accessDeniedReason && getDisabledReason) {
                accessDeniedReason = getDisabledReason(building);
            }
            
            const isDisabled = accessDeniedReason !== null
            const levelDisplay = building.level ? ` ${building.level}` : ''
            const buttonText = type.name + levelDisplay
            
            // Add tooltip for disabled buttons
            if (isDisabled && accessDeniedReason) {
                options.push([buttonText, () => menu(building), true, accessDeniedReason])
            } else {
                options.push([buttonText, () => menu(building), false])
            }
        }
    }
    
    options.push(ce({tag:'br'}));
    //options.push(["News", () => showNewsTimelineMenu(planet, () => showPlanetMenu(planet))]);
    
    // Check if player has visited this planet
    const notVisitedMessage = "You must visit this location first to gain detailed information"
    
    options.push([`Info`, () => planet.civilization ? showPlanetSocietyMenu(planet) : showPlanetClimateMenu(planet), !hasVisited, notVisitedMessage]);
    if (planet.children && planet.children.length > 0) {
        const firstChild = planet.children[0];
        if (firstChild && firstChild instanceof Moon) options.push(["Moons", () => showPlanetMenu(firstChild), !hasVisited, notVisitedMessage]);
    }
    options.push([isDocked ? "Depart" : "Stop Scanning", () => closeModal()]);
    
    // Use appropriate title based on visit status
    const menuTitle = hasVisited ? coloredName(planet) : `Scanning Unknown ${planet.objectType.name}`
    showPlanetModal(planet, menuTitle, msg, options, 'planet_menu', (nextPlanet) => showPlanetMenu(nextPlanet));
}

/**
 * Displays a menu listing all moons of a planet.
 * @param {Planet} planet - The planet whose moons to display.
 */
function showMoonsMenu(planet = new Planet()) {
    let msg = `${coloredName(planet)} has ${planet.children.length} major moon${planet.children.length > 1 ? 's' : ''}:<br/><br/>`
    
    /** @type { (ButtonData|HTMLElement)[] } */
    const options = []
    for (const moon of planet.children) {
        if (moon instanceof Moon) options.push([moon.name, () => showPlanetMenu(moon)])
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
    console.log('showPlanetSocietyMenu called with planet:', planet)
    const {civilization, settlement} = planet
    console.log('Civilization:', civilization, 'Settlement:', settlement)
    
    let content
    
    // Check if player has visited this planet
    if (!gs.lastVisitedDates.has(planet)) {
        console.log('Planet not visited yet, showing placeholder')
        content = ce({children: [colorSpan('No data available yet. Visit this location to gather detailed information.', COLORS.Gray)]})
    }
    // Check if civilization exists
    else if (!civilization) {
        console.log('No civilization on planet')
        content = ce({children: ['No civilization detected on this planet.']})
    } else {
        console.log('Displaying civilization data')
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
    const leftColumnRatings = ['population', 'territory', 'army', 'navy', 'industry', 'economy', 'security', 'culture', 'technology']
    let leftRatingsContent = ''
    for (const ratingName of leftColumnRatings) {
        const rating = CIVILIZATION_RATINGS_ALL.find(r => r.name.toLowerCase() === ratingName)
        if (!rating) continue
        const value = civilization[ratingName]
        
        if (value !== undefined) {
            let displayValue = describeRating(value)
            
            // Use specific describe functions where available
            switch(ratingName) {
                case 'population': displayValue = describePopulation(value, planet); break;
                case 'territory': displayValue = describeTerritory(value); break;
                case 'army': displayValue = describeArmy(value, planet); break;
                case 'navy': displayValue = describeNavy(value, planet); break;
                case 'industry': displayValue = describeIndustry(value, planet); break;
                case 'economy': displayValue = describeEconomy(value, planet); break;
                case 'security': displayValue = describeSecurity(value, planet); break;
                case 'culture': displayValue = describeCulture(value, planet); break;
                case 'technology': displayValue = describeTechnology(value); break;
            }
            
            leftRatingsContent += `${rating.symbol} ${rating.name}: ${displayValue}<br/>`
        }
    }
    
    // Build right ratings column
    const rightColumnRatings = ['education', 'wealth', 'reserves', 'crime', 'corruption', 'inflation', 'taxes', 'prestige']
    let rightRatingsContent = ''
    for (const ratingName of rightColumnRatings) {
        const rating = CIVILIZATION_RATINGS_ALL.find(r => r.name.toLowerCase() === ratingName)
        if (!rating) continue
        const value = civilization[ratingName]
        
        if (value !== undefined) {
            let displayValue = describeRating(value)
            
            // Use specific describe functions where available
            switch(ratingName) {
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
        const topSection = createColumnLayout([ce({innerHTML: overviewContent}), ce({innerHTML: policiesContent})])
        const hr = ce({tag: 'hr', style: {margin: '20px 0', border: `1px solid ${rgbArrayToString(COLORS.Gray)}`}})
        const ratingsHeader = ce({children: ['<u>Ratings</u>']})
        const ratingsSection = createColumnLayout([ce({innerHTML: leftRatingsContent}), ce({innerHTML: rightRatingsContent})])
        
        content = ce({
            children: [topSection, hr, ratingsHeader, ratingsSection]
        })
    }
    
    showPlanetModal(planet, `${coloredName(planet)} - Society`, content, [
        ["Demographics", () => showPlanetDemographicsMenu(planet), !civilization],
        ["Climate", () => showPlanetClimateMenu(planet)],
        ["News", () => showPlanetNewsMenu(planet)],
        ["Back", () => showPlanetMenu(planet)]
    ], 'planet_society', (nextPlanet) => showPlanetSocietyMenu(nextPlanet));
}

function scoreEarthlikeValue(planetValue = 1, earthValue = 1) {
    // Calculate ratio and use log scale for symmetric scoring
    // 1.0 = perfect (Earth-like), values further from 1.0 are worse
    // 0.5x and 2x both return 0.5, 0.25x and 4x both return 0.25
    const ratio = planetValue / earthValue
    if (ratio <= 0) return 0
    
    // Use logarithmic distance from 1.0
    // log2(ratio) gives us: -1 for 0.5x, 0 for 1x, 1 for 2x
    const logDistance = Math.abs(Math.log2(ratio))
    
    // Convert to 0-1 score where 0 distance = 1.0, distance of 2 (4x or 0.25x) = 0.25
    // Using exponential decay: score = 2^(-logDistance)
    const score = Math.pow(2, -logDistance)
    
    return score*4
}
/**
 * Displays detailed climate and physical information about a planet.
 * @param {Planet} planet - The planet to display climate information for.
 */
function showPlanetClimateMenu(planet = new Planet()) {
    console.log('showPlanetClimateMenu called with planet:', planet)
    // Check if player has visited this planet
    if (!gs.lastVisitedDates.has(planet)) {
        console.log('Planet not visited yet, showing placeholder')
        const content = ce({children: [colorSpan('No data available yet. Visit this location to gather detailed information.', COLORS.Gray)]})
        showPlanetModal(planet, `${coloredName(planet)} - Climate`, content, [
            ["Back", () => showPlanetMenu(planet)]
        ], 'planet_climate', (nextPlanet) => showPlanetClimateMenu(nextPlanet));
        return
    }
    
    console.log('Planet visited, showing climate data')
    const {climate} = planet
    console.log('Climate object:', climate)
    if (!climate) {
        console.error('Climate is null or undefined!')
        const content = ce({children: [colorSpan('Error: Climate data missing', COLORS.Red)]})
        showPlanetModal(planet, `${coloredName(planet)} - Climate`, content, [
            ["Back", () => showPlanetMenu(planet)]
        ], 'planet_climate', (nextPlanet) => showPlanetClimateMenu(nextPlanet));
        return
    }
    const {temperature, atmosphericPressure, gravity, oceanCoverage, geologicalActivity, magnetosphere, radiationLevel, asteroidImpact} = climate
    console.log('Climate properties extracted:', {temperature, atmosphericPressure, gravity, oceanCoverage, geologicalActivity, magnetosphere, radiationLevel, asteroidImpact})
    
    // Build left column: Physical Properties and Composition
    let leftContent = `<u>Physical Properties</u><br/>`
    leftContent += `Class: ${coloredName(planet.objectType)}<br/>`
    leftContent += `Type: ${coloredName(planet.planetType)}<br/>`
    leftContent += `Radius: ${statColorSpan(roundToPlaces(planet.radius, 2) + ' Earth radii', scoreEarthlikeValue(planet.radius, EARTH.radius))}<br/>`
    leftContent += `Day Length: ${statColorSpan(roundToPlaces(planet.dayLength, 2) + ' Earth days', scoreEarthlikeValue(planet.dayLength, EARTH.dayLength))}<br/>`
    if (planet.orbit) {
        leftContent += `Orbital Distance: ${statColorSpan(roundToPlaces(planet.orbit.radius, 2) + ' AU', scoreEarthlikeValue(planet.orbit.radius, EARTH.orbit.radius))}<br/>`
        leftContent += `Orbital Period: ${statColorSpan(roundToPlaces(planet.orbit.calcPeriod(), 2) + ' years', scoreEarthlikeValue(planet.orbit.calcPeriod(), EARTH.orbit.calcPeriod()))}<br/>`
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
    const columnLayout = createColumnLayout([ce({innerHTML: leftContent}), ce({innerHTML: rightContent})])
    
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
        ["Society", () => showPlanetSocietyMenu(planet), !planet.civilization],
        ["Demographics", () => showPlanetDemographicsMenu(planet), !planet.civilization],
        ["News", () => showPlanetNewsMenu(planet)],
        ["Back", () => showPlanetMenu(planet)]
    ], 'planet_climate', (nextPlanet) => showPlanetClimateMenu(nextPlanet));
}
