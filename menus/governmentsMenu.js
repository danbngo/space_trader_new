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

    // Create policy adoption table
    const policyAdoptionSection = ce({
        style: 'margin-top: 30px; padding-top: 20px; border-top: 1px solid #444;',
        children: [
            ce({
                tag: 'div',
                style: 'font-weight: bold; margin-bottom: 10px; font-size: 1.1em;',
                children: ['Policy Adoption']
            }),
            createPolicyAdoptionTable(civilizedPlanets)
        ]
    })

    // Create data completeness indicator
    const completenessText = completeness >= 100 
        ? colorSpan('Data 100% complete!', COLORS.Green)
        : `Data ${Math.round(completeness)}% complete, visit more locations to increase accuracy`
    
    const content = ce({
        children: [
            ce({innerHTML: completenessText, style: 'margin-bottom: 15px; font-style: italic;'}),
            columnLayout, 
            policyAdoptionSection
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

/**
 * Creates tables showing policy adoption by category across all governments
 * @param {Planet[]} civilizedPlanets - Array of planets with civilizations
 * @returns {HTMLElement} The policy tables in two-column layout
 */
function createPolicyAdoptionTable(civilizedPlanets) {
    // Count how many governments use each policy
    const policyCounts = new Map()
    
    for (const planet of civilizedPlanets) {
        const policies = planet.c.policies
        if (policies.economic) {
            policyCounts.set(policies.economic, (policyCounts.get(policies.economic) || 0) + 1)
        }
        if (policies.labor) {
            policyCounts.set(policies.labor, (policyCounts.get(policies.labor) || 0) + 1)
        }
        if (policies.social) {
            policyCounts.set(policies.social, (policyCounts.get(policies.social) || 0) + 1)
        }
        if (policies.foreign) {
            policyCounts.set(policies.foreign, (policyCounts.get(policies.foreign) || 0) + 1)
        }
    }

    // Helper function to create a table for a policy category
    const createCategoryTable = (categoryName, categoryPolicies) => {
        const usedPolicies = categoryPolicies.filter(p => policyCounts.get(p) > 0)
        
        if (usedPolicies.length === 0) {
            return ce({
                style: 'margin-bottom: 20px;',
                children: [
                    ce({
                        tag: 'div',
                        style: 'font-weight: bold; margin-bottom: 5px;',
                        children: [categoryName]
                    }),
                    colorSpan('(No policies active)', COLORS.Gray)
                ]
            })
        }

        // Sort by count descending
        usedPolicies.sort((a, b) => policyCounts.get(b) - policyCounts.get(a))

        /** @type {Array<[string, string|HTMLElement]>} */
        const tableRows = [
            ['Policy', 'Governments']
        ]

        for (const policy of usedPolicies) {
            // Get planet symbols for this policy
            const planetSymbols = civilizedPlanets
                .filter(p => p.c.policies.all.includes(policy))
                .map(p => p.symbol)
                .join(' ')
            
            tableRows.push([
                coloredName(policy),
                ce({innerHTML: planetSymbols})
            ])
        }

        return ce({
            style: 'margin-bottom: 20px;',
            children: [
                ce({
                    tag: 'div',
                    style: 'font-weight: bold; margin-bottom: 5px;',
                    children: [categoryName]
                }),
                createTable(tableRows, null, null)
            ]
        })
    }

    // Left column: Social and Foreign policies
    const leftColumn = ce({
        style: 'display: flex; flex-direction: column;',
        children: [
            createCategoryTable('Social Policies', SOCIAL_POLICIES),
            createCategoryTable('Foreign Policies', FOREIGN_POLICIES)
        ]
    })

    // Right column: Economic and Labor policies
    const rightColumn = ce({
        style: 'display: flex; flex-direction: column;',
        children: [
            createCategoryTable('Economic Policies', ECONOMIC_POLICIES),
            createCategoryTable('Labor Policies', LABOR_POLICIES)
        ]
    })

    return createColumnLayout([leftColumn, rightColumn])
}
