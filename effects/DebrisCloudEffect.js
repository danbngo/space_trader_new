class DebrisCloudEffect extends Effect {
    constructor(x = 0, y = 0, angle = Math.PI*2) {
        super(EFFECT_TYPES.DEBRIS_CLOUD, x, y, x, y)
        this.angle = angle;
    }

    hitShip(encounter = new Encounter(), ship = new Ship()) {
        // No immediate effect when entering
        if (ASTEROID_SHIP_TYPES_ALL.includes(ship.shipType)) return []
        console.log('Ship entered dust cloud:', ship.name)
        ship.statusEffects.raiseTo(STATUS_EFFECTS.DUSTY)
        const [hullDamage, shieldDamage, disabled] = ship.takeDamage(rng(3,1), true, false)
        return [ShipAction.getDamageAction(encounter, ship, hullDamage, shieldDamage, disabled)]
    }
}
