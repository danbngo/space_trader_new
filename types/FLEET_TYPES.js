
class FleetType {
    constructor(name = '', shipTypes = [], minShips = 1, maxShips = 1, cargoTypes = []) {
        this.name = name
        this.shipTypes = shipTypes
        this.minShips = minShips
        this.maxShips = maxShips
        this.cargoTypes = cargoTypes
    }
}

const FLEET_TYPES = {
    PATROL: new FleetType('Patrol', [SHIP_TYPES.GUARD_SHIP], 1, 5, []),
    PIRATES: new FleetType('Pirates', [SHIP_TYPES.FIGHTER, SHIP_TYPES.BATTLESHIP], 1, 5, CARGO_TYPES_ALL),
    MERCHANTS: new FleetType('Merchants', [SHIP_TYPES.FREIGHTER, SHIP_TYPES.GUARD_SHIP], 1, 5, CARGO_TYPES_ALL.filter(ct=>(!ct.illegal))),
    MINERS: new FleetType('Miners', [SHIP_TYPES.MINING_SHIP], 1, 3, [CARGO_TYPES.ICE, CARGO_TYPES.METAL, CARGO_TYPES.ISOTOPES]),
    BOUNTY_HUNTERS: new FleetType('Bounty Hunters', [SHIP_TYPES.DESTROYER, SHIP_TYPES.SCOUT], 1, 3, []),
    SMUGGLERS: new FleetType('Smugglers', [SHIP_TYPES.BLOCKADE_RUNNER], 1, 3, [CARGO_TYPES.DRUGS, CARGO_TYPES.CLONES, CARGO_TYPES.WEAPONS]),
    WAR_FLEET: new FleetType('War Fleet', [SHIP_TYPES.BATTLESHIP, SHIP_TYPES.DESTROYER, SHIP_TYPES.SCOUT], 1, 5, []),
    //SCOUTING_PARTY: new FleetType('Scouting Party', [SHIP_TYPES.SCOUT], 1, 3, []),
    CRUISE_FLEET: new FleetType('Cruise Fleet', [SHIP_TYPES.PASSENGER_SHIP], 1, 3, [CARGO_TYPES.BIOGEL, CARGO_TYPES.HOLOCUBES, CARGO_TYPES.NANITES]),
    //EXPLORERS: new FleetType('Explorers', [SHIP_TYPES.SCOUT, SHIP_TYPES.SHUTTLE], 1, 3, [CARGO_TYPES.BIOGEL, CARGO_TYPES.HOLOCUBES, CARGO_TYPES.NANITES]),
    ASTEROIDS: new FleetType('Asteroids', [PSEUDO_SHIP_TYPES.ASTEROID], 15, 40, [CARGO_TYPES.METAL, CARGO_TYPES.ICE, CARGO_TYPES.ISOTOPES]),
}

const FLEET_TYPES_ALL = Object.values(FLEET_TYPES)

