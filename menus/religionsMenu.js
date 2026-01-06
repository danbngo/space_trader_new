/**
 * Displays information about all religions in the star system.
 * @param {Function} backFunction - Function to call when back button is pressed.
 */
function showReligionsMenu(backFunction = () => closeModal()) {
    const religions = gs.system.religions
    
    if (religions.length === 0) {
        showModal(
            'Religions Database',
            'No organized religions detected in this star system.',
            [["Back", backFunction]]
        )
        return
    }

    // Calculate data completeness based on visited population
    const totalPopulation = gs.system.getTotalPopulation(false)
    const visitedPopulation = gs.system.getTotalPopulation(true)
    const completeness = totalPopulation > 0 ? (visitedPopulation / totalPopulation) * 100 : 0
    
    // Filter to only visited planets
    const visitedPlanets = gs.system.planets.filter(p => gs.lastVisitedDates.has(p))

    // Calculate each religion's total followers across visited planets only
    const religionFollowers = new Map()
    for (const religion of religions) {
        let followers = 0
        for (const planet of visitedPlanets) {
            if (planet.c && planet.c.population && planet.c.religions) {
                const religionPercent = planet.c.religions.getAmount(religion)
                followers += planet.c.population * (religionPercent / 100)
            }
        }
        religionFollowers.set(religion, followers)
    }

    // Split religions into two columns
    const midpoint = Math.ceil(religions.length / 2)
    const leftReligions = religions.slice(0, midpoint)
    const rightReligions = religions.slice(midpoint)

    // Create left column
    const leftColumn = ce({style: 'display: flex; flex-direction: column; gap: 20px;'})
    
    // Create right column
    const rightColumn = ce({style: 'display: flex; flex-direction: column; gap: 20px;'})
    
    // Populate left column
    for (const religion of leftReligions) {
        leftColumn.appendChild(createReligionSection(religion, religionFollowers, totalSystemPopulation))
    }
    
    // Populate right column
    for (const religion of rightReligions) {
        rightColumn.appendChild(createReligionSection(religion, religionFollowers, totalSystemPopulation))
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
        'Religions Database',
        content,
        [["Back", backFunction]]
    )
}

/**
 * Creates a religion section element with traits and faith reach
 * @param {Religion} religion - The religion to display
 * @param {Map} religionFollowers - Map of religion to follower count
 * @param {number} totalSystemPopulation - Total population of the system
 * @returns {HTMLElement} The religion section element
 */
function createReligionSection(religion, religionFollowers, totalSystemPopulation) {
    const followers = religionFollowers.get(religion) || 0
    const faithPercentage = totalSystemPopulation > 0 ? (followers / totalSystemPopulation) * 100 : 0
    
    const religionSection = ce({
        style: 'border-left: 3px solid ' + rgbArrayToString(religion.color) + '; padding-left: 15px; margin-bottom: 15px;',
        children: [
            ce({
                tag: 'div',
                style: 'font-weight: bold; margin-bottom: 5px; font-size: 1.1em;',
                children: [coloredName(religion)]
            })
        ]
    })

    // Add traits as comma-separated list
    if (religion.traits && religion.traits.length > 0) {
        const traitsList = religion.traits.map(trait => colorSpan(trait.name, trait.color)).join(', ')
        const traitsEl = ce({
            style: 'margin-top: 5px; margin-bottom: 8px;',
            children: [`Traits: ${traitsList}`]
        })
        religionSection.appendChild(traitsEl)
    } else {
        const noTraits = ce({
            style: 'margin-top: 5px; margin-bottom: 8px; opacity: 0.6; font-style: italic;',
            children: ['This faith has no documented doctrinal traits.']
        })
        religionSection.appendChild(noTraits)
    }

    // Add state religion adoption info
    const planetsWithStateReligion = gs.system.planets.filter(p => p.c && p.c.stateReligion === religion)
    const stateReligionCount = planetsWithStateReligion.length
    const totalPlanets = gs.system.planets.filter(p => p.c).length
    
    if (totalPlanets > 0) {
        const planetSymbols = planetsWithStateReligion.map(p => p.symbol).join(' ')
        const stateReligionEl = ce({
            style: 'margin-bottom: 8px;',
            children: [`State Religion: ${stateReligionCount} of ${totalPlanets} planets ${planetSymbols ? '— ' + planetSymbols : ''}`]
        })
        religionSection.appendChild(stateReligionEl)
    }

    // Add faith reach progress bar
    const faithProgressBar = new ProgressBar({
        value: faithPercentage,
        fillColor: rgbArrayToString(religion.color),
        width: 40
    })
    
    const faithReachContainer = ce({
        style: 'margin-bottom: 8px;',
        children: [
            faithProgressBar.container
        ]
    })
    religionSection.appendChild(faithReachContainer)
    religionSection.appendChild(ce({tag:'br'}))
    religionSection.appendChild(ce({tag:'br'}))
    return religionSection
}
