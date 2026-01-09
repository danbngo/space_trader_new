/**
 * Displays information about all government types in the star system.
 * @param {Function} backFunction - Function to call when back button is pressed.
 */
function showGovernmentsMenu(backFunction = () => closeModal()) {
    // Filter to only visited civilized planets
    const civilizedPlanets = gs.system.planets.filter(p => p.c && gs.lastVisitedDates.has(p))
    
    if (civilizedPlanets.length === 0) {
        showModal(
            'Governments Database',
            'No civilizations detected in visited locations.',
            [["Back", backFunction]]
        )
        return
    }

    // Calculate data completeness
    const totalPopulation = gs.system.getTotalPopulation(false)
    const visitedPopulation = gs.system.getTotalPopulation(true)
    const completeness = totalPopulation > 0 ? (visitedPopulation / totalPopulation) * 100 : 0

    // Count planets by government type
    const governmentCounts = new Map()
    const totalPlanets = civilizedPlanets.length
    
    for (const planet of civilizedPlanets) {
        const govType = planet.c.governmentType
        governmentCounts.set(govType, (governmentCounts.get(govType) || 0) + 1)
    }

    // Get unique government types present in system
    const presentGovernments = Array.from(governmentCounts.keys())

    // Split governments into two columns
    const midpoint = Math.ceil(presentGovernments.length / 2)
    const leftGovernments = presentGovernments.slice(0, midpoint)
    const rightGovernments = presentGovernments.slice(midpoint)

    // Create left column
    const leftColumn = ce({style: 'display: flex; flex-direction: column; gap: 20px;'})
    
    // Create right column
    const rightColumn = ce({style: 'display: flex; flex-direction: column; gap: 20px;'})
    
    // Populate left column
    for (const govType of leftGovernments) {
        leftColumn.appendChild(createGovernmentSection(govType, governmentCounts, totalPlanets))
    }
    
    // Populate right column
    for (const govType of rightGovernments) {
        rightColumn.appendChild(createGovernmentSection(govType, governmentCounts, totalPlanets))
    }

    const columnLayout = createColumnLayout([leftColumn, rightColumn])

    // Create data completeness indicator
    const completenessText = completeness >= 100 
        ? colorSpan('Data 100% complete!', COLORS.Green)
        : colorSpan(`Data ${Math.round(completeness)}% complete, visit more locations to increase accuracy`, COLORS.LightYellow)
    
    const content = ce({
        children: [
            ce({innerHTML: completenessText, style: 'margin-bottom: 15px; font-style: italic;'}),
            ce({tag: 'br'}),
            columnLayout
        ]
    })

    showModal(
        'Governments Database',
        content,
        [["Back", backFunction]]
    )
}

/**
 * Creates a government section element with adoption rate
 * @param {GovernmentType} govType - The government type to display
 * @param {Map} governmentCounts - Map of government type to planet count
 * @param {number} totalPlanets - Total number of civilized planets
 * @returns {HTMLElement} The government section element
 */
function createGovernmentSection(govType, governmentCounts, totalPlanets) {
    const count = governmentCounts.get(govType) || 0
    const adoptionPercentage = totalPlanets > 0 ? (count / totalPlanets) * 100 : 0
    
    // Get planet symbols for this government type
    const planetSymbols = gs.system.planets
        .filter(p => p.c && p.c.governmentType === govType)
        .map(p => p.symbol)
        .join(' ')
    
    const govSection = ce({
        style: 'border-left: 3px solid ' + rgbArrayToString(govType.color) + '; padding-left: 15px; margin-bottom: 15px;',
        children: [
            ce({
                tag: 'div',
                style: 'font-weight: bold; margin-bottom: 5px; font-size: 1.1em;',
                children: [coloredName(govType)]
            })
        ]
    })

    // Add adoption rate progress bar
    const adoptionProgressBar = new ProgressBar({
        value: adoptionPercentage,
        fillColor: rgbArrayToString(govType.color),
        width: 40
    })
    
    const adoptionContainer = ce({
        style: 'margin-bottom: 8px;',
        children: [
            ce({
                style: 'margin-bottom: 4px; font-size: 0.9em;',
                innerHTML: `${count} of ${totalPlanets} planets: ${planetSymbols}`
            }),
            adoptionProgressBar.container
        ]
    })
    govSection.appendChild(adoptionContainer)
    govSection.appendChild(ce({tag:'br'}))

    return govSection
}

