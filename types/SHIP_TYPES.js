
class ShipType {
    constructor(name = '', shape = SHAPES.Triangle, hull = 1, shields = 1, lasers = 1, engine = 1, cargoSpace = 1, radars = 1, maxActionsPerTurn = SHIP_NUM_MOVES_PER_TURN) {
        this.name = name
        this.shape = shape;
        this.hull = hull
        this.shields = shields
        this.lasers = lasers
        this.engine = engine
        this.cargoSpace = cargoSpace
        this.radars = radars
        this.maxActionsPerTurn = maxActionsPerTurn
    }
}

const SHIP_TYPES = {
    SHUTTLE: new ShipType('Shuttle', SHAPES.Triangle, 0.1, 0.1, 0.1, 1, 1, 1),
    PASSENGER_SHIP: new ShipType('Passenger Ship', SHAPES.Triangle, 2, 0.5, 0.1, 1, 2, 0.5),
    FREIGHTER: new ShipType('Freighter', SHAPES.Triangle, 1, 0.25, 0.1, 1, 4, 0.5),
    BLOCKADE_RUNNER: new ShipType('Blockade Runner', SHAPES.Triangle, 1.5, 1, 0.5, 3, 2, 1),
    SCOUT: new ShipType('Scout', SHAPES.Triangle, 0.5, 0.5, 0.5, 3, 0.5, 3),
    DESTROYER: new ShipType('Destroyer', SHAPES.Triangle, 2, 2, 4, 1, 0.5, 2),
    BATTLESHIP: new ShipType('Battleship', SHAPES.Triangle, 4, 4, 3, 0.5, 1, 1),
    FIGHTER: new ShipType('Fighter', SHAPES.Triangle, 1, 2, 2, 1, 0.1, 1),
    MINING_SHIP: new ShipType('Mining Ship', SHAPES.Triangle, 2, 0.5, 1, 0.5, 2, 0.5),
    GUARD_SHIP: new ShipType('Guard Ship', SHAPES.Triangle, 1, 1.5, 1.5, 0.5, 0.25, 1.5),
    PATROL_SHIP: new ShipType('Patrol Ship', SHAPES.Triangle, 1.5, 1.5, 1.5, 2, 0.25, 2),
}

const SHIP_TYPES_ALL = Object.values(SHIP_TYPES)

const PSEUDO_SHIP_TYPES = {
    STARTING_SHIP: new ShipType('Starting Ship', SHAPES.Triangle, 0.1, 0.1, 0.1, 1, 1, 1),
    ASTEROID: new ShipType('Asteroid', SHAPES.FilledOval, 0.25, 0, 0, 4, 0.5, 4, 1),
    CRYOID: new ShipType('Cryoid', SHAPES.FilledOval, 1, 0, 0, 2, 0.5, 4, 1),
    PLASMOID: new ShipType('Plasmoid', SHAPES.FilledCircle, 0.25, 2, 2, 4, 0.5, 4, 1),
}