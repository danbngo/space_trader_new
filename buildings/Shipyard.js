/**
 * A building where ships and modules can be bought and sold.
 * @class Shipyard
 * @extends {Building}
 */
class Shipyard extends Building {
    /**
     * @param {Planet} planet - The planet this shipyard is on.
     * @param {Ship[]} ships - The ships available for purchase.
     * @param {ShipModule[]} modules - The modules available for purchase.
     * @param {number} credits - The credits available at this shipyard.
     * @param {number} baseRake - The base commission percentage.
     */
    constructor(planet = new Planet(), ships = [], modules = [], credits = 0, baseRake = 1) {
        super(planet, BUILDING_TYPES.SHIPYARD, baseRake, credits)
        /** @type {Ship[]} */
        this.ships = ships; // Ship[]
        /** @type {ShipModule[]} */
        this.modules = modules; // ShipModule[]
        /** @type {number} */
        this.baseNumShips = ships.length
        /** @type {number} */
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
