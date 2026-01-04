/**
 * Displays basic information about discovered anomalies in the star system in a table format.
 * @param {Function} backFunction - Function to call when back button is pressed.
 */
function showAnomaliesMenu(backFunction = () => closeModal()) {
    // In debug mode, show all anomalies. Otherwise, only show discovered ones.
    const anomalies = DEBUG_MODE 
        ? (gs.system.anomalies || []) 
        : (gs.system.anomalies || []).filter(a => a.discoveredYear !== null)
    
    if (anomalies.length === 0) {
        showModal(
            'Anomalies Database',
            'No anomalies discovered in this star system yet.',
            [["Back", backFunction]]
        )
        return
    }

    // Sort anomalies by distance from sun
    anomalies.sort((a, b) => {
        const aDist = calcDistance(a.x, a.y, 0, 0)
        const bDist = calcDistance(b.x, b.y, 0, 0)
        return aDist - bDist
    })
    
    let selectedAnomaly = anomalies[0] // Select first anomaly by default
    const contentContainer = ce({style: 'overflow-y: auto; max-height: 70vh;'})
    
    // Create table data
    const tableData = anomalies.map(anomaly => {
        const distanceFromSun = Math.round(calcDistance(anomaly.x, anomaly.y, 0, 0) * 100) / 100
        const distanceFromPlayer = gs.fleet ? Math.round(calcDistance(anomaly.x, anomaly.y, gs.fleet.x, gs.fleet.y) * 100) / 100 : '-'
        const discoveryYear = Math.round(anomaly.discoveredYear * 10) / 10
        
        return [
            coloredName(anomaly),
            coloredName(anomaly.anomalyType),
            `${distanceFromSun} AU`,
            `${distanceFromPlayer} AU`,
            `${discoveryYear}`
        ]
    })

    tableData.unshift(['Name', 'Type', 'Distance from Sun', 'Distance from You', 'Discovered'])
    
    // Create table with selection (row 1 is first data row, after header row 0)
    const table = createTable(
        tableData,
        (index) => {
            if (index > 0) { // Skip header row
                selectedAnomaly = anomalies[index - 1]
                updateButtons()
            }
        },
        1 // Start with first data row selected
    )
    
    contentContainer.appendChild(table)
    
    function updateButtons() {
        const buttons = [["Back", backFunction]]
        
        if (selectedAnomaly) {
            buttons.unshift(["View", () => {
                closeModal()
                if (currentMap && currentMap.selectObject) {
                    currentMap.selectObject(selectedAnomaly)
                }
            }])
        }
        
        refreshPanelButtons('anomalies_menu', buttons)
    }
    
    showModal('Anomalies Database', contentContainer, [["Back", backFunction]], 'anomalies_menu')
    
    // Update buttons after modal is shown to include View button for initially selected anomaly
    updateButtons()
}
