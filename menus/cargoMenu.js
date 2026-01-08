/**
 * Creates an HTML table displaying cargo amounts by type.
 * @param {CountsMap} cargo - The cargo inventory to display.
 * @param {(cargoType: CargoType) => void} onSelectCargoType - Callback when a cargo type is selected.
 * @returns {HTMLTableElement} The cargo table element.
 */
function createCargoTable(cargo = new CountsMap(), onSelectCargoType = (ct = CARGO_TYPES_ALL[0])=>{}) {
    // Calculate best prices from memorized settlements
    const bestSellPrices = new CountsMap()
    const bestBuyPrices = new CountsMap()
    
    for (const [planet, settlement] of gs.memorizedSettlements.entries()) {
        const market = settlement.market
        const blackMarket = settlement.blackMarket
        
        if (market && market.exists && !market.damaged) {
            const sellPrices = market.calcCargoSellPrices()
            const buyPrices = market.calcCargoBuyPrices()
            
            for (const ct of CARGO_TYPES_ALL) {
                const sellPrice = sellPrices.getAmount(ct)
                const buyPrice = buyPrices.getAmount(ct)
                
                // Track best sell price (highest)
                if (sellPrice > bestSellPrices.getAmount(ct)) {
                    bestSellPrices.setAmount(ct, sellPrice)
                }
                
                // Track best buy price (lowest)
                const currentBest = bestBuyPrices.getAmount(ct)
                if (currentBest === 0 || buyPrice < currentBest) {
                    bestBuyPrices.setAmount(ct, buyPrice)
                }
            }
        }
        
        if (blackMarket && blackMarket.exists && !blackMarket.damaged) {
            const sellPrices = blackMarket.calcCargoSellPrices()
            const buyPrices = blackMarket.calcCargoBuyPrices()
            
            for (const ct of CARGO_TYPES_ALL) {
                const sellPrice = sellPrices.getAmount(ct)
                const buyPrice = buyPrices.getAmount(ct)
                
                // Track best sell price (highest)
                if (sellPrice > bestSellPrices.getAmount(ct)) {
                    bestSellPrices.setAmount(ct, sellPrice)
                }
                
                // Track best buy price (lowest)
                const currentBest = bestBuyPrices.getAmount(ct)
                if (currentBest === 0 || buyPrice < currentBest) {
                    bestBuyPrices.setAmount(ct, buyPrice)
                }
            }
        }
    }
    
    /** @type {Array<[string, string, string|HTMLElement, string, string]>} */
    const rows = [
        ['Cargo Type', 'Amount', 'Cargo Space %', 'Best Sell', 'Best Buy']
    ]
    for (const ct of CARGO_TYPES_ALL) {
        const amount = cargo.getAmount(ct)
        const percentage = (amount / gs.fleet.totalCargoSpace) * 100
        
        const progressBar = new ProgressBar({
            value: percentage,
            fillColor: rgbArrayToString(ct.color),
            width: 20
        })
        
        const bar = progressBar.container
        
        const bestSell = bestSellPrices.getAmount(ct)
        const bestBuy = bestBuyPrices.getAmount(ct)
        const sellDisplay = bestSell > 0 ? `${bestSell} CR` : '-'
        const buyDisplay = bestBuy > 0 ? `${bestBuy} CR` : '-'
        
        rows.push([
            coloredName(ct),
            ''+cargo.getAmount(ct),
            bar,
            sellDisplay,
            buyDisplay
        ])
    }
    const totalBar = new ProgressBar({
            value: (cargo.total / gs.fleet.totalCargoSpace) * 100,
            fillColor: rgbArrayToString(COLORS.LightGray),
    })
    rows.push([
        'All',
        ''+cargo.total,
        totalBar.container,
        '-',
        '-'
    ])
    return createTable(rows, (rowIndex = 0)=>onSelectCargoType(CARGO_TYPES_ALL[rowIndex]))
}

/**
 * Displays the cargo management menu for viewing and dumping cargo.
 * @param {CountsMap} cargo - The cargo inventory to manage.
 */
function showCargoMenu(cargo = gs.fleet.cargo) {
    const reloadMenu = ()=>showCargoMenu(cargo)

    function dumpCargo(ct = CARGO_TYPES_ALL[0], amt = 0) {
        cargo.increment(ct, -amt)
        reloadMenu()
    }

    function showDumpCargoSlider(ct = CARGO_TYPES_ALL[0], dumpableAmount = 0) {
        showSliderModal(
            1, dumpableAmount, `Buy ${ct.name}`, 
            `How many ${ct.name} would you like to dump?`,
            null,
            'Dump', 'Cancel', (amt = 0)=>dumpCargo(ct, amt), ()=>reloadMenu(),
        )
    }

    function onSelectCargoType(ct = CARGO_TYPES_ALL[0]) {
        console.log(`Selected ct: ${ct}`)
        const dumpableAmount = cargo.getAmount(ct)
        /** @type {ButtonData[]} */
        const buttons = [
            ['Dump', ()=>showDumpCargoSlider(ct, dumpableAmount), dumpableAmount == 0],
            ["Close", () => closeModal()],
        ]
        refreshPanelButtons('cargo_panel', buttons)
    }

    showModal(
        `Cargo Manifest`,
        ce({children:[
            colorSpan('Prices are based on last visit to planet(s)', COLORS.Yellow),
            ce({tag: 'br'}),
            ce({tag: 'br'}),
            createCargoTable(cargo, onSelectCargoType),
            ce({tag: 'br'}),
            `Your Cargo Space: ${gs.fleet.cargo.total}/${gs.fleet.totalCargoSpace}`,
        ]}),
        [
            ["Close", () => closeModal()],
        ],
        'cargo_panel'
    );
}
