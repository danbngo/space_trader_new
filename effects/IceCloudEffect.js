class IceCloudEffect extends Effect {
    constructor(x = 0, y = 0) {
        super(EFFECT_TYPES.ICE_CLOUD, x, y, x, y)
    }

    applyEffectOnEnter(ship = new Ship()) {
        // Apply frozen status when entering ice cloud
        console.log('Ship entered ice cloud:', ship.name)
        ship.statusEffects.add(STATUS_EFFECTS.FROZEN)
    }

    applyEffectOnStart(ship = new Ship()) {
        // Apply frozen status to ships starting their turn in the ice cloud
        console.log('Applying ice cloud penalties to:', ship.name)
        ship.statusEffects.add(STATUS_EFFECTS.FROZEN)
    }
}
