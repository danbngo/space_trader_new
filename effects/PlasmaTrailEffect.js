/**
 * Effect for plasma trails that damage ships and apply overheated status.
 * @class PlasmaTrailEffect
 * @extends {Effect}
 */
class PlasmaTrailEffect extends Effect {
    /**
     * @param {number} x - The x-coordinate of the trail start point.
     * @param {number} y - The y-coordinate of the trail start point.
     * @param {number} toX - The x-coordinate of the trail end point.
     * @param {number} toY - The y-coordinate of the trail end point.
     */
    constructor(x = 0, y = 0, toX = 0, toY = 0) {
        console.log('Creating plasma trail from', x, y, 'to', toX, toY)
        super(EFFECT_TYPES.PLASMA_TRAIL, x, y, toX, toY)
    }

    /**
     * Applies plasma trail effects when a ship enters it.
     * @param {Encounter} encounter - The current encounter.
     * @param {Ship} ship - The ship entering the plasma trail.
     * @returns {ShipAction[]} Array of actions resulting from the hit.
     */
    hitShip(encounter, ship = new Ship()) {
        // Deal damage and apply overheated status when entering plasma trail
        console.log('Ship entered plasma trail:', ship.name)
        if (ASTEROID_SHIP_TYPES_ALL.includes(ship.shipType)) return []
        ship.statusEffects.raiseTo(STATUS_EFFECTS.OVERHEATED)
        const [hullDamage, shieldDamage, disabled] = ship.takeDamage(rng(4,1), false, false)
        return [ShipAction.getDamageAction(encounter, ship, hullDamage, shieldDamage, disabled)]
    }
}
