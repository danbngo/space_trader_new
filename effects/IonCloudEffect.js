/**
 * Effect for ion clouds that damage shields and apply ionized status.
 * @class IonCloudEffect
 * @extends {Effect}
 */
class IonCloudEffect extends Effect {
    /**
     * @param {number} x - The x-coordinate of the ion cloud center.
     * @param {number} y - The y-coordinate of the ion cloud center.
     * @param {number} angle - The rotation angle of the ion cloud.
     */
    constructor(x = 0, y = 0, angle = Math.PI*2) {
        super(EFFECT_TYPES.ION_CLOUD, x, y, x, y)
        this.angle = angle
    }

    /**
     * Applies ion cloud effects when a ship enters it.
     * @param {Encounter} encounter - The current encounter.
     * @param {Ship} ship - The ship entering the ion cloud.
     * @returns {ShipAction[]} Array of actions resulting from the hit.
     */
    hitShip(encounter, ship = new Ship()) {
        // Apply ionized status and damage shields when entering ion cloud
        console.log('Ship entered ion cloud:', ship.name)
        if (ASTEROID_SHIP_TYPES_ALL.includes(ship.shipType)) return []
        ship.statusEffects.raiseTo(STATUS_EFFECTS.IONIZED)
        const [hullDamage, shieldDamage, disabled] = ship.takeDamage(rng(5,1), false, true)
        return [ShipAction.getDamageAction(encounter, ship, hullDamage, shieldDamage, disabled)]
    }
}
