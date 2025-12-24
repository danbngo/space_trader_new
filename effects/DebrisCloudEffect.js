class DebrisCloudEffect extends Effect {
    constructor(x = 0, y = 0, angle = Math.PI*2) {
        super(EFFECT_TYPES.DEBRIS_CLOUD, x, y, x, y)
        this.angle = angle;
    }

    onShipEnter(ship = new Ship()) {
        // No immediate effect when entering
        console.log('Ship entered dust cloud:', ship.name)
        ship.statusEffects.raiseTo(STATUS_EFFECTS.DUSTY)
    }

    onShipPresent(ship = new Ship()) {
        // Apply dusty status effect to ships starting their turn in the dust cloud
        console.log('Applying dust cloud penalties to:', ship.name)
        ship.statusEffects.raiseTo(STATUS_EFFECTS.DUSTY)
    }
}
