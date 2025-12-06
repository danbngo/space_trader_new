class CargoType {
    constructor(name = '', value = 1, illegal = false) {
        this.name = name
        this.value = value
        this.illegal = illegal
    }
}

const CARGO_TYPES = {
    METAL: new CargoType('Metal', 100, false),
    ICE: new CargoType('Ice', 200, false),
    ISOTOPES: new CargoType('Isotopes', 400, false),
    NANITES: new CargoType('Nanites', 200, false),
    BIOGEL: new CargoType('Bio-gel', 400, false),
    HOLOCUBES: new CargoType('Holocubes', 800, false),
    WEAPONS: new CargoType('Weapons', 400, true),
    CLONES: new CargoType('Clones', 800, true),
    DRUGS: new CargoType('Drugs', 1600, true),
}
const CARGO_TYPES_ALL = Object.values(CARGO_TYPES)

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
    TRANSPORT: new ShipType('Transport', 1/2, 1/2, 1/4, 4, 1),
    CARGO_SHIP: new ShipType('Cargo Ship', 1, 1/4, 1/4, 1, 4),
    SCOUT: new ShipType('Scout', 1, 1, 1, 2, 1/2),
    DESTROYER: new ShipType('Destroyer', 2, 2, 4, 1, 1/2),
    BATTLESHIP: new ShipType('Battleship', 4, 4, 3, 1/2, 1),
    MINING_SHIP: new ShipType('Mining Ship', 2, 1, 1, 1/2, 2),
    PRIVATEER: new ShipType('Privateer', 1, 4, 1, 3, 2),
}

const SHIP_TYPES_ALL = Object.values(SHIP_TYPES)