/**
 * Displays information about all cultures in the star system.
 * @param {Function} backFunction - Function to call when back button is pressed.
 */
function showCulturesMenu(backFunction = () => closeModal()) {
    const cultures = gs.system.planets.filter(p => p.civilization)
    
    if (cultures.length === 0) {
        showModal(
            'Cultures Database',
            'No civilizations with distinct cultures detected in this star system.',
            [["Back", backFunction]]
        )
        return
    }

    // Calculate total system population
    let totalSystemPopulation = 0
    for (const planet of gs.system.planets) {
        if (planet.c && planet.c.population) {
            totalSystemPopulation += planet.c.population
        }
    }

    // Calculate each culture's total population across all planets
    const culturePopulation = new Map()
    for (const culturePlanet of cultures) {
        let population = 0
        for (const planet of gs.system.planets) {
            if (planet.c && planet.c.population && planet.c.cultures) {
                const culturePercent = planet.c.cultures.getAmount(culturePlanet)
                population += planet.c.population * culturePercent
            }
        }
        culturePopulation.set(culturePlanet, population)
    }

    // Split cultures into two columns
    const midpoint = Math.ceil(cultures.length / 2)
    const leftCultures = cultures.slice(0, midpoint)
    const rightCultures = cultures.slice(midpoint)

    // Create left column
    const leftColumn = ce({style: 'display: flex; flex-direction: column; gap: 20px;'})
    
    // Create right column
    const rightColumn = ce({style: 'display: flex; flex-direction: column; gap: 20px;'})
    
    // Populate left column
    for (const culturePlanet of leftCultures) {
        leftColumn.appendChild(createCultureSection(culturePlanet, culturePopulation, totalSystemPopulation))
    }
    
    // Populate right column
    for (const culturePlanet of rightCultures) {
        rightColumn.appendChild(createCultureSection(culturePlanet, culturePopulation, totalSystemPopulation))
    }

    const columnLayout = createColumnLayout([leftColumn, rightColumn])

    showModal(
        'Cultures Database',
        columnLayout,
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

    // Add culture prevalence info
    const planetsWithCulture = gs.system.planets.filter(p => p.c && p.c.cultures && p.c.cultures.getAmount(culturePlanet) > 0.05)
    const prevalenceCount = planetsWithCulture.length
    const totalPlanets = gs.system.planets.filter(p => p.c).length
    
    if (totalPlanets > 0) {
        const planetSymbols = planetsWithCulture.map(p => p.symbol).join(' ')
        const prevalenceEl = ce({
            style: 'margin-bottom: 8px;',
            children: [`Present on: ${prevalenceCount} of ${totalPlanets} planets ${planetSymbols ? '— ' + planetSymbols : ''}`]
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
