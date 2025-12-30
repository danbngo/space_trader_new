/**
 * Creates an HTML table displaying ships available for purchase.
 * @param {Ship[]} ships - Array of ships for sale.
 * @param {Shipyard} shipyard - The shipyard building.
 * @param {(ship: Ship) => void} onSelectShip - Callback when a ship is selected.
 * @returns {HTMLTableElement|string} The ships table or "(None)" if no ships.
 */
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
/**
 * Creates an HTML table displaying ship modules available for purchase.
 * @param {ShipModule[]} modules - Array of modules for sale.
 * @param {Shipyard} shipyard - The shipyard building.
 * @param {(module: ShipModule) => void} onSelectModule - Callback when a module is selected.
 * @returns {HTMLTableElement|string} The modules table or "(None)" if no modules.
 */
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
/**
 * Creates an HTML table displaying player ships available for sale.
 * @param {Ship[]} ships - Array of player ships.
 * @param {Shipyard} shipyard - The shipyard building.
 * @param {(ship: Ship) => void} onSelectShip - Callback when a ship is selected.
 * @returns {HTMLTableElement|string} The ships table or "(None)" if no ships.
 */
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
            `Buy ${coloredName(ship)}?`,
            `Buy the ${coloredName(ship)} for ${buyPrice} credits?`,
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
            ["Buy Modules", ()=>showShipyardBuyModulesMenu(shipyard)],
            ["Sell Ships", ()=>showShipyardSellMenu(shipyard)],
            ["Back", () => leave()],
        ]
        refreshPanelButtons('shipyard_buy_panel', buttons)
    }

    showPlanetModal(
        planet,
        `${coloredName(planet)} - Shipyard`,
        ce({children:[
            isDocked ? 'Welcome to the shipyard.<br/>' : colorSpan('You must dock to use the shipyard.', COLORS.Yellow) + '<br/>',
            createBuyShipMenu(shipyard.ships, shipyard, (ship)=>onSelectShipyardShip(ship)),
            `Your # ships: ${fleet.ships.length}/${fleet.numPilots} | Your credits: ${gs.credits}`,
            //`Shipyard credits: ${shipyard.credits}`,
            `Local Ship Quality: ${roundToPlaces(100*shipyard.planet.c.technology, 2)}%`,
            `Buy Fee: ${statColorSpan(roundToPlaces(100*planet.c.corruption, 2), 2/(1+planet.c.corruption))}%`,
            (gs.fleet.totalSkills.getAmount(SKILLS.Barter) > 0) ? `Fee After Barter | ${statColorSpan(roundToPlaces(100*(1+shipyard.rake) - 100, 2), 2/(1+shipyard.rake))}% Buy` : '',
        ]}),
        [
            ["Buy Modules", ()=>showShipyardBuyModulesMenu(shipyard)],
            ["Sell Ships", ()=>showShipyardSellMenu(shipyard)],
            ["Back", () => leave()],
        ],
        `shipyard_buy_panel`,
        (nextPlanet) => nextPlanet.settlement?.shipyard ? showShipyardBuyMenu(nextPlanet.settlement.shipyard) : showPlanetMenu(nextPlanet)
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
            ["Buy Modules", ()=>showShipyardBuyModulesMenu(shipyard)],
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
            `Sell ${coloredName(ship)}?`,
            ce({children:[
                !shipyardCanAfford ? `${colorSpan('Warning', COLORS.Yellow)}: Your ${coloredName(ship)} is worth ${salePrice}CR but the shipyard only has ${shipyard.credits} credits!` : ``,
                `Sell ${coloredName(ship)} for ${Math.min(salePrice, shipyard.credits)} credits?`,
                `Sale Price: ${finalSale}CR ${officersShare ? `(-${officersShare}CR for officers)` : ''}`,
                `CR After Sale: ${gs.credits+finalSale}CR`,
            ]}),
            [
                ['Sell', () => sellShip(ship, salePrice)],
                ['Cancel', () => rebuildMenu()],
            ],
        )
    }

    showPlanetModal(
        planet,
        `${coloredName(planet)} - Shipyard`,
        ce({children:[
            isDocked ? 'Welcome to the shipyard.<br/>' : colorSpan('You must dock to use the shipyard.', COLORS.Yellow) + '<br/>',
            `<b>Your ships</b>`,
            createSellShipMenu(fleet.ships, shipyard, (ship)=>onSelectPlayerShip(ship)),
            `Your # ships: ${fleet.ships.length}/${fleet.numPilots}` + (fleet.ships.length < 2 ? colorSpan(` (You can't sell your last ship!)`, COLORS.Yellow) : ''),
            colorSpan(`Your credits: ${gs.credits}`, gs.credits == 0 ? COLORS.Red : ''),
            colorSpan(`Shipyard credits: ${shipyard.credits}`, shipyard.credits == 0 ? COLORS.Red : ''),
            `Sell Fee: ${statColorSpan(roundToPlaces(100*planet.c.corruption/(planet.c.corruption+1), 2), 2/(planet.c.corruption+1))}%`,
            (gs.fleet.totalSkills.getAmount(SKILLS.Barter) > 0) ? `Fee After Barter | ${statColorSpan(roundToPlaces(100*shipyard.rake/(shipyard.rake+1), 2), 2/(shipyard.rake+1))}% Sell` : '',
        ]}),
        [
            ["Buy Modules", ()=>showShipyardBuyModulesMenu(shipyard)],
            ["Buy Ships", ()=>showShipyardBuyMenu(shipyard)],
            ["Back", () => leave()]
        ],
        `shipyard_sell_panel`,
        (nextPlanet) => nextPlanet.settlement?.shipyard ? showShipyardSellMenu(nextPlanet.settlement.shipyard) : showPlanetMenu(nextPlanet)
    );
}

