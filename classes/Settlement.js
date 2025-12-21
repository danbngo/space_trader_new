class ShipyardState {
    constructor(playerShips = [new Ship()], playerCredits = 0, shipyardShips = [new Ship()], shipyardCredits = 0) {
        this.playerShips = playerShips;
        this.playerCredits = playerCredits;
        this.shipyardShips = shipyardShips;
        this.shipyardCredits = shipyardCredits;
    }
}

class Building {
    constructor(planet = new Planet(), baseRake = 1, credits = 0) {
        this.planet = planet
        this.baseRake = baseRake
        this.credits = credits
    }
    get rake() {
        console.log('Calculating rake for building on planet', this.planet.name,'with baseRake', this.baseRake,'and player barter skill', gs.fleet.totalSkills.getAmount(SKILLS.Barter),'skills:',gs.fleet.totalSkills)
        return this.baseRake/(1 + gs.fleet.totalSkills.getAmount(SKILLS.Barter)/50)
    }

}

class Shipyard extends Building {
    constructor(planet = new Planet(), ships = [], credits = 0, baseRake = 1) {
        super(planet, baseRake, credits)
        this.ships = ships; // Ship[]
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
class Guild extends Building {
    constructor(planet = new Planet(), officers = [], baseRake = 1) {
        super(planet, baseRake)
        this.officers = officers; // Officer[]
    }
    calcHirePrice(officer = new Officer()) {
        return Math.round(officer.value * (1+this.rake))
    }
}

class Market extends Building {
    constructor(planet = new Planet(), blackMarket = false, cargo = [], credits = 0, baseRake = 1) {
        super(planet, baseRake, credits)
        this.blackMarket = blackMarket;
        this.cargo = cargo; // Cargo[]
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

class Bank extends Building {
    static playerBalance = 0 //might need to improve this later if like..multiplayer becomes a thing

    constructor(planet = new Planet(), credits = 0, baseRake = 1) {
        super(planet, baseRake, credits)
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
        maxLoanAmount -= officer.calcTotalDebts()
        return Math.floor(maxLoanAmount)
    }
}

class Courthouse extends Building {
    constructor(planet = new Planet(), baseRake = 1) {
        super(planet, baseRake)
    }
    calcPayBountyPenalty(bountyAmount = 0) {
        return Math.ceil( bountyAmount * Math.pow(0.01, 1/(1+this.rake)) )
    }
}


class Settlement {
    constructor(shipyard = null, market = null, blackMarket = null, guild = null, bank = null, courthouse = null) {
        this.shipyard = shipyard;
        this.market = market;
        this.blackMarket = blackMarket;
        this.guild = guild;
        this.bank = bank;
        this.courthouse = courthouse;
    }
}
