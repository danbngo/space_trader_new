
/**
 * @param {MOVE_TYPES} [moveType]
 */
class ShipModuleType {
    constructor(name = '', moveType = null, description = '', value = 0, cooldown = 0) {
        this.name = name
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
    CLOAK: new ShipModuleType('Cloak', MOVE_TYPES.Cloak, 'Makes your ship much harder to hit, but is dispelled if you attack or are hit.', 5000, 3),
    MAGNETIZE: new ShipModuleType('Magnetize', MOVE_TYPES.Magnetize, 'Pulls your ship and enemy ships towards each other', 6000, 2),
    WARHEAD: new ShipModuleType('Warhead', MOVE_TYPES.Warhead, 'Deals damage and knockback in a large area', 8000, 4),
    EMP_PULSE: new ShipModuleType('EMP Pulse', MOVE_TYPES.EMPPulse, 'Lowers the shields of nearby ships and increases the cooldown on their modules.', 7000, 3),
    BLINK: new ShipModuleType('Blink', MOVE_TYPES.Blink, 'Randomly teleports your ship a short distance', 4000, 2),
    BOOSTER: new ShipModuleType('Booster', MOVE_TYPES.Booster, 'Move very fast in a direction and spin ships as you pass.', 5500, 3),
    SMOKE_BOMB: new ShipModuleType('Smoke Bomb', MOVE_TYPES.SmokeBomb, 'Creates a dust cloud nearby, which slows ships and decreases hit chance.', 4500, 2),
    SPEED_MODULE: new ShipModuleType('Speed Module', null, 'Grants +1 action per turn, allowing your ship to act faster in combat.', 6500, 0),
    //NANITE_SWARM: new ShipModuleType('Nanite Swarm', 'Repairs hull damage for your ship and nearby allies', 0),
    //DEFLECTOR: new ShipModuleType('Deflector', 'Reflects incoming enemy projectiles/ships', 0),
}

const SHIP_MODULE_TYPES_ALL = Object.values(SHIP_MODULE_TYPES)