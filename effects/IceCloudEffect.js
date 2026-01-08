/**
 * Effect for ice clouds that apply frozen status to ships.
 * @class IceCloudEffect
 * @extends {Effect}
 */
class IceCloudEffect extends Effect {
    /**
     * @param {number} x - The x-coordinate of the ice cloud center.
     * @param {number} y - The y-coordinate of the ice cloud center.
     * @param {number} angle - The rotation angle of the ice cloud.
     */
    constructor(x = 0, y = 0, angle = Math.PI*2) {
        super(EFFECT_TYPES.ICE_CLOUD, x, y, x, y)
        this.angle = angle
    }

    /**
     * Applies ice cloud effects when a ship enters it.
     * @param {Encounter} encounter - The current encounter.
     * @param {Ship} ship - The ship entering the ice cloud.
     * @returns {ShipAction[]} Array of actions resulting from the hit (empty for ice clouds).
     */
    hitShip(encounter, ship ) {
        // Apply frozen status when entering ice cloud
        if (ASTEROID_SHIP_TYPES_ALL.includes(ship.shipType)) return []
        console.log('Ship entered ice cloud:', ship.name)
        ship.statusEffects.raiseTo(STATUS_EFFECTS.FROZEN)
        return []
    }
}
