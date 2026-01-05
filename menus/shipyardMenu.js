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
        ['Ship Name', 'Quality', 'Hull', 'Shields', 'Lasers', 'Engine', 'Cargo Space', 'Buy Price']
    ]
    for (const ship of ships) {
        const buyPrice = shipyard.calcBuyPrice(ship)
        rows.push([
            ship.name,
            statColorSpan(roundToPlaces(ship.quality * 100, 1) + '%', ship.quality),
            statColorSpan(ship.hull[1], ship.hull[1]/10),
            statColorSpan(ship.shields[1], ship.shields[1]/10),
            statColorSpan(ship.lasers, ship.lasers/10),
            statColorSpan(ship.engine, ship.engine/10),
            statColorSpan(ship.cargoSpace, ship.cargoSpace/10),
            statColorSpan(buyPrice, ship.value/buyPrice)
        ])
    }
    const table = createTable(rows, (rowIndex = 0)=>onSelectShip(ships[rowIndex]))
    
    // Add popovers to stat header cells
    const headerRow = table.rows[0];
    if (headerRow) {
        createPopoverElement(headerRow.cells[2], SHIP_STATS.HULL.description); // Hull
        createPopoverElement(headerRow.cells[3], SHIP_STATS.SHIELDS.description); // Shields
        createPopoverElement(headerRow.cells[4], SHIP_STATS.LASERS.description); // Lasers
        createPopoverElement(headerRow.cells[5], SHIP_STATS.ENGINES.description); // Engine
        createPopoverElement(headerRow.cells[6], SHIP_STATS.CARGO_CAPACITY.description); // Cargo Space
    }
    
    // Add popovers to each row
    ships.forEach((ship, index) => {
        const row = table.rows[index + 1]; // +1 to skip header
        if (!row) return;
        
        // Ship name popover (column 0)
        const shipNameCell = row.cells[0];
        if (shipNameCell && ship.shipType && ship.shipType.description) {
            createPopoverElement(shipNameCell, ship.shipType.description);
        }
        
        // Buy price popover (column 7)
        const buyPriceCell = row.cells[7];
        if (buyPriceCell) {
            const buyPriceCalc = shipyard.getBuyPriceCalculation(ship);
            createPopoverElement(buyPriceCell, buyPriceCalc.createPopover(ship.value, 'price', true)); // true = lower is better for buying
        }
    });
    
    return table;
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
            coloredName(module.moduleType),
            statColorSpan(roundToPlaces(module.quality*100, 1)+'%', module.quality),
            statColorSpan(buyPrice, module.moduleType.value/buyPrice),
            module.moduleType.description
        ])
    }
    const table = createTable(rows, (rowIndex = 0)=>onSelectModule(modules[rowIndex]))
    
    // Add popovers to each row's buy price
    modules.forEach((module, index) => {
        const row = table.rows[index + 1]; // +1 to skip header
        if (!row) return;
        
        // Module name popover (column 0)
        const moduleNameCell = row.cells[0];
        if (moduleNameCell && module.moduleType && module.moduleType.description) {
            createPopoverElement(moduleNameCell, module.moduleType.description);
        }
        
        // Buy price popover (column 2)
        const buyPriceCell = row.cells[2];
        if (buyPriceCell) {
            const buyPriceCalc = shipyard.getBuyModulePriceCalculation(module);
            createPopoverElement(buyPriceCell, buyPriceCalc.createPopover(module.moduleType.value, 'price', true)); // true = lower is better for buying
        }
    });
    
    return table;
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
        ['Ship Name', 'Quality', 'Hull', 'Shields', 'Lasers', 'Engine', 'Cargo Space', 'Sell Price']
    ]
    for (const ship of ships) {
        const sellPrice = shipyard.calcSellPrice(ship)
        rows.push([
            ship.name,
            statColorSpan(roundToPlaces(ship.quality * 100, 1) + '%', ship.quality),
            statColorSpan(ship.hull[1], ship.hull[1]/10),
            statColorSpan(ship.shields[1], ship.shields[1]/10),
            statColorSpan(ship.lasers, ship.lasers/10),
            statColorSpan(ship.engine, ship.engine/10),
            statColorSpan(ship.cargoSpace, ship.cargoSpace/10),
            statColorSpan(sellPrice, sellPrice/ship.value)
        ])
    }
    const table = createTable(rows, (rowIndex = 0)=>onSelectShip(ships[rowIndex]))
    
    // Add popovers to stat header cells
    const headerRow = table.rows[0];
    if (headerRow) {
        createPopoverElement(headerRow.cells[2], SHIP_STATS.HULL.description); // Hull
        createPopoverElement(headerRow.cells[3], SHIP_STATS.SHIELDS.description); // Shields
        createPopoverElement(headerRow.cells[4], SHIP_STATS.LASERS.description); // Lasers
        createPopoverElement(headerRow.cells[5], SHIP_STATS.ENGINES.description); // Engine
        createPopoverElement(headerRow.cells[6], SHIP_STATS.CARGO_CAPACITY.description); // Cargo Space
    }
    
    // Add popovers to each row
    ships.forEach((ship, index) => {
        const row = table.rows[index + 1]; // +1 to skip header
        if (!row) return;
        
        // Ship name popover (column 0)
        const shipNameCell = row.cells[0];
        if (shipNameCell && ship.shipType && ship.shipType.description) {
            createPopoverElement(shipNameCell, ship.shipType.description);
        }
        
        // Sell price popover (column 7)
        const sellPriceCell = row.cells[7];
        if (sellPriceCell) {
            const sellPriceCalc = shipyard.getSellPriceCalculation(ship);
            createPopoverElement(sellPriceCell, sellPriceCalc.createPopover(ship.value, 'price', false)); // false = higher is better for selling
        }
    });
    
    return table;
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
        
        // Auto-assign an unassigned officer as pilot
        fleet.autoAssignPilots()
        
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
        /** @type {ButtonData[]} */
        const buttons = []
        if (canBuy) buttons.push([`Buy`, ()=>showBuyShipModal(ship)])
        buttons.push(
            ["Buy Modules", ()=>showShipyardBuyModulesMenu(shipyard)],
            ["Sell Ships", ()=>showShipyardSellMenu(shipyard)],
            ["Back", () => leave()],
        )
        refreshPanelButtons('shipyard_buy_panel', buttons)
    }

    showPlanetModal(
        planet,
        `${coloredName(planet)} - Shipyard`,
        ce({children:[
            createBuyShipMenu(shipyard.ships, shipyard, (ship)=>onSelectShipyardShip(ship)),
            `Shipyard Credits: ${shipyard.credits} | Your # ships: ${fleet.ships.length}/${fleet.numPilots} | Your Credits: ${gs.credits}`,
        ]}),
        [
            ["Buy Modules", ()=>showShipyardBuyModulesMenu(shipyard)],
            ["Sell Ships", ()=>showShipyardSellMenu(shipyard)],
            ["Back", () => leave()],
        ],
        `shipyard_buy_panel`,
        (nextPlanet) => nextPlanet.settlement?.shipyard ? showShipyardBuyMenu(nextPlanet.settlement.shipyard) : showPlanetMenu(nextPlanet)
    );
    
    // Auto-select first ship
    if (shipyard.ships.length > 0) {
        onSelectShipyardShip(shipyard.ships[0])
    }
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
        const isLastShip = fleet.ships.length < 2;
        const shipyardCanAfford = shipyard.credits >= shipyard.calcSellPrice(ship);
        const canSell = isDocked && shipyardCanAfford && !isLastShip;
        
        let disabledReason = null;
        if (!isDocked) disabledReason = 'Must be docked to sell ships';
        else if (isLastShip) disabledReason = "You can't sell your last ship!";
        else if (!shipyardCanAfford) disabledReason = `Shipyard cannot afford this ship (has ${shipyard.credits} CR)`;
        
        /** @type {ButtonData[]} */
        const buttons = [
            [`Sell`, ()=>showSellShipModal(ship), !canSell, disabledReason],
            ["Buy Modules", ()=>showShipyardBuyModulesMenu(shipyard)],
            ["Buy Ships", ()=>showShipyardBuyMenu(shipyard)],
            ["Back", () => leave()],
        ]
        refreshPanelButtons('shipyard_buy_panel', buttons)
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
                `Your CR After Sale: ${gs.credits+finalSale}CR ${officersShare ? `(-${officersShare}CR officers' share)` : ''}`,
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
            `<b>Your ships</b>`,
            createSellShipMenu(fleet.ships, shipyard, (ship)=>onSelectPlayerShip(ship)),
            `Shipyard Credits: ${shipyard.credits}`,
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
        
        // Get disabled reason
        let disabledReason = null;
        if (!isDocked) disabledReason = 'Must be docked to buy modules';
        else if (!canAfford) disabledReason = `Insufficient credits (need ${buyPrice} CR)`;
        else if (!hasEligibleShip) disabledReason = 'No ships with available module slots';
        
        /** @type {ButtonData[]} */
        const buttons = [
            [`Buy & Install`, ()=>showShipyardInstallModuleMenu(shipyard, module), !canBuy, disabledReason],
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
            `<b>Available Modules</b>`,
            createBuyModuleMenu(shipyard.modules, shipyard, (module)=>onSelectModule(module)),
            `Shipyard Credits: ${shipyard.credits} | Your Credits: ${gs.credits} | Open Slots: ${fleet.ships.filter(s => s.unusedModuleSlots > 0).length} / ${fleet.ships.length}`,
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

        /** @type {ButtonData[]} */
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