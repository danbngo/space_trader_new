/**
 * Heal animation that makes a ship gradually flash green (hull) or blue (shields)
 * @class HealFlickerAnim
 * @extends Anim
 */
class HealFlickerAnim extends Anim {
    /**
     * @param {CanvasObject} healedShipObj - The canvas object for the healed ship
     * @param {Ship} healedShip - The healed ship entity
     * @param {boolean} hullHealed - Whether hull was healed (true) or shields (false)
     * @param {TravelMap} travelMap - Reference to the travel map
     */
    constructor(healedShipObj, healedShip, hullHealed, travelMap) {
        // Record initial state
        const originalFillColor = healedShipObj.fillColor
        const originalTintRatio = healedShipObj.tintRatio || 0
        const healColor = hullHealed ? [0, 255, 0, 1] : [0, 150, 255, 1] // Green for hull, blue for shields
        
        super(
            800,
            (progressRatio) => {
                // Smooth transition: 0-0.5 fade to heal color, 0.5-1.0 fade back to original
                let transitionProgress
                if (progressRatio <= 0.5) {
                    // First half: transition from original to heal color
                    transitionProgress = progressRatio * 2 // 0 to 1
                } else {
                    // Second half: transition from heal color back to original
                    transitionProgress = 1 - ((progressRatio - 0.5) * 2) // 1 to 0
                }
                
                // Interpolate colors
                const r = originalFillColor[0] + (healColor[0] - originalFillColor[0]) * transitionProgress
                const g = originalFillColor[1] + (healColor[1] - originalFillColor[1]) * transitionProgress
                const b = originalFillColor[2] + (healColor[2] - originalFillColor[2]) * transitionProgress
                const a = originalFillColor[3] || 1
                
                healedShipObj.fillColor = [r, g, b, a]
                
                // Interpolate tint ratio
                healedShipObj.tintRatio = originalTintRatio + (1.0 - originalTintRatio) * transitionProgress
            },
            () => {
                // On complete: restore original state
                healedShipObj.fillColor = originalFillColor
                healedShipObj.tintRatio = originalTintRatio
            }
        )
        
        this.healedShip = healedShip
        this.travelMap = travelMap
    }
}
