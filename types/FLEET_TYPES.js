
/**
 * Represents a type of fleet that can be encountered.
 * @class FleetType
 */
class FleetType {
    /**
     * @param {string} name - The name of the fleet type.
     * @param {ShipType[]} shipTypes - The types of ships this fleet can contain.
     * @param {number} minShips - The minimum number of ships in this fleet type.
     * @param {number} maxShips - The maximum number of ships in this fleet type.
     * @param {number} maxCredits - The maximum credits this fleet can carry.
     * @param {CargoType[]} cargoTypes - The types of cargo this fleet can carry.
     * @param {number} voyageYears - The voyage duration in years for this fleet type.
     */
    constructor(name = '', shipTypes = [], minShips = 1, maxShips = 1, maxCredits = 1, cargoTypes = [], voyageYears = 0.08, targetMaxDistance = Infinity) {
        /** @type {string} */
        this.name = name
        /** @type {ShipType[]} */
        this.shipTypes = shipTypes
        /** @type {number} */
        this.minShips = minShips
        /** @type {number} */
        this.maxShips = maxShips
        /** @type {number} */
        this.voyageYears = voyageYears
        /** @type {number} */
        this.targetMaxDistance = targetMaxDistance
        /** @type {number} */
        this.maxCredits = maxCredits
        /** @type {CargoType[]} */
        this.cargoTypes = cargoTypes
    }
}

class PseudoFleetType extends FleetType {
    constructor(name = '', shipTypes = [], minShips = 1, maxShips = 1, cargoTypes = []) {
        super(name, shipTypes, minShips, maxShips, 0, cargoTypes, 0)
    }
}

const AVG_CR = 5000 //something like a basic unit of credits per fleet
const AVG_DR = 1/2 //average voyage is max 6 months

const FLEET_TYPES = {
    SOLDIERS: new FleetType('Soldiers', [SHIP_TYPES.BATTLESHIP], 3, 5, AVG_CR*CL.LOW, [CARGO_TYPES.FOOD, CARGO_TYPES.WATER, CARGO_TYPES.WEAPONS, CARGO_TYPES.ANTIMATTER], AVG_DR*CL.SLIGHTLY_HIGH, CHASE_DISTANCES.NEAR),
    POLICE: new FleetType('Police', [SHIP_TYPES.INTERCEPTOR], 1, 5, AVG_CR*CL.LOW, [], AVG_DR*CL.SLIGHTLY_LOW, CHASE_DISTANCES.FAR),
    PIRATES: new FleetType('Pirates', [SHIP_TYPES.RAIDER], 1, 5, AVG_CR*CL.VERY_HIGH, CARGO_TYPES_ALL, AVG_DR*CL.MEDIUM, CHASE_DISTANCES.NEAR),
    MERCHANTS: new FleetType('Merchants', [SHIP_TYPES.HAULER], 1, 5, AVG_CR*CL.EXTREMELY_HIGH, CARGO_TYPES_ALL.filter(ct=>(!ct.illegal)), AVG_DR*CL.SLIGHTLY_HIGH),
    MINERS: new FleetType('Miners', [SHIP_TYPES.TANKER], 1, 3, AVG_CR*CL.VERY_LOW, [CARGO_TYPES.FOOD, CARGO_TYPES.WATER, CARGO_TYPES.METAL, CARGO_TYPES.ISOTOPES], AVG_DR*CL.EXTREMELY_HIGH, Infinity),
}

const PSEUDO_FLEET_TYPES = {
    ABANDONED_SHIP: new PseudoFleetType('Abandoned Ship', [...SHIP_TYPES_ALL], 1, 1, CARGO_TYPES_ALL),
    ASTEROIDS_STORM: new PseudoFleetType('Asteroid Storm', [ASTEROID_SHIP_TYPES.ASTEROID], 5, 7, [CARGO_TYPES.METAL, CARGO_TYPES.WATER, CARGO_TYPES.METAL, CARGO_TYPES.WATER, CARGO_TYPES.METAL, CARGO_TYPES.WATER, CARGO_TYPES.ISOTOPES]),
    ASTEROIDS_CALM: new PseudoFleetType('Asteroid Field', [ASTEROID_SHIP_TYPES.ASTEROID], 1, 3, [CARGO_TYPES.METAL, CARGO_TYPES.WATER, CARGO_TYPES.METAL, CARGO_TYPES.WATER, CARGO_TYPES.METAL, CARGO_TYPES.WATER, CARGO_TYPES.ISOTOPES]),
}

const FLEET_TYPES_ALL = Object.values(FLEET_TYPES)

const PLAYER_FLEET_TYPE = new FleetType('Player Fleet', [], 0, 0, 0, [], 0)
