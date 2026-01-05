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
 * @param {Array} modules - The modules equipped on the ship.
 * @param {number} moduleSlots - The maximum number of modules the ship can have.
 * @param {number} maxActionsPerTurn - The maximum number of actions the ship can perform per turn.
 * @returns {ShipType} The created ShipType instance.
 */
class ShipType {
    constructor(name = '', description = '', shape, hull = 1, shields = 1, lasers = 1, engine = 1, cargoSpace = 1, radars = 1, modules = [], moduleSlots = 0, maxActionsPerTurn = SHIP_NUM_MOVES_PER_TURN) {
        this.name = name
        this.description = description
        this.shape = shape;
        this.hull = hull
        this.shields = shields
        this.lasers = lasers
        this.engine = engine
        this.cargoSpace = cargoSpace
        this.radars = radars
        this.modules = modules
        this.moduleSlots = moduleSlots
        this.maxActionsPerTurn = maxActionsPerTurn
        this.onDisabled = null
        this.minRadiusModifier = 1
        this.maxRadiusModifier = 1
    }
}

const SHIP_TYPES = {
    COURIER_SHIP: new ShipType('Courier Ship', 'Fast, lightly-armored vessel designed for rapid message and package delivery across star systems.', SHAPES.FilledTriangle, 0.1, 0.1, 0.1, 2, 1, 1, [SHIP_MODULE_TYPES.BOOSTER], 2),
    FIRE_SHIP: new ShipType('Fire Ship', 'Ship that can detonate itself, causing massive area damage.', SHAPES.FilledTriangle, 0.1, 0.5, 0.5, 1.5, 0.5, 0.5, [SHIP_MODULE_TYPES.DETONATE], 2),
    PASSENGER_SHIP: new ShipType('Passenger Ship', 'Civilian transport designed to carry passengers in comfort with moderate cargo space.', SHAPES.FilledTriangle, 2, 0.5, 0.1, 1, 2, 0.5, [], 1),
    SUPPLY_SHIP: new ShipType('Supply Ship', 'Nimble cargo vessel specializing in quick resupply runs with decent cargo capacity.', SHAPES.FilledTriangle, 0.5, 0.1, 0.1, 2, 3, 0.5, [], 1),
    TANKER: new ShipType('Tanker', 'Massive bulk hauler with enormous cargo holds designed to transport liquids and gases.', SHAPES.FilledTriangle, 1.5, 0.25, 0.1, 1.5, 5, 1, [], 2),
    BLOCKADE_RUNNER: new ShipType('Blockade Runner', 'Sleek smuggler ship equipped with cloaking technology for evading detection and patrols.', SHAPES.FilledTriangle, 1, 1, 0.5, 3, 2, 1, [SHIP_MODULE_TYPES.CLOAK], 1),
    SCOUT: new ShipType('Scout', 'Long-range reconnaissance vessel with powerful sensors and high speed for exploration.', SHAPES.FilledTriangle, 0.5, 0.5, 0.5, 3, 0.5, 3, [SHIP_MODULE_TYPES.BOOSTER], 1),
    FIGHTER: new ShipType('Fighter', 'Agile combat craft with blink drive, designed for hit-and-run attacks and dogfighting.', SHAPES.FilledTriangle, 0.5, 1, 1.5, 2, 0.1, 1, [SHIP_MODULE_TYPES.BLINK], 1),
    FRIGATE: new ShipType('Frigate', 'Well-balanced warship with solid defenses, firepower, and speed for versatile combat.', SHAPES.FilledTriangle, 2, 3, 1.5, 3, 1, 1, [], 2),
    DESTROYER: new ShipType('Destroyer', 'Heavy weapons platform equipped with warheads, trading speed for devastating firepower.', SHAPES.FilledTriangle, 2, 1, 4, 1, 0.5, 3, [SHIP_MODULE_TYPES.WARHEAD], 2),
    JAMMER: new ShipType('Jammer', 'Electronic warfare vessel designed to disrupt enemy sensors and communications.', SHAPES.FilledTriangle, 2, 2, 1, 1, 0.1, 2, [SHIP_MODULE_TYPES.EMP_PULSE], 2),
    BATTLESHIP: new ShipType('Battleship', 'Massive capital ship with warhead launchers, heavy armor, and shields for fleet engagements.', SHAPES.FilledTriangle, 4, 4, 3, 1, 2, 1.5, [SHIP_MODULE_TYPES.WARHEAD], 3),
    TUG_SHIP: new ShipType('Tug Ship', 'Heavy-duty vessel designed for towing and maneuvering larger ships or objects in space.', SHAPES.FilledTriangle, 2, 0.5, 0.5, 2, 1, 1, [SHIP_MODULE_TYPES.MAGNETIZE], 1),
    DRILLING_RIG: new ShipType('Drilling Rig', 'Industrial vessel with a heavy drill for asteroid mining and resource extraction.', SHAPES.FilledTriangle, 3, 0.1, 2, 1, 3, 0.5, [SHIP_MODULE_TYPES.DRILL], 2),
    ESCORT_SHIP: new ShipType('Escort Ship', 'Defensive support vessel with smoke bombs and strong shields to protect allied ships.', SHAPES.FilledTriangle, 1, 1.5, 1.5, 0.5, 0.25, 1.5, [SHIP_MODULE_TYPES.SMOKE_BOMB], 2),
    INTERCEPTOR: new ShipType('Interceptor', 'Fast pursuit craft with magnetic grapples for capturing or disabling enemy vessels.', SHAPES.FilledTriangle, 1.5, 1.5, 1.5, 2, 0.25, 2, [SHIP_MODULE_TYPES.MAGNETIZE], 2),
    UTILITY_SHIP: new ShipType('Utility Ship', 'Support vessel equipped with nanite repair systems to fix damaged ships in the field.', SHAPES.FilledTriangle, 1, 2, 0.5, 1, 0.5, 2, [SHIP_MODULE_TYPES.NANITE_BEAM], 3),
}

