/**
 * Effect for debris clouds that damage ships and apply dusty status.
 * @class DebrisCloudEffect
 * @extends {Effect}
 */
class DebrisCloudEffect extends Effect {
    /**
     * @param {number} x - The x-coordinate of the debris cloud center.
     * @param {number} y - The y-coordinate of the debris cloud center.
     * @param {number} angle - The rotation angle of the debris cloud.
     */
    constructor(x = 0, y = 0, angle = Math.PI*2) {
        super(EFFECT_TYPES.DEBRIS_CLOUD, x, y, x, y)
        this.angle = angle;
    }

    /**
     * Applies debris cloud effects when a ship enters it.
     * @param {Encounter} encounter - The current encounter.
     * @param {Ship} ship - The ship entering the debris cloud.
     * @returns {ShipAction[]} Array of actions resulting from the hit.
     */
    hitShip(encounter, ship = new Ship()) {
        // No immediate effect when entering
        if (ASTEROID_SHIP_TYPES_ALL.includes(ship.shipType)) return []
        console.log('Ship entered dust cloud:', ship.name)
        ship.statusEffects.raiseTo(STATUS_EFFECTS.DUSTY)
        const [hullDamage, shieldDamage, disabled] = ship.takeDamage(rng(3,1), true, false)
        return [ShipAction.getDamageAction(encounter, ship, hullDamage, shieldDamage, disabled)]
    }
}
