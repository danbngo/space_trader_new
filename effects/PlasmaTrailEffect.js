class PlasmaTrailEffect extends Effect {
    constructor(x = 0, y = 0, toX = 0, toY = 0) {
        super(EFFECT_TYPES.PLASMA_TRAIL, x, y, toX, toY)
    }

    applyEffectOnEnter(ship = new Ship()) {
        // Deal damage and apply overheated status when entering plasma trail
        console.log('Ship entered plasma trail:', ship.name)
        ship.statusEffects.add(STATUS_EFFECTS.OVERHEATED)
        const damage = rng(5,1)
        ship.takeDamage(damage, true) // Bypass shields
    }

    applyEffectOnStart(ship = new Ship()) {
        // Deal damage and apply overheated status to ships starting their turn in the plasma trail
        console.log('Applying plasma trail damage to:', ship.name)
        ship.statusEffects.add(STATUS_EFFECTS.OVERHEATED)
        const damage = rng(5,1)
        ship.takeDamage(damage, true) // Bypass shields
    }
}
