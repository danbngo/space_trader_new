
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
     * @param {number} voyageMinYears - The minimum voyage years for this fleet type.
     * @param {number} voyageMaxYears - The maximum voyage years for this fleet type.
     */
    constructor(name = '', shipTypes = [], minShips = 1, maxShips = 1, maxCredits = 1, cargoTypes = [], voyageMinYears = 1, voyageMaxYears = 5, targetMaxDistance = Infinity) {
        /** @type {string} */
        this.name = name
        /** @type {ShipType[]} */
        this.shipTypes = shipTypes
        /** @type {number} */
        this.minShips = minShips
        /** @type {number} */
        this.maxShips = maxShips
        /** @type {number} */
        this.voyageMinYears = voyageMinYears
        /** @type {number} */
        this.voyageMaxYears = voyageMaxYears
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
        super(name, shipTypes, minShips, maxShips, 0, cargoTypes, 0, 0)
    }
}

const FLEET_TYPES = {
    SOLDIERS: new FleetType('Soldiers', [SHIP_TYPES.BATTLESHIP, SHIP_TYPES.DESTROYER, SHIP_TYPES.SCOUT, SHIP_TYPES.FIGHTER], 3, 7, 500, [CARGO_TYPES.WEAPONS], 4, 12, CHASE_DISTANCES.NEAR),
    POLICE: new FleetType('Police', [SHIP_TYPES.PATROL_SHIP], 1, 5, 500, [], 2, 6, CHASE_DISTANCES.FAR),
    BOUNTY_HUNTERS: new FleetType('Bounty Hunters', [SHIP_TYPES.DESTROYER, SHIP_TYPES.SCOUT], 1, 3, 2500, [], 3, 10, CHASE_DISTANCES.FAR),

    PIRATES: new FleetType('Pirates', [SHIP_TYPES.FIGHTER, SHIP_TYPES.BATTLESHIP, SHIP_TYPES.SCOUT], 1, 5, 10000, CARGO_TYPES_ALL, 3, 8, CHASE_DISTANCES.NEAR),
    SLAVERS: new FleetType('Slavers', [SHIP_TYPES.FIGHTER, SHIP_TYPES.DESTROYER], 2, 4, 7000, [], 3, 7, CHASE_DISTANCES.NEAR),

    MERCHANTS: new FleetType('Merchants', [SHIP_TYPES.FREIGHTER, SHIP_TYPES.GUARD_SHIP], 1, 5, 10000, CARGO_TYPES_ALL.filter(ct=>(!ct.illegal)), 4, 10),
    MINERS: new FleetType('Miners', [SHIP_TYPES.MINING_SHIP], 1, 3, 10000, [CARGO_TYPES.FOOD, CARGO_TYPES.WATER, CARGO_TYPES.METAL, CARGO_TYPES.ISOTOPES], 2, 5, Infinity),
    TOURISTS: new FleetType('Tourists', [SHIP_TYPES.PASSENGER_SHIP, SHIP_TYPES.GUARD_SHIP], 1, 3, 10000, [], 5, 15),
    COLONISTS: new FleetType('Colonists', [SHIP_TYPES.PASSENGER_SHIP, SHIP_TYPES.GUARD_SHIP], 1, 3, 4000, [], 10, 20),
    SCIENTISTS: new FleetType('Scientists', [SHIP_TYPES.SCOUT], 1, 3, 3000, [CARGO_TYPES.RELICS, CARGO_TYPES.ISOTOPES, CARGO_TYPES.NANITES], 3, 8),
    PILGRIMS: new FleetType('Pilgrims', [SHIP_TYPES.PASSENGER_SHIP], 1, 3, 2000, [CARGO_TYPES.RELICS], 5, 15),
    INQUISITORS: new FleetType('Inquisitors', [SHIP_TYPES.PATROL_SHIP, SHIP_TYPES.DESTROYER], 2, 4, 3000, [CARGO_TYPES.RELICS], 3, 10, CHASE_DISTANCES.NEAR),
    MISSIONARIES: new FleetType('Missionaries', [SHIP_TYPES.SHUTTLE], 1, 2, 1500, [CARGO_TYPES.RELICS], 4, 12),

    SMUGGLERS: new FleetType('Smugglers', [SHIP_TYPES.BLOCKADE_RUNNER], 1, 3, 5000, [CARGO_TYPES.DRUGS, CARGO_TYPES.ANTIMATTER, CARGO_TYPES.WEAPONS], 3, 8),
}

const PSEUDO_FLEET_TYPES = {
    ABANDONED_SHIP: new PseudoFleetType('Abandoned Ship', [SHIP_TYPES.FREIGHTER, SHIP_TYPES.MINING_SHIP, SHIP_TYPES.PASSENGER_SHIP, SHIP_TYPES.BLOCKADE_RUNNER], 1, 1, CARGO_TYPES_ALL),
    ASTEROIDS_STORM: new PseudoFleetType('Asteroid Storm', [ASTEROID_SHIP_TYPES.ASTEROID], 30, 50, [CARGO_TYPES.FOOD, CARGO_TYPES.METAL, CARGO_TYPES.WATER, CARGO_TYPES.METAL, CARGO_TYPES.WATER, CARGO_TYPES.METAL, CARGO_TYPES.WATER, CARGO_TYPES.ISOTOPES]),
    ASTEROIDS_CALM: new PseudoFleetType('Asteroid Field', [ASTEROID_SHIP_TYPES.ASTEROID], 10, 20, [CARGO_TYPES.FOOD, CARGO_TYPES.METAL, CARGO_TYPES.WATER, CARGO_TYPES.METAL, CARGO_TYPES.WATER, CARGO_TYPES.METAL, CARGO_TYPES.WATER, CARGO_TYPES.ISOTOPES]),
    CRYOIDS_STORM: new PseudoFleetType('Cryoid Storm', [ASTEROID_SHIP_TYPES.CRYOID], 30, 50, [CARGO_TYPES.FOOD, CARGO_TYPES.METAL, CARGO_TYPES.WATER, CARGO_TYPES.WATER, CARGO_TYPES.WATER, CARGO_TYPES.ISOTOPES]),
    CRYOIDS_CALM: new PseudoFleetType('Cryoid Field', [ASTEROID_SHIP_TYPES.CRYOID], 10, 20, [CARGO_TYPES.FOOD, CARGO_TYPES.METAL, CARGO_TYPES.WATER, CARGO_TYPES.WATER, CARGO_TYPES.WATER, CARGO_TYPES.ISOTOPES]),
    PLASMOIDS_STORM: new PseudoFleetType('Plasmoid Storm', [ASTEROID_SHIP_TYPES.PLASMOID], 30, 50, [CARGO_TYPES.ANTIMATTER]),
    PLASMOIDS_CALM: new PseudoFleetType('Plasmoid Field', [ASTEROID_SHIP_TYPES.PLASMOID], 10, 20, [CARGO_TYPES.ANTIMATTER]),
    MAGNETOIDS_STORM: new PseudoFleetType('Magnetoid Storm', [ASTEROID_SHIP_TYPES.MAGNETOID], 30, 50, [CARGO_TYPES.ISOTOPES]),
    MAGNETOIDS_CALM: new PseudoFleetType('Magnetoid Field', [ASTEROID_SHIP_TYPES.MAGNETOID], 10, 20, [CARGO_TYPES.ISOTOPES]),
    // Legacy names for backward compatibility
}

const FLEET_TYPES_ALL = Object.values(FLEET_TYPES)

const PLAYER_FLEET_TYPE = new FleetType('Player Fleet', [], 0, 0, 0, [], 0, 0)
