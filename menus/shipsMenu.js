function createShipsListMenu(ships = [new Ship()], onSelectShip = (s = new Ship())=>{}) {
    if (ships.length == 0) return `(None)`
    const rows = [
        ['Ship Name', 'Hull', 'Shields', 'Lasers', 'Thrusters', 'Cargo Space']
    ]
    for (const ship of ships) {
        rows.push([
            ship.name,
            statColorSpan(`${ship.hull[0]}/${ship.hull[1]}`, ship.hull[0]/ship.hull[1]),
            statColorSpan(`${ship.shields[0]}/${ship.shields[1]}`, ship.shields[0]/ship.shields[1]),
            ship.lasers,
            ship.thrusters,
            ship.cargoSpace,
        ])
    }
    return createTable(rows, (rowIndex = 0)=>onSelectShip(ships[rowIndex]))
}


function showShipsMenu(ships = [...gameState.fleet.ships]) {
    function onSelectShip(ship = new Ship()) {
        console.log(`Selected ship: ${ship}`)
    }

    showModal(
        `Ships Manifest`,
        createElement({children:[
            createShipsListMenu(ships, onSelectShip),
        ]}),
        [
            ["Close", () => closeModal()],
        ]
    );
}
