function createCargoTable(blackMarket = false, playerCargo = new Cargo(), marketCargo = new Cargo(), buyPrices = new Cargo(), sellPrices = new Cargo(), onSelectCargoType = (ct = CARGO_TYPES_ALL[0])=>{}) {
    const rows = [
        ['Cargo Type', 'Market Amt.', 'Buy Price', 'Your Amt.', 'Sell Price']
    ]
    const cargoTypes = blackMarket ? CARGO_TYPES_ALL.filter(ct=>ct.illegal) : CARGO_TYPES_ALL.filter(ct=>(!ct.illegal))
    for (const ct of cargoTypes) {
        rows.push([
            ct.name,
            marketCargo.getAmount(ct),
            statColorSpan(buyPrices.getAmount(ct), ct.value/buyPrices.getAmount(ct)),
            playerCargo.getAmount(ct),
            statColorSpan(sellPrices.getAmount(ct), sellPrices.getAmount(ct)/ct.value),
        ])
    }
    console.log('creating cargo table w rows:',rows)
    return createTable(rows, (rowIndex = 0)=>onSelectCargoType(CARGO_TYPES_ALL[rowIndex]))
}

function showMarketMenu(planet = new Planet(), blackMarket = false) {
    console.log('showing market menu:',planet,planet.market,gameState)
    const {fleet, captain} = gameState;
    const market = blackMarket ? planet.blackMarket : planet.market
    const isDocked = fleet.location == planet
    const buyPrices = market.calcCargoBuyPrices()
    const sellPrices = market.calcCargoSellPrices()

    function buyCargo(ct = CARGO_TYPES_ALL[0], amount = 0) {
        const buyPrice = buyPrices.getAmount(ct)
        captain.credits -= amount * buyPrice;
        market.credits += amount * buyPrice;
        fleet.cargo.increment(ct, amount)
        market.cargo.increment(ct, -amount)
        showMarketMenu(planet, blackMarket); // refresh menu
    }

    function sellCargo(ct = CARGO_TYPES_ALL[0], amount = 0) {
        const sellPrice = buyPrices.getAmount(ct)
        captain.credits += amount * sellPrice;
        market.credits -= amount * sellPrice;
        fleet.cargo.increment(ct, -amount)
        market.cargo.increment(ct, amount)
        showMarketMenu(planet, blackMarket); // refresh menu
    }

    function onSelectCargoType(ct = CARGO_TYPES_ALL[0]) {
        if (!isDocked) return
        const remainingCargoSpace = fleet.calcTotalCargoSpace() - fleet.cargo.calcTotalCargo();
        const playerAmount = fleet.cargo.getAmount(ct)
        const marketAmount = market.cargo.getAmount(ct)
        const buyPrice = buyPrices.getAmount(ct)
        const sellPrice = sellPrices.getAmount(ct)
        const playerAffordableAmount = Math.floor(captain.credits/buyPrice)
        const buyableAmount = Math.min(marketAmount, playerAffordableAmount, remainingCargoSpace)
        const marketAffordableAmount = Math.floor(planet.market.credits/sellPrice)
        const sellableAmount = Math.min(playerAmount, marketAffordableAmount)
        const buttons = []
        for (const amount of [1, 5, 10, 25]) {
            buttons.push([`Buy ${amount} ${ct.name}`, ()=>buyCargo(ct, amount), (amount > buyableAmount)])
        }
        for (const amount of [1, 5, 10, 25]) {
            buttons.push([`Sell ${amount} ${ct.name}`, ()=>sellCargo(ct, amount), (amount > sellableAmount)])
        }
        buttons.push(['Back', ()=>showPlanetMenu(planet)])
        refreshPanelButtons('market_panel', buttons)
    }

    let infoContainer = createElement({
        children: [
            createCargoTable(blackMarket, fleet.cargo, market.cargo, buyPrices, sellPrices, onSelectCargoType),
            `Your Cargo Space: ${fleet.cargo.calcTotalCargo()} / ${fleet.calcTotalCargoSpace()}`,
            `Your Credits: ${captain.credits}`,
            `Market Credits: ${market.credits}`
        ]
    })

    panel = showPanel(
        `${coloredName(planet)} - ${blackMarket ? 'Black Market' : 'Market'}`,
        infoContainer,
        [['Back', ()=>showPlanetMenu(planet)]],
        'market_panel'
    );
}
