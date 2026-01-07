/**
 * Displays information about all cultures in the star system.
 * @param {Function} backFunction - Function to call when back button is pressed.
 */
function showCulturesMenu(backFunction = () => closeModal()) {
    // Filter to only visited civilized planets
    const visitedCultures = gs.system.planets.filter(p => p.civilization && gs.lastVisitedDates.has(p))
    
    if (visitedCultures.length === 0) {
        showModal(
            'Cultures Database',
            'No civilizations with distinct cultures detected in visited locations.',
            [["Back", backFunction]]
        )
        return
    }

    // Calculate data completeness
    const totalPopulation = gs.system.getTotalPopulation(false)
    const visitedPopulation = gs.system.getTotalPopulation(true)
    const completeness = totalPopulation > 0 ? (visitedPopulation / totalPopulation) * 100 : 0
    
    // Filter to only visited planets for calculations
    const visitedPlanets = gs.system.planets.filter(p => gs.lastVisitedDates.has(p))

    // Calculate each culture's total population across visited planets only
    const culturePopulation = new Map()
    for (const culturePlanet of visitedCultures) {
        let population = 0
        for (const planet of visitedPlanets) {
            if (planet.c && planet.c.population && planet.c.cultures) {
                const culturePercent = planet.c.cultures.getAmount(culturePlanet)
                population += planet.c.population * culturePercent
            }
        }
        culturePopulation.set(culturePlanet, population)
    }
    
    // Calculate visited civilized planets population for percentage calculations
    const visitedCivilizedPopulation = visitedPlanets
        .filter(p => p.c && p.c.population)
        .reduce((sum, p) => sum + p.c.population, 0)

    // Split cultures into two columns
    const midpoint = Math.ceil(visitedCultures.length / 2)
    const leftCultures = visitedCultures.slice(0, midpoint)
    const rightCultures = visitedCultures.slice(midpoint)

    // Create left column
    const leftColumn = ce({style: 'display: flex; flex-direction: column; gap: 20px;'})
    
    // Create right column
    const rightColumn = ce({style: 'display: flex; flex-direction: column; gap: 20px;'})
    
    // Populate left column
    for (const culturePlanet of leftCultures) {
        leftColumn.appendChild(createCultureSection(culturePlanet, culturePopulation, visitedCivilizedPopulation))
    }
    
    // Populate right column
    for (const culturePlanet of rightCultures) {
        rightColumn.appendChild(createCultureSection(culturePlanet, culturePopulation, visitedCivilizedPopulation))
    }

    const columnLayout = createColumnLayout([leftColumn, rightColumn])
    
    // Create data completeness indicator
    const completenessText = completeness >= 100 
        ? colorSpan('Data 100% complete!', COLORS.Green)
        : `Data ${Math.round(completeness)}% complete, visit more locations to increase accuracy`
    
    const content = ce({
        children: [
            ce({innerHTML: completenessText, style: 'margin-bottom: 15px; font-style: italic;'}),
            columnLayout
        ]
    })

    showModal(
        'Cultures Database',
        content,
        [["Back", backFunction]]
    )
}

/**
 * Creates a culture section element with culture reach
 * @param {Planet} culturePlanet - The planet whose culture to display
 * @param {Map} culturePopulation - Map of planet to population count
 * @param {number} totalSystemPopulation - Total population of the system
 * @returns {HTMLElement} The culture section element
 */
function createCultureSection(culturePlanet, culturePopulation, totalSystemPopulation) {
    const population = culturePopulation.get(culturePlanet) || 0
    const culturePercentage = totalSystemPopulation > 0 ? (population / totalSystemPopulation) * 100 : 0
    
    const cultureSection = ce({
        style: 'border-left: 3px solid ' + rgbArrayToString(culturePlanet.color) + '; padding-left: 15px; margin-bottom: 15px;',
        children: [
            ce({
                tag: 'div',
                style: 'font-weight: bold; margin-bottom: 5px; font-size: 1.1em;',
                children: [coloredName(culturePlanet) + ' Culture']
            })
        ]
    })

    // Add culture prevalence info (only count discovered planets)
    const discoveredPlanets = gs.system.planets.filter(p => p.c && gs.lastVisitedDates.has(p))
    const discoveredPlanetsWithCulture = discoveredPlanets.filter(p => p.c.cultures && p.c.cultures.getAmount(culturePlanet) > 0.05)
    const prevalenceCount = discoveredPlanetsWithCulture.length
    
    // Check if player has discovered all civilized planets
    const allCivilizedPlanets = gs.system.planets.filter(p => p.c)
    const allDiscovered = discoveredPlanets.length >= allCivilizedPlanets.length
    
    if (discoveredPlanets.length > 0) {
        const planetSymbols = allDiscovered ? discoveredPlanetsWithCulture.map(p => p.symbol).join(' ') : ''
        const totalText = allDiscovered ? `${allCivilizedPlanets.length}` : '?'
        const prevalenceEl = ce({
            style: 'margin-bottom: 8px;',
            children: [`Present on: ${prevalenceCount} of ${totalText} planets ${planetSymbols ? '— ' + planetSymbols : ''}`]
        })
        cultureSection.appendChild(prevalenceEl)
    }

    // Add culture reach progress bar
    const cultureProgressBar = new ProgressBar({
        value: culturePercentage,
        fillColor: rgbArrayToString(culturePlanet.color),
        width: 40
    })
    
    const cultureReachContainer = ce({
        style: 'margin-bottom: 8px;',
        children: [
            cultureProgressBar.container
        ]
    })
    cultureSection.appendChild(cultureReachContainer)
    cultureSection.appendChild(ce({tag:'br'}))
    cultureSection.appendChild(ce({tag:'br'}))
    return cultureSection
}
