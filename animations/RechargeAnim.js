/**
 * Recharge animation that executes recharge and displays healing
 * @class RechargeAnim
 * @extends Anim
 */
class RechargeAnim extends Anim {
    /**
     * @param {CanvasObject} shipObj - The canvas object for the recharging ship
     * @param {Ship} ship - The recharging ship entity
     * @param {CombatResult} combatResult - The result of the recharge action
     * @param {TravelMap} travelMap - Reference to the travel map
     */
    constructor(shipObj, ship, combatResult, travelMap) {
        ship.acting = true
        
        super(
            100, // Very short duration, just to trigger the heal display
            (progressRatio) => {
                // Animation doesn't need to do anything visual
            },
            () => {
                // On complete
                ship.acting = false
            }
        )
        
        // Immediately execute the recharge result
        gs.combat.executeResult(combatResult)
        
        // Display heal text with negative values (triggers HealFlickerAnim)
        travelMap.combatHandler.displayDamageText(
            ship,
            0, // No hull damage
            -(combatResult.shieldsRecharged || 0), // Negative shield "damage" = healing
            false,
            null
        )
        
        this.ship = ship
        this.combatResult = combatResult
        this.travelMap = travelMap
    }
}