function showShipyardBuyModulesMenu(shipyard = new Shipyard()) {
    const {planet} = shipyard
    const {fleet} = gs
    const isDocked = fleet.location == planet
    const leave = ()=>leaveShipyard(shipyard)

    
    function onSelectModule(module = new ShipModule()) {
        const buyPrice = shipyard.calcBuyModulePrice(module)
        const canAfford = gs.credits >= buyPrice
        console.log('onSelectModule:', {module, buyPrice, canAfford});
        
        // Check if player has ships with available module slots
        const hasEligibleShip = fleet.ships.filter(s=>s.unusedModuleSlots > 0).length > 0
        
        const canBuy = canAfford && hasEligibleShip && isDocked
        const buttons = [
            [`Buy & Install`, ()=>showShipyardInstallModuleMenu(shipyard, module), !canBuy],
            ["Buy Ships", ()=>showShipyardBuyMenu(shipyard)],
            ["Sell Ships", ()=>showShipyardSellMenu(shipyard)],
            ["Back", () => leave()],
        ]
        refreshPanelButtons('shipyard_modules_panel', buttons)
    }

    showPlanetModal(
        planet,
        `${coloredName(planet)} - Shipyard`,
        ce({children:[
            isDocked ? 'Welcome to the shipyard.<br/>' : colorSpan('You must dock to use the shipyard.', COLORS.Yellow) + '<br/>',
            `<b>Available Modules</b>`,
            createBuyModuleMenu(shipyard.modules, shipyard, (module)=>onSelectModule(module)),
            `Your credits: ${gs.credits} | Your Ships With Open Slots: ${fleet.ships.filter(s => s.unusedModuleSlots > 0).length} / ${fleet.ships.length}`,
            `Buy Fee: ${statColorSpan(roundToPlaces(100*planet.c.corruption, 2), 2/(1+planet.c.corruption))}%`,
            (gs.fleet.totalSkills.getAmount(SKILLS.Barter) > 0) ? `Fee After Barter | ${statColorSpan(roundToPlaces(100*(1+shipyard.rake) - 100, 2), 2/(1+shipyard.rake))}% Buy` : '',
        ]}),
        [
            ["Buy Ships", ()=>showShipyardBuyMenu(shipyard)],
            ["Sell Ships", ()=>showShipyardSellMenu(shipyard)],
            ["Back", () => leave()],
        ],
        `shipyard_modules_panel`,
        (nextPlanet) => nextPlanet.settlement?.shipyard ? showShipyardBuyModulesMenu(nextPlanet.settlement.shipyard) : showPlanetMenu(nextPlanet)
    );
}



function showShipyardInstallModuleMenu(shipyard = new Shipyard(), module = new ShipModule(), selectedShip = null) {
    const {fleet} = gs
    const buyPrice = shipyard.calcBuyModulePrice(module)

    function buyModule(module = new ShipModule(), ship = new Ship()) {
        const buyPrice = shipyard.calcBuyModulePrice(module)
        gs.credits -= buyPrice;
        shipyard.credits += buyPrice;
        ship.localModules.push(module)
        safeRemove(shipyard.modules, module)
        showShipyardBuyModulesMenu(shipyard)
    }

    function createShipSelectionTable() {
        const rows = [
            ['Name', 'Installed Modules', 'Slots']
        ]
        
        for (const ship of fleet.ships) {
            const usedSlots = ship.localModules.length
            const totalSlots = ship.shipType.moduleSlots
            const installedModuleNames = ship.modules.map(m => m.moduleType.name).join(', ') || '(None)'
            
            rows.push([
                ship.name,
                installedModuleNames,
                `${usedSlots}/${totalSlots}`
            ])
        }
        
        return createTable(rows, (rowIndex) => onSelectShip(fleet.ships[rowIndex]), selectedShip ? fleet.ships.indexOf(selectedShip) + 1 : null)
    }

    function onSelectShip(ship = new Ship()) {
        const hasOpenSlot = ship.unusedModuleSlots > 0
        const alreadyHasModule = ship.modules.some(m => m.moduleType === module.moduleType)
        const canInstall = hasOpenSlot && !alreadyHasModule && gs.credits >= buyPrice
        
        const buttons = [
            ['Buy & Install', () => buyModule(module, ship), !canInstall],
            ['Cancel', () => showShipyardBuyModulesMenu(shipyard)],
        ]
        refreshPanelButtons('shipyard_install_panel', buttons)
    }
    
    showModal(
        `Install ${coloredName(module.moduleType)}`,
        ce({children:[
            `Select a ship to install this module:`,
            createShipSelectionTable(),
            `Module: ${coloredName(module.moduleType)} | Quality: ${roundToPlaces(module.quality*100, 1)}% | Price: ${buyPrice} credits`,
            `Your Credits: ${gs.credits} | CR After Purchase: ${gs.credits - buyPrice}`,
        ]}),
        [
            ['Cancel', () => showShipyardBuyModulesMenu(shipyard)],
        ],
        'shipyard_install_panel'
    )
    
    if (selectedShip) {
        onSelectShip(selectedShip)
    }
}