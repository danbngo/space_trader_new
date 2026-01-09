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
    COURIER: new ShipType('Courier', 'Fast, lightly-armored vessel designed for rapid message and package delivery across star systems.', null, 0.1, 0.1, 0.1, 2, 1, 1, 3, [], 2),
    HAULER: new ShipType('Hauler', 'Massive bulk hauler with enormous cargo holds designed to transport liquids and gases.', null, 1.5, 0.25, 0.1, 1.5, 5, 1, 2, [], 2),
    TANKER: new ShipType('Tanker', 'Has more space for fuel.', null, 1.5, 0.25, 0.1, 1.5, 5, 1, 2, [], 2),
    SCOUT: new ShipType('Scout', 'Long-range reconnaissance vessel with powerful sensors and high speed for exploration.', null, 0.5, 0.5, 0.5, 3, 0.5, 3, 1.5, [], 1),
    BATTLESHIP: new ShipType('Battleship', 'Massive capital ship with warhead launchers, heavy armor, and shields for fleet engagements.', null, 4, 4, 3, 1, 2, 1.5, 1.5, [], 1),
    INTERCEPTOR: new ShipType('Interceptor', 'Fast pursuit craft with magnetic grapples for capturing or disabling enemy vessels.', null, 1.5, 1.5, 1.5, 2, 0.25, 2, 1, [], 2),
    RAIDER: new ShipType('Raider', '', null, 1, 2, 0.5, 1, 0.5, 2, 1.5, [], 1),
}

const SHIP_TYPES_ALL = Object.values(SHIP_TYPES)

// Assign shape generators to ship types
SHIP_TYPES.COURIER.shapeGenerator = SHIP_SHAPES.COURIER
SHIP_TYPES.TANKER.shapeGenerator = SHIP_SHAPES.COURIER
SHIP_TYPES.SCOUT.shapeGenerator = SHIP_SHAPES.COURIER
SHIP_TYPES.BATTLESHIP.shapeGenerator = SHIP_SHAPES.COURIER
SHIP_TYPES.INTERCEPTOR.shapeGenerator = SHIP_SHAPES.COURIER
SHIP_TYPES.RAIDER.shapeGenerator = SHIP_SHAPES.COURIER


const ASTEROID_SHIP_TYPES = {
    ASTEROID: new ShipType('Asteroid', 'Rocky space debris drifting through the void, can be mined for valuable minerals.', null, 0.2, 0, 0, 0.25, 0.5, 1, 1, [], 0, 1),
}

const ASTEROID_SHIP_TYPES_ALL = Object.values(ASTEROID_SHIP_TYPES)

for (const st of ASTEROID_SHIP_TYPES_ALL) {
    st.minRadiusModifier = 4
    st.maxRadiusModifier = 16
}
