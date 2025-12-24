class IonCloudEffect extends Effect {
    constructor(x = 0, y = 0) {
        super(EFFECT_TYPES.ION_CLOUD, x, y, x, y)
    }

    onShipEnter(ship = new Ship()) {
        // Apply ionized status and damage shields when entering ion cloud
        console.log('Ship entered ion cloud:', ship.name)
        ship.statusEffects.raiseTo(STATUS_EFFECTS.IONIZED)
    }

    onShipPresent(ship = new Ship()) {
        // Apply ionized status and damage shields for ships starting their turn in the ion cloud
        console.log('Applying ion cloud penalties to:', ship.name)
        ship.statusEffects.raiseTo(STATUS_EFFECTS.IONIZED)
    }
}
