class IonCloudEffect extends Effect {
    constructor(x = 0, y = 0) {
        super(EFFECT_TYPES.ION_CLOUD, x, y, x, y)
    }

    hitShip(ship = new Ship()) {
        // Apply ionized status and damage shields when entering ion cloud
        console.log('Ship entered ion cloud:', ship.name)
        ship.statusEffects.raiseTo(STATUS_EFFECTS.IONIZED)
        const [hullDamage, shieldDamage, disabled] = ship.takeDamage(rng(5,1), false, true)
        return [ShipAction.getDamageAction(ship, hullDamage, shieldDamage, disabled)]
    }
}
