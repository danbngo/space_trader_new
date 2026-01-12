/**
 * Flee animation that displays the flee result
 * @class FleeAnim
 * @extends Anim
 */
class FleeAnim extends Anim {
    /**
     * @param {CanvasObject} shipObj - The canvas object for the fleeing ship
     * @param {Ship} ship - The fleeing ship entity
     * @param {CombatResult} combatResult - The result of the flee attempt
     * @param {TravelMap} travelMap - Reference to the travel map
     */
    constructor(shipObj, ship, combatResult, travelMap) {
        ship.acting = true
        
        const initialOpacity = shipObj ? shipObj.fillColor[3] : 1.0
        let textDisplayed = false
        
        super(
            1500, // Longer duration for fade-out effect
            (progressRatio) => {
                // Fade out the ship on successful escape
                if (combatResult.escaped && shipObj) {
                    const newOpacity = initialOpacity * (1 - progressRatio)
                    shipObj.fillColor[3] = newOpacity
                    
                    // Display "Escaped" text when opacity reaches 0 (end of animation)
                    if (!textDisplayed && progressRatio >= 0.99) {
                        textDisplayed = true
                        travelMap.combatHandler.displayTextOverShip(
                            ship,
                            TRAVEL_MAP_CONFIG.floatingTextColors.shieldHeal, // Blue for success
                            'Escaped',
                            TRAVEL_MAP_CONFIG.floatingTextDuration,
                            0
                        )
                    }
                }
            },
            () => {
                // On complete
                ship.acting = false
                
                // Hide the ship completely after fade-out
                if (combatResult.escaped && shipObj) {
                    shipObj.visible = false
                    shipObj.fillColor[3] = 0
                    // Execute the flee result (sets escaped flag if successful)
                    gs.combat.executeResult(combatResult)
                }
            }
        )
        
        
        // Display result text for failed escapes immediately
        if (!combatResult.escaped) {
            travelMap.combatHandler.displayDamageText(
                ship,
                0, // No hull damage
                0, // No shield damage
                false, // Not destroyed
                'Failed' // Failed flee attempt
            )
        }
        
        this.ship = ship
        this.combatResult = combatResult
        this.initialOpacity = initialOpacity
    }
}
