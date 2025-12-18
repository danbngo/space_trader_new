
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
    SHUTTLE: new ShipType('Shuttle', 0.1, 0.1, 0.1, 1, 1),
    PASSENGER_SHIP: new ShipType('Passenger Ship', 2, 0.5, 0.1, 1, 2),
    FREIGHTER: new ShipType('Freighter', 1, 0.25, 0.1, 2, 4),
    BLOCKADE_RUNNER: new ShipType('Blockade Runner', 1.5, 1, 0.5, 3, 3),
    SCOUT: new ShipType('Scout', 0.5, 0.5, 0.5, 3, 0.5),
    DESTROYER: new ShipType('Destroyer', 2, 2, 4, 1, 0.5),
    BATTLESHIP: new ShipType('Battleship', 4, 4, 3, 0.5, 1),
    FIGHTER: new ShipType('Fighter', 1, 2, 2, 1, 0.1),
    MINING_SHIP: new ShipType('Mining Ship', 2, 0.5, 1, 0.5, 2),
    GUARD_SHIP: new ShipType('Guard Ship', 1.5, 1.5, 1.5, 0.5, 0.25),}

const SHIP_TYPES_ALL = Object.values(SHIP_TYPES)
