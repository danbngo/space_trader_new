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
        this.baseCredits = credits //gradually revert back towards this amount over time
        this.enabled = true
    }
    normalize() {
        this.credits = this.baseCredits
    }
    get rake() {
        console.log('Calculating rake for building on planet', this.planet.name,'with baseRake', this.baseRake,'and player barter skill', gs.fleet.totalSkills.getAmount(SKILLS.Barter),'skills:',gs.fleet.totalSkills)
        return this.baseRake/(1 + gs.fleet.totalSkills.getAmount(SKILLS.Barter)/50)
    }

}

class Shipyard extends Building {
    constructor(planet = new Planet(), ships = [], modules = [], credits = 0, baseRake = 1) {
        super(planet, baseRake, credits)
        this.ships = ships; // Ship[]
        this.modules = modules; // ShipModule[]
        this.baseNumShips = ships.length
        this.baseNumModules = modules.length
    }
    normalize(clearExisting = false) {
        super.normalize()
        if (clearExisting) {
            this.ships = []
            this.modules = []
        }
        const shipDiffFromBase = this.ships.length - this.baseNumShips
        if (shipDiffFromBase > 0) {
            this.ships.splice(0, shipDiffFromBase)
        } else if (shipDiffFromBase < 0) {
            for (let i = 0; i < -shipDiffFromBase; i++) {
                this.ships.push(generateShip(this.planet))
            }
        }
        const moduleDiffFromBase = this.modules.length - this.baseNumModules
        if (moduleDiffFromBase > 0) {
            this.modules.splice(0, moduleDiffFromBase)
        } else if (moduleDiffFromBase < 0) {
            for (let i = 0; i < -moduleDiffFromBase; i++) {
                this.modules.push(generateShipModule(this.planet))
            }
        }
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
    calcBuyModulePrice(module = new ShipModule()) {
        return Math.round(module.moduleType.value * module.quality * (1+this.rake))
    }
}

// Guild class
class Guild extends Building {
    constructor(planet = new Planet(), officers = [], baseRake = 1) {
        super(planet, baseRake)
        this.officers = officers; // Officer[]
        this.baseNumOfficers = officers.length
    }
    calcHirePrice(officer = new Officer()) {
        return Math.round(officer.value * (1+this.rake))
    }
    normalize(clearExisting = false) {
        super.normalize()
        if (clearExisting) {
            this.officers = []
        }
        const officerDiffFromBase = this.officers.length - this.baseNumOfficers
        if (officerDiffFromBase > 0) {
            this.officers.splice(0, officerDiffFromBase)
        } else if (officerDiffFromBase < 0) {
            for (let i = 0; i < -officerDiffFromBase; i++) {
                this.officers.push(generateOfficer(this.planet))
            }
        }
    }
}

class Market extends Building {
    constructor(planet = new Planet(), blackMarket = false, cargo = new CountsMap(), credits = 0, baseRake = 1, inflation = 1) {
        super(planet, baseRake, credits)
        this.blackMarket = blackMarket;
        this.cargo = cargo; // Cargo[]
        this.baseCargo = cargo.clone()
        this.inflation = inflation
    }

    normalize() {
        super.normalize()
        this.cargo = this.baseCargo.clone()
    }

    calcCargoBuyPrices() {
        const prices = new CountsMap()
        for (const cargoType of CARGO_TYPES_ALL) {
            const price = Math.round(cargoType.value * this.planet.culture.cargoPriceModifiers.getAmount(cargoType) * (1+this.rake) * this.inflation)
            prices.setAmount(cargoType, price)
        }
        return prices
    }

    calcCargoSellPrices() {
        const prices = new CountsMap()
            for (const cargoType of CARGO_TYPES_ALL) {
            const price = Math.round(cargoType.value * this.planet.culture.cargoPriceModifiers.getAmount(cargoType) / (1+this.rake) * this.inflation)
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
        maxLoanAmount += officer.fame.total*10 - officer.infamy.total*10
        maxLoanAmount += Bank.playerBalance
        maxLoanAmount -= officer.bounty.total
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

class Academy extends Building {
    constructor(planet = new Planet(), skillCosts = new CountsMap(), baseRake = 1) {
        super(planet, baseRake)
        this.skillCosts = skillCosts // CountsMap with skill cost modifiers (0.5-2 range)
    }
    calcSkillUpgradeCost(officer = new Officer(), skill = SKILLS_ALL[0]) {
        // Base cost scales exponentially with current skill level
        const baseCost = 250 * officer.calcSkillPointsToUpgrade(skill, false)
        const skillModifier = this.skillCosts.getAmount(skill) || 1
        return Math.ceil(baseCost * skillModifier * (1 + this.rake))
    }
}


class Settlement {
    constructor(planet = new Planet(), shipyard = null, market = null, blackMarket = null, guild = null, bank = null, courthouse = null, academy = null) {
        this.planet = planet;
        this.shipyard = shipyard;
        this.market = market;
        this.blackMarket = blackMarket;
        this.guild = guild;
        this.bank = bank;
        this.courthouse = courthouse;
        this.academy = academy;
    }

    get buildings() {
        return [this.shipyard, this.market, this.blackMarket, this.guild, this.bank, this.courthouse, this.academy]
    }
}