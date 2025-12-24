class IonCloudEffect extends Effect {
    constructor(x = 0, y = 0) {
        super(EFFECT_TYPES.ION_CLOUD, x, y, x, y)
    }

    applyEffectOnEnter(ship = new Ship()) {
        // Apply ionized status and damage shields when entering ion cloud
        console.log('Ship entered ion cloud:', ship.name)
        ship.statusEffects.add(STATUS_EFFECTS.FROZEN)
        const damage = 3
        ship.takeDamage(damage, false, true) // Don't bypass shields, don't hurt hull
    }

    applyEffectOnStart(ship = new Ship()) {
        // Apply ionized status and damage shields for ships starting their turn in the ion cloud
        console.log('Applying ion cloud penalties to:', ship.name)
        ship.statusEffects.add(STATUS_EFFECTS.FROZEN)
        const damage = 5
        ship.takeDamage(damage, false, true) // Don't bypass shields, don't hurt hull
    }
}
