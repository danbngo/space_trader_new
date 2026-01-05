/**
 * A building where ships and modules can be bought and sold.
 * @class Shipyard
 * @extends {Building}
 */
class Shipyard extends Building {
    /**
     * @param {Planet} planet - The planet this shipyard is on.
     */
    constructor(planet = new Planet()) {
        super(planet, BUILDING_TYPES.SHIPYARD)
        /** @type {Ship[]} */
        this.ships = []; // Ship[]
        /** @type {ShipModule[]} */
        this.modules = []; // ShipModule[]
        this.normalize(true)
    }
    get baseNumShips() {
        const multiplier = this.planet?.objectType?.powerMultiplier ?? 1
        return this.planet.c.navy * SHIPYARD_AVERAGE_NUM_SHIPS * this.level * multiplier
    }
    get baseNumModules() {
        const multiplier = this.planet?.objectType?.powerMultiplier ?? 1
        return this.planet.c.navy * SHIPYARD_AVERAGE_NUM_MODULES * this.level * multiplier
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

    /**
     * Get the full buy price calculation breakdown for a ship.
     * @param {Ship} ship - The ship to calculate for.
     * @returns {Calculation} The calculation showing all price factors.
     */
    getBuyPriceCalculation(ship = new Ship()) {
        const calc = new Calculation();
        
        calc.addFactor('merchant markup', 1 + this.planet.c.corruption / 4);
        calc.addFactor('inflation', 1 + this.planet.c.inflationRate / 4);
        calc.addFactor('base taxes', 1 + this.planet.c.taxes / 4);
        calc.addFactor('naval supply', 1 / this.planet.c.navy);
        calc.addFactor('purchase tax', 1 + this.planet.c.taxRate);
        
        return calc;
    }

    calcBuyPrice(ship = new Ship()) {
        const calc = this.getBuyPriceCalculation(ship);
        return Math.round(calc.calculate(ship.value));
    }
    /**
     * Get the full sell price calculation breakdown for a ship.
     * @param {Ship} ship - The ship to calculate for.
     * @returns {Calculation} The calculation showing all price factors.
     */
    getSellPriceCalculation(ship = new Ship()) {
        const calc = new Calculation();
        
        calc.addFactor('merchant discount', 1 / (1 + this.planet.c.corruption / 4));
        calc.addFactor('inflation', 1 + this.planet.c.inflationRate / 4);
        calc.addFactor('base taxes', 1 + this.planet.c.taxes / 4);
        calc.addFactor('naval supply', 1 / this.planet.c.navy);
        calc.addFactor('sale tax', 1 - this.planet.c.taxRate);
        
        return calc;
    }

    calcSellPrice(ship = new Ship()) {
        const calc = this.getSellPriceCalculation(ship);
        return Math.round(calc.calculate(ship.value));
    }
    
    /**
     * Get the full buy module price calculation breakdown.
     * @param {ShipModule} module - The module to calculate for.
     * @returns {Calculation} The calculation showing all price factors.
     */
    getBuyModulePriceCalculation(module = new ShipModule()) {
        const calc = new Calculation();
        
        calc.addFactor('module quality', module.quality);
        calc.addFactor('merchant markup', 1 + this.planet.c.corruption / 4);
        calc.addFactor('inflation', 1 + this.planet.c.inflationRate / 4);
        calc.addFactor('base taxes', 1 + this.planet.c.taxes / 4);
        calc.addFactor('purchase tax', 1 + this.planet.c.taxRate);
        
        return calc;
    }
    
    calcBuyModulePrice(module = new ShipModule()) {
        const calc = this.getBuyModulePriceCalculation(module);
        return Math.round(calc.calculate(module.moduleType.value));
    }

    /**
     * Get the full repair cost calculation breakdown for a ship.
     * @param {Ship} ship - The ship to calculate for.
     * @param {number} amount - Amount of hull to repair.
     * @returns {Calculation} The calculation showing all price factors.
     */
    getRepairCostCalculation(ship = new Ship(), amount = 1) {
        const calc = new Calculation();
        
        calc.addFactor('hull points', amount);
        calc.addFactor('merchant markup', 1 + this.planet.c.corruption / 4);
        calc.addFactor('inflation', 1 + this.planet.c.inflationRate / 4);
        calc.addFactor('base taxes', 1 + this.planet.c.taxes / 4);
        
        return calc;
    }

    /**
     * Calculate the cost to repair a ship.
     * @param {Ship} ship - The ship to repair.
     * @param {number} amount - Amount of hull to repair.
     * @returns {number} The repair cost in credits.
     */
    calculateRepairCost(ship = new Ship(), amount = 1) {
        const calc = this.getRepairCostCalculation(ship, amount);
        return Math.round(calc.calculate(REPAIR_COST_PER_1_HULL));
    }
}


/**
 * Generates a ship module with quality based on planet.
 * @param {Planet} planet - The planet determining module quality.
 * @param {ShipModuleType} moduleType - The type of module to generate.
 * @returns {ShipModule} The generated ship module.
 */
function generateShipModule(planet = new Planet(), moduleType = rndMember(SHIP_MODULE_TYPES_ALL)) {
    const technology = planet ? planet.c.technology : 1
    const quality = rng(2, 0.5, false)*technology
    return new ShipModule(moduleType, quality)
}