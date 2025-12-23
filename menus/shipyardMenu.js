function createBuyShipMenu(ships = [new Ship()], shipyard = new Shipyard(), onSelectShip = (ship = new Ship())=>{}) {
    if (ships.length == 0) return `(None)`
    /** @type {any[]} */
    const rows = [
        ['Ship Name', 'Hull', 'Shields', 'Lasers', 'Engine', 'Cargo Space', 'Buy Price']
    ]
    for (const ship of ships) {
        const buyPrice = shipyard.calcBuyPrice(ship)
        rows.push([
            ship.name,
            statColorSpan(ship.hull[1], ship.hull[1]/10),
            statColorSpan(ship.shields[1], ship.shields[1]/10),
            statColorSpan(ship.lasers, ship.lasers/10),
            statColorSpan(ship.engine, ship.engine/10),
            statColorSpan(ship.cargoSpace, ship.cargoSpace/10),
            statColorSpan(buyPrice, ship.value/buyPrice)
        ])
    }
    return createTable(rows, (rowIndex = 0)=>onSelectShip(ships[rowIndex]))
}

function createBuyModuleMenu(modules = [new ShipModule()], shipyard = new Shipyard(), onSelectModule = (module = new ShipModule())=>{}) {
    if (modules.length == 0) return `(None)`
    /** @type {any[]} */
    const rows = [
        ['Module Name', 'Quality', 'Buy Price', 'Description']
    ]
    for (const module of modules) {
        const buyPrice = shipyard.calcBuyModulePrice(module)
        rows.push([
            module.moduleType.name,
            statColorSpan(roundToPlaces(module.quality*100, 1)+'%', module.quality),
            statColorSpan(buyPrice, module.moduleType.value/buyPrice),
            module.moduleType.description
        ])
    }
    return createTable(rows, (rowIndex = 0)=>onSelectModule(modules[rowIndex]))
}

function createSellShipMenu(ships = [new Ship()], shipyard = new Shipyard(), onSelectShip = (ship = new Ship())=>{}) {
    if (ships.length == 0) return `(None)`
    /** @type {any[]} */
    const rows = [
        ['Ship Name', 'Hull', 'Shields', 'Lasers', 'Engine', 'Cargo Space', 'Sell Price']
    ]
    for (const ship of ships) {
        const sellPrice = shipyard.calcSellPrice(ship)
        rows.push([
            ship.name,
            statColorSpan(ship.hull[1], ship.hull[1]/10),
            statColorSpan(ship.shields[1], ship.shields[1]/10),
            statColorSpan(ship.lasers, ship.lasers/10),
            statColorSpan(ship.engine, ship.engine/10),
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
    const leave = ()=>leaveShipyard(shipyard)

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
        const canBuy = gs.credits >= buyPrice && fleet.ships.length < fleet.numPilots
        const buttons = [
            ...(canBuy ? [[`Buy`, ()=>showBuyShipModal(ship)]] : []),
            ["Buy Modules", ()=>showShipyardModulesMenu(shipyard)],
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
            `Local Ship Quality: ${roundToPlaces(100*shipyard.planet.culture.shipQuality, 2)}%`,
            `Buy Tax: ${statColorSpan(roundToPlaces(100*shipyard.baseRake, 2), 2/(1+shipyard.baseRake),true)}%`,
            (gs.fleet.totalSkills.getAmount(SKILLS.Barter) > 0) ? `Taxes After Barter | ${statColorSpan(roundToPlaces(100*(1+shipyard.rake) - 100, 2), 2/(1+shipyard.rake),true)}% Buy` : '',
        ]}),
        [
            ["Buy Modules", ()=>showShipyardModulesMenu(shipyard)],
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
        const canSell = isDocked && shipyard.credits > 0
        refreshPanelButtons('shipyard_sell_panel', [
            ...(canSell ? [[`Sell`, ()=>showSellShipModal(ship)]] : []),
            ["Buy Modules", ()=>showShipyardModulesMenu(shipyard)],
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
                !shipyardCanAfford ? `${colorSpan('Warning', 'yellow', true)}: Your ${ship.name} is worth ${salePrice}CR but the shipyard only has ${shipyard.credits} credits!` : ``,
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
            `Your # ships: ${fleet.ships.length}/${fleet.numPilots}` + (fleet.ships.length < 2 ? colorSpan(` (You can't sell your last ship!)`, 'Yellow') : ''),
            colorSpan(`Your credits: ${gs.credits}`, gs.credits == 0 ? '#f00' : ''),
            colorSpan(`Shipyard credits: ${shipyard.credits}`, shipyard.credits == 0 ? '#f00' : ''),
            `Sell Tax: ${statColorSpan(roundToPlaces(100*shipyard.baseRake/(shipyard.baseRake+1), 2), 2/(shipyard.baseRake+1),true)}%`,
            (gs.fleet.totalSkills.getAmount(SKILLS.Barter) > 0) ? `Taxes After Barter | ${statColorSpan(roundToPlaces(100*shipyard.rake/(shipyard.rake+1), 2), 2/(shipyard.rake+1),true)}% Sell` : '',
        ]}),
        [
            ["Buy Modules", ()=>showShipyardModulesMenu(shipyard)],
            ["Buy Ships", ()=>showShipyardBuyMenu(shipyard)],
            ["Back", () => leave()]
        ],
        `shipyard_sell_panel`,
    );
}

