/**
 * Displays political information about all civilized planets in the star system.
 * @param {Function} backFunction - Function to call when back button is pressed.
 */
function showPoliticsMenu(backFunction = () => closeModal()) {
    const planets = gs.system.planets.filter(p => p.civilization)
    
    if (planets.length === 0) {
        showModal(
            'Political Database',
            'No civilizations detected in this star system.',
            [["Back", backFunction]]
        )
        return
    }

    const contentContainer = ce({style: 'overflow-y: auto; max-height: 70vh;'})
    
    // Create table data
    const tableData = planets.map(planet => {
        const c = planet.civilization
        
        // Get alliances
        const alliances = []
        for (const [otherPlanet, relationship] of c.relationships.entries()) {
            if (relationship === RELATIONSHIP_TYPES.ALLY) {
                alliances.push(otherPlanet.symbol)
            }
        }
        
        // Get tense relationships
        const tense = []
        for (const [otherPlanet, relationship] of c.relationships.entries()) {
            if (relationship === RELATIONSHIP_TYPES.TENSE) {
                tense.push(otherPlanet.symbol)
            }
        }
        
        // Get at war relationships
        const atWar = []
        for (const [otherPlanet, relationship] of c.relationships.entries()) {
            if (relationship === RELATIONSHIP_TYPES.WAR) {
                atWar.push(otherPlanet.symbol)
            }
        }
        
        return [coloredName(planet),
            coloredName(c.governmentType),
            c.stateReligion ? coloredName(c.stateReligion) : 'None',
            c.races?.calcHighestKey() ? coloredName(c.races.calcHighestKey()) : 'Unknown',
            alliances.length > 0 ? alliances.join(' ') : '-',
            tense.length > 0 ? tense.join(' ') : '-',
            atWar.length > 0 ? atWar.join(' ') : '-',
        ]
    })

    tableData.unshift(['Planet Name', 'Government Type', 'State Religion', 'Majority Ethnicity', 'Alliances', 'Tense', 'At War'])
    
    // Create table
    const table = createTable(
        tableData,
        null, // onSelect - no selection needed
        null  // selectedRow
    )
    
    contentContainer.appendChild(table)
    
    showModal(
        'Political Database',
        contentContainer,
        [["Back", backFunction]]
    )
}
