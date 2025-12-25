/**
 * @fileoverview Defines various ship types used in the game.
 * @module types/SHIP_TYPES
 */

/**
 * @class ShipType
 * @classdesc Represents a type of ship with specific attributes.
 * @property {string} name - The name of the ship type.
 * @property {string} shape - The shape of the ship (from SHAPES enum).
 * @property {number} hull - The hull strength of the ship.
 * @property {number} shields - The shield strength of the ship.
 * @property {number} lasers - The laser power of the ship.
 * @property {number} engine - The engine power of the ship.
 * @property {number} cargoSpace - The cargo space of the ship.
 * @property {number} radars - The radar capability of the ship.
 * @property {Array} modules - The modules equipped on the ship.
 * @property {number} maxNumModules - The maximum number of modules the ship can have.
 * @property {number} maxActionsPerTurn - The maximum number of actions the ship can perform per turn.
 * @constructor
 * @param {string} name - The name of the ship type.
 * @param {SHAPES} shape - The shape of the ship.
 * @param {number} hull - The hull strength of the ship.
 * @param {number} shields - The shield strength of the ship.
 * @param {number} lasers - The laser power of the ship.
 * @param {number} engine - The engine power of the ship.
 * @param {number} cargoSpace - The cargo space of the ship.
 * @param {number} radars - The radar capability of the ship.
 * @param {Array} modules - The modules equipped on the ship.
 * @param {number} maxNumModules - The maximum number of modules the ship can have.
 * @param {number} maxActionsPerTurn - The maximum number of actions the ship can perform per turn.
 * @returns {ShipType} The created ShipType instance.
 */
class ShipType {
    constructor(name = '', shape, hull = 1, shields = 1, lasers = 1, engine = 1, cargoSpace = 1, radars = 1, modules = [], maxNumModules = 0, maxActionsPerTurn = SHIP_NUM_MOVES_PER_TURN) {
        this.name = name
        this.shape = shape;
        this.hull = hull
        this.shields = shields
        this.lasers = lasers
        this.engine = engine
        this.cargoSpace = cargoSpace
        this.radars = radars
        this.modules = modules
        this.maxNumModules = maxNumModules
        this.maxActionsPerTurn = maxActionsPerTurn
        this.onDisabled = null
        this.minRadiusModifier = 1
        this.maxRadiusModifier = 1
    }
}

const SHIP_TYPES = {
    SHUTTLE: new ShipType('Shuttle', SHAPES.FilledTriangle, 0.1, 0.1, 0.1, 1, 1, 1, [SHIP_MODULE_TYPES.BOOSTER], 1),
    PASSENGER_SHIP: new ShipType('Passenger Ship', SHAPES.FilledTriangle, 2, 0.5, 0.1, 1, 2, 0.5, [], 1),
    FREIGHTER: new ShipType('Freighter', SHAPES.FilledTriangle, 1, 0.25, 0.1, 1, 4, 0.5, [], 2),
    BLOCKADE_RUNNER: new ShipType('Blockade Runner', SHAPES.FilledTriangle, 1.5, 1, 0.5, 3, 2, 1, [SHIP_MODULE_TYPES.CLOAK], 2),
    SCOUT: new ShipType('Scout', SHAPES.FilledTriangle, 0.5, 0.5, 0.5, 3, 0.5, 3, [SHIP_MODULE_TYPES.BOOSTER], 2),
    DESTROYER: new ShipType('Destroyer', SHAPES.FilledTriangle, 2, 2, 4, 1, 0.5, 2, [SHIP_MODULE_TYPES.EMP_PULSE], 3),
    BATTLESHIP: new ShipType('Battleship', SHAPES.FilledTriangle, 4, 4, 3, 0.5, 1, 1, [SHIP_MODULE_TYPES.WARHEAD], 3),
    FIGHTER: new ShipType('Fighter', SHAPES.FilledTriangle, 1, 2, 2, 1, 0.1, 1, [SHIP_MODULE_TYPES.BLINK], 2),
    MINING_SHIP: new ShipType('Mining Ship', SHAPES.FilledTriangle, 2, 0.5, 1, 0.5, 2, 0.5, [SHIP_MODULE_TYPES.MAGNETIZE], 1),
    GUARD_SHIP: new ShipType('Guard Ship', SHAPES.FilledTriangle, 1, 1.5, 1.5, 0.5, 0.25, 1.5, [SHIP_MODULE_TYPES.SMOKE_BOMB], 2),
    PATROL_SHIP: new ShipType('Patrol Ship', SHAPES.FilledTriangle, 1.5, 1.5, 1.5, 2, 0.25, 2, [SHIP_MODULE_TYPES.MAGNETIZE], 2),
}

const SHIP_TYPES_ALL = Object.values(SHIP_TYPES)

const STARTING_SHIP_TYPE = new ShipType('Starting Ship', SHAPES.FilledTriangle, 1, 1, 1, 1, 1, 1, [], 3, 1)

const ASTEROID_SHIP_TYPES = {
    ASTEROID: new ShipType('Asteroid', SHAPES.FilledOval, 0.4, 0, 0, 8, 0.5, 1, [SHIP_MODULE_TYPES.MAGNETIZE], 0, 1),
    CRYOID: new ShipType('Cryoid', SHAPES.FilledOval, 0.6, 0, 0, 8, 0.5, 1, [SHIP_MODULE_TYPES.SMOKE_BOMB], 0, 1),
    PLASMOID: new ShipType('Plasmoid', SHAPES.FilledCircle, 0.5, 0.5, 0, 8, 0.5, 1, [SHIP_MODULE_TYPES.BOOSTER], 0, 1),
}

const ASTEROID_SHIP_TYPES_ALL = Object.values(ASTEROID_SHIP_TYPES)

for (const st of ASTEROID_SHIP_TYPES_ALL) {
    st.minRadiusModifier = 1
    st.maxRadiusModifier = 5
}

ASTEROID_SHIP_TYPES.ASTEROID.onDisabled = (died = new Ship(), encounter = new Encounter())=>{
    console.log('Asteroid.onDisabled', { died, encounter });
    if (Math.random() > .5) encounter.addEffect(new DebrisCloudEffect(died.x, died.y, Math.random()*Math.PI*4))
}
ASTEROID_SHIP_TYPES.CRYOID.onDisabled = (died = new Ship(), encounter = new Encounter())=>{
    console.log('Cryoid.onDisabled', { died, encounter });
    if (Math.random() > .5) encounter.addEffect(new IceCloudEffect(died.x, died.y, Math.random()*Math.PI*4))
}
ASTEROID_SHIP_TYPES.PLASMOID.onDisabled = (died = new Ship(), encounter = new Encounter())=>{
    console.log('Plasmoid.onDisabled', { died, encounter });
    if (Math.random() > .5) encounter.addEffect(new IonCloudEffect(died.x, died.y, Math.random()*Math.PI*4))
}