
class ShipType {
    constructor(name = '', hull = 1, shields = 1, lasers = 1, thrusters = 1, cargoSpace = 1) {
        this.name = name
        this.hull = hull
        this.shields = shields
        this.lasers = lasers
        this.thrusters = thrusters
        this.cargoSpace = cargoSpace
    }
}

const SHIP_TYPES = {
    TRANSPORT: new ShipType('Transport', 1, 1/2, 1/4, 2, 2),
    CARGO_SHIP: new ShipType('Cargo Ship', 1, 1/4, 1/4, 1, 4),
    SCOUT: new ShipType('Scout', 1, 1, 1, 3, 1/2),
    GUARD_SHIP: new ShipType('Gaurd Ship', 1, 2, 1, 1, 1/2),
    DESTROYER: new ShipType('Destroyer', 2, 2, 4, 1, 1/2),
    BATTLESHIP: new ShipType('Battleship', 4, 4, 3, 1/2, 1),
    MINING_SHIP: new ShipType('Mining Ship', 2, 1, 1, 1/2, 2),
    PRIVATEER: new ShipType('Privateer', 1, 4, 1, 3, 2),
}

const SHIP_TYPES_ALL = Object.values(SHIP_TYPES)
