class ShipModule {
    constructor(name = '', description = '', value = 0) {
        this.name = name
        this.description = description
        this.value = value
    }
}


const SHIP_MODULES = {
    CLOAK: new ShipModule('Cloak', 'Turns your ship invisible and allows it to pass through enemy projectiles/ships', 0),
    GRAVITON_BEAM: new ShipModule('Graviton Beam', 'Pulls your ship and enemy ships towards each other', 0),
    BLINK: new ShipModule('Blink', 'Randomly teleports your ship a short distance', 0),
    //BOOSTER: new ShipModule('Booster', 'Provides massive thrust in a given direction', 0),
    //NANITE_SWARM: new ShipModule('Nanite Swarm', 'Repairs hull damage for your ship and nearby allies', 0),
    DEFLECTOR: new ShipModule('Deflector', 'Reflects incoming enemy projectiles/ships', 0),
}