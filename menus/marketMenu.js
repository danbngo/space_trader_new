/**
 * Creates an HTML table displaying market cargo with buy/sell prices.
 * @param {Market} market - The market building.
 * @param {boolean} blackMarket - Whether this is a black market (shows only illegal goods).
 * @param {CountsMap} playerCargo - The player's current cargo.
 * @param {CountsMap} marketCargo - The market's available cargo.
 * @param {CountsMap} buyPrices - The buy prices for each cargo type.
 * @param {CountsMap} sellPrices - The sell prices for each cargo type.
 * @param {(cargoType: CargoType) => void} onSelectCargoType - Callback when cargo type is selected.
 * @returns {HTMLTableElement} The market cargo table.
 */
function createMarketCargoTable(market = new Market(), blackMarket = false, playerCargo = new CountsMap(), marketCargo = new CountsMap(), buyPrices = new CountsMap(), sellPrices = new CountsMap(), onSelectCargoType = (ct = CARGO_TYPES_ALL[0])=>{}) {
    /** @type {any[]} */
    const rows = [
        ['Cargo Type', 'Market Amt.', 'Buy Price', 'Your Amt.', 'Sell Price']
    ]
    const cargoTypes = blackMarket ? CARGO_TYPES_ALL.filter(ct=>ct.illegal) : CARGO_TYPES_ALL.filter(ct=>(!ct.illegal))
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
    const {blackMarket, planet} = market
    const {fleet} = gs;
    const isDocked = fleet.location == planet
    const buyPrices = market.calcCargoBuyPrices()
    const sellPrices = market.calcCargoSellPrices()
    const reloadMenu = ()=>showMarketMenu(market)
    
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

    //TODO: when player clicks buy or sell, open a NEW modal and then let him use a slider to select the actual amt
    //TODO: colorize buy and sell penalties
    
    function showSellCargoSlider(ct = CARGO_TYPES_ALL[0], sellableAmount = 0, sellPrice = 0) {
        const credits = gs.credits
        showSliderModal(
            1, sellableAmount, `Sell ${coloredName(ct)}`, 
            `How many ${coloredName(ct)} would you like to sell?`,
            (amt)=>{
                const totalSalePrice = amt*sellPrice
                const officersShare = gs.fleet.calcTotalCRShare(totalSalePrice, true)
                const finalSale = totalSalePrice - officersShare
                return `
                    Sale Price: ${finalSale}CR ${officersShare ? `(-${officersShare}CR for officers)` : ''}<br/>
                    CR After Sale: ${credits+finalSale}CR <br/>
                `
            },
            'Sell', 'Cancel', (amt = 0)=>sellCargo(ct, amt, amt*sellPrice), ()=>reloadMenu(),
        )
    }

    function showBuyCargoSlider(ct = CARGO_TYPES_ALL[0], buyableAmount = 0, buyPrice = 0) {
        showSliderModal(
            1, buyableAmount, `Buy ${coloredName(ct)}`, 
            `How many ${coloredName(ct)} would you like to buy?`,
            (amt)=>`Price: ${amt*buyPrice}CR`,
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
        
        /** @type {ButtonData[]} */
        const buttons = [
            ['Buy', ()=>showBuyCargoSlider(ct, buyableAmount, buyPrice), !canBuy],
            ['Sell', ()=>showSellCargoSlider(ct, sellableAmount, sellPrice), !canSell],
            ['Back', ()=>showPlanetMenu(planet)],
        ]
        refreshPanelButtons('market_panel', buttons)
    }

    let infoContainer = ce({
        children: [
            accessDeniedReason ? colorSpan(accessDeniedReason, COLORS.Orange) + '<br/>' : '',
            createMarketCargoTable(market, blackMarket, fleet.cargo, market.cargo, buyPrices, sellPrices, onSelectCargoType),
            `Market Credits: ${market.credits} | Your Credits: ${gs.credits} | Your Cargo: ${fleet.cargo.total}/${fleet.totalCargoSpace}`,
        ]
    })

    showPlanetModal(
        planet,
        `${coloredName(planet)} - ${blackMarket ? 'Black Market' : 'Market'}`,
        infoContainer,
        [['Back', ()=>showPlanetMenu(planet)]],
        'market_panel',
        (nextPlanet) => {
            const nextMarket = blackMarket ? nextPlanet.settlement?.blackMarket : nextPlanet.settlement?.market;
            return nextMarket ? showMarketMenu(nextMarket) : showPlanetMenu(nextPlanet);
        }
    );
    
    // Auto-select first cargo type
    const cargoTypes = blackMarket ? CARGO_TYPES_ALL.filter(ct=>ct.illegal) : CARGO_TYPES_ALL.filter(ct=>(!ct.illegal))
    if (cargoTypes.length > 0) {
        onSelectCargoType(cargoTypes[0])
    }
}
