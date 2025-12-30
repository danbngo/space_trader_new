/**
 * A building where cargo can be bought and sold.
 * @class Market
 * @extends {Building}
 */
class Market extends Building {
    /**
     * @param {Planet} planet - The planet this market is on.
     * @param {boolean} blackMarket - Whether this is a black market (illegal goods).
     */
    constructor(planet = new Planet(), blackMarket = false) {
        super(planet, BUILDING_TYPES.MARKET)
        /** @type {boolean} */
        this.blackMarket = blackMarket;
        /** @type {CountsMap} */
        this.cargo = new CountsMap();
        this.normalize()
    }

    normalize() {
        super.normalize()
        this.cargo = this.calcBaseCargo()
        //apply a bit of rng
        for (const cargoType of CARGO_TYPES_ALL) {
            const currentAmount = this.cargo.getAmount(cargoType)
            const variation = Math.round(currentAmount * 0.25)
            const newAmount = rng(currentAmount - variation, currentAmount + variation)
            this.cargo.setAmount(cargoType, newAmount)
        }
    }

    calcBaseCargo() {
        const baseCargo = new CountsMap()
        for (const cargoType of CARGO_TYPES_ALL) {
            //simple supply and demand - as price goes up, availability goes down
            const baseAmount = Math.round(MARKET_AVERAGE_CARGO_PER_TYPE/this.planet.civilization.cargoPriceModifiers.getAmount(cargoType))
            const amount = this.blackMarket ? baseAmount * this.planet.civilization.crime : baseAmount * this.planet.civilization.reserves
            baseCargo.setAmount(cargoType, amount)
        }
        return baseCargo
    }

    //sticking with having corruption raise prices even at the black market
    calcCargoBuyPrices() {
        const prices = new CountsMap()
        for (const cargoType of CARGO_TYPES_ALL) {
            const basePrice = cargoType.value * this.planet.civilization.cargoPriceModifiers.getAmount(cargoType)
            const price = 
                this.blackMarket ? Math.round(basePrice * (1+this.planet.civilization.corruption) * this.planet.civilization.inflation / this.planet.civilization.crime)
                : Math.round(basePrice * (1+this.planet.civilization.corruption) * this.planet.civilization.inflation / this.planet.civilization.reserves)
            prices.setAmount(cargoType, price)
        }
        return prices
    }

    calcCargoSellPrices() {
        const prices = new CountsMap()
            for (const cargoType of CARGO_TYPES_ALL) {
            const basePrice = cargoType.value * this.planet.civilization.cargoPriceModifiers.getAmount(cargoType)
            const price = 
                this.blackMarket ? Math.round(basePrice / (1+this.planet.civilization.corruption) * this.planet.civilization.inflation / this.planet.civilization.crime)
                : Math.round(basePrice / (1+this.planet.civilization.corruption) * this.planet.civilization.inflation / this.planet.civilization.reserves)
            prices.setAmount(cargoType, price)
        }
        return prices
    }
}