function showShipyardModulesMenu(shipyard = new Shipyard()) {
    const {planet} = shipyard
    const {fleet} = gs
    const isDocked = fleet.location == planet
    const rebuildMenu = ()=>showShipyardModulesMenu(shipyard)
    const leave = ()=>leaveShipyard(shipyard)

    function buyModule(module = new ShipModule(), ship = new Ship()) {
        const buyPrice = shipyard.calcBuyModulePrice(module)
        gs.credits -= buyPrice;
        shipyard.credits += buyPrice;
        
        // Install module into ship's localModules
        ship.localModules.push(module)
        
        // Remove from shipyard
        safeRemove(shipyard.modules, module)
        
        showModal(
            `Module Installed!`,
            `You installed a ${module.moduleType.name} (${roundToPlaces(module.quality*100, 1)}% quality) into your ${ship.name} for ${buyPrice} credits!`,
            [['Continue', () => rebuildMenu()]],
        )
    }

    function showBuyModuleModal(module = new ShipModule()) {
        const buyPrice = shipyard.calcBuyModulePrice(module)
        
        // Find ships with available module slots
        const eligibleShips = fleet.ships.filter(ship => {
            const maxModules = ship.shipType.maxNumModules
            const currentModules = ship.localModules.length
            return currentModules < maxModules
        })
        
        if (eligibleShips.length === 0) {
            showModal(
                `No Available Ships`,
                `You don't have any ships with available module slots!`,
                [['Back', () => rebuildMenu()]],
            )
            return
        }
        
        // Create ship selection buttons
        const shipButtons = eligibleShips.map(ship => {
            const slotsUsed = ship.localModules.length
            const maxSlots = ship.shipType.maxNumModules
            return [
                `${ship.name} (${slotsUsed}/${maxSlots} slots)`,
                () => buyModule(module, ship)
            ]
        })
        
        showModal(
            `Install ${module.moduleType.name}`,
            ce({children:[
                `Select a ship to install this module:`,
                `Module: ${module.moduleType.name}`,
                `Quality: ${roundToPlaces(module.quality*100, 1)}%`,
                `Price: ${buyPrice} credits`,
                `Description: ${module.moduleType.description}`,
            ]}),
            [
                ...shipButtons,
                ['Cancel', () => rebuildMenu()],
            ],
        )
    }
    
    function onSelectModule(module = new ShipModule()) {
        const buyPrice = shipyard.calcBuyModulePrice(module)
        const canAfford = gs.credits >= buyPrice
        
        // Check if player has ships with available module slots
        const hasEligibleShip = fleet.ships.some(ship => {
            const maxModules = ship.shipType.maxNumModules
            const currentModules = ship.localModules.length
            return currentModules < maxModules
        })
        
        const canBuy = canAfford && hasEligibleShip && isDocked
        const buttons = [
            ...(canBuy ? [[`Buy & Install`, ()=>showBuyModuleModal(module)]] : []),
            ["Buy Ships", ()=>showShipyardBuyMenu(shipyard)],
            ["Sell Ships", ()=>showShipyardSellMenu(shipyard)],
            ["Back", () => leave()],
        ]
        refreshPanelButtons('shipyard_modules_panel', buttons)
    }

    showModal(
        `${coloredName(planet)} - Shipyard Modules`,
        ce({children:[
            `<b>Available Modules</b>`,
            createBuyModuleMenu(shipyard.modules, shipyard, (module)=>onSelectModule(module)),
            `Your credits: ${gs.credits}`,
            `Buy Tax: ${statColorSpan(roundToPlaces(100*shipyard.baseRake, 2), 2/(1+shipyard.baseRake),true)}%`,
            (gs.fleet.totalSkills.getAmount(SKILLS.Barter) > 0) ? `Taxes After Barter | ${statColorSpan(roundToPlaces(100*(1+shipyard.rake) - 100, 2), 2/(1+shipyard.rake),true)}% Buy` : '',
        ]}),
        [
            ["Buy Ships", ()=>showShipyardBuyMenu(shipyard)],
            ["Sell Ships", ()=>showShipyardSellMenu(shipyard)],
            ["Back", () => leave()],
        ],
        `shipyard_modules_panel`,
    );
}