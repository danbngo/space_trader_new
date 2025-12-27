/**
 * Creates an HTML table displaying the player's ships.
 * @param {Ship[]} ships - Array of ships to display.
 * @param {(ship: Ship) => void} onSelectShip - Callback when a ship is selected.
 * @returns {HTMLTableElement|string} The ships table or "(None)" if no ships.
 */
function createShipsListMenu(ships = [new Ship()], onSelectShip = (s = new Ship())=>{}) {
    if (ships.length == 0) return `(None)`
    const rows = [
        ['Ship Name', 'Hull', 'Shields', 'Lasers', 'Engine', 'Cargo Space']
    ]
    for (const ship of ships) {
        rows.push([
            ship.name,
            ''+statColorSpan(`${ship.hull[0]}/${ship.hull[1]}`, ship.hull[0]/ship.hull[1]),
            ''+statColorSpan(`${ship.shields[0]}/${ship.shields[1]}`, ship.shields[0]/ship.shields[1]),
            ''+ship.lasers,
            ''+ship.engine,
            ''+ship.cargoSpace,
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
            `Are you sure you want to dump ${coloredName(ship)}?`,
            [
                ["Dump", () => dumpShip(ship)],
                ["Cancel", () => reloadMenu()],
            ]
        )
    }

    function onSelectShip(ship = new Ship()) {
        const buttons = [
            ['Dump', ()=>showDumpShipModal(ship), gs.fleet.ships.length < 2],
            ["Close", () => closeModal()],
        ]
        refreshPanelButtons('ships_panel', buttons)
    }

    showModal(
        `Ships Manifest`,
        ce({children:[
            createShipsListMenu(ships, onSelectShip),
        ]}),
        [
            ["Close", () => closeModal()],
        ],
        'ships_panel'
    );
}
