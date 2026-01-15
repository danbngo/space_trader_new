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
 * @param {number} hull - The hull strength of the ship.
 * @param {number} shields - The shield strength of the ship.
 * @param {number} lasers - The laser power of the ship.
 * @param {number} engine - The engine power of the ship.
 * @param {number} cargoSpace - The cargo space of the ship.
 * @param {number} radars - The radar capability of the ship.
 * @param {number} fuelCapacity - The fuel capacity of the ship
 * @param {Array} modules - The modules equipped on the ship.
 * @param {number} moduleSlots - The maximum number of modules the ship can have.
 * @returns {ShipType} The created ShipType instance.
 */
class ShipType {
    constructor(name = '', description = '', hull = 1, shields = 1, lasers = 1, engine = 1, cargoSpace = 1, radars = 1, fuelCapacity = 1, modules = [], moduleSlots = 0) {
        this.name = name
        this.description = description
        this.shipShape = null; // Function that generates polygon vertices
        this.hull = hull
        this.shields = shields
        this.lasers = lasers
        this.engine = engine
        this.cargoSpace = cargoSpace
        this.radars = radars
        this.fuelCapacity = fuelCapacity
        this.modules = modules
        this.moduleSlots = moduleSlots
        this.onDisabled = null
    }
}

const SHIP_TYPES = {
    COURIER: new ShipType('Courier', 'Nimble dispatch vessel built for speed. Light armor, high velocity.', 0.25, 0.25, 0.25, 2, 1, 1, 3, [], 2),
    HAULER: new ShipType('Hauler', 'Industrial freighter with expansive cargo bays. Poor defenses, excellent capacity.', 1, 0.25, 0.25, 1.5, 4, 0.5, 2, [], 2),
    TANKER: new ShipType('Tanker', 'Deep-range transport with extended fuel reserves. Sluggish but tireless.', 2, 0.25, 0.5, 0.5, 2, 1, 4, [], 2),
    SCOUT: new ShipType('Scout', 'Advanced recon platform with long-range sensors. Fast and perceptive.', 0.5, 0.5, 0.5, 3, 0.5, 3, 1.5, [], 1),
    BATTLESHIP: new ShipType('Battleship', 'Heavy warship bristling with weapons and reinforced plating. Slow but devastating.', 3, 2, 2, 1, 2, 1.5, 1.5, [], 1),
    INTERCEPTOR: new ShipType('Interceptor', 'Pursuit specialist equipped with grappling systems. Built to catch and disable.', 1.5, 1.5, 1.5, 2, 0.25, 2, 0.5, [], 2),
    RAIDER: new ShipType('Raider', 'Strike fighter designed for aggressive maneuvers. Fast attack, minimal endurance.', 1, 2, 2, 2, 0.5, 0.5, 0.5, [], 1),
}

const SHIP_TYPES_ALL = Object.values(SHIP_TYPES)

// Assign shape generators to ship types
SHIP_TYPES.COURIER.shipShape = SHIP_SHAPES.COURIER
SHIP_TYPES.HAULER.shipShape = SHIP_SHAPES.COURIER
SHIP_TYPES.TANKER.shipShape = SHIP_SHAPES.COURIER
SHIP_TYPES.SCOUT.shipShape = SHIP_SHAPES.COURIER
SHIP_TYPES.BATTLESHIP.shipShape = SHIP_SHAPES.COURIER
SHIP_TYPES.INTERCEPTOR.shipShape = SHIP_SHAPES.COURIER
SHIP_TYPES.RAIDER.shipShape = SHIP_SHAPES.COURIER


const ASTEROID_SHIP_TYPES = {
    ASTEROID: new ShipType('Asteroid', 'Rocky space debris drifting through the void, can be mined for valuable minerals.', 2, 0, 0, 2, 0.5, 0, 0, [], 0),
}

ASTEROID_SHIP_TYPES.ASTEROID.shipShape = SHIP_SHAPES.COURIER


const ASTEROID_SHIP_TYPES_ALL = Object.values(ASTEROID_SHIP_TYPES)
