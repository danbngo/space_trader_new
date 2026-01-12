/**
 * Laser animation that creates a beam from attacker to target
 * @class LaserAnim
 * @extends Anim
 */
class LaserAnim extends Anim {
    /**
     * @param {CanvasObject} attackerShipObj - The canvas object for the attacker
     * @param {CanvasObject} targetShipObj - The canvas object for the target
     * @param {Ship} attackingShip - The attacking ship entity
     * @param {Ship} targetShip - The target ship entity
     * @param {CombatResult} combatResult - The result of the laser attack
     * @param {TravelMap} travelMap - Reference to the travel map
     */
    constructor(attackerShipObj, targetShipObj, attackingShip, targetShip, combatResult, travelMap) {
        const attackerX = attackerShipObj.x
        const attackerY = attackerShipObj.y
        const targetX = targetShipObj.x
        const targetY = targetShipObj.y
        
        const laserLineId = `laser-line-${Date.now()}`
        let damageExecuted = false
        
        attackingShip.acting = true
        
        super(
            1000, // 1 second total duration
            (progressRatio) => {
                // Execute damage when laser reaches target (at 25% progress)
                if (!damageExecuted && progressRatio >= 0.25) {
                    damageExecuted = true
                    // Execute the combat result to apply damage
                    gs.combat.executeResult(combatResult)
                    // Display damage text
                    travelMap.combatHandler.displayDamageText(
                        targetShip,
                        combatResult.hullDamage || 0,
                        combatResult.shieldsAbsorbed || 0,
                        combatResult.destroyed,
                        !combatResult.success
                    )
                }
                
                // Remove previous line if it exists
                const existingLine = travelMap.cvs.getObject(laserLineId)
                if (existingLine) {
                    travelMap.cvs.deleteObject(laserLineId)
                }
                
                let lineX1, lineY1, lineX2, lineY2
                
                if (progressRatio <= 0.25) {
                    // Phase 1 (0-25%): Laser extends from attacker to target
                    const extendProgress = progressRatio / 0.25 // 0 to 1
                    lineX1 = attackerX
                    lineY1 = attackerY
                    lineX2 = attackerX + (targetX - attackerX) * extendProgress
                    lineY2 = attackerY + (targetY - attackerY) * extendProgress
                } else if (progressRatio <= 0.5) {
                    // Phase 2 (25-50%): Laser stays fully extended
                    lineX1 = attackerX
                    lineY1 = attackerY
                    lineX2 = targetX
                    lineY2 = targetY
                } else {
                    // Phase 3 & 4 (50-100%): Laser retracts by moving x1,y1 toward x2,y2
                    const retractProgress = (progressRatio - 0.5) / 0.5 // 0 to 1
                    lineX1 = attackerX + (targetX - attackerX) * retractProgress
                    lineY1 = attackerY + (targetY - attackerY) * retractProgress
                    lineX2 = targetX
                    lineY2 = targetY
                }
                
                // Add the laser line to canvas
                travelMap.cvs.addLine(
                    laserLineId,
                    lineX1,
                    lineY1,
                    lineX2,
                    lineY2,
                    COLORS.Red,
                    3 // line width
                )
            },
            () => {
                // On complete: remove the laser line
                const existingLine = travelMap.cvs.getObject(laserLineId)
                if (existingLine) {
                    travelMap.cvs.deleteObject(laserLineId)
                }
                attackingShip.acting = false
            }
        )
        
        this.attackingShip = attackingShip
        this.targetShip = targetShip
        this.combatResult = combatResult
        this.travelMap = travelMap
        this.laserLineId = laserLineId
    }
}
