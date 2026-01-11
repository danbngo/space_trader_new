/**
 * CombatResult - stores the result of a combat action
 */
class CombatResult {
    /**
     * @param {Object} data
     * @param {Ship} data.attacker - The ship performing the action
     * @param {Ship} [data.defender] - The ship being targeted (if applicable)
     * @param {string} data.action - The action type: 'laser', 'ram', 'evade', 'recharge', 'flee'
     * @param {boolean} data.success - Whether the action succeeded
     * @param {string} data.message - Description of what happened
     * @param {number} [data.damage] - Damage dealt (if applicable)
     * @param {number} [data.shieldsAbsorbed] - Shields that absorbed damage
     * @param {number} [data.hullDamage] - Hull damage dealt
     * @param {number} [data.selfHullDamage] - Self damage taken (for ram attacks)
     * @param {number} [data.shieldsRecharged] - Shields recharged
     * @param {number} [data.lasersRecharged] - Lasers recharged
     * @param {boolean} [data.destroyed] - Whether defender was destroyed
     * @param {boolean} [data.escaped] - Whether attacker escaped
     */
    constructor(data) {
        this.attacker = data.attacker
        this.defender = data.defender || null
        this.action = data.action
        this.success = data.success
        this.message = data.message
        this.damage = data.damage || 0
        this.shieldsAbsorbed = data.shieldsAbsorbed || 0
        this.hullDamage = data.hullDamage || 0
        this.selfHullDamage = data.selfHullDamage || 0
        this.shieldsRecharged = data.shieldsRecharged || 0
        this.lasersRecharged = data.lasersRecharged || 0
        this.destroyed = data.destroyed || false
        this.escaped = data.escaped || false
    }
}
