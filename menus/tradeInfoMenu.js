function createTradeInfoBuyTable(cargoType = CARGO_TYPES_ALL[0], onSelectPlanet = (p = new Planet())=>{}) {
    const {illegal} = cargoType
    const {system, fleet} = gameState
    const {planets} = system
    const rows = [
        ['Planet', 'Market Amt.', 'Buy Price', 'Distance', 'ETA']
    ]
    for (const planet of planets) {
        const market = illegal ? planet.settlement.blackMarket : planet.settlement.market
        const buyPrice = market ? market.calcCargoBuyPrices().getAmount(cargoType) : -1
        rows.push([
            coloredName(planet),
            !market ? 'N/A' : market.cargo.getAmount(cargoType),
            !market ? 'N/A' : statColorSpan(buyPrice, cargoType.value/buyPrice),
            round(calcDistance(fleet.x, fleet.y, planet.x, planet.y), 2),
            describeTimespan(new Route(fleet, planet).travelTime)
        ])
    }
    return createTable(rows, (rowIndex = 0)=>onSelectPlanet(planets[rowIndex]))
}

function createTradeInfoSellTable(cargoType = CARGO_TYPES_ALL[0], onSelectPlanet = (p = PLANETS[0])=>{}) {
    const {illegal} = cargoType
    const {system, fleet} = gameState
    const {planets} = system
    const rows = [
        ['Planet', 'Sell Price', 'Market Credits', 'Distance', 'ETA']
    ]
    for (const planet of planets) {
        const market = illegal ? planet.settlement.blackMarket : planet.settlement.market
        const sellPrice = market ? market.calcCargoSellPrices().getAmount(cargoType) : -1
        rows.push([
            coloredName(planet),
            !market ? 'N/A' : statColorSpan(sellPrice, sellPrice/cargoType.value),
            !market ? 'N/A' : market.credits,
            round(calcDistance(fleet.x, fleet.y, planet.x, planet.y), 2),
            describeTimespan(new Route(fleet, planet).travelTime)
        ])
    }
    return createTable(rows, (rowIndex = 0)=>onSelectPlanet(planets[rowIndex]))
}

function showTradeInfoSellMenu(cargoType = CARGO_TYPES_ALL[0]) {
    const {fleet} = gameState

    function onSelectPlanet(planet = new Planet()) {
        showStarMap(planet)
    }

    const options = []
    for (const ct of CARGO_TYPES_ALL) {
        const amt = fleet.cargo.getAmount(ct)
        options.push([`Sell ${ct.name}: ${amt}`, ()=>showTradeInfoSellMenu(ct), (ct == cargoType)])
    }
    options.push(
        ["Buy Info", () => showTradeInfoBuyMenu(cargoType)],
        ["Back", () => showStarMap()],
    )

    showPanel(
        `Trade Info - Sell ${cargoType.name}`,
        createElement({children:[
            createTradeInfoSellTable(cargoType, onSelectPlanet),
            `Your ${cargoType.name} amount: ${fleet.cargo.getAmount(cargoType)}`,
        ]}),
        options
    );
}

function showTradeInfoBuyMenu(cargoType = CARGO_TYPES_ALL[0]) {
    const {fleet, captain} = gameState

    function onSelectPlanet(planet = new Planet()) {
        showStarMap(planet)
    }

    const options = []
    for (const ct of CARGO_TYPES_ALL) {
        options.push([`Buy ${ct.name}`, ()=>showTradeInfoBuyMenu(ct), (ct == cargoType)])
    }
    options.push(
        ["Sell Info", () => showTradeInfoSellMenu(cargoType)],
        ["Back", () => showStarMap()],
    )

    showPanel(
        `Trade Info - Buy ${cargoType.name}`,
        createElement({children:[
            createTradeInfoBuyTable(cargoType, onSelectPlanet),
            `Your ${cargoType.name} amount: ${fleet.cargo.getAmount(cargoType)}`,
            `Your Cargo Space: ${fleet.cargo.calcTotalCargo()}/${fleet.calcTotalCargoSpace()}`,
            `Your credits: ${captain.credits}`,
        ]}),
        options
    );
}
