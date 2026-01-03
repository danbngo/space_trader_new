/**
 * Displays basic information about ruins in the star system in a table format.
 * @param {Function} backFunction - Function to call when back button is pressed.
 */
function showRuinsDatabaseMenu(backFunction = () => closeModal()) {
    const ruins = gs.system.ruins || []
    
    if (ruins.length === 0) {
        showModal(
            'Ruins Database',
            'No ancient ruins detected in this star system.',
            [["Back", backFunction]]
        )
        return
    }

    // Sort ruins by distance from sun
    ruins.sort((a, b) => {
        const aRadius = a.orbit ? a.orbit.radius : 0
        const bRadius = b.orbit ? b.orbit.radius : 0
        return aRadius - bRadius
    })
    
    let selectedRuins = ruins[0] // Select first ruins by default
    const contentContainer = ce({style: 'overflow-y: auto; max-height: 70vh;'})
    
    // Create table data
    const tableData = ruins.map(ruin => {
        const distanceFromSun = Math.round(calcDistance(ruin.x, ruin.y, 0, 0) * 100) / 100
        const distanceFromPlayer = gs.fleet ? Math.round(calcDistance(ruin.x, ruin.y, gs.fleet.x, gs.fleet.y) * 100) / 100 : '-'
        
        return [
            coloredName(ruin),
            coloredName(ruin.ruinsType),
            `${distanceFromSun} AU`,
            `${distanceFromPlayer} AU`
        ]
    })

    tableData.unshift(['Name', 'Type', 'Distance from Sun', 'Distance from You'])
    
    // Create table with selection (row 1 is first data row, after header row 0)
    const table = createTable(
        tableData,
        (index) => {
            if (index > 0) { // Skip header row
                selectedRuins = ruins[index - 1]
                updateButtons()
            }
        },
        1 // Start with first data row selected
    )
    
    contentContainer.appendChild(table)
    
    function updateButtons() {
        const buttons = [["Back", backFunction]]
        
        if (selectedRuins) {
            buttons.unshift(["View", () => {
                closeModal()
                if (currentMap && currentMap.selectObject) {
                    currentMap.selectObject(selectedRuins)
                }
            }])
        }
        
        refreshPanelButtons('ruins_database_menu', buttons)
    }
    
    showModal('Ruins Database', contentContainer, [["Back", backFunction]], 'ruins_database_menu')
    
    // Update buttons after modal is shown to include View button for initially selected ruins
    updateButtons()
}

/**
 * Displays the ruins exploration menu.
 * @param {Ruins} ruins - The ruins being explored.
 */
function showRuinsMenu(ruins = new Ruins()) {
    console.log('opening ruins menu for:', ruins);
    
    const msg = `You have docked with ${coloredName(ruins)}.<br/>
        ${ruins.ruinsType.description}<br/><br/>
        The structure appears ancient and mysterious. Further exploration will be implemented soon.`;
    
    showModal(
        coloredName(ruins),
        msg,
        [
            ['Close', () => {
                gs.fleet.location = null;
                closeModal();
            }]
        ]
    );
}
