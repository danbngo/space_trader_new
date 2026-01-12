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
        
        // Populate valid targets (all non-disabled, non-escaped enemy ships)
        this.combatHandler.targetedShips.clear()
        if (gs.encounter && gs.encounter.fleet && gs.encounter.fleet.ships) {
            gs.encounter.fleet.ships.forEach(ship => {
                if (!ship.disabled && !ship.escaped) {
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
     * @param {Object} combatResult - The result of the ram attack
     */
    animateRam(attacker, target, combatResult) {
        const attackerObj = this.travelMap.cvs.getObject(`ship-${attacker.uuid}`)
        const targetObj = this.travelMap.cvs.getObject(`ship-${target.uuid}`)
        if (!attackerObj || !targetObj) {
            console.warn('Could not find ship objects for ram animation')
            return
        }
        this.travelMap.animations.push(new RamAnimation(attackerObj, targetObj, attacker, target, combatResult, this.travelMap))
    }
}
