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

function leaveShipyard(shipyard = new Shipyard()) {
    const {planet} = shipyard
    if (gs.fleet.ships.length == 0) {
        console.log('leaving shipyard without ships:',planet,gs)
        showModal(
            `${coloredName(planet)} - Shipyard`,
            `You start to leave the shipyard but realize you have no ships! Without a ship you'd no longer be a space captain!<br/><br/>
            Fortunately, you're able to negotiate with the merchants here and undo the last ship sale you made.`,
            [['Continue', () => {
                Shipyard.restoreState()
                showShipyardSellMenu(shipyard)
            }],],
        )
    }
    else {
        console.log('leaving shipyard:',planet,gs)
        showPlanetMenu(planet)
    }
}

function showShipyardBuyMenu(shipyard = new Shipyard()) {
    const {planet} = shipyard
    const {fleet} = gs
    const isDocked = fleet.location == planet
    const rebuildMenu = ()=>showShipyardBuyMenu(shipyard)
    const leave = ()=>leaveShipyard(shipyard, planet)

    function buyShip(ship = new Ship()) {
        const buyPrice = shipyard.calcBuyPrice(ship)
        gs.credits -= buyPrice;
        shipyard.credits += buyPrice;
        fleet.addShip(ship)
        safeRemove(shipyard.ships, ship)
        rebuildMenu()
    }

    function showBuyShipModal(ship = new Ship()) {
        const buyPrice = shipyard.calcBuyPrice(ship)
        showModal(
            `Buy ${ship.name}?`,
            `Are you sure you want to buy the ${ship.name} for ${buyPrice} credits?`,
            [
                ['Buy', () => buyShip(ship), !isDocked],
                ['Cancel', () => rebuildMenu()],
            ],
        )
    }
    
    function onSelectShipyardShip(ship = new Ship()) {
        const buyPrice = shipyard.calcBuyPrice(ship)
        const buttons = [
            [`Buy`, ()=>showBuyShipModal(ship), (gs.credits < buyPrice || fleet.ships.length >= fleet.numPilots)],
            ["Sell Ships", ()=>showShipyardSellMenu(shipyard)],
            ["Back", () => leave()],
        ]
        refreshPanelButtons('shipyard_buy_panel', buttons)
    }

    showModal(
        `${coloredName(planet)} - Shipyard`,
        ce({children:[
            `<b>Shipyard ships</b>`,
            createBuyShipMenu(shipyard.ships, shipyard, (ship)=>onSelectShipyardShip(ship)),
            `Your # ships: ${fleet.ships.length}/${fleet.numPilots} | Your credits: ${gs.credits}`,
            //`Shipyard credits: ${shipyard.credits}`,
            `Buy Penalty: ${roundToPlaces(100*shipyard.rake, 2)}% | Local Ship Quality: ${roundToPlaces(100*shipyard.planet.culture.shipQuality, 2)}%`,
        ]}),
        [
            ["Sell Ships", ()=>showShipyardSellMenu(shipyard)],
            ["Back", () => leave()],
        ],
        `shipyard_buy_panel`,
    );
}

function showShipyardSellMenu(shipyard = new Shipyard()) {
    const {planet} = shipyard
    const {fleet} = gs
    const isDocked = fleet.location == planet
    const rebuildMenu = ()=>showShipyardSellMenu(shipyard)
    const leave = ()=>leaveShipyard(shipyard)

    function sellShip(ship = new Ship(), salePrice = 0) {
        Shipyard.recordState(shipyard)
        const officersShare = gs.fleet.calcTotalCRShare(salePrice, true)
        gs.credits += salePrice - officersShare;
        shipyard.credits -= salePrice;
        safeAdd(shipyard.ships, ship)
        safeRemove(fleet.ships, ship)
        rebuildMenu()
    }

    function onSelectPlayerShip(ship = new Ship()) {
        refreshPanelButtons('shipyard_sell_panel', [
            [`Sell`, ()=>showSellShipModal(ship), !isDocked || (shipyard.credits <= 0)],
            ["Buy Ships", ()=>showShipyardBuyMenu(shipyard)],
            ["Back", () => leave()],
        ])
    }

    function showSellShipModal(ship = new Ship()) {
        const salePrice = shipyard.calcSellPrice(ship)
        const shipyardCanAfford = shipyard.credits >= salePrice
        const officersShare = gs.fleet.calcTotalCRShare(salePrice, true)
        const finalSale = salePrice - officersShare

        showModal(
            `Sell ${ship.name}?`,
            ce({children:[
                !shipyardCanAfford ? `${colorSpan(WARNING, 'yellow', true)}: Your ${ship.name} is worth ${salePrice}CR but the shipyard only has ${shipyard.credits} credits!` : ``,
                `Are you sure you want to sell your ${ship.name} for ${Math.min(salePrice, shipyard.credits)} credits?`,
                `Sale Price: ${finalSale}CR ${officersShare ? `(-${officersShare}CR for officers)` : ''}`,
                `CR After Sale: ${gs.credits+finalSale}CR`,
            ]}),
            [
                ['Sell', () => sellShip(ship, salePrice)],
                ['Cancel', () => rebuildMenu()],
            ],
        )
    }

    showModal(
        `${coloredName(planet)} - Shipyard`,
        ce({children:[
            `<b>Your ships</b>`,
            createSellShipMenu(fleet.ships, shipyard, (ship)=>onSelectPlayerShip(ship)),
            `Your # ships: ${fleet.ships.length}/${fleet.numPilots}` + fleet.ships.length < 2 ? colorSpan(` (You can't sell your last ship!)`, 'Yellow') : '',
            colorSpan(`Your credits: ${gs.credits}`, gs.credits == 0 ? '#f00' : ''),
            colorSpan(`Shipyard credits: ${shipyard.credits}`, shipyard.credits == 0 ? '#f00' : ''),
            `Sell Penalty: ${roundToPlaces(100/shipyard.rake, 2)}%`,
        ]}),
        [
            ["Buy Ships", ()=>showShipyardBuyMenu(shipyard)],
            ["Back", () => leave()]
        ],
        `shipyard_sell_panel`,
    );
}