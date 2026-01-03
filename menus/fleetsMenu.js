/**
 * Displays information about all fleets in the star system in a table format.
 * @param {Function} backFunction - Function to call when back button is pressed.
 */
function showFleetsMenu(backFunction = () => closeModal()) {
    const fleets = gs.system.fleets
    const title = 'Fleets Database'
    const emptyMessage = 'No fleets detected in this star system.'
    
    if (fleets.length === 0) {
        showModal(title, emptyMessage, [["Back", backFunction]])
        return
    }

    // Sort fleets: player fleet first, then by faction name, then by fleet name
    fleets.sort((a, b) => {
        // Player fleet always first
        if (a === gs.fleet) return -1
        if (b === gs.fleet) return 1
        
        const aFaction = a.factionType ? a.factionType.name : 'Unknown'
        const bFaction = b.factionType ? b.factionType.name : 'Unknown'
        if (aFaction !== bFaction) return aFaction.localeCompare(bFaction)
        return a.name.localeCompare(b.name)
    })
    
    let selectedFleet = fleets[0] // Select first fleet by default
    const contentContainer = ce({style: 'overflow-y: auto; max-height: 70vh;'})
    
    // Create table data
    const tableData = fleets.map(fleet => {
        // Fleet name
        const fleetName = coloredName(fleet)
        
        // Planet of origin
        const origin = fleet.fleetAI?.origin ? coloredName(fleet.fleetAI.origin) : '-'

        const planet = fleet.planet ? coloredName(fleet.planet) : '-'
        
        // Faction
        const faction = fleet.factionType ? coloredName(fleet.factionType) : '-'
        
        // Captain's race
        const captainRace = fleet.captain?.race ? coloredName(fleet.captain.race) : '-'
        
        // Captain's religion
        const captainReligion = fleet.captain?.religion ? coloredName(fleet.captain.religion) : '-'
        
        // Number of crew (officers)
        const numCrew = fleet.officers.length
        
        // Target
        const target = fleet.fleetAI?.target ? coloredName(fleet.fleetAI.target) : '-'
        
        // Destination
        const destination = fleet.fleetAI?.destination ? coloredName(fleet.fleetAI.destination) : '-'
        
        // Cargo space used / total
        const cargoUsed = fleet.cargo ? fleet.cargo.total : 0
        const cargoTotal = fleet.totalCargoSpace || 0
        const cargoInfo = `${cargoUsed} / ${cargoTotal}`
        
        return [
            fleetName,
            origin,
            planet,
            faction,
            captainRace,
            captainReligion,
            numCrew,
            target,
            destination,
            cargoInfo
        ]
    })

    tableData.unshift(['Fleet Name', 'Origin', 'Planet', 'Faction', 'Race', 'Religion', '# Crew', 'Target', 'Destination', 'Cargo'])
    
    // Create table with selection (row 1 is first data row, after header row 0)
    const table = createTable(
        tableData,
        (index) => {
            if (index > 0) { // Skip header row
                selectedFleet = fleets[index]
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
        
        refreshPanelButtons('fleets_menu', buttons)
    }
    
    showModal(title, contentContainer, [["Back", backFunction]], 'fleets_menu')
    
    // Update buttons after modal is shown to include View button for initially selected fleet
    updateButtons()
}
