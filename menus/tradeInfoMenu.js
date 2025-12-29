/**
 * Creates a table showing buy prices for a cargo type across all planets.
 * @param {CargoType} ct - The cargo type to show buy prices for.
 * @param {(planet: Planet) => void} onSelectPlanet - Callback when a planet is selected.
 * @returns {HTMLTableElement} The trade info table.
 */
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
            !market ? 'N/A' : ''+statColorSpan(buyPrice, ct.value/buyPrice),
            !market ? 'N/A' : ''+statColorSpan(market.cargo.getAmount(ct), market.cargo.getAmount(ct)/MARKET_AVERAGE_CARGO_PER_TYPE),
            ''+statColorSpan(roundToPlaces(distance, 2), distScore),
            ''+statColorSpan(describeTimespan(route.travelTime), distScore),
        ])
    }
    return createTable(rows, (rowIndex = 0)=>onSelectPlanet(planets[rowIndex]))
}
/**
 * Creates a table showing sell prices for a cargo type across all planets.
 * @param {CargoType} ct - The cargo type to show sell prices for.
 * @param {(planet: Planet) => void} onSelectPlanet - Callback when a planet is selected.
 * @returns {HTMLTableElement} The trade info table.
 */
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
            !market ? 'N/A' : ''+statColorSpan(sellPrice, sellPrice/ct.value),
            !market ? 'N/A' : ''+statColorSpan(market.credits, market.credits/MARKET_AVERAGE_CREDITS),
            ''+statColorSpan(roundToPlaces(distance, 2), distScore),
            ''+statColorSpan(describeTimespan(route.travelTime), distScore),
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
        options.push([`${coloredName(cto)}: ${amt}`, ()=>showTradeInfoSellMenu(cto), (ct == cto)])
    }
    options.push(
        ["Buy Info", () => showTradeInfoBuyMenu(ct)],
        ["Close", () => closeModal()],
    )

    showModal(
        `Trade Info - Sell ${coloredName(ct)}`,
        ce({children:[
            createTradeInfoSellTable(ct, onSelectPlanet),
            `Your ${coloredName(ct)} Amount: ${fleet.cargo.getAmount(ct)}`,
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
        options.push([`${coloredName(cto)}`, ()=>showTradeInfoBuyMenu(cto), (ct == cto)])
    }
    options.push(
        ["Sell Info", () => showTradeInfoSellMenu(ct)],
        ["Close", () => closeModal()],
    )

    showModal(
        `Trade Info - Buy ${coloredName(ct)}`,
        ce({children:[
            createTradeInfoBuyTable(ct, onSelectPlanet),
            `Your ${coloredName(ct)} Amount: ${fleet.cargo.getAmount(ct)} | Your Cargo Space: ${fleet.cargo.total}/${fleet.totalCargoSpace} | Your credits: ${gs.credits}`,
        ]}),
        options
    );
}
