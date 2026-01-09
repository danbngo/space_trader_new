/**
 * Creates an HTML table displaying ships available for purchase.
 * @param {Ship[]} ships - Array of ships for sale.
 * @param {Shipyard} shipyard - The shipyard building.
 * @param {(ship: Ship) => void} onSelectShip - Callback when a ship is selected.
 * @returns {HTMLTableElement|string} The ships table or "(None)" if no ships.
 */
function createBuyShipMenu(ships = [], shipyard = new Shipyard(), onSelectShip = (ship )=>{}) {
    if (ships.length == 0) return `(None)`
    /** @type {any[]} */
    const rows = [
        ['Ship Name', 'Quality', 'Hull', 'Shields', 'Fuel', 'Lasers', 'Engine', 'Cargo Space', 'Buy Price']
    ]
    for (const ship of ships) {
        const buyPrice = shipyard.calcBuyPrice(ship)
        rows.push([
            ship.name,
            statColorSpan(roundToPlaces(ship.quality * 100, 1) + '%', ship.quality),
            statColorSpan(ship.hull[1], ship.hull[1]/AVERAGE_SHIP_HULL),
            statColorSpan(ship.shields[1], ship.shields[1]/AVERAGE_SHIP_SHIELDS),
            statColorSpan(ship.lasers[1], ship.lasers[1]/AVERAGE_SHIP_LASERS),
            statColorSpan(ship.fuelCapacity, ship.fuelCapacity/AVERAGE_SHIP_FUEL_CAPACITY),
            statColorSpan(ship.engine, ship.engine/AVERAGE_SHIP_ENGINE),
            statColorSpan(ship.cargoSpace, ship.cargoSpace/AVERAGE_SHIP_CARGO_SPACE),
            statColorSpan(buyPrice, ship.value/buyPrice)
        ])
    }
    const table = createTable(rows, (rowIndex = 0)=>onSelectShip(ships[rowIndex - 1]))
    
    // Add popovers to stat header cells
    const headerRow = table.rows[0];
    if (headerRow) {
        createPopoverElement(headerRow.cells[1], "Represents how high this ship's stats are compared to average ships"); // Quality
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
    const table = createTable(rows, (rowIndex = 0)=>onSelectModule(modules[rowIndex - 1]))
    
    // Add popovers to header columns
    if (table.rows[0]) {
        const headerRow = table.rows[0];
        if (headerRow.cells[0]) createPopoverElement(headerRow.cells[0], 'Type of ship module');
        if (headerRow.cells[1]) createPopoverElement(headerRow.cells[1], 'Quality affects module effectiveness. Higher is better.');
        if (headerRow.cells[2]) createPopoverElement(headerRow.cells[2], 'Price to purchase this module');
        if (headerRow.cells[3]) createPopoverElement(headerRow.cells[3], 'Module description and effects');
    }
    
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
function createSellShipMenu(ships = [], shipyard = new Shipyard(), onSelectShip = (ship )=>{}) {
    if (ships.length == 0) return `(None)`
    /** @type {any[]} */
    const rows = [
        ['Ship Name', 'Quality', 'Hull', 'Shields', 'Lasers', 'Engine', 'Cargo Space', 'Repair Cost', 'Sell Price']
    ]
    for (const ship of ships) {
        const sellPrice = shipyard.calcSellPrice(ship)
        const damageAmount = ship.hull[1] - ship.hull[0]
        const repairCost = damageAmount > 0 ? shipyard.calculateRepairCost(ship, damageAmount) : 0
        rows.push([
            ship.name,
            statColorSpan(roundToPlaces(ship.quality * 100, 1) + '%', ship.quality),
            statColorSpan(`${ship.hull[0]}/${ship.hull[1]}`, ship.hull[0]/ship.hull[1]),
            statColorSpan(ship.shields[1], ship.shields[1]/10),
            statColorSpan(ship.lasers[1], ship.lasers[1]/10),
            statColorSpan(ship.engine, ship.engine/10),
            statColorSpan(ship.cargoSpace, ship.cargoSpace/10),
            damageAmount > 0 ? statColorSpan(repairCost, 1/repairCost*100) : colorSpan('—', COLORS.Gray),
            statColorSpan(sellPrice, sellPrice/ship.value)
        ])
    }
    const table = createTable(rows, (rowIndex = 0)=>onSelectShip(ships[rowIndex - 1]))
    
    // Add popovers to stat header cells
    const headerRow = table.rows[0];
    if (headerRow) {
        if (headerRow.cells[0]) createPopoverElement(headerRow.cells[0], 'Ship name and type');
        if (headerRow.cells[1]) createPopoverElement(headerRow.cells[1], "Represents how high this ship's stats are compared to average ships");
        createPopoverElement(headerRow.cells[2], SHIP_STATS.HULL.description); // Hull
        createPopoverElement(headerRow.cells[3], SHIP_STATS.SHIELDS.description); // Shields
        createPopoverElement(headerRow.cells[4], SHIP_STATS.LASERS.description); // Lasers
        createPopoverElement(headerRow.cells[5], SHIP_STATS.ENGINES.description); // Engine
        createPopoverElement(headerRow.cells[6], SHIP_STATS.CARGO_CAPACITY.description); // Cargo Space
        createPopoverElement(headerRow.cells[7], 'The total cost to fully repair this ship at this shipyard'); // Repair Cost
        if (headerRow.cells[8]) createPopoverElement(headerRow.cells[8], 'Price the shipyard will pay you for this ship');
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
        
        // Repair cost popover (column 7)
        const repairCostCell = row.cells[7];
        const damageAmount = ship.hull[1] - ship.hull[0];
        if (repairCostCell && damageAmount > 0) {
            const repairCostCalc = shipyard.getRepairCostCalculation(ship, damageAmount);
            createPopoverElement(repairCostCell, repairCostCalc.createPopover(REPAIR_COST_PER_1_HULL, 'repair cost', true)); // true = lower is better
        }
        
        // Sell price popover (column 8)
        const sellPriceCell = row.cells[8];
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

    function buyShip(ship ) {
        const buyPrice = shipyard.calcBuyPrice(ship)
        gs.credits -= buyPrice;
        shipyard.credits += buyPrice;
        fleet.addShip(ship)
        safeRemove(shipyard.ships, ship)
        
        // Auto-assign an unassigned officer as pilot
        fleet.autoAssignPilots()
        
        rebuildMenu()
    }

    function showBuyShipModal(ship ) {
        const buyPrice = shipyard.calcBuyPrice(ship)
        
        // Create ship visual using Ship.asCanvas() with player's fleet color
        const shipCanvas = ship.asCanvas(80, gs.fleet.color)
        
        showModal(
            `Buy ${coloredName(ship)}?`,
            ce({children: [
                shipCanvas,
                `Buy the ${coloredName(ship)} for ${buyPrice} credits?`
            ]}),
            [
                ['Buy', () => buyShip(ship), !isDocked],
                ['Cancel', () => rebuildMenu()],
            ],
        )
    }
    
    function onSelectShipyardShip(ship ) {
        const buyPrice = shipyard.calcBuyPrice(ship)
        const canAfford = gs.credits >= buyPrice
        const hasRoomForShip = fleet.ships.length < fleet.numPilots
        const canBuy = canAfford && hasRoomForShip
        
        /** @type {ButtonData[]} */
        const buttons = []
        
        // Always show Buy button, but disable with reason if can't buy
        let disabledReason = ''
        if (!canAfford) disabledReason = `Not enough credits (need ${buyPrice}, have ${gs.credits})`
        else if (!hasRoomForShip) disabledReason = `No room for more ships (${fleet.ships.length}/${fleet.numPilots} pilots)`
        
        buttons.push([`Buy`, ()=>showBuyShipModal(ship), !canBuy, disabledReason])
        
        buttons.push(
            ["Buy Modules", ()=>showShipyardBuyModulesMenu(shipyard)],
            ["Your Ships", ()=>showShipyardSellMenu(shipyard)],
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
            ["Your Ships", ()=>showShipyardSellMenu(shipyard)],
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

    function sellShip(ship, salePrice = 0) {
        Shipyard.recordState(shipyard)
        const officersShare = gs.fleet.calcTotalCRShare(salePrice, true)
        gs.credits += salePrice - officersShare;
        shipyard.credits -= salePrice;
        safeAdd(shipyard.ships, ship)
        safeRemove(fleet.ships, ship)
        rebuildMenu()
    }

    function refuelFleet() {
        const refuelCost = shipyard.calcRefuelCost(fleet)
        if (gs.credits < refuelCost) return
        if (fleet.fuel >= fleet.totalFuelCapacity) return
        
        gs.credits -= refuelCost
        fleet.fuel = fleet.totalFuelCapacity
        rebuildMenu()
    }

    function onSelectPlayerShip(ship ) {
        const isLastShip = fleet.ships.length < 2;
        const shipyardCanAfford = shipyard.credits >= shipyard.calcSellPrice(ship);
        const canSell = isDocked && shipyardCanAfford && !isLastShip;
        const damageAmount = ship.hull[1] - ship.hull[0];
        const canRepair = isDocked && damageAmount > 0;
        const fuelNeeded = fleet.totalFuelCapacity - fleet.fuel;
        const refuelCost = fuelNeeded > 0 ? shipyard.calcRefuelCost(fleet) : 0;
        const canRefuel = isDocked && fuelNeeded > 0 && gs.credits >= refuelCost;
        
        let disabledReason = null;
        if (!isDocked) disabledReason = 'Must be docked to sell ships';
        else if (isLastShip) disabledReason = "You can't sell your last ship!";
        else if (!shipyardCanAfford) disabledReason = `Shipyard cannot afford this ship (has ${shipyard.credits} CR)`;
        
        let repairDisabledReason = null;
        if (!isDocked) repairDisabledReason = 'Must be docked to repair ships';
        else if (damageAmount <= 0) repairDisabledReason = 'Ship is not damaged';
        
        let refuelDisabledReason = null;
        if (!isDocked) refuelDisabledReason = 'Must be docked to refuel';
        else if (fuelNeeded <= 0) refuelDisabledReason = 'Fuel tank is full';
        else if (gs.credits < refuelCost) refuelDisabledReason = `Not enough credits (need ${refuelCost} CR)`;
        
        // For last ship, change Sell button to show Trade modal
        const sellButtonAction = isLastShip ? ()=>showTradeLastShipModal(ship) : ()=>showSellShipModal(ship);
        
        // Create refuel button with cost breakdown popover
        const refuelCalc = shipyard.getRefuelCostCalculation(fleet);
        const refuelButtonText = `Refuel (${refuelCost} CR)`;
        const refuelButton = ce({innerHTML: refuelButtonText, classNames: ['gameButton']});
        if (!canRefuel) refuelButton.classList.add('disabled');
        refuelButton.onclick = () => {
            if (!canRefuel) return;
            refuelFleet();
        };
        if (fuelNeeded > 0) {
            createPopoverElement(refuelButton, refuelCalc.createPopover(BASE_FUEL_COST_PER_UNIT, 'refuel cost', true));
        }
        
        /** @type {(ButtonData|HTMLElement)[]} */
        const buttons = [
            [`Sell`, sellButtonAction, !canSell && !isLastShip, disabledReason],
            [`Repair`, ()=>showRepairShipModal(ship), !canRepair, repairDisabledReason],
            refuelButton,
            ["Buy Modules", ()=>showShipyardBuyModulesMenu(shipyard)],
            ["Buy Ships", ()=>showShipyardBuyMenu(shipyard)],
            ["Back", () => leave()],
        ]
        refreshPanelButtons('shipyard_sell_panel', buttons)
    }

    function showTradeLastShipModal(currentShip ) {
        const sellPrice = shipyard.calcSellPrice(currentShip);
        
        // Create table similar to buy menu but with trade cost
        function createTradeTable(ships, onSelectShip, selectedShip = null) {
            if (ships.length == 0) return `(None)`;
            
            const rows = [
                ['Ship Name', 'Quality', 'Hull', 'Shields', 'Fuel', 'Lasers', 'Engine', 'Cargo Space', 'Trade Cost']
            ];
            
            for (const ship of ships) {
                const buyPrice = shipyard.calcBuyPrice(ship);
                const tradeCost = buyPrice - sellPrice;
                const tradeCostDisplay = tradeCost >= 0 ? `+${tradeCost}` : `${tradeCost}`;
                const tradeCostColor = tradeCost <= 0 ? COLORS.LightGreen : COLORS.LightRed;
                
                rows.push([
                    ship.name,
                    statColorSpan(roundToPlaces(ship.quality * 100, 1) + '%', ship.quality),
                    statColorSpan(ship.hull[1], ship.hull[1]/AVERAGE_SHIP_HULL),
                    statColorSpan(ship.shields[1], ship.shields[1]/AVERAGE_SHIP_SHIELDS),
                    statColorSpan(ship.fuelCapacity, ship.fuelCapacity/AVERAGE_SHIP_FUEL_CAPACITY),
                    statColorSpan(ship.lasers, ship.lasers/AVERAGE_SHIP_LASERS),
                    statColorSpan(ship.engine, ship.engine/AVERAGE_SHIP_ENGINE),
                    statColorSpan(ship.cargoSpace, ship.cargoSpace/AVERAGE_SHIP_CARGO_SPACE),
                    colorSpan(tradeCostDisplay, tradeCostColor)
                ]);
            }
            
            // Find the index of the selected ship (add 1 to account for header row)
            const selectedIndex = selectedShip ? ships.indexOf(selectedShip) + 1 : null;
            
            return createTable(rows, (rowIndex) => onSelectShip(ships[rowIndex - 1]), selectedIndex);
        }
        
        let selectedTradeShip = null;
        
        function showTradeModal() {
            const content = ce({children: [
                colorSpan(`You cannot sell your last ship or you'd no longer be a captain!`, COLORS.Yellow),
                `However, you can trade it for another.`,
                ce({tag: 'br'}),
                createTradeTable(shipyard.ships, (ship) => {
                    selectedTradeShip = ship;
                    showTradeModal(); // Recreate modal with updated buttons
                }, selectedTradeShip),
                ce({tag: 'br'}),
                `Your Credits: ${gs.credits}CR`
            ]});
            /** @type {ButtonData[]} */
            let buttons = []
            if (!selectedTradeShip) {
                buttons = [
                    ['Trade', null, true, 'Select a ship to trade'],
                    ['Cancel', () => closeModal()]
                ];
            } else {
                const buyPrice = shipyard.calcBuyPrice(selectedTradeShip);
                const tradeCost = buyPrice - sellPrice;
                const canAfford = gs.credits >= tradeCost;
                
                let disabledReason = null;
                if (!canAfford) disabledReason = `Not enough credits (need ${tradeCost}, have ${gs.credits})`;
                
                buttons = [
                    ['Trade', () => performTrade(currentShip, selectedTradeShip, tradeCost), !canAfford, disabledReason],
                    ['Cancel', () => closeModal()]
                ];
            }
            
            showModal(
                'Trade Ship',
                content,
                buttons
            );
        }
        
        function performTrade(oldShip, newShip, tradeCost) {
            Shipyard.recordState(shipyard);
            
            // Remove old ship from player, add to shipyard
            safeRemove(fleet.ships, oldShip);
            safeAdd(shipyard.ships, oldShip);
            
            // Remove new ship from shipyard, add to player
            safeRemove(shipyard.ships, newShip);
            safeAdd(fleet.ships, newShip);
            
            // Handle credits
            gs.credits -= tradeCost;
            shipyard.credits += tradeCost;
            
            closeModal();
            rebuildMenu();
        }
        
        showTradeModal();
    }

    function showRepairShipModal(ship ) {
        const maxDamage = ship.hull[1] - ship.hull[0];
        if (maxDamage <= 0) {
            rebuildMenu();
            return;
        }
        
        showSliderModal(
            1,
            maxDamage,
            `Repair ${coloredName(ship)}`,
            ce({children: [
                `Ship Hull: ${ship.hull[0]}/${ship.hull[1]}`,
                `Damage: ${maxDamage} hull points`,
                ``,
            ]}),
            (repairAmount) => {
                const cost = shipyard.calculateRepairCost(ship, repairAmount);
                const canAfford = gs.credits >= cost;
                const afterCredits = gs.credits - cost;
                const repairCalc = shipyard.getRepairCostCalculation(ship, repairAmount);
                
                const costSpan = ce({innerHTML: colorSpan(`${cost}CR`, canAfford ? COLORS.White : COLORS.Red)});
                createPopoverElement(costSpan, repairCalc.createPopover(REPAIR_COST_PER_1_HULL, 'repair cost', true));
                
                return ce({children: [
                    `Repair ${repairAmount} hull point${repairAmount > 1 ? 's' : ''} → ${ship.hull[0] + repairAmount}/${ship.hull[1]}`,
                    ce({children: [`Cost: `, costSpan]}),
                    canAfford ? `Your credits after: ${afterCredits}CR` : colorSpan(`Insufficient credits!`, COLORS.Red),
                ]});
            },
            'Repair',
            'Cancel',
            (repairAmount) => {
                const cost = shipyard.calculateRepairCost(ship, repairAmount);
                if (gs.credits >= cost) {
                    gs.credits -= cost;
                    ship.hull[0] = Math.min(ship.hull[1], ship.hull[0] + repairAmount);
                    rebuildMenu();
                }
            },
            () => rebuildMenu()
        );
    }

    function showSellShipModal(ship ) {
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

    // Add fuel progress bar
    const fuelPercentage = (fleet.fuel / fleet.totalFuelCapacity) * 100
    const colorRatio = fuelPercentage / 25
    const fuelBarColor = calcStatColor(colorRatio)
    const fuelBar = ce({
        style: {marginTop: '10px', display: 'flex', gap: '6px', alignItems: 'center'},
        children: [
            'Fleet Fuel: ',
            new ProgressBar({
                value: fuelPercentage,
                fillColor: fuelBarColor,
                overrideLabel: '',
                width: 25
            }).container,
        ]
    })
    
    showPlanetModal(
        planet,
        `${coloredName(planet)} - Shipyard`,
        ce({children:[
            `<b>Your ships</b>`,
            createSellShipMenu(fleet.ships, shipyard, (ship)=>onSelectPlayerShip(ship)),
            ce({tag: 'br'}),
            fuelBar,
            ce({tag: 'br'}),
            `Your Credits: ${gs.credits} | Shipyard Credits: ${shipyard.credits}`,
        ]}),
        [
            ["Buy Modules", ()=>showShipyardBuyModulesMenu(shipyard)],
            ["Buy Ships", ()=>showShipyardBuyMenu(shipyard)],
            ["Back", () => leave()]
        ],
        `shipyard_sell_panel`,
        (nextPlanet) => nextPlanet.settlement?.shipyard ? showShipyardSellMenu(nextPlanet.settlement.shipyard) : showPlanetMenu(nextPlanet)
    );
    
    // Auto-select first ship
    if (fleet.ships.length > 0) {
        onSelectPlayerShip(fleet.ships[0])
    }
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
            ["Your Ships", ()=>showShipyardSellMenu(shipyard)],
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
            ["Your Ships", ()=>showShipyardSellMenu(shipyard)],
            ["Back", () => leave()],
        ],
        `shipyard_modules_panel`,
        (nextPlanet) => nextPlanet.settlement?.shipyard ? showShipyardBuyModulesMenu(nextPlanet.settlement.shipyard) : showPlanetMenu(nextPlanet)
    );
}



function showShipyardInstallModuleMenu(shipyard = new Shipyard(), module = new ShipModule(), selectedShip = null) {
    const {fleet} = gs
    const buyPrice = shipyard.calcBuyModulePrice(module)

    function buyModule(module = new ShipModule(), ship ) {
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
        
        return createTable(rows, (rowIndex) => onSelectShip(fleet.ships[rowIndex - 1]), selectedShip ? fleet.ships.indexOf(selectedShip) + 1 : null)
    }

    function onSelectShip(ship ) {
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