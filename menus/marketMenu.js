/**
 * Creates an HTML table displaying market cargo with buy/sell prices.
 * @param {Market} market - The market building.
 * @param {CountsMap} playerCargo - The player's current cargo.
 * @param {CountsMap} marketCargo - The market's available cargo.
 * @param {CountsMap} buyPrices - The buy prices for each cargo type.
 * @param {CountsMap} sellPrices - The sell prices for each cargo type.
 * @param {(cargoType: CargoType) => void} onSelectCargoType - Callback when cargo type is selected.
 * @returns {HTMLTableElement} The market cargo table.
 */
function createMarketCargoTable(market = new Market(), playerCargo = new CountsMap(), marketCargo = new CountsMap(), buyPrices = new CountsMap(), sellPrices = new CountsMap(), onSelectCargoType = (ct = CARGO_TYPES_ALL[0])=>{}) {
    /** @type {any[]} */
    const rows = [
        ['Cargo Type', 'Market Amt.', 'Buy Price', 'Your Amt.', 'Sell Price']
    ]
    const cargoTypes = CARGO_TYPES_ALL
    for (const ct of cargoTypes) {
        rows.push([
            `${ct.symbol} ${ct.name}`,
            statColorSpan(marketCargo.getAmount(ct), marketCargo.getAmount(ct)/MARKET_AVERAGE_CARGO_PER_TYPE),
            statColorSpan(buyPrices.getAmount(ct), ct.value/buyPrices.getAmount(ct)),
            playerCargo.getAmount(ct),
            statColorSpan(sellPrices.getAmount(ct), sellPrices.getAmount(ct)/ct.value),
        ])
    }
    console.log('creating cargo table w rows:',rows)
    const table = createTable(rows, (rowIndex = 0)=>onSelectCargoType(cargoTypes[rowIndex]));
    
    // Add popovers to header columns
    if (table.rows[0]) {
        const headerRow = table.rows[0];
        if (headerRow.cells[0]) createPopoverElement(headerRow.cells[0], 'Type of cargo available for trade');
        if (headerRow.cells[1]) createPopoverElement(headerRow.cells[1], 'Amount of this cargo available at the market. Affected by planet production and consumption.');
        if (headerRow.cells[2]) createPopoverElement(headerRow.cells[2], 'Price to purchase one unit from the market. Lower is better.');
        if (headerRow.cells[3]) createPopoverElement(headerRow.cells[3], 'Amount of this cargo in your fleet\'s hold');
        if (headerRow.cells[4]) createPopoverElement(headerRow.cells[4], 'Price the market will pay you per unit. Higher is better.');
    }
    
    // Add popovers to various columns
    const tableRows = table.querySelectorAll('tr');
    tableRows.forEach((row, rowIndex) => {
        if (rowIndex === 0) return; // Skip header row
        const ct = cargoTypes[rowIndex - 1];
        
        // Add popover to Cargo Type column (column 0)
        const cargoTypeCell = row.cells[0];
        if (cargoTypeCell && ct.description) {
            createPopoverElement(cargoTypeCell, ct.description);
        }
        
        // Add popover to Market Amt. column (column 1)
        const marketAmtCell = row.cells[1];
        if (marketAmtCell) {
            const availabilityCalc = market.calcCargoAvailabilityModifier(ct);
            const baseAmount = MARKET_AVERAGE_CARGO_PER_TYPE;
            createPopoverElement(marketAmtCell, availabilityCalc.createPopover(baseAmount, 'base availability'));
        }
        
        // Add popover to Buy Price column (column 2)
        const buyPriceCell = row.cells[2];
        if (buyPriceCell) {
            const buyPriceCalc = market.getCargoBuyPriceCalculation(ct);
            createPopoverElement(buyPriceCell, buyPriceCalc.createPopover(ct.value, 'price', true)); // true = lower is better for buying
        }
        
        // Add popover to Sell Price column (column 4)
        const sellPriceCell = row.cells[4];
        if (sellPriceCell) {
            const sellPriceCalc = market.getCargoSellPriceCalculation(ct);
            createPopoverElement(sellPriceCell, sellPriceCalc.createPopover(ct.value, 'price', false)); // false = higher is better for selling
        }
    });
    
    return table;
}
/**
 * Displays the market menu for buying and selling cargo.
 * @param {Market} market - The market building to interact with.
 */
