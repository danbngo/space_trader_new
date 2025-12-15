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
        if (gs.fleet.ships.length == 0) return //dont record if player has no ships left, to allow him to restore
        this.state = new ShipyardState([...gs.fleet.ships], gs.credits, [...shipyard.ships], shipyard.credits)
    }
    static restoreState() {
        gs.fleet.ships = [...this.state.playerShips]
        gs.credits = this.state.playerCredits
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
    static playerBalance = 0 //might need to improve this later if like..multiplayer becomes a thing

    constructor(planet = new Planet(), credits = 0, rake = 0) {
        this.planet = planet;
        this.credits = credits;
        this.rake = rake;
    }
    calcDepositPenalty(depositAmount = 0) {
        return Math.ceil( depositAmount * Math.pow(0.01, 1/(1+this.rake)) )
    }
    calcWithdrawalPenalty(withdrawalAmount = 0) {
        return Math.ceil( withdrawalAmount * Math.pow(0.01, 1/(1+this.rake)) )
    }
    calcLoanInterest(loanAmount = 1, loanDuration = 1) {
        console.log('calculating loan interest:', loanAmount, loanDuration)
        return Math.ceil( loanAmount * Math.pow(0.01*loanDuration, 1/(1+this.rake)) )
    }
    calcLoanMaxAmount(officer = new Officer()) {
        let maxLoanAmount = Math.pow(officer.level, 1.5) * 5000
        maxLoanAmount += officer.fame*10 - officer.infamy*10
        maxLoanAmount += Bank.playerBalance
        maxLoanAmount -= officer.bounty
        maxLoanAmount -= officer.totalDebts
        return Math.floor(maxLoanAmount)
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
