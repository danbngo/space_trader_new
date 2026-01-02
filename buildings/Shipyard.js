/**
 * A building where ships and modules can be bought and sold.
 * @class Shipyard
 * @extends {Building}
 */
class Shipyard extends Building {
    /**
     * @param {Planet | DwarfPlanet | SpaceStation} planet - The planet this shipyard is on.
     * @param {Moon} moon - The moon this building is on (null if on planet surface).
     */
    constructor(planet = new Planet(), moon = null) {
        super(planet, BUILDING_TYPES.SHIPYARD, moon)
        /** @type {Ship[]} */
        this.ships = []; // Ship[]
        /** @type {ShipModule[]} */
        this.modules = []; // ShipModule[]
        this.normalize(true)
    }
    get baseNumShips() {
        return this.planet.c.navy * SHIPYARD_AVERAGE_NUM_SHIPS * this.level
    }
    get baseNumModules() {
        return this.planet.c.navy * SHIPYARD_AVERAGE_NUM_MODULES * this.level
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
        const basePrice = Math.round(ship.value * (1+this.planet.c.corruption/4) * (1+this.planet.c.inflation/4) * (1+this.planet.c.taxes/4) / this.planet.c.navy)
        return Math.round(basePrice * (1 + this.planet.c.taxRate))
    }
    calcSellPrice(ship = new Ship()) {
        const basePrice = Math.round(ship.value / (1+this.planet.c.corruption/4) * (1+this.planet.c.inflation/4)  * (1+this.planet.c.taxes/4) / this.planet.c.navy)
        return Math.round(basePrice * (1 - this.planet.c.taxRate))
    }
    calcBuyModulePrice(module = new ShipModule()) {
        const basePrice = Math.round(module.moduleType.value * module.quality * (1+this.planet.c.corruption/4) * (1+this.planet.c.taxes/4) )
        return Math.round(basePrice * (1 + this.planet.c.taxRate))
    }
}


/**
 * Generates a ship module with quality based on planet.
 * @param {Planet | DwarfPlanet | SpaceStation} planet - The planet determining module quality.
 * @param {ShipModuleType} moduleType - The type of module to generate.
 * @returns {ShipModule} The generated ship module.
 */
function generateShipModule(planet = new Planet(), moduleType = rndMember(SHIP_MODULE_TYPES_ALL)) {
    const technology = planet ? planet.c.technology : 1
    const quality = rng(2, 0.5, false)*technology
    return new ShipModule(moduleType, quality)
}