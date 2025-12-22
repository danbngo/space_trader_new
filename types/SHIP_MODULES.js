class ShipModule {
    constructor(name = '', description = '', value = 0) {
        this.name = name
        this.description = description
        this.value = value
    }
}


const SHIP_MODULES = {
    CLOAK: new ShipModule('Cloak', 'Makes your ship much harder to hit, but is dispelled if you attack or are hit.', 0),
    GRAVITON_BEAM: new ShipModule('Graviton Beam', 'Pulls your ship and enemy ships towards each other', 0),
    WARHEAD: new ShipModule('Warhead', 'Deals damage and knockback in a large area', 0),
    EMP_PULSE: new ShipModule('EMP Pulse', 'Lowers the shields of nearby ships and causes them to move randomly.', 0),
    BLINK: new ShipModule('Blink', 'Randomly teleports your ship a short distance', 0),
    BOOSTER: new ShipModule('Booster', 'Move very fast in a direction and spin ships as you pass.', 0),
    SMOKE_BOMB: new ShipModule('Smoke Bomb', 'Creates a dust cloud nearby, which slows ships and decreases hit chance.', 0),
    //NANITE_SWARM: new ShipModule('Nanite Swarm', 'Repairs hull damage for your ship and nearby allies', 0),
    //DEFLECTOR: new ShipModule('Deflector', 'Reflects incoming enemy projectiles/ships', 0),
}