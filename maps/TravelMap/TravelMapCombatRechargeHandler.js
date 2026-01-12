/**
 * Handles recharge action functionality for TravelMap combat
 */
class TravelMapCombatRechargeHandler {
    /**
     * @param {TravelMapCombatHandler} combatHandler - Reference to parent combat handler
     */
    constructor(combatHandler) {
        this.combatHandler = combatHandler
        this.travelMap = combatHandler.travelMap
    }

    /**
     * Handles recharge action
     */
    handleRecharge() {
        const {selectedShip} = this.travelMap
        
        // Calculate the recharge result without executing it
        const result = gs.combat.calculateAction(selectedShip, 'recharge')
        selectedShip.actionsRemaining--
        
        // Animate the recharge (animation will execute result and display text)
        this.animateRecharge(selectedShip, result)
        
        // Deselect ship if it has no actions remaining
        if (selectedShip.actionsRemaining <= 0) {
            this.travelMap.selectedShip = null
        }
        
        // Wait for animation to complete before handling action completion
        this.combatHandler.waitForAnimationsThenComplete()
    }

    /**
     * Animates a recharge effect for the ship
     * @param {Ship} ship - The ship that is recharging
     * @param {CombatResult} combatResult - The result of the recharge action
     */
    animateRecharge(ship, combatResult) {
        const shipObj = this.travelMap.cvs.getObject(`ship-${ship.uuid}`)
        if (!shipObj) {
            console.warn('Could not find ship object for recharge animation')
            return
        }
        this.travelMap.animations.push(new RechargeAnim(shipObj, ship, combatResult, this.travelMap))
    }
}

