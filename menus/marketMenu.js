function createMarketCargoTable(blackMarket = false, playerCargo = new CountsMap(), marketCargo = new CountsMap(), buyPrices = new CountsMap(), sellPrices = new CountsMap(), onSelectCargoType = (ct = CARGO_TYPES_ALL[0])=>{}) {
    const rows = [
        ['Cargo Type', 'Market Amt.', 'Buy Price', 'Your Amt.', 'Sell Price']
    ]
    const cargoTypes = blackMarket ? CARGO_TYPES_ALL.filter(ct=>ct.illegal) : CARGO_TYPES_ALL.filter(ct=>(!ct.illegal))
    for (const ct of cargoTypes) {
        rows.push([
            ct.name,
            statColorSpan(marketCargo.getAmount(ct), marketCargo.getAmount(ct)/MARKET_MAX_CARGO_PER_TYPE),
            statColorSpan(buyPrices.getAmount(ct), ct.value/buyPrices.getAmount(ct)),
            playerCargo.getAmount(ct),
            statColorSpan(sellPrices.getAmount(ct), sellPrices.getAmount(ct)/ct.value),
        ])
    }
    console.log('creating cargo table w rows:',rows)
    return createTable(rows, (rowIndex = 0)=>onSelectCargoType(cargoTypes[rowIndex]))
}

function showMarketMenu(market = new Market()) {
    const {blackMarket, planet} = market
    const {fleet, captain} = gameState;
    const isDocked = fleet.location == planet
    const buyPrices = market.calcCargoBuyPrices()
    const sellPrices = market.calcCargoSellPrices()
    const reloadMenu = ()=>showMarketMenu(market)

    function buyCargo(ct = CARGO_TYPES_ALL[0], amount = 0) {
        const buyPrice = buyPrices.getAmount(ct)
        captain.credits -= amount * buyPrice;
        market.credits += amount * buyPrice;
        fleet.cargo.increment(ct, amount)
        market.cargo.increment(ct, -amount)
        reloadMenu()
    }

    function sellCargo(ct = CARGO_TYPES_ALL[0], amount = 0, totalSalePrice = 0) {
        const officersShare = gameState.fleet.calcTotalCRShare(totalSalePrice, true)
        captain.credits += totalSalePrice - officersShare;
        market.credits -= totalSalePrice;
        fleet.cargo.increment(ct, -amount)
        market.cargo.increment(ct, amount)
        reloadMenu()
    }

    //TODO: when player clicks buy or sell, open a NEW modal and then let him use a slider to select the actual amount
    //TODO: colorize buy and sell penalties
    
    function showSellCargoSlider(ct = CARGO_TYPES_ALL[0], sellableAmount = 0, sellPrice = 0) {
        const credits = gameState.credits
        showSliderModal(
            1, sellableAmount, `Sell ${ct.name}`, 
            `How many ${ct.name} would you like to sell?`,
            (amount)=>{
                const totalSalePrice = amount*sellPrice
                const officersShare = gameState.fleet.calcTotalCRShare(totalSalePrice, true)
                const finalSale = totalSalePrice - officersShare
                return `
                    Sale Price: ${finalSale}CR ${officersShare ? `(-${officersShare}CR for officers)` : ''}<br/>
                    CR After Sale: ${credits+finalSale}CR <br/>
                `
            },
            'Sell', 'Cancel', (amount = 0)=>sellCargo(ct, amount, totalSalePrice), ()=>reloadMenu(),
        )
    }

    function showBuyCargoSlider(ct = CARGO_TYPES_ALL[0], buyableAmount = 0, buyPrice = 0) {
        showSliderModal(
            1, buyableAmount, `Buy ${ct.name}`, 
            `How many ${ct.name} would you like to buy?`,
            (amount)=>`Price: ${amount*buyPrice}CR`,
            'Buy', 'Cancel', (amount = 0)=>buyCargo(ct, amount), ()=>reloadMenu(),
        )
    }

    function onSelectCargoType(ct = CARGO_TYPES_ALL[0]) {
        if (!isDocked) return
        const remainingCargoSpace = fleet.calcAvailableCargoSpace();
        const playerAmount = fleet.cargo.getAmount(ct)
        const marketAmount = market.cargo.getAmount(ct)
        const buyPrice = buyPrices.getAmount(ct)
        const sellPrice = sellPrices.getAmount(ct)
        const playerAffordableAmount = Math.floor(captain.credits/buyPrice)
        const buyableAmount = Math.min(marketAmount, playerAffordableAmount, remainingCargoSpace)
        const marketAffordableAmount = Math.floor(market.credits/sellPrice)
        const sellableAmount = Math.min(playerAmount, marketAffordableAmount)
        console.log({playerAmount,marketAmount,buyPrice,sellPrice,playerAffordableAmount,buyableAmount,marketAffordableAmount,sellableAmount})
        const buttons = [
            ['Buy', ()=>showBuyCargoSlider(ct, buyableAmount, buyPrice), buyableAmount == 0],
            ['Sell', ()=>showSellCargoSlider(ct, sellableAmount, sellPrice), sellableAmount == 0],
            ['Back', ()=>showPlanetMenu(planet)],
        ]
        refreshPanelButtons('market_panel', buttons)
    }

    let infoContainer = createElement({
        children: [
            createMarketCargoTable(blackMarket, fleet.cargo, market.cargo, buyPrices, sellPrices, onSelectCargoType),
            `Your Cargo Space: ${fleet.cargo.total}/${fleet.calcTotalCargoSpace()} | Your Credits: ${captain.credits}`,
            `Market Credits: ${market.credits} | Buy Penalty: ${round(100*market.rake, 2)}% | Sell Penalty: ${round(100/market.rake, 2)}%`,
        ]
    })

    panel = showModal(
        `${coloredName(planet)} - ${blackMarket ? 'Black Market' : 'Market'}`,
        infoContainer,
        [['Back', ()=>showPlanetMenu(planet)]],
        'market_panel'
    );
}
