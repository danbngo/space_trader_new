class IonCloudEffect extends Effect {
    constructor(x = 0, y = 0, angle = Math.PI*2) {
        super(EFFECT_TYPES.ION_CLOUD, x, y, x, y)
        this.angle = angle
    }

    hitShip(encounter = new Encounter(), ship = new Ship()) {
        // Apply ionized status and damage shields when entering ion cloud
        console.log('Ship entered ion cloud:', ship.name)
        if (ASTEROID_SHIP_TYPES_ALL.includes(ship.shipType)) return []
        ship.statusEffects.raiseTo(STATUS_EFFECTS.IONIZED)
        const [hullDamage, shieldDamage, disabled] = ship.takeDamage(rng(5,1), false, true)
        return [ShipAction.getDamageAction(encounter, ship, hullDamage, shieldDamage, disabled)]
    }
}
