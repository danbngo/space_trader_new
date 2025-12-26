
/**
 * @param {MOVE_TYPES} [moveType]
 */
class ShipModuleType {
    constructor(name = '', color = COLORS.White, moveType = null, description = '', value = 0, cooldown = 0) {
        this.name = name
        this.color = color;
        this.moveType = moveType
        this.description = description
        this.value = value
        this.cooldown = cooldown
    }
}

class ShipModule {
    constructor(moduleType = new ShipModuleType(), quality = 1) {
        this.moduleType = moduleType
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
    SPEED_MODULE: new ShipModuleType('Speed Module', COLORS.LightGray, null, 'Chance to grant +1 action per turn.', 3000, 0),
    //NANITE_SWARM: new ShipModuleType('Nanite Swarm', 'Repairs hull damage for your ship and nearby allies', 0),
    //DEFLECTOR: new ShipModuleType('Deflector', 'Reflects incoming enemy projectiles/ships', 0),
}

const SHIP_MODULE_TYPES_ALL = Object.values(SHIP_MODULE_TYPES)