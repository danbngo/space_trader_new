class IceCloudEffect extends Effect {
    constructor(x = 0, y = 0, angle = Math.PI*2) {
        super(EFFECT_TYPES.ICE_CLOUD, x, y, x, y)
        this.angle = angle
    }

    hitShip(encounter = new Encounter(), ship = new Ship()) {
        // Apply frozen status when entering ice cloud
        console.log('Ship entered ice cloud:', ship.name)
        ship.statusEffects.raiseTo(STATUS_EFFECTS.FROZEN)
        return []
    }
}