function showMarketMenu(market = new Market()) {
    const {planet} = market
    const {fleet} = gs;
    const isDocked = fleet.location == planet
    const buyPrices = market.calcCargoBuyPrices()
    const sellPrices = market.calcCargoSellPrices()
    const reloadMenu = ()=>showMarketMenu(market)
    // Check if player has any cargo that can be sold
    const hasSellableCargo = CARGO_TYPES_ALL.some(ct => {
        const playerAmount = fleet.cargo.getAmount(ct)
        if (playerAmount <= 0) return false
        const sellPrice = sellPrices.getAmount(ct)
        const marketAffordableAmount = Math.floor(market.credits / sellPrice)
        return Math.min(playerAmount, marketAffordableAmount) > 0
    }) 
    
    // Check access
    const accessDeniedReason = BuildingType.getAccessDeniedReason(planet, market)
    const canAccess = accessDeniedReason === null

    function buyCargo(ct = CARGO_TYPES_ALL[0], amt = 0) {
        const buyPrice = buyPrices.getAmount(ct)
        gs.credits -= amt * buyPrice;
        market.credits += amt * buyPrice;
        fleet.cargo.increment(ct, amt)
        market.cargo.increment(ct, -amt)
        reloadMenu()
    }

    function sellCargo(ct = CARGO_TYPES_ALL[0], amt = 0, totalSalePrice = 0) {
        const officersShare = gs.fleet.calcTotalCRShare(totalSalePrice, true)
        gs.credits += totalSalePrice - officersShare;
        market.credits -= totalSalePrice;
        fleet.cargo.increment(ct, -amt)
        market.cargo.increment(ct, amt)
        reloadMenu()
    }

    function showSellAllConfirmation() {
        // Calculate what can be sold
        const cargoToSell = new CountsMap()
        let totalSalePrice = 0
        
        for (const ct of CARGO_TYPES_ALL) {
            const playerAmount = fleet.cargo.getAmount(ct)
            if (playerAmount <= 0) continue
            
            const sellPrice = sellPrices.getAmount(ct)
            const marketAffordableAmount = Math.floor(market.credits / sellPrice)
            const sellableAmount = Math.min(playerAmount, marketAffordableAmount)
            
            if (sellableAmount > 0) {
                cargoToSell.increment(ct, sellableAmount)
                totalSalePrice += sellableAmount * sellPrice
            }
        }
        
        // Check if anything can be sold
        if (cargoToSell.total === 0) {
            showModal('Cannot Sell', 'You have no cargo that the market can afford to buy.', [['OK', reloadMenu]])
            return
        }
        
        // Build description of what's being sold
        let description = 'Sell the following?<br/><br/>'
        for (const ct of cargoToSell.keys) {
            const amount = cargoToSell.getAmount(ct)
            const price = sellPrices.getAmount(ct)
            const lineTotal = amount * price
            description += `${coloredName(ct)}: ${amount} units @ ${price}CR = ${lineTotal}CR<br/>`
        }
        
        const officersShare = gs.fleet.calcTotalCRShare(totalSalePrice, true)
        const finalSale = totalSalePrice - officersShare
        
        description += `Total Sale: ${totalSalePrice}CR<br/>`
        if (officersShare > 0) {
            description += `Officers' Share: -${officersShare}CR<br/>`
            description += `Your Net Gain: ${finalSale}CR<br/>`
        }
        description += `Your Credits After Sale: ${gs.credits + finalSale}CR<br/>`
        
        const confirmSellAll = () => {
            // Execute all sales
            for (const ct of cargoToSell.keys) {
                const amount = cargoToSell.getAmount(ct)
                const salePrice = amount * sellPrices.getAmount(ct)
                
                gs.credits += salePrice - gs.fleet.calcTotalCRShare(salePrice, true)
                market.credits -= salePrice
                fleet.cargo.increment(ct, -amount)
                market.cargo.increment(ct, amount)
            }
            reloadMenu()
        }
        
        showModal('Sell All Cargo', description, [
            ['Confirm', confirmSellAll],
            ['Cancel', reloadMenu]
        ])
    }

    //TODO: when player clicks buy or sell, open a NEW modal and then let him use a slider to select the actual amt
    //TODO: colorize buy and sell penalties
    
    function showSellCargoSlider(ct = CARGO_TYPES_ALL[0], sellableAmount = 0, sellPrice = 0) {
        const currentAmount = fleet.cargo.getAmount(ct);
        const currentCredits = gs.credits;
        const currentCargoTotal = fleet.cargo.total;
        const maxCargoSpace = fleet.totalCargoSpace;
    
        // Create hoverable label for "How many X"
        createPopoverElement(coloredName(ct), ct.description);
        
        showSliderModal(
            1, sellableAmount, `Sell ${coloredName(ct)}`, 
            ce({children: [`How many ${coloredName(ct)} would you like to sell?`]}),
            (amt)=>{
                const totalSalePrice = amt*sellPrice
                const officersShare = gs.fleet.calcTotalCRShare(totalSalePrice, true)
                const finalSale = totalSalePrice - officersShare
                return ce({children: [
                    `Your Amount: ${currentAmount} → ${currentAmount - amt}`,
                    ce({tag: 'br'}),
                    `Your Credits: ${currentCredits}CR → ${currentCredits + finalSale}CR ${officersShare ? `(-${officersShare}CR officers)` : ''}`,
                    ce({tag: 'br'}),
                    `Cargo Space: ${currentCargoTotal}/${maxCargoSpace} → ${currentCargoTotal - amt}/${maxCargoSpace}`,
                ]});
            },
            'Sell', 'Cancel', (amt = 0)=>sellCargo(ct, amt, amt*sellPrice), ()=>reloadMenu(),
        )
    }

    function showBuyCargoSlider(ct = CARGO_TYPES_ALL[0], buyableAmount = 0, buyPrice = 0) {
        const currentAmount = fleet.cargo.getAmount(ct);
        const currentCredits = gs.credits;
        const currentCargoTotal = fleet.cargo.total;
        const maxCargoSpace = fleet.totalCargoSpace;
        
        // Create hoverable cargo name
        createPopoverElement(coloredName(ct), ct.description);
        createPopoverElement(coloredName(ct), ct.description);
        
        showSliderModal(
            1, buyableAmount, `Buy ${coloredName(ct)}`, 
            ce({children: [`How many ${coloredName(ct)} would you like to buy?`]}),
            (amt)=>{
                const totalPrice = amt * buyPrice;
                return ce({children: [
                    `Your Amount: ${currentAmount} → ${currentAmount + amt}`,
                    ce({tag: 'br'}),
                    `Your Credits: ${currentCredits}CR → ${currentCredits - totalPrice}CR`,
                    ce({tag: 'br'}),
                    `Cargo Space: ${currentCargoTotal}/${maxCargoSpace} → ${currentCargoTotal + amt}/${maxCargoSpace}`,
                ]});
            },
            'Buy', 'Cancel', (amt = 0)=>buyCargo(ct, amt), ()=>reloadMenu(),
        )
    }

    function onSelectCargoType(ct = CARGO_TYPES_ALL[0]) {
        const remainingCargoSpace = fleet.availableCargoSpace;
        const playerAmount = fleet.cargo.getAmount(ct)
        const marketAmount = market.cargo.getAmount(ct)
        const buyPrice = buyPrices.getAmount(ct)
        const sellPrice = sellPrices.getAmount(ct)
        const playerAffordableAmount = Math.floor(gs.credits/buyPrice)
        const buyableAmount = Math.min(marketAmount, playerAffordableAmount, remainingCargoSpace)
        const marketAffordableAmount = Math.floor(market.credits/sellPrice)
        const sellableAmount = Math.min(playerAmount, marketAffordableAmount)
        console.log({playerAmount,marketAmount,buyPrice,sellPrice,playerAffordableAmount,buyableAmount,marketAffordableAmount,sellableAmount})
        
        const canBuy = canAccess && isDocked && buyableAmount > 0
        const canSell = canAccess && isDocked && sellableAmount > 0
        
        // Build disabled reasons
        let buyDisabledReason = ''
        if (!canAccess) buyDisabledReason = accessDeniedReason
        else if (!isDocked) buyDisabledReason = 'Must be docked to trade'
        else if (marketAmount <= 0) buyDisabledReason = 'Market has none in stock'
        else if (remainingCargoSpace <= 0) buyDisabledReason = 'No cargo space available'
        else if (playerAffordableAmount <= 0) buyDisabledReason = 'Cannot afford any'
        
        let sellDisabledReason = ''
        if (!canAccess) sellDisabledReason = accessDeniedReason
        else if (!isDocked) sellDisabledReason = 'Must be docked to trade'
        else if (playerAmount <= 0) sellDisabledReason = 'You have none to sell'
        else if (marketAffordableAmount <= 0) sellDisabledReason = 'Market cannot afford to buy'
        
        let sellAllDisabledReason = ''
        if (!canAccess) sellAllDisabledReason = accessDeniedReason
        else if (!isDocked) sellAllDisabledReason = 'Must be docked to trade'
        else if (!hasSellableCargo) sellAllDisabledReason = 'No cargo to sell'
        
        /** @type {ButtonData[]} */
        const buttons = [
            ['Buy', ()=>showBuyCargoSlider(ct, buyableAmount, buyPrice), !canBuy, buyDisabledReason],
            ['Sell', ()=>showSellCargoSlider(ct, sellableAmount, sellPrice), !canSell, sellDisabledReason],
            ['Sell All', ()=>showSellAllConfirmation(), !canAccess || !isDocked || !hasSellableCargo, sellAllDisabledReason],
            ['Back', ()=>showPlanetMenu(planet)],
        ]
        refreshPanelButtons('market_panel', buttons)
    }

    let infoContainer = ce({
        children: [
            accessDeniedReason ? colorSpan(accessDeniedReason, COLORS.Orange) + '<br/>' : '',
            createMarketCargoTable(market, fleet.cargo, market.cargo, buyPrices, sellPrices, onSelectCargoType),
            `Market Credits: ${market.credits} | Your Credits: ${gs.credits} | Your Cargo: ${fleet.cargo.total}/${fleet.totalCargoSpace}`,
        ]
    })

    // Build disabled reason for main Sell All button
    let mainSellAllDisabledReason = ''
    if (!canAccess) mainSellAllDisabledReason = accessDeniedReason
    else if (!isDocked) mainSellAllDisabledReason = 'Must be docked to trade'
    else if (!hasSellableCargo) mainSellAllDisabledReason = 'No cargo to sell'

    showPlanetModal(
        planet,
        `${coloredName(planet)} - Market`,
        infoContainer,
        [
            ['Sell All', ()=>showSellAllConfirmation(), !canAccess || !isDocked || !hasSellableCargo, mainSellAllDisabledReason],
            ['Back', ()=>showPlanetMenu(planet)]
        ],
        'market_panel',
        (nextPlanet) => {
            const nextMarket = nextPlanet.settlement?.market;
            return nextMarket ? showMarketMenu(nextMarket) : showPlanetMenu(nextPlanet);
        }
    );
    
    // Auto-select first cargo type
    if (CARGO_TYPES_ALL.length > 0) {
        onSelectCargoType(CARGO_TYPES_ALL[0])
    }
}