const SHIP_TYPES_ALL = Object.values(SHIP_TYPES)

const STARTING_SHIP_TYPE = new ShipType('Starting Ship', 'A basic ship with balanced capabilities suitable for beginning your journey.', SHAPES.FilledTriangle, 1, 1, 1, 1, 1, 1, [], 1, 1)

const ASTEROID_SHIP_TYPES = {
    ASTEROID: new ShipType('Asteroid', 'Rocky space debris drifting through the void, can be mined for valuable minerals.', SHAPES.FilledOval, 0.3, 0, 0, 0.25, 0.5, 1, [], 0, 1),
    CRYOID: new ShipType('Cryoid', 'Frozen comet fragment containing water ice, leaves a freezing vapor trail when destroyed.', SHAPES.FilledOval, 0.3, 0, 0, 0.25, 0.5, 1, [SHIP_MODULE_TYPES.SMOKE_BOMB], 0, 1),
    PLASMOID: new ShipType('Plasmoid', 'Energetic plasma sphere moving at high velocity, highly volatile and dangerous.', SHAPES.FilledCircle, 0.2, 0.5, 0, 0.5, 0.5, 1, [SHIP_MODULE_TYPES.BOOSTER], 0, 1),
    MAGNETOID: new ShipType('Magnetoid', 'Magnetically-charged metallic fragment that can disrupt ship systems and pull objects.', SHAPES.FilledCircle, 0.2, 0.3, 0, 0.5, 0.5, 1, [SHIP_MODULE_TYPES.MAGNETIZE], 0, 1),
}

const ASTEROID_SHIP_TYPES_ALL = Object.values(ASTEROID_SHIP_TYPES)

for (const st of ASTEROID_SHIP_TYPES_ALL) {
    st.minRadiusModifier = 4
    st.maxRadiusModifier = 16
}


ASTEROID_SHIP_TYPES.ASTEROID.onDisabled = (died = new Ship(), encounter) => {
    console.log('Asteroid.onDisabled', { died, encounter });
    if (Math.random()*died.radiusModifier < 0.5) {
        const effect = new DebrisCloudEffect(died.x, died.y, Math.random() * Math.PI * 4)
        effect.radius *= Math.sqrt(died.radiusModifier)
        encounter.addEffect(effect)
    } else {
        spawnSmallerAsteroids(died, encounter)
    }
}

ASTEROID_SHIP_TYPES.CRYOID.onDisabled = (died = new Ship(), encounter) => {
    console.log('Cryoid.onDisabled', { died, encounter });
    if (Math.random()*died.radiusModifier < 0.5) {
        const effect = new IceCloudEffect(died.x, died.y, Math.random() * Math.PI * 4)
        effect.radius *= died.radiusModifier
        encounter.addEffect(effect)
    } else {
        spawnSmallerAsteroids(died, encounter)
    }
}

ASTEROID_SHIP_TYPES.PLASMOID.onDisabled = (died = new Ship(), encounter) => {
    console.log('Plasmoid.onDisabled', { died, encounter });
    if (Math.random()*died.radiusModifier < 0.5) {
        const effect = new IonCloudEffect(died.x, died.y, Math.random() * Math.PI * 4)
        effect.radius *= died.radiusModifier
        encounter.addEffect(effect)
    } else {
        spawnSmallerAsteroids(died, encounter)
    }
}

ASTEROID_SHIP_TYPES.MAGNETOID.onDisabled = (died = new Ship(), encounter) => {
    console.log('Magnetoid.onDisabled', { died, encounter });
    if (Math.random()*died.radiusModifier < 0.5) {
        const effect = new IonCloudEffect(died.x, died.y, Math.random() * Math.PI * 4)
        effect.radius *= died.radiusModifier
        encounter.addEffect(effect)
    } else {
        spawnSmallerAsteroids(died, encounter)
    }
}


/**
 * Utility function to spawn smaller asteroids when a large asteroid is destroyed
 * @param {Ship} died - The destroyed asteroid
 * @param {Encounter} encounter - The current encounter
 */
function spawnSmallerAsteroids(died, encounter) {
    if (died.hull[1] < 4) return; // Too small to split
    
    // Spawn 2 smaller asteroids
    for (let i = 0; i < 2; i++) {
        const angle = Math.random() * Math.PI * 2
        const newHull = Math.floor(died.hull[1] * 0.5)
        const offsetDist = rng(died.radius, died.radius/4, false)
        const newX = died.x + Math.cos(angle) * offsetDist
        const newY = died.y + Math.sin(angle) * offsetDist
        const newEngine = died.engine * 2
        
        const smallAsteroid = new Ship(died.name, died.shipType, died.color, [newHull,newHull], [0,0], died.lasers, newEngine, 0, died.radars, died.maxActionsPerTurn)
        smallAsteroid.hull = [newHull, newHull]
        smallAsteroid.x = newX
        smallAsteroid.y = newY
        smallAsteroid.angle = angle
        smallAsteroid.radiusModifier = died.radiusModifier / 2
        smallAsteroid.fleet = died.fleet
        smallAsteroid.aiType = died.aiType
        died.fleet.ships.push(smallAsteroid)
        died.fleet.addShip(smallAsteroid)
        console.log('spawned small asteroid:',smallAsteroid,smallAsteroid.radius)
    }
    if (currentMap && currentMap.refreshCanvas) {
        currentMap.refreshCanvas()
    }
}