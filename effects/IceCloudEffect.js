class IceCloudEffect extends Effect {
    constructor(x = 0, y = 0) {
        super(EFFECT_TYPES.ICE_CLOUD, x, y, x, y)
    }

    onShipEnter(ship = new Ship()) {
        // Apply frozen status when entering ice cloud
        console.log('Ship entered ice cloud:', ship.name)
        ship.statusEffects.raiseTo(STATUS_EFFECTS.FROZEN)
    }

    onShipPresent(ship = new Ship()) {
        // Apply frozen status to ships starting their turn in the ice cloud
        console.log('Applying ice cloud penalties to:', ship.name)
        ship.statusEffects.raiseTo(STATUS_EFFECTS.FROZEN)
    }
}
