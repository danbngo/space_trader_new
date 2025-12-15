function createTradeInfoBuyTable(ct = CARGO_TYPES_ALL[0], onSelectPlanet = (p = new Planet())=>{}) {
    const {illegal} = ct
    const {system, fleet} = gs
    const {planets} = system
    const rows = [
        ['Planet', 'Buy Price', 'Market Amt.', 'Distance', 'ETA']
    ]
    for (const planet of planets) {
        const market = illegal ? planet.settlement.blackMarket : planet.settlement.market
        const buyPrice = market ? market.calcCargoBuyPrices().getAmount(ct) : -1
        const route = new Route(fleet, planet)
        const distance = calcDistance(fleet.x, fleet.y, planet.x, planet.y)
        const distScore = 2*(INNER_SOLAR_SYSTEM_RADIUS_IN_AU-distance)/INNER_SOLAR_SYSTEM_RADIUS_IN_AU
        console.log('created route:',route)
        rows.push([
            coloredName(planet),
            !market ? 'N/A' : statColorSpan(buyPrice, ct.value/buyPrice),
            !market ? 'N/A' : statColorSpan(market.cargo.getAmount(ct), market.cargo.getAmount(ct)/MARKET_MAX_CARGO_PER_TYPE),
            statColorSpan(round(distance, 2), distScore),
            statColorSpan(describeTimespan(route.travelTime), distScore),
        ])
    }
    return createTable(rows, (rowIndex = 0)=>onSelectPlanet(planets[rowIndex]))
}

function createTradeInfoSellTable(ct = CARGO_TYPES_ALL[0], onSelectPlanet = (p = PLANETS[0])=>{}) {
    const {illegal} = ct
    const {system, fleet} = gs
    const {planets} = system
    const rows = [
        ['Planet', 'Sell Price', 'Market CR', 'Distance', 'ETA']
    ]
    for (const planet of planets) {
        const market = illegal ? planet.settlement.blackMarket : planet.settlement.market
        const sellPrice = market ? market.calcCargoSellPrices().getAmount(ct) : -1
        const route = new Route(fleet, planet)
        const distance = calcDistance(fleet.x, fleet.y, planet.x, planet.y)
        const distScore = 2*(INNER_SOLAR_SYSTEM_RADIUS_IN_AU-distance)/INNER_SOLAR_SYSTEM_RADIUS_IN_AU
        rows.push([
            coloredName(planet),
            !market ? 'N/A' : statColorSpan(sellPrice, sellPrice/ct.value),
            !market ? 'N/A' : statColorSpan(market.credits, 2*market.credits/MARKET_MAX_CREDITS),
            statColorSpan(round(distance, 2), distScore),
            statColorSpan(describeTimespan(route.travelTime), distScore),
        ])
    }
    return createTable(rows, (rowIndex = 0)=>onSelectPlanet(planets[rowIndex]))
}

function showTradeInfoSellMenu(ct = CARGO_TYPES_ALL[0]) {
    const {fleet} = gs

    function onSelectPlanet(planet = new Planet()) {
        showStarMap(planet)
    }

    const options = []
    for (const cto of CARGO_TYPES_ALL) {
        const amt = fleet.cargo.getAmount(cto)
        options.push([`${cto.name}: ${amt}`, ()=>showTradeInfoSellMenu(cto), (ct == cto)])
    }
    options.push(
        ["Buy Info", () => showTradeInfoBuyMenu(ct)],
        ["Close", () => closeModal()],
    )

    showModal(
        `Trade Info - Sell ${ct.name}`,
        createElement({children:[
            createTradeInfoSellTable(ct, onSelectPlanet),
            `Your ${ct.name} amt: ${fleet.cargo.getAmount(ct)}`,
        ]}),
        options
    );
}

function showTradeInfoBuyMenu(ct = CARGO_TYPES_ALL[0]) {
    const {fleet} = gs

    function onSelectPlanet(planet = new Planet()) {
        showStarMap(planet)
    }

    const options = []
    for (const cto of CARGO_TYPES_ALL) {
        options.push([`${cto.name}`, ()=>showTradeInfoBuyMenu(cto), (ct == cto)])
    }
    options.push(
        ["Sell Info", () => showTradeInfoSellMenu(ct)],
        ["Close", () => closeModal()],
    )

    showModal(
        `Trade Info - Buy ${ct.name}`,
        createElement({children:[
            createTradeInfoBuyTable(ct, onSelectPlanet),
            `Your ${ct.name} amt: ${fleet.cargo.getAmount(ct)} | Your Cargo Space: ${fleet.cargo.total}/${fleet.calcTotalCargoSpace()} | Your credits: ${gs.credits}`,
        ]}),
        options
    );
}
