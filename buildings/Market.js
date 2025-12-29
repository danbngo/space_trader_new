/**
 * A building where cargo can be bought and sold.
 * @class Market
 * @extends {Building}
 */
class Market extends Building {
    /**
     * @param {Planet} planet - The planet this market is on.
     * @param {boolean} blackMarket - Whether this is a black market (illegal goods).
     * @param {CountsMap} cargo - The cargo available for purchase.
     * @param {number} credits - The credits available at this market.
     * @param {number} baseRake - The base commission percentage.
     * @param {number} inflation - The inflation multiplier for prices.
     */
    constructor(planet = new Planet(), blackMarket = false, cargo = new CountsMap(), credits = 0, baseRake = 1, inflation = 1) {
        super(planet, BUILDING_TYPES.MARKET, baseRake, credits)
        /** @type {boolean} */
        this.blackMarket = blackMarket;
        /** @type {CountsMap} */
        this.cargo = cargo; // Cargo[]
        /** @type {CountsMap} */
        this.baseCargo = cargo.clone()
        /** @type {number} */
        this.inflation = inflation
    }

    normalize() {
        super.normalize()
        this.cargo = this.baseCargo.clone()
    }

    calcCargoBuyPrices() {
        const prices = new CountsMap()
        for (const cargoType of CARGO_TYPES_ALL) {
            const price = Math.round(cargoType.value * this.planet.civilization.cargoPriceModifiers.getAmount(cargoType) * (1+this.rake) * this.inflation)
            prices.setAmount(cargoType, price)
        }
        return prices
    }

    calcCargoSellPrices() {
        const prices = new CountsMap()
            for (const cargoType of CARGO_TYPES_ALL) {
            const price = Math.round(cargoType.value * this.planet.civilization.cargoPriceModifiers.getAmount(cargoType) / (1+this.rake) * this.inflation)
            prices.setAmount(cargoType, price)
        }
        return prices
    }
}
