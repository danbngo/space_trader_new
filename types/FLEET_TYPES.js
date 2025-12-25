
class FleetType {
    constructor(name = '', shipTypes = [], minShips = 1, maxShips = 1, maxCredits = 1, cargoTypes = []) {
        this.name = name
        this.shipTypes = shipTypes
        this.minShips = minShips
        this.maxShips = maxShips
        this.maxCredits = maxCredits
        this.cargoTypes = cargoTypes
    }
}

const FLEET_TYPES = {
    POLICE: new FleetType('Police', [SHIP_TYPES.PATROL_SHIP], 1, 5, 500, []),
    PIRATES: new FleetType('Pirates', [SHIP_TYPES.FIGHTER, SHIP_TYPES.BATTLESHIP, SHIP_TYPES.SCOUT], 1, 5, 10000, CARGO_TYPES_ALL),
    MERCHANTS: new FleetType('Merchants', [SHIP_TYPES.FREIGHTER, SHIP_TYPES.GUARD_SHIP], 1, 5, 10000, CARGO_TYPES_ALL.filter(ct=>(!ct.illegal))),
    MINERS: new FleetType('Miners', [SHIP_TYPES.MINING_SHIP], 1, 3, 10000, [CARGO_TYPES.ICE, CARGO_TYPES.METAL, CARGO_TYPES.ISOTOPES]),
    BOUNTY_HUNTERS: new FleetType('Bounty Hunters', [SHIP_TYPES.DESTROYER, SHIP_TYPES.SCOUT], 1, 3, 2500, []),
    SMUGGLERS: new FleetType('Smugglers', [SHIP_TYPES.BLOCKADE_RUNNER], 1, 3, 5000, [CARGO_TYPES.DRUGS, CARGO_TYPES.CLONES, CARGO_TYPES.WEAPONS]),
    SOLDIERS: new FleetType('Soldiers', [SHIP_TYPES.BATTLESHIP, SHIP_TYPES.DESTROYER, SHIP_TYPES.SCOUT, SHIP_TYPES.FIGHTER], 3, 7, 500, [CARGO_TYPES.WEAPONS]),
    //SCOUTING_PARTY: new FleetType('Scouting Party', [SHIP_TYPES.SCOUT], 1, 3, []),
    TOURISTS: new FleetType('Tourists', [SHIP_TYPES.PASSENGER_SHIP, SHIP_TYPES.GUARD_SHIP], 1, 3, 10000, []),
    //EXPLORERS: new FleetType('Explorers', [SHIP_TYPES.SCOUT, SHIP_TYPES.SHUTTLE], 1, 3, [CARGO_TYPES.BIOGEL, CARGO_TYPES.HOLOCUBES, CARGO_TYPES.NANITES]),
    ASTEROIDS: new FleetType('Asteroids', [ASTEROID_SHIP_TYPES.ASTEROID], 15, 30, 0, [CARGO_TYPES.METAL, CARGO_TYPES.ICE, CARGO_TYPES.METAL, CARGO_TYPES.ICE, CARGO_TYPES.METAL, CARGO_TYPES.ICE, CARGO_TYPES.ISOTOPES]),
    CRYOIDS: new FleetType('Cryoids', [ASTEROID_SHIP_TYPES.CRYOID], 15, 30, 0, [CARGO_TYPES.METAL, CARGO_TYPES.ICE, CARGO_TYPES.ICE, CARGO_TYPES.ICE, CARGO_TYPES.ISOTOPES]),
    PLASMOIDS: new FleetType('Plasmoids', [ASTEROID_SHIP_TYPES.PLASMOID], 15, 30, 0, [CARGO_TYPES.ISOTOPES]),
}

const FLEET_TYPES_ALL = Object.values(FLEET_TYPES)

