/**
 * Ram animation that makes an attacker ship surge forward and return
 * @class RamAnimation
 * @extends Anim
 */
class RamAnimation extends Anim {
    /**
     * @param {CanvasObject} attackerShipObj - The canvas object for the attacker
     * @param {CanvasObject} targetShipObj - The canvas object for the target
     * @param {Ship} attackingShip - The attacking ship entity
     * @param {Ship} targetShip - The target ship entity
     * @param {CombatResult} combatResult - The result of the ram attack
     * @param {TravelMap} travelMap - Reference to the travel map
     */
    constructor(attackerShipObj, targetShipObj, attackingShip, targetShip, combatResult, travelMap) {
        const startX = attackerShipObj.x
        const startY = attackerShipObj.y
        const targetX = targetShipObj.x
        const targetY = targetShipObj.y
        const midpointX = (startX + targetX) / 2
        const midpointY = (startY + targetY) / 2
        attackingShip.acting = true
        
        let damageDisplayed = false

        console.log('RAM ANIM PROPS:', attackerShipObj, targetShipObj, startX, targetX, midpointX)
        
        super(
            2000,
            (progressRatio) => {
                console.log('Ram animation progress:', progressRatio, attackerShipObj, targetShipObj)
                if (!attackerShipObj) return
                
                // Execute damage and display text at 30% progress (at the end of the forward surge)
                if (!damageDisplayed && progressRatio >= 0.3) {
                    damageDisplayed = true
                    // Execute the combat result to apply damage
                    gs.combat.executeResult(combatResult)
                    // Display damage text
                    travelMap.combatHandler.displayDamageText(
                        targetShip,
                        combatResult.hullDamage || 0,
                        combatResult.shieldsAbsorbed || 0,
                        combatResult.destroyed,
                        !combatResult.success ? 'Missed' : null
                    )

                    travelMap.combatHandler.displayDamageText(
                        attackingShip,
                        combatResult.selfHullDamage || 0,
                        0,
                        combatResult.selfDestroyed
                    )
                }
                
                if (progressRatio <= 0.3) {
                    // First 30%: fast surge forward to midpoint
                    const forwardProgress = progressRatio / 0.3 // 0 to 1
                    attackerShipObj.x = startX + (midpointX - startX) * forwardProgress
                    attackerShipObj.y = startY + (midpointY - startY) * forwardProgress
                } else {
                    // Remaining 70%: slow return to start
                    const returnProgress = (progressRatio - 0.3) / 0.7 // 0 to 1
                    attackerShipObj.x = midpointX + (startX - midpointX) * returnProgress
                    attackerShipObj.y = midpointY + (startY - midpointY) * returnProgress
                }
            },
            () => {
                // On complete: ensure ship is back at start position
                if (attackerShipObj) {
                    attackerShipObj.x = startX
                    attackerShipObj.y = startY
                }
                attackingShip.acting = false
            }
        )
        
        this.targetShip = targetShip
        this.combatResult = combatResult
        this.travelMap = travelMap
    }
}