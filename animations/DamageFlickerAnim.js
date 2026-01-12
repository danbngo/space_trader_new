/**
 * Ram animation that makes an attacker ship surge forward and return
 * @class RamAnimation
 * @extends Anim
 */
class DamageFlickerAnim extends Anim {
    /**
     * @param {CanvasObject} damagedShipObj - The canvas object for the attacker
     * @param {Ship} damagedShip - The attacking ship entity
     * @param {boolean} shieldsOnly - Whether to flicker only shields (true) or hull as well (false)
     * @param {TravelMap} travelMap - Reference to the travel map
     */
    constructor(damagedShipObj, damagedShip, shieldsOnly, travelMap) {
        // Record initial state
        const originalFillColor = damagedShipObj.fillColor
        const originalTintRatio = damagedShipObj.tintRatio
        const flickerColor = shieldsOnly ? [255, 255, 255, 1] : COLORS.Red
        
        super(
            500,
            (progressRatio) => {
                // Flicker effect: alternate between flicker color and original
                const flickerFrequency = 10 // Number of flickers during animation
                const flickerPhase = Math.floor(progressRatio * flickerFrequency) % 2
                
                if (flickerPhase === 0) {
                    damagedShipObj.fillColor = flickerColor
                    damagedShipObj.tintRatio = 1.0
                } else {
                    damagedShipObj.fillColor = originalFillColor
                    damagedShipObj.tintRatio = originalTintRatio
                }
            },
            () => {
                // On complete: restore original state
                damagedShipObj.fillColor = originalFillColor
                damagedShipObj.tintRatio = originalTintRatio
            }
        )
        
        this.damagedShip = damagedShip
        this.travelMap = travelMap
    }
}