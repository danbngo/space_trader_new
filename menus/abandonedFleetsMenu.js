/**
 * Displays information about all abandoned fleets in the star system in a table format.
 * @param {Function} backFunction - Function to call when back button is pressed.
 */
function showAbandonedFleetsMenu(backFunction = () => closeModal()) {
    const abandonedFleets = gs.system.abandonedFleets
    const title = 'Abandoned Fleets'
    const emptyMessage = 'No abandoned fleets detected in this star system.'
    
    if (abandonedFleets.length === 0) {
        showModal(title, emptyMessage, [["Back", backFunction]])
        return
    }

    // Sort abandoned fleets by year abandoned (most recent first)
    abandonedFleets.sort((a, b) => b.abandonedYear - a.abandonedYear)
    
    let selectedFleet = abandonedFleets[0] // Select first fleet by default
    const contentContainer = ce({style: 'overflow-y: auto; max-height: 70vh;'})
    
    // Create table data
    const tableData = abandonedFleets.map(fleet => {
        // Fleet name
        const fleetName = coloredName(fleet)
        
        // Planet of origin
        const origin = fleet.fleetAI?.origin ? coloredName(fleet.fleetAI.origin) : '-'
        
        // Faction
        const faction = fleet.factionType ? coloredName(fleet.factionType) : '-'
        
        // Captain's race
        const captainRace = fleet.captain?.race ? coloredName(fleet.captain.race) : '-'
        
        // Captain's religion
        const captainReligion = fleet.captain?.religion ? coloredName(fleet.captain.religion) : '-'
        
        // Number of crew (officers)
        const numCrew = fleet.officers.length
        
        // Number of ships
        const numShips = fleet.ships.length
        
        // Cargo space used / total
        const cargoUsed = fleet.cargo ? fleet.cargo.total : 0
        const cargoTotal = fleet.totalCargoSpace || 0
        const cargoInfo = `${cargoUsed} / ${cargoTotal}`
        
        // Distance from sun in AU
        const distanceFromSun = Math.sqrt(fleet.x * fleet.x + fleet.y * fleet.y).toFixed(2)
        
        // Year abandoned
        const yearAbandoned = fleet.abandonedYear || '-'
        
        // Years since abandoned
        const yearsSince = fleet.abandonedYear ? (gs.year - fleet.abandonedYear).toFixed(2) : '-'
        
        return [
            fleetName,
            origin,
            faction,
            captainRace,
            captainReligion,
            numCrew,
            numShips,
            cargoInfo,
            distanceFromSun,
            yearAbandoned,
            yearsSince
        ]
    })

    tableData.unshift(['Name', 'Origin', 'Faction', 'Race', 'Religion', '# Crew', '# Ships', 'Cargo', 'Distance (AU)', 'Abandoned', 'Years Ago'])
    
    // Create table with selection (row 1 is first data row, after header row 0)
    const table = createTable(
        tableData,
        (index) => {
            if (index > 0) { // Skip header row
                selectedFleet = abandonedFleets[index - 1]
                updateButtons()
            }
        },
        1 // Start with first data row selected
    )
    
    contentContainer.appendChild(table)
    
    function updateButtons() {
        const buttons = [["Back", backFunction]]
        
        if (selectedFleet) {
            buttons.unshift(["View", () => {
                closeModal()
                if (currentMap && currentMap.selectObject) {
                    currentMap.selectObject(selectedFleet)
                }
            }])
        }
        
        refreshPanelButtons('abandoned_fleets_menu', buttons)
    }
    
    showModal(title, contentContainer, [["Back", backFunction]], 'abandoned_fleets_menu')
    
    // Update buttons after modal is shown to include View button for initially selected fleet
    updateButtons()
}
