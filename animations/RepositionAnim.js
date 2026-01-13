/**
 * Reposition animation that swaps two ships' visual positions
 * @class RepositionAnim
 * @extends Anim
 */
class RepositionAnim extends Anim {
    /**
     * @param {CanvasObject} shipObj - The canvas object for the repositioning ship
     * @param {CanvasObject} targetObj - The canvas object for the target ship
     * @param {Ship} ship - The repositioning ship entity
     * @param {Ship} target - The target ship entity
     * @param {CombatResult} combatResult - The result of the reposition attempt
     * @param {TravelMap} travelMap - Reference to the travel map
     */
    constructor(shipObj, targetObj, ship, target, combatResult, travelMap) {
        ship.acting = true
        if (target) target.acting = true
        
        // Store initial positions
        const shipStartY = shipObj ? shipObj.y : 0
        const targetStartY = targetObj ? targetObj.y : 0
        
        let textDisplayed = false
        
        super(
            800, // Duration for position swap animation
            (progressRatio) => {
                // Smooth ease-in-out curve
                const easeRatio = progressRatio < 0.5 
                    ? 2 * progressRatio * progressRatio 
                    : 1 - Math.pow(-2 * progressRatio + 2, 2) / 2
                
                // Animate ships swapping positions
                if (shipObj && targetObj && combatResult.success) {
                    // Ship moves toward target's position
                    shipObj.y = shipStartY + (targetStartY - shipStartY) * easeRatio
                    // Target moves toward ship's position
                    targetObj.y = targetStartY + (shipStartY - targetStartY) * easeRatio
                    
                    // Display "Repositioned" text at midpoint
                    if (!textDisplayed && progressRatio >= 0.5) {
                        textDisplayed = true
                        travelMap.combatHandler.displayTextOverShip(
                            ship,
                            TRAVEL_MAP_CONFIG.floatingTextColors.shieldHeal, // Blue for action
                            'Repositioned',
                            TRAVEL_MAP_CONFIG.floatingTextDuration,
                            0
                        )
                    }
                }
            },
            () => {
                // On complete
                ship.acting = false
                if (target) target.acting = false
                
                // Execute the reposition result (swaps rowIndex values)
                if (combatResult.success) {
                    gs.combat.executeResult(combatResult)
                }
                
                // Force ship positions to update based on new rowIndex values
                if (travelMap.shipHandler) {
                    travelMap.shipHandler.renderShips()
                }
            }
        )
        
        // Display failed reposition text immediately
        if (!combatResult.success) {
            travelMap.combatHandler.displayTextOverShip(
                ship,
                TRAVEL_MAP_CONFIG.floatingTextColors.missed, // Gray for failure
                'Cannot Reposition',
                TRAVEL_MAP_CONFIG.floatingTextDuration,
                0
            )
        }
        
        this.shipObj = shipObj
        this.targetObj = targetObj
        this.ship = ship
        this.target = target
    }
}
