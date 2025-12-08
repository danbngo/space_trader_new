function createBuyShipMenu(ships = [new Ship()], shipyard = new Shipyard(), onSelectShip = (ship = new Ship())=>{}) {
    if (ships.length == 0) return `(None)`
    const rows = [
        ['Ship Name', 'Hull', 'Shields', 'Lasers', 'Thrusters', 'Cargo Space', 'Buy Price']
    ]
    for (const ship of ships) {
        const buyPrice = shipyard.calcBuyPrice(ship)
        rows.push([
            ship.name,
            statColorSpan(ship.hull[1], ship.hull[1]/10),
            statColorSpan(ship.shields[1], ship.shields[1]/10),
            statColorSpan(ship.lasers, ship.lasers/10),
            statColorSpan(ship.thrusters, ship.thrusters/10),
            statColorSpan(ship.cargoSpace, ship.cargoSpace/10),
            statColorSpan(buyPrice, ship.value/buyPrice)
        ])
    }
    return createTable(rows, (rowIndex = 0)=>onSelectShip(ships[rowIndex]))
}

function createSellShipMenu(ships = [new Ship()], shipyard = new Shipyard(), onSelectShip = (ship = new Ship())=>{}) {
    if (ships.length == 0) return `(None)`
    const rows = [
        ['Ship Name', 'Hull', 'Shields', 'Lasers', 'Thrusters', 'Cargo Space', 'Sell Price']
    ]
    for (const ship of ships) {
        const sellPrice = shipyard.calcSellPrice(ship)
        rows.push([
            ship.name,
            statColorSpan(ship.hull[1], ship.hull[1]/10),
            statColorSpan(ship.shields[1], ship.shields[1]/10),
            statColorSpan(ship.lasers, ship.lasers/10),
            statColorSpan(ship.thrusters, ship.thrusters/10),
            statColorSpan(ship.cargoSpace, ship.cargoSpace/10),
            statColorSpan(sellPrice, sellPrice/ship.value)
        ])
    }
    return createTable(rows, (rowIndex = 0)=>onSelectShip(ships[rowIndex]))
}

function showShipyardBuyMenu(planet) {
    console.log('displaying shipyard menu:',planet,gameState)
    const {shipyard} = planet.settlement
    const {fleet, captain} = gameState
    const isDocked = fleet.location == planet

    function buyShip(ship = new Ship()) {
        const buyPrice = shipyard.calcBuyPrice(ship)
        gameState.captain.credits -= buyPrice;
        shipyard.credits += buyPrice;
        fleet.ships.push(ship);
        shipyard.ships.splice(index, 1);
        showShipyardBuyMenu(planet); // refresh menu
    }
    
    function onSelectShipyardShip(ship = new Ship()) {
        if (!isDocked) return
        const buyPrice = shipyard.calcBuyPrice(ship)
        const buttons = [
            [`Buy ${ship.name}`, ()=>buyShip(ship), (captain.credits < buyPrice)],
            ["Sell Ships", ()=>showShipyardSellMenu(planet)],
            ["Back", () => showPlanetMenu(planet)],
        ]
        refreshPanelButtons('shipyard_buy_panel', buttons)
    }

    showPanel(
        `${colorSpan(planet.name, planet.color)} - Shipyard`,
        createElement({children:[
            `Shipyard ships`,
            createBuyShipMenu(shipyard.ships, shipyard, (ship)=>onSelectShipyardShip(ship)),
            `Your # ships: ${fleet.ships.length}`,
            `Your credits: ${captain.credits}`,
            `Shipyard credits: ${shipyard.credits}`,
            `Buy Penalty: ${round(100*shipyard.rake, 2)}%`,
            `Local Ship Quality: ${round(100*shipyard.planet.culture.shipQuality, 2)}%`,
        ]}),
        [
            ["Sell Ships", ()=>showShipyardSellMenu(planet)],
            ["Back", () => showPlanetMenu(planet)],
        ],
        `shipyard_buy_panel`,
    );
}

function showShipyardSellMenu(planet) {
    console.log('displaying shipyard menu:',planet,gameState)
    const {shipyard} = planet.settlement
    const {fleet, captain} = gameState
    const isDocked = fleet.location == planet

    function sellShip(ship = new Ship()) {
        const sellPrice = Math.min(shipyard.credits, shipyard.calcSellPrice(ship))
        gameState.captain.credits += sellPrice;
        shipyard.credits -= sellPrice;
        shipyard.ships.push(ship);
        fleet.ships.splice(index, 1);
        showShipyardSellMenu(planet);
    }

    function onSelectPlayerShip(ship = new Ship()) {
        if (!isDocked) return
        const sellPrice = shipyard.calcSellPrice(ship)
        const shipyardCanAfford = shipyard.credits >= sellPrice
        const buttons = [
            [`Sell ${ship.name}${shipyardCanAfford ? '' : ` (For only ${shipyard.credits}CR)`}`, ()=>sellShip(ship), (shipyard.credits <= 0)],
            ["Buy Ships", ()=>showShipyardBuyMenu(planet)],
            ["Back", () => showPlanetMenu(planet)],
        ]
        refreshPanelButtons('shipyard_sell_panel', buttons)
    }

    showPanel(
        `${colorSpan(planet.name, planet.color)} - Shipyard`,
        createElement({children:[
            `Your ships`,
            createSellShipMenu(fleet.ships, shipyard, (ship)=>onSelectPlayerShip(ship)),
            `Your # ships: ${fleet.ships.length}`,
            `Your credits: ${captain.credits}`,
            `Shipyard credits: ${shipyard.credits}`,
            `Sell Penalty: ${round(100/shipyard.rake, 2)}%`,
        ]}),
        [
            ["Buy Ships", ()=>showShipyardBuyMenu(planet)],
            ["Back", () => showPlanetMenu(planet)]
        ],
        `shipyard_sell_panel`,
    );
}