
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
     * @param {FactionType|null} faction - The faction this fleet type belongs to.
     */
    constructor(name = '', shipTypes = [], minShips = 1, maxShips = 1, maxCredits = 1, cargoTypes = [], faction = null) {
        /** @type {string} */
        this.name = name
        /** @type {ShipType[]} */
        this.shipTypes = shipTypes
        /** @type {number} */
        this.minShips = minShips
        /** @type {number} */
        this.maxShips = maxShips
        /** @type {number} */
        this.maxCredits = maxCredits
        /** @type {CargoType[]} */
        this.cargoTypes = cargoTypes
        /** @type {FactionType|null} */
        this.faction = faction
    }
}

const FLEET_TYPES = {
    POLICE: new FleetType('Police', [SHIP_TYPES.PATROL_SHIP], 1, 5, 500, [], FACTION_TYPES.POLICE),
    PIRATES: new FleetType('Pirates', [SHIP_TYPES.FIGHTER, SHIP_TYPES.BATTLESHIP, SHIP_TYPES.SCOUT], 1, 5, 10000, CARGO_TYPES_ALL, FACTION_TYPES.PIRATES),
    MERCHANTS: new FleetType('Merchants', [SHIP_TYPES.FREIGHTER, SHIP_TYPES.GUARD_SHIP], 1, 5, 10000, CARGO_TYPES_ALL.filter(ct=>(!ct.illegal)), FACTION_TYPES.MERCHANTS),
    MINERS: new FleetType('Miners', [SHIP_TYPES.MINING_SHIP], 1, 3, 10000, [CARGO_TYPES.FOOD, CARGO_TYPES.WATER, CARGO_TYPES.METAL, CARGO_TYPES.ISOTOPES], FACTION_TYPES.MINERS),
    BOUNTY_HUNTERS: new FleetType('Bounty Hunters', [SHIP_TYPES.DESTROYER, SHIP_TYPES.SCOUT], 1, 3, 2500, [], FACTION_TYPES.BOUNTY_HUNTERS),
    SMUGGLERS: new FleetType('Smugglers', [SHIP_TYPES.BLOCKADE_RUNNER], 1, 3, 5000, [CARGO_TYPES.DRUGS, CARGO_TYPES.ANTIMATTER, CARGO_TYPES.WEAPONS], FACTION_TYPES.SMUGGLERS),
    SLAVERS: new FleetType('Slavers', [SHIP_TYPES.FIGHTER, SHIP_TYPES.DESTROYER], 2, 4, 7000, [], FACTION_TYPES.SLAVERS),
    SOLDIERS: new FleetType('Soldiers', [SHIP_TYPES.BATTLESHIP, SHIP_TYPES.DESTROYER, SHIP_TYPES.SCOUT, SHIP_TYPES.FIGHTER], 3, 7, 500, [CARGO_TYPES.WEAPONS], FACTION_TYPES.SOLDIERS),
    //SCOUTING_PARTY: new FleetType('Scouting Party', [SHIP_TYPES.SCOUT], 1, 3, []),
    TOURISTS: new FleetType('Tourists', [SHIP_TYPES.PASSENGER_SHIP, SHIP_TYPES.GUARD_SHIP], 1, 3, 10000, [], FACTION_TYPES.TOURISTS),
    COLONISTS: new FleetType('Colonists', [SHIP_TYPES.PASSENGER_SHIP, SHIP_TYPES.GUARD_SHIP], 1, 3, 4000, [], FACTION_TYPES.COLONISTS),
    SCIENTISTS: new FleetType('Scientists', [SHIP_TYPES.SCOUT], 1, 3, 3000, [CARGO_TYPES.RELICS, CARGO_TYPES.ISOTOPES, CARGO_TYPES.NANITES], FACTION_TYPES.SCIENTISTS),
    //EXPLORERS: new FleetType('Explorers', [SHIP_TYPES.SCOUT, SHIP_TYPES.SHUTTLE], 1, 3, [CARGO_TYPES.MEDICINE, CARGO_TYPES.HOLOCUBES, CARGO_TYPES.NANITES]),
    ABANDONED_SHIP: new FleetType('Abandoned Ship', [SHIP_TYPES.FREIGHTER, SHIP_TYPES.MINING_SHIP, SHIP_TYPES.PASSENGER_SHIP, SHIP_TYPES.BLOCKADE_RUNNER], 1, 1, 5000, CARGO_TYPES_ALL, null),
    ASTEROIDS_STORM: new FleetType('Asteroid Storm', [ASTEROID_SHIP_TYPES.ASTEROID], 30, 50, 0, [CARGO_TYPES.FOOD, CARGO_TYPES.METAL, CARGO_TYPES.WATER, CARGO_TYPES.METAL, CARGO_TYPES.WATER, CARGO_TYPES.METAL, CARGO_TYPES.WATER, CARGO_TYPES.ISOTOPES], null),
    ASTEROIDS_CALM: new FleetType('Asteroid Field', [ASTEROID_SHIP_TYPES.ASTEROID], 10, 20, 0, [CARGO_TYPES.FOOD, CARGO_TYPES.METAL, CARGO_TYPES.WATER, CARGO_TYPES.METAL, CARGO_TYPES.WATER, CARGO_TYPES.METAL, CARGO_TYPES.WATER, CARGO_TYPES.ISOTOPES], null),
    CRYOIDS_STORM: new FleetType('Cryoid Storm', [ASTEROID_SHIP_TYPES.CRYOID], 30, 50, 0, [CARGO_TYPES.FOOD, CARGO_TYPES.METAL, CARGO_TYPES.WATER, CARGO_TYPES.WATER, CARGO_TYPES.WATER, CARGO_TYPES.ISOTOPES], null),
    CRYOIDS_CALM: new FleetType('Cryoid Field', [ASTEROID_SHIP_TYPES.CRYOID], 10, 20, 0, [CARGO_TYPES.FOOD, CARGO_TYPES.METAL, CARGO_TYPES.WATER, CARGO_TYPES.WATER, CARGO_TYPES.WATER, CARGO_TYPES.ISOTOPES], null),
    PLASMOIDS_STORM: new FleetType('Plasmoid Storm', [ASTEROID_SHIP_TYPES.PLASMOID], 30, 50, 0, [CARGO_TYPES.ANTIMATTER], null),
    PLASMOIDS_CALM: new FleetType('Plasmoid Field', [ASTEROID_SHIP_TYPES.PLASMOID], 10, 20, 0, [CARGO_TYPES.ANTIMATTER], null),
    MAGNETOIDS_STORM: new FleetType('Magnetoid Storm', [ASTEROID_SHIP_TYPES.MAGNETOID], 30, 50, 0, [CARGO_TYPES.ISOTOPES], null),
    MAGNETOIDS_CALM: new FleetType('Magnetoid Field', [ASTEROID_SHIP_TYPES.MAGNETOID], 10, 20, 0, [CARGO_TYPES.ISOTOPES], null),
    // Legacy names for backward compatibility
    ASTEROIDS: new FleetType('Asteroids', [ASTEROID_SHIP_TYPES.ASTEROID], 30, 50, 0, [CARGO_TYPES.FOOD, CARGO_TYPES.METAL, CARGO_TYPES.WATER, CARGO_TYPES.METAL, CARGO_TYPES.WATER, CARGO_TYPES.METAL, CARGO_TYPES.WATER, CARGO_TYPES.ISOTOPES], null),
    CRYOIDS: new FleetType('Cryoids', [ASTEROID_SHIP_TYPES.CRYOID], 30, 50, 0, [CARGO_TYPES.FOOD, CARGO_TYPES.METAL, CARGO_TYPES.WATER, CARGO_TYPES.WATER, CARGO_TYPES.WATER, CARGO_TYPES.ISOTOPES], null),
    PLASMOIDS: new FleetType('Plasmoids', [ASTEROID_SHIP_TYPES.PLASMOID], 30, 50, 0, [CARGO_TYPES.ANTIMATTER], null),
    MAGNETOIDS: new FleetType('Magnetoids', [ASTEROID_SHIP_TYPES.MAGNETOID], 30, 50, 0, [CARGO_TYPES.ISOTOPES], null),
}

const FLEET_TYPES_ALL = Object.values(FLEET_TYPES)

