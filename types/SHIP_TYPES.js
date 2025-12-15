
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
    TRANSPORT: new ShipType('Transport', 0.25, 0.25, 0.25, 2, 0.5),
    CRUISE_SHIP: new ShipType('Cruise Ship', 2, 0.5, 0.25, 1, 2),
    CARGO_SHIP: new ShipType('Cargo Ship', 1, 0.25, 0.25, 2, 4),
    SCOUT: new ShipType('Scout', 0.5, 0.5, 0.5, 3, 0.5),
    DESTROYER: new ShipType('Destroyer', 2, 2, 4, 1, 0.5),
    BATTLESHIP: new ShipType('Battleship', 4, 4, 3, 0.5, 1),
    MINING_SHIP: new ShipType('Mining Ship', 2, 1, 1, 0.5, 2),
    FIGHTER: new ShipType('Fighter', 1, 2, 2, 1, 0.25),
}

const SHIP_TYPES_ALL = Object.values(SHIP_TYPES)
