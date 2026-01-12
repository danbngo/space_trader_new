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
        const result = gs.combat.executeAction(selectedShip, 'recharge')
        selectedShip.actionsRemaining--
        
        // Display amount recharged over ship
        if (result.shieldsRecharged && result.shieldsRecharged > 0) {
            this.combatHandler.displayTextOverShip(
                selectedShip, 
                TRAVEL_MAP_CONFIG.floatingTextColors.shieldDamage, 
                `+${result.shieldsRecharged}`, 
                TRAVEL_MAP_CONFIG.floatingTextDuration, 
                0
            )
        }
        
        // Animate recharge visual effect
        this.animateRecharge(selectedShip)
        
        // Deselect ship if it has no actions remaining
        if (selectedShip.actionsRemaining <= 0) {
            this.travelMap.selectedShip = null
        }
        
        this.combatHandler.handleActionComplete()
    }

    /**
     * Animates a blue shield effect over the ship during recharge
     * @param {Ship} ship - The ship that is recharging
     * @param {number} durationMs - Duration of the animation (default 1500ms)
     */
    animateRecharge(ship, durationMs = 1500) {
        const shipObj = this.travelMap.cvs.getObject(`ship-${ship.uuid}`)
        
        if (!shipObj) {
            console.warn('Could not find ship object for recharge animation')
            return
        }
        
        // Create a blue shield oval over the ship
        const shieldId = `recharge-shield-${ship.uuid}-${Date.now()}`
        const shieldSize = TRAVEL_MAP_CONFIG.shipSize * 0.8
        
        const shieldObj = this.travelMap.cvs.addFilledOval(
            shieldId,
            shipObj.x,
            shipObj.y,
            shieldSize,      // radiusX
            shieldSize,      // radiusY
            0,               // minScreenSize
            [100, 150, 255, 0.7], // fillColor - Blue with transparency
            0,               // angle
            null             // No onClick
        )
        
        if (shieldObj) {
            // Set duration to make it automatically disappear
            shieldObj.durationMs = durationMs
            shieldObj.createdAt = Date.now()
        }
    }
}
