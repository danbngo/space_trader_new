/**
 * Creates an HTML table displaying the player's ships.
 * @param {Ship[]} ships - Array of ships to display.
 * @param {(ship: Ship) => void} onSelectShip - Callback when a ship is selected.
 * @param {Ship|null} selectedShip - Currently selected ship to highlight.
 * @returns {HTMLElement} The ships table or "(None)" if no ships.
 */
function createShipsListMenu(ships = [], onSelectShip = (s )=>{}, selectedShip = null) {
    if (ships.length == 0) return ce({innerHTML: `(None)`})
    /** @type {Array<(string|HTMLElement)[]>} */
    const rows = [
        ['Name', 'Pilot', 'Lasers', 'Engine', 'Cargo', 'Shields', 'Hull']
    ]
    for (const ship of ships) {
        const pilotName = ship.pilot ? ship.pilot.name : colorSpan('(Unassigned)', COLORS.Gray)
        const hullPercentage = (ship.hull[0] / ship.hull[1]) * 100
        
        const hullProgressBar = new ProgressBar({
            value: hullPercentage,
            fillColor: rgbArrayToString(COLORS.Green),
            overrideLabel: `${ship.hull[0]}/${ship.hull[1]}`,
            width: 10
        })
        
        rows.push([
            ship.name,
            pilotName,
            ''+ship.lasers,
            ''+ship.engine,
            ''+ship.cargoSpace,
            ''+ship.shields[1],
            hullProgressBar.container,
        ])
    }
    const selectedIndex = selectedShip ? ships.indexOf(selectedShip) + 1 : null
    return createTable(rows, (rowIndex = 0)=>onSelectShip(ships[rowIndex]), selectedIndex)
}

/**
 * Displays the ships manifest menu for managing the player's fleet.
 * @param {Ship[]} ships - Array of ships to display and manage.
 * @param {Ship|null} selectedShip - Currently selected ship.
 */
function showShipsMenu(ships = [...gs.fleet.ships], selectedShip = null) {
    // Default to first ship if none selected
    if (!selectedShip && ships.length > 0) {
        selectedShip = ships[0]
    }

    const reloadMenu = ()=>showShipsMenu(ships, selectedShip)

    function dumpShip(ship ) {
        safeRemove(ships, ship)
        const newSelected = ships.length > 0 ? ships[0] : null
        showShipsMenu(ships, newSelected)
    }

    function showDumpShipModal(ship ) {
        showModal(`Dump ${coloredName(ship)}`, 
            `Dump ${coloredName(ship)}?`,
            [
                ["Dump", () => dumpShip(ship)],
                ["Cancel", () => reloadMenu()],
            ]
        )
    }

    function swapPilots(ship, newPilot = new Officer()) {
        // Get current pilot of selected ship
        const currentPilot = ship.pilot
        
        // Get ship piloted by the new pilot (if any)
        const newPilotCurrentShip = gs.fleet.getAssignedShip(newPilot)
        
        // Swap them
        gs.fleet.assignPilot(ship, newPilot)
        if (newPilotCurrentShip && currentPilot) {
            gs.fleet.assignPilot(newPilotCurrentShip, currentPilot)
        }
        
        showShipsMenu(ships, ship)
    }

    function onSelectShip(ship ) {
        showShipsMenu(ships, ship)
    }

    // Left column: Ships table
    const leftColumn = createShipsListMenu(ships, onSelectShip, selectedShip)

    // Right column: Selected ship details
    const rightColumn = selectedShip ? (() => {
        // gs.fleet.officers already includes captain, no need to add separately
        const allOfficers = gs.fleet.officers
        const currentPilotIndex = selectedShip.pilot ? allOfficers.indexOf(selectedShip.pilot) : -1
        
        const pilotDropdown = new Dropdown(
            allOfficers.map(officer => [
                officer.name,
                () => swapPilots(selectedShip, officer)
            ]),
            false,
            currentPilotIndex >= 0 ? currentPilotIndex : 0,
            250
        )

        const modulesSection = selectedShip.modules.length > 0 
            ? ce({
                tag: 'ul',
                style: {marginTop: '4px', marginBottom: '8px', paddingLeft: '20px'},
                children: selectedShip.modules.map(m => 
                    ce({
                        tag: 'li',
                        style: {whiteSpace: 'nowrap'},
                        children: [
                            colorSpan(m.moduleType.name, m.moduleType.color) + `\u00A0(${roundToPlaces(m.quality*100, 1)}%)`
                        ]
                    })
                )
            })
            : ce({children: [colorSpan('(None)', COLORS.Gray)]})

        return ce({
            style: {display: 'flex', flexDirection: 'column', gap: '12px'},
            children: [
                selectedShip.asCanvas(80, gs.fleet.color),
                `<u>Pilot:</b>`,
                pilotDropdown.container,
                `<u>Installed Modules:</u>`,
                modulesSection
            ]
        })
    })() : ce({children: [colorSpan('(No ship selected)', COLORS.Gray)]})

    const columnLayout = createColumnLayout([leftColumn, rightColumn])

    /** @type {ButtonData[]} */
    const buttons = selectedShip ? [
        ['Dump', ()=>showDumpShipModal(selectedShip), gs.fleet.ships.length < 2],
        ["Close", () => closeModal()],
    ] : [
        ["Close", () => closeModal()],
    ]

    showModal(
        `Ships Manifest`,
        columnLayout,
        buttons,
        'ships_panel'
    );
}
