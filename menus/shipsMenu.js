/**
 * Creates an HTML table displaying the player's ships.
 * @param {Ship[]} ships - Array of ships to display.
 * @param {(ship: Ship) => void} onSelectShip - Callback when a ship is selected.
 * @returns {HTMLTableElement|string} The ships table or "(None)" if no ships.
 */
function createShipsListMenu(ships = [new Ship()], onSelectShip = (s = new Ship())=>{}) {
    if (ships.length == 0) return `(None)`
    const rows = [
        ['Ship Name', 'Pilot', 'Hull', 'Shields', 'Lasers', 'Engine', 'Cargo', 'Hull%']
    ]
    for (const ship of ships) {
        const pilotName = ship.pilot ? ship.pilot.name : colorSpan('(Unassigned)', COLORS.Gray)
        const hullPercentage = (ship.hull[0] / ship.hull[1]) * 100
        
        const hullProgressBar = new ProgressBar({
            id: `ship_hull_${ship.name.replace(/\s+/g, '_')}`,
            label: '',
            value: hullPercentage,
            fillColor: rgbArrayToString(COLORS.Green),
            showPercentage: true,
            width: 20
        })
        
        rows.push([
            ship.name,
            pilotName,
            ''+statColorSpan(`${ship.hull[0]}/${ship.hull[1]}`, ship.hull[0]/ship.hull[1]),
            ''+statColorSpan(`${ship.shields[0]}/${ship.shields[1]}`, ship.shields[0]/ship.shields[1]),
            ''+ship.lasers,
            ''+ship.engine,
            ''+ship.cargoSpace,
            hullProgressBar.container,
        ])
    }
    return createTable(rows, (rowIndex = 0)=>onSelectShip(ships[rowIndex]))
}

/**
 * Displays the ships manifest menu for managing the player's fleet.
 * @param {Ship[]} ships - Array of ships to display and manage.
 */
function showShipsMenu(ships = [...gs.fleet.ships]) {
    const reloadMenu = ()=>showShipsMenu(ships)

    function dumpShip(ship = new Ship()) {
        safeRemove(ships, ship)
        showShipsMenu(ships) //DONT use reloadMenu here, wont reflect changes to ship list
    }

    function showDumpShipModal(ship = new Ship()) {
        showModal(`Dump ${coloredName(ship)}`, 
            `Dump ${coloredName(ship)}?`,
            [
                ["Dump", () => dumpShip(ship)],
                ["Cancel", () => reloadMenu()],
            ]
        )
    }

    function showAssignPilotModal(ship = new Ship()) {
        const allOfficers = [gs.captain, ...gs.fleet.officers]
        const rows = [['Officer', 'Level', 'Current Assignment']]
        
        for (const officer of allOfficers) {
            const assignedShip = gs.fleet.getAssignedShip(officer)
            const assignment = assignedShip ? assignedShip.name : colorSpan('(Unassigned)', COLORS.Gray)
            rows.push([officer.name, ''+officer.level, assignment])
        }
        
        const table = createTable(rows, (rowIndex) => {
            const selectedOfficer = allOfficers[rowIndex]
            gs.fleet.assignPilot(ship, selectedOfficer)
            reloadMenu()
        })
        
        showModal(
            `Assign Pilot to ${ship.name}`,
            ce({children: [
                'Select an officer to pilot this ship:',
                table
            ]}),
            [
                ['Unassign', () => {
                    gs.fleet.assignPilot(ship, null)
                    reloadMenu()
                }],
                ['Cancel', () => reloadMenu()]
            ]
        )
    }

    function onSelectShip(ship = new Ship()) {
        const modulesText = ship.modules.length > 0 
            ? ship.modules.map(m => colorSpan(m.moduleType.name, m.moduleType.color) + ` (${roundToPlaces(m.quality*100, 1)}%)`).join(', ')
            : colorSpan('(None)', COLORS.Gray)
        
        const pilotText = ship.pilot ? ship.pilot.name : colorSpan('(Unassigned)', COLORS.Gray)
        
        const buttons = [
            ['Assign Pilot', ()=>showAssignPilotModal(ship)],
            ['Dump', ()=>showDumpShipModal(ship), gs.fleet.ships.length < 2],
            ["Close", () => closeModal()],
        ]
        
        const infoPanel = ce({children: [
            `<b>${ship.name}</b><br/>`,
            `Pilot: ${pilotText}<br/>`,
            `Hull: ${statColorSpan(`${ship.hull[0]}/${ship.hull[1]}`, ship.hull[0]/ship.hull[1])} | `,
            `Shields: ${statColorSpan(`${ship.shields[0]}/${ship.shields[1]}`, ship.shields[0]/ship.shields[1])}<br/>`,
            `Lasers: ${ship.lasers} | Engine: ${ship.engine} | Cargo: ${ship.cargoSpace}<br/>`,
            `<br/><b>Installed Modules:</b><br/>`,
            modulesText,
        ]})
        
        const modalContent = document.getElementById('ships_panel_content')
        if (modalContent) {
            modalContent.innerHTML = ''
            modalContent.appendChild(infoPanel)
        }
        
        refreshPanelButtons('ships_panel', buttons)
    }

    showModal(
        `Ships Manifest`,
        ce({children:[
            createShipsListMenu(ships, onSelectShip),
            ce({id: 'ships_panel_content'}),
        ]}),
        [
            ["Close", () => closeModal()],
        ],
        'ships_panel'
    );
}
