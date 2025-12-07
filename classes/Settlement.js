// Shipyard class
class Shipyard {
    constructor(planet = new Planet(), ships = [], credits = 0, rake = 0) {
        this.planet = planet
        this.ships = ships; // Ship[]
        this.credits = credits;
        this.rake = rake
    }
    calcBuyPrice(ship = new Ship()) {
        return Math.round(ship.value / (1+this.rake))
    }
    calcSellPrice(ship = new Ship()) {
        return Math.round(ship.value * (1+this.rake))
    }
}

// Guild class
class Guild {
    constructor(planet = new Planet(), officers = [], rake = 0) {
        this.planet = planet
        this.officers = officers; // Officer[]
        this.rake = rake
    }
}

// Market class
class Market {
    constructor(planet = new Planet(), cargo = [], credits = 0, rake = 0) {
        this.planet = planet
        this.cargo = cargo; // Cargo[]
        this.credits = credits;
        this.rake = rake
    }

    calcCargoBuyPrices() {
        const prices = new Cargo()
        for (const cargoType of CARGO_TYPES_ALL) {
            const price = Math.round(cargoType.value * this.planet.culture.cargoPriceModifiers.getAmount(cargoType) * (1+this.rake))
            prices.setAmount(cargoType, price)
        }
        return prices
    }

    calcCargoSellPrices() {
        const prices = new Cargo()
        for (const cargoType of CARGO_TYPES_ALL) {
            const price = Math.round(cargoType.value * this.planet.culture.cargoPriceModifiers.getAmount(cargoType) / (1+this.rake))
            prices.setAmount(cargoType, price)
        }
        return prices
    }
}

class Settlement {
    constructor(shipyard = null, market = null, blackMarket = null, guild = null) {
        this.shipyard = shipyard;
        this.market = market;
        this.blackMarket = blackMarket;
        this.guild = guild;
    }
}
