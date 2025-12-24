class IceCloudEffect extends Effect {
    constructor(x = 0, y = 0) {
        super(EFFECT_TYPES.ICE_CLOUD, x, y, x, y)
    }

    hitShip(ship = new Ship()) {
        // Apply frozen status when entering ice cloud
        console.log('Ship entered ice cloud:', ship.name)
        ship.statusEffects.raiseTo(STATUS_EFFECTS.FROZEN)
        return []
    }
}
