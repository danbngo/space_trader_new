
/**
 * Represents a type of module that can be installed on ships.
 * @class ShipModuleType
 */
class ShipModuleType {
    /**
     * @param {string} name - The name of the module type.
     * @param {number[]} color - The color associated with this module type.
     * @param {MoveType} moveType - The move type this module enables (if any).
     * @param {string} description - A description of what the module does.
     * @param {number} value - The base value/price of this module type.
     * @param {number} cooldown - The cooldown in turns before the module can be used again.
     */
    constructor(name = '', color = COLORS.White, moveType = null, description = '', value = 0, cooldown = 0) {
        /** @type {string} */
        this.name = name
        /** @type {number[]} */
        this.color = color;
        /** @type {MoveType} */
        this.moveType = moveType
        /** @type {string} */
        this.description = description
        /** @type {number} */
        this.value = value
        /** @type {number} */
        this.cooldown = cooldown
    }
}

/**
 * Represents an instance of a ship module with a quality modifier.
 * @class ShipModule
 */
class ShipModule {
    /**
     * @param {ShipModuleType} moduleType - The type of module.
     * @param {number} quality - The quality multiplier for this module instance.
     */
    constructor(moduleType = new ShipModuleType(), quality = 1) {
        /** @type {ShipModuleType} */
        this.moduleType = moduleType
        /** @type {number} */
        this.quality = quality
    }
}


const SHIP_MODULE_TYPES = {
    CLOAK: new ShipModuleType('Cloak', COLORS.DarkGray, MOVE_TYPES.Cloak, 'Become invisible and un-targetable by enemy ships. Dispelled if you attack or are attacked.', 3000, 4),
    MAGNETIZE: new ShipModuleType('Magnetize', COLORS.Purple, MOVE_TYPES.Magnetize, 'Pulls your ship and an enemy ship towards each other', 2000, 2),
    WARHEAD: new ShipModuleType('Warhead', COLORS.Red, MOVE_TYPES.Warhead, 'Deals damage and knockback in a large area', 4000, 4),
    EMP_PULSE: new ShipModuleType('EMP Pulse', COLORS.Blue, MOVE_TYPES.EMPPulse, 'Lowers the shields of nearby ships and increases their ability cooldowns.', 3000, 3),
    BLINK: new ShipModuleType('Blink', COLORS.Cyan, MOVE_TYPES.Blink, 'Randomly teleports your ship a short distance', 1500, 2),
    BOOSTER: new ShipModuleType('Booster', COLORS.Orange, MOVE_TYPES.Booster, 'Rocket forward in direction ship is facing, leaving a plasma trail.', 2000, 3),
    SMOKE_BOMB: new ShipModuleType('Smoke Bomb', COLORS.Gray, MOVE_TYPES.SmokeBomb, 'Creates a debris cloud nearby.', 2000, 2),
    DRILL: new ShipModuleType('Drill', COLORS.Brown, MOVE_TYPES.Drill, 'Drill into a target ship, dealing heavy hull damage and spinning them around.', 2500, 3),
    PLASMA_SPRAY: new ShipModuleType('Detonate', COLORS.Yellow, MOVE_TYPES.Detonate, 'Self-destruct your ship in a massive explosion, dealing devastating damage to all nearby vessels.', 5000, 0),
    NANITE_BEAM: new ShipModuleType('Nanite Beam', COLORS.Green, MOVE_TYPES.NaniteBeam, 'Heal allied ships using a targeted nanite beam. Repairs hull damage based on your engineering skill.', 2500, 3),
    PLASMA_SPRAY: new ShipModuleType('Plasma Spray', COLORS.Orange, MOVE_TYPES.PlasmaSpray, 'Shoots plasma in a triangular area in front of the ship, overheating all targets hit.', 3000, 3),
    SPEED_MODULE: new ShipModuleType('Speed Module', COLORS.LightGray, null, 'Chance to grant +1 action per turn.', 3000, 0),
    //NANITE_SWARM: new ShipModuleType('Nanite Swarm', 'Repairs hull damage for your ship and nearby allies', 0),
    //DEFLECTOR: new ShipModuleType('Deflector', 'Reflects incoming enemy projectiles/ships', 0),
}

const SHIP_MODULE_TYPES_ALL = Object.values(SHIP_MODULE_TYPES)