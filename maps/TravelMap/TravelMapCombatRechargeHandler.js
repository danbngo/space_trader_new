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
        const {selectedPlayerShip} = this.travelMap
        if (!selectedPlayerShip) return
        
        const result = gs.combat.executeAction(selectedPlayerShip, 'recharge')
        selectedPlayerShip.actionsRemaining--
        this.combatHandler.refreshCombatLog()
        
        // Animate recharge visual effect
        this.animateRecharge(selectedPlayerShip)
        
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
