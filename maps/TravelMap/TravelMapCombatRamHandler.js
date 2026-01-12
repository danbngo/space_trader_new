/**
 * Handles ram attack functionality for TravelMap combat
 */
class TravelMapCombatRamHandler {
    /**
     * @param {TravelMapCombatHandler} combatHandler - Reference to parent combat handler
     */
    constructor(combatHandler) {
        this.combatHandler = combatHandler
        this.travelMap = combatHandler.travelMap
    }

    /**
     * Handles ram action
     */
    handleRam() {
        const {selectedShip} = this.travelMap
        // Enter targeting mode
        this.combatHandler.targetingMode = 'ram'
        this.combatHandler.targetingShip = selectedShip
        
        // Populate valid targets (all non-disabled enemy ships)
        this.combatHandler.targetedShips.clear()
        if (gs.encounter && gs.encounter.fleet && gs.encounter.fleet.ships) {
            gs.encounter.fleet.ships.forEach(ship => {
                if (!ship.disabled) {
                    this.combatHandler.targetedShips.add(ship)
                }
            })
        }
        
        this.travelMap.updateUIPanel() // Refresh to show targeting UI
    }

    /**
     * Animates a ramming ship surging forward and back
     * @param {Ship} attacker - The ship doing the ramming
     * @param {Ship} target - The ship being rammed
     * @param {number} durationMs - Total animation duration (default 600ms)
     */
    animateRam(attacker, target, durationMs = 600) {
        const attackerObj = this.travelMap.cvs.getObject(`ship-${attacker.uuid}`)
        const targetObj = this.travelMap.cvs.getObject(`ship-${target.uuid}`)
        
        if (!attackerObj || !targetObj) {
            console.warn('Could not find ship objects for ram animation')
            return
        }
        
        const startX = attackerObj.x
        const targetX = targetObj.x
        const midpointX = (startX + targetX) / 2
        
        // Store original position on the ship object
        attackerObj.ramStartX = startX
        attackerObj.ramMidpointX = midpointX
        
        const ramAnimation = new Loop(
            durationMs,
            (progressRatio) => {
                const shipObj = this.travelMap.cvs.getObject(`ship-${attacker.uuid}`)
                if (!shipObj) return
                
                if (progressRatio <= 0.5) {
                    // First half: surge forward to midpoint
                    const forwardProgress = progressRatio * 2 // 0 to 1
                    shipObj.x = startX + (midpointX - startX) * forwardProgress
                } else {
                    // Second half: return to start
                    const returnProgress = (progressRatio - 0.5) * 2 // 0 to 1
                    shipObj.x = midpointX + (startX - midpointX) * returnProgress
                }
            },
            () => {
                // On complete: ensure ship is back at start position
                const shipObj = this.travelMap.cvs.getObject(`ship-${attacker.uuid}`)
                if (shipObj) {
                    shipObj.x = startX
                }
            }
        )
        
        this.travelMap.animations.push(ramAnimation)
    }
}
