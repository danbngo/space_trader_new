class ShipyardState {
    constructor(playerShips = [new Ship()], playerCredits = 0, shipyardShips = [new Ship()], shipyardCredits = 0) {
        this.playerShips = playerShips;
        this.playerCredits = playerCredits;
        this.shipyardShips = shipyardShips;
        this.shipyardCredits = shipyardCredits;
    }
}

class Shipyard {
    constructor(planet = new Planet(), ships = [], credits = 0, rake = 0) {
        this.planet = planet
        this.ships = ships; // Ship[]
        this.credits = credits;
        this.rake = rake
    }

    static state = new ShipyardState();

    static recordState(shipyard = new Shipyard()) {
        if (gameState.fleet.ships.length == 0) return //dont record if player has no ships left, to allow him to restore
        this.state = new ShipyardState([...gameState.fleet.ships], gameState.credits, [...shipyard.ships], shipyard.credits)
    }
    static restoreState() {
        gameState.fleet.ships = [...this.state.playerShips]
        gameState.credits = this.state.playerCredits
        this.ships = [...this.state.shipyardShips]
        this.credits = this.state.shipyardCredits
    }

    calcBuyPrice(ship = new Ship()) {
        return Math.round(ship.value * (1+this.rake))
    }
    calcSellPrice(ship = new Ship()) {
        return Math.round(ship.value / (1+this.rake))
    }
}

// Guild class
class Guild {
    constructor(planet = new Planet(), officers = [], rake = 0) {
        this.planet = planet
        this.officers = officers; // Officer[]
        this.rake = rake
    }
    calcHirePrice(officer = new Officer()) {
        return Math.round(officer.value * (1+this.rake))
    }
}

class Market {
    constructor(planet = new Planet(), blackMarket = false, cargo = [], credits = 0, rake = 0) {
        this.planet = planet
        this.blackMarket = blackMarket;
        this.cargo = cargo; // Cargo[]
        this.credits = credits;
        this.rake = rake
    }

    calcCargoBuyPrices() {
        const prices = new CountsMap()
        for (const cargoType of CARGO_TYPES_ALL) {
            const price = Math.round(cargoType.value * this.planet.culture.cargoPriceModifiers.getAmount(cargoType) * (1+this.rake))
            prices.setAmount(cargoType, price)
        }
        return prices
    }

    calcCargoSellPrices() {
        const prices = new CountsMap()
        for (const cargoType of CARGO_TYPES_ALL) {
            const price = Math.round(cargoType.value * this.planet.culture.cargoPriceModifiers.getAmount(cargoType) / (1+this.rake))
            prices.setAmount(cargoType, price)
        }
        return prices
    }
}

class Bank {
    constructor(planet = new Planet(), credits = 0, rake = 0) {
        this.planet = planet;
        this.credits = credits;
    }
}

class BankLoan {
    constructor(amount = 0, dueYear = 0) {
        this.amount = amount
        this.dueYear = dueYear
    }
}

class Settlement {
    constructor(shipyard = null, market = null, blackMarket = null, guild = null, bank = null) {
        this.shipyard = shipyard;
        this.market = market;
        this.blackMarket = blackMarket;
        this.guild = guild;
        this.bank = bank;
    }
}
