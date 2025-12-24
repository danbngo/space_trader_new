class PlasmaTrailEffect extends Effect {
    constructor(x = 0, y = 0, toX = 0, toY = 0) {
        console.log('Creating plasma trail from', x, y, 'to', toX, toY)
        super(EFFECT_TYPES.PLASMA_TRAIL, x, y, toX, toY)
    }

    hitShip(encounter = new Encounter(), ship = new Ship()) {
        // Deal damage and apply overheated status when entering plasma trail
        console.log('Ship entered plasma trail:', ship.name)
        ship.statusEffects.raiseTo(STATUS_EFFECTS.OVERHEATED)
        const [hullDamage, shieldDamage, disabled] = ship.takeDamage(rng(4,1), false, false)
        return [ShipAction.getDamageAction(encounter, ship, hullDamage, shieldDamage, disabled)]
    }
}
