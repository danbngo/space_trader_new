class ShipyardState {
    constructor(playerShips = [new Ship()], playerCredits = 0, shipyardShips = [new Ship()], shipyardCredits = 0) {
        this.playerShips = playerShips;
        this.playerCredits = playerCredits;
        this.shipyardShips = shipyardShips;
        this.shipyardCredits = shipyardCredits;
    }
}

// Shipyard class
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
        this.state = new ShipyardState([...gameState.fleet.ships], gameState.fleet.captain.credits, [...shipyard.ships], shipyard.credits)
    }
    static restoreState() {
        gameState.fleet.ships = [...this.state.playerShips]
        gameState.fleet.captain.credits = this.state.playerCredits
        this.ships = [...this.state.shipyardShips]
        this.credits = this.state.shipyardCredits
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
    calcHirePrice(officer = new Officer()) {
        return Math.round(officer.value / (1+this.rake))
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

class Settlement {
    constructor(shipyard = null, market = null, blackMarket = null, guild = null) {
        this.shipyard = shipyard;
        this.market = market;
        this.blackMarket = blackMarket;
        this.guild = guild;
    }
}
