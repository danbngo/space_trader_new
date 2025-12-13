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

function leaveShipyard(shipyard = new Shipyard(), planet = new Planet()) {
    if (gameState.fleet.ships.length == 0) {
        console.log('leaving shipyard without ships:',planet,gameState)
        showModal(
            `${coloredName(planet)} - Shipyard`,
            `You start to leave the shipyard but realize you have no ships! Without a ship you'd no longer be a space captain!<br/><br/>
            Fortunately, you're able to negotiate with the merchants here and undo the last ship sale you made.`,
            [['Continue', () => {
                Shipyard.restoreState()
                showShipyardSellMenu(planet)
            }],],
        )
    }
    else {
        console.log('leaving shipyard:',planet,gameState)
        showPlanetMenu(planet)
    }
}

function showShipyardBuyMenu(planet = new Planet()) {
    console.log('displaying shipyard menu:',planet,gameState)
    const {shipyard} = planet.settlement
    const {fleet, captain} = gameState
    const isDocked = fleet.location == planet
    const rebuildMenu = ()=>showShipyardBuyMenu(planet)
    const leave = ()=>leaveShipyard(shipyard, planet)

    function buyShip(ship = new Ship()) {
        const buyPrice = shipyard.calcBuyPrice(ship)
        gameState.captain.credits -= buyPrice;
        shipyard.credits += buyPrice;
        safeAdd(fleet.ships, ship)
        safeRemove(shipyard.ships, ship)
        rebuildMenu()
    }

    function showBuyShipModal(ship = new Ship()) {
        const buyPrice = shipyard.calcBuyPrice(ship)
        showModal(
            `Buy ${ship.name}?`,
            `Are you sure you want to buy the ${ship.name} for ${buyPrice} credits?`,
            [
                ['Buy', () => buyShip(ship)],
                ['Cancel', () => rebuildMenu()],
            ],
        )
    }
    
    function onSelectShipyardShip(ship = new Ship()) {
        if (!isDocked) return
        const buyPrice = shipyard.calcBuyPrice(ship)
        const buttons = [
            [`Buy`, ()=>showBuyShipModal(ship), (captain.credits < buyPrice || fleet.ships.length >= fleet.officers.length)],
            ["Sell Ships", ()=>showShipyardSellMenu(planet)],
            ["Back", () => leave()],
        ]
        refreshPanelButtons('shipyard_buy_panel', buttons)
    }

    showModal(
        `${coloredName(planet)} - Shipyard`,
        createElement({children:[
            `<h4>Shipyard ships</h4>`,
            createBuyShipMenu(shipyard.ships, shipyard, (ship)=>onSelectShipyardShip(ship)),
            `Your # ships: ${fleet.ships.length}/${fleet.officers.length} | Your credits: ${captain.credits}`,
            //`Shipyard credits: ${shipyard.credits}`,
            `Buy Penalty: ${round(100*shipyard.rake, 2)}% | Local Ship Quality: ${round(100*shipyard.planet.culture.shipQuality, 2)}%`,
        ]}),
        [
            ["Sell Ships", ()=>showShipyardSellMenu(planet)],
            ["Back", () => leave()],
        ],
        `shipyard_buy_panel`,
    );
}

function showShipyardSellMenu(planet) {
    console.log('displaying shipyard menu:',planet,gameState)
    const {shipyard} = planet.settlement
    const {fleet, captain} = gameState
    const isDocked = fleet.location == planet
    const rebuildMenu = ()=>showShipyardSellMenu(planet)
    const leave = ()=>leaveShipyard(shipyard, planet)

    function sellShip(ship = new Ship()) {
        Shipyard.recordState(shipyard)
        const sellPrice = Math.min(shipyard.credits, shipyard.calcSellPrice(ship))
        gameState.captain.credits += sellPrice;
        shipyard.credits -= sellPrice;
        safeAdd(shipyard.ships, ship)
        safeRemove(fleet.ships, ship)
        rebuildMenu()
    }

    function onSelectPlayerShip(ship = new Ship()) {
        if (!isDocked) return
        refreshPanelButtons('shipyard_sell_panel', [
            [`Sell`, ()=>showSellShipModal(ship), (shipyard.credits <= 0)],
            ["Buy Ships", ()=>showShipyardBuyMenu(planet)],
            ["Back", () => leave()],
        ])
    }

    function showSellShipModal(ship = new Ship()) {
        const sellPrice = shipyard.calcSellPrice(ship)
        const shipyardCanAfford = shipyard.credits >= sellPrice
        showModal(
            `Sell ${ship.name}?`,
            createElement({children:[
                !shipyardCanAfford ? `WARNING: Your ${ship.name} is worth ${sellPrice}CR but the shipyard only has ${shipyard.credits} credits!` : ``,
                `Are you sure you want to sell your ${ship.name} for ${Math.min(sellPrice, shipyard.credits)} credits?`
            ]}),
            [
                ['Sell', () => sellShip(ship)],
                ['Cancel', () => rebuildMenu()],
            ],
        )
    }

    showModal(
        `${coloredName(planet)} - Shipyard`,
        createElement({children:[
            `<h4>Your ships</h4>`,
            createSellShipMenu(fleet.ships, shipyard, (ship)=>onSelectPlayerShip(ship)),
            `Your # ships: ${fleet.ships.length}/${fleet.officers.length}` + fleet.ships.length < 2 ? colorSpan(` (You can't sell your last ship!)`, 'Yellow') : '',
            colorSpan(`Your credits: ${captain.credits}`, captain.credits == 0 ? 'red' : ''),
            colorSpan(`Shipyard credits: ${shipyard.credits}`, shipyard.credits == 0 ? 'red' : ''),
            `Sell Penalty: ${round(100/shipyard.rake, 2)}%`,
        ]}),
        [
            ["Buy Ships", ()=>showShipyardBuyMenu(planet)],
            ["Back", () => leave()]
        ],
        `shipyard_sell_panel`,
    );
}