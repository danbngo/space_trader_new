class BaseShipModule {
    constructor(name = '', description = '', value = 0, cooldown = 0) {
        this.name = name
        this.description = description
        this.value = value
        this.cooldown = cooldown
    }
}

class ShipModule {
    constructor(moduleType = new BaseShipModule(), quality = 1) {
        this.moduleType = moduleType
        this.quality = quality
    }
}


const SHIP_MODULES = {
    CLOAK: new BaseShipModule('Cloak', 'Makes your ship much harder to hit, but is dispelled if you attack or are hit.', 5000, 3),
    GRAVITON_BEAM: new BaseShipModule('Graviton Beam', 'Pulls your ship and enemy ships towards each other', 6000, 2),
    WARHEAD: new BaseShipModule('Warhead', 'Deals damage and knockback in a large area', 8000, 4),
    EMP_PULSE: new BaseShipModule('EMP Pulse', 'Lowers the shields of nearby ships and increases the cooldown on their modules.', 7000, 3),
    BLINK: new BaseShipModule('Blink', 'Randomly teleports your ship a short distance', 4000, 2),
    BOOSTER: new BaseShipModule('Booster', 'Move very fast in a direction and spin ships as you pass.', 5500, 3),
    SMOKE_BOMB: new BaseShipModule('Smoke Bomb', 'Creates a dust cloud nearby, which slows ships and decreases hit chance.', 4500, 2),
    //NANITE_SWARM: new BaseShipModule('Nanite Swarm', 'Repairs hull damage for your ship and nearby allies', 0),
    //DEFLECTOR: new BaseShipModule('Deflector', 'Reflects incoming enemy projectiles/ships', 0),
}