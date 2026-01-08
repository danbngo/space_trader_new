/**
 * @fileoverview Defines various ship types used in the game.
 * @module types/SHIP_TYPES
 */

/**
 * @class ShipType
 * @classdesc Represents a type of ship with specific attributes.
 * @property {string} name - The name of the ship type.
 * @property {string} description - A description of the ship type.
 * @property {string} shape - The shape of the ship (from SHAPES enum).
 * @property {number} hull - The hull strength of the ship.
 * @property {number} shields - The shield strength of the ship.
 * @property {number} lasers - The laser power of the ship.
 * @property {number} engine - The engine power of the ship.
 * @property {number} cargoSpace - The cargo space of the ship.
 * @property {number} radars - The radar capability of the ship.
 * @property {number} fuelCapacity - The fuel capacity of the ship.
 * @property {Array} modules - The modules equipped on the ship.
 * @property {number} moduleSlots - The maximum number of modules the ship can have.
 * @property {number} maxActionsPerTurn - The maximum number of actions the ship can perform per turn.
 * @constructor
 * @param {string} name - The name of the ship type.
 * @param {string} description - A description of the ship type.
 * @param {SHAPES} shape - The shape of the ship.
 * @param {number} hull - The hull strength of the ship.
 * @param {number} shields - The shield strength of the ship.
 * @param {number} lasers - The laser power of the ship.
 * @param {number} engine - The engine power of the ship.
 * @param {number} cargoSpace - The cargo space of the ship.
 * @param {number} radars - The radar capability of the ship.
 * @param {number} fuelCapacity - The fuel capacity of the ship
 * @param {Array} modules - The modules equipped on the ship.
 * @param {number} moduleSlots - The maximum number of modules the ship can have.
 * @param {number} maxActionsPerTurn - The maximum number of actions the ship can perform per turn.
 * @returns {ShipType} The created ShipType instance.
 */
class ShipType {
    constructor(name = '', description = '', shape, hull = 1, shields = 1, lasers = 1, engine = 1, cargoSpace = 1, radars = 1, fuelCapacity = 1,modules = [], moduleSlots = 0, maxActionsPerTurn = SHIP_NUM_MOVES_PER_TURN) {
        this.name = name
        this.description = description
        this.shape = shape; // Legacy shape enum (deprecated)
        this.shapeGenerator = null; // Function that generates polygon vertices
        this.hull = hull
        this.shields = shields
        this.lasers = lasers
        this.engine = engine
        this.cargoSpace = cargoSpace
        this.radars = radars
        this.fuelCapacity = fuelCapacity
        this.modules = modules
        this.moduleSlots = moduleSlots
        this.maxActionsPerTurn = maxActionsPerTurn
        this.onDisabled = null
        this.minRadiusModifier = 1
        this.maxRadiusModifier = 1
    }
}

const SHIP_TYPES = {
    COURIER_SHIP: new ShipType('Courier Ship', 'Fast, lightly-armored vessel designed for rapid message and package delivery across star systems.', null, 0.1, 0.1, 0.1, 2, 1, 1, 3, [SHIP_MODULE_TYPES.BOOSTER], 2),
    TANKER: new ShipType('Tanker', 'Massive bulk hauler with enormous cargo holds designed to transport liquids and gases.', null, 1.5, 0.25, 0.1, 1.5, 5, 1, 2, [], 2),
    SCOUT: new ShipType('Scout', 'Long-range reconnaissance vessel with powerful sensors and high speed for exploration.', null, 0.5, 0.5, 0.5, 3, 0.5, 3, 1.5, [SHIP_MODULE_TYPES.SCANNER], 1),
    FRIGATE: new ShipType('Frigate', 'Well-balanced warship with solid defenses, firepower, and speed for versatile combat.', null, 2, 3, 1.5, 3, 1, 1, 1, [SHIP_MODULE_TYPES.BOOSTER], 2),
    BATTLESHIP: new ShipType('Battleship', 'Massive capital ship with warhead launchers, heavy armor, and shields for fleet engagements.', null, 4, 4, 3, 1, 2, 1.5, 1.5, [SHIP_MODULE_TYPES.WARHEAD], 1),
    INTERCEPTOR: new ShipType('Interceptor', 'Fast pursuit craft with magnetic grapples for capturing or disabling enemy vessels.', null, 1.5, 1.5, 1.5, 2, 0.25, 2, 1, [SHIP_MODULE_TYPES.MAGNETIZE], 2),
    UTILITY_SHIP: new ShipType('Utility Ship', 'Support vessel equipped with nanite repair systems to fix damaged ships in the field.', null, 1, 2, 0.5, 1, 0.5, 2, 1.5, [SHIP_MODULE_TYPES.NANITE_BEAM, SHIP_MODULE_TYPES.MAGNETIZE], 1),
}

const SHIP_TYPES_ALL = Object.values(SHIP_TYPES)

// Assign shape generators to ship types
SHIP_TYPES.COURIER_SHIP.shapeGenerator = SHIP_SHAPES.COURIER_SHIP
SHIP_TYPES.FIRE_SHIP.shapeGenerator = SHIP_SHAPES.FIRE_SHIP
SHIP_TYPES.PASSENGER_SHIP.shapeGenerator = SHIP_SHAPES.PASSENGER_SHIP
SHIP_TYPES.SUPPLY_SHIP.shapeGenerator = SHIP_SHAPES.SUPPLY_SHIP
SHIP_TYPES.TANKER.shapeGenerator = SHIP_SHAPES.TANKER
SHIP_TYPES.BLOCKADE_RUNNER.shapeGenerator = SHIP_SHAPES.BLOCKADE_RUNNER
SHIP_TYPES.SCOUT.shapeGenerator = SHIP_SHAPES.SCOUT
SHIP_TYPES.FIGHTER.shapeGenerator = SHIP_SHAPES.FIGHTER
SHIP_TYPES.FRIGATE.shapeGenerator = SHIP_SHAPES.FRIGATE
SHIP_TYPES.DESTROYER.shapeGenerator = SHIP_SHAPES.DESTROYER
SHIP_TYPES.JAMMER.shapeGenerator = SHIP_SHAPES.JAMMER
SHIP_TYPES.BATTLESHIP.shapeGenerator = SHIP_SHAPES.BATTLESHIP
SHIP_TYPES.DRILLING_RIG.shapeGenerator = SHIP_SHAPES.DRILLING_RIG
SHIP_TYPES.ESCORT_SHIP.shapeGenerator = SHIP_SHAPES.ESCORT_SHIP
SHIP_TYPES.INTERCEPTOR.shapeGenerator = SHIP_SHAPES.INTERCEPTOR
SHIP_TYPES.UTILITY_SHIP.shapeGenerator = SHIP_SHAPES.UTILITY_SHIP
SHIP_TYPES.OBSERVER.shapeGenerator = SHIP_SHAPES.OBSERVER

const ASTEROID_SHIP_TYPES = {
    ASTEROID: new ShipType('Asteroid', 'Rocky space debris drifting through the void, can be mined for valuable minerals.', null, 0.2, 0, 0, 0.25, 0.5, 1, 1, [], 0, 1),
    CRYOID: new ShipType('Cryoid', 'Frozen comet fragment containing water ice, leaves a freezing vapor trail when destroyed.', null, 0.2, 0, 0, 0.25, 0.5, 1, 0, [SHIP_MODULE_TYPES.SMOKE_BOMB], 0, 1),
    PLASMOID: new ShipType('Plasmoid', 'Energetic plasma sphere moving at high velocity, highly volatile and dangerous.', null, 0.2, 0.5, 0, 0.5, 0.5, 1, 0, [SHIP_MODULE_TYPES.BOOSTER], 0, 1),
    MAGNETOID: new ShipType('Magnetoid', 'Magnetically-charged metallic fragment that can disrupt ship systems and pull objects.', null, 0.2, 0.3, 0, 0.5, 0.5, 1, 0, [SHIP_MODULE_TYPES.MAGNETIZE], 0, 1),
}

const ASTEROID_SHIP_TYPES_ALL = Object.values(ASTEROID_SHIP_TYPES)

for (const st of ASTEROID_SHIP_TYPES_ALL) {
    st.minRadiusModifier = 4
    st.maxRadiusModifier = 16
}
