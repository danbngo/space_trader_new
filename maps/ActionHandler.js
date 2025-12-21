class ActionHandler {
    constructor(encounterMap = new EncounterMap()) {
        this.encounterMap = encounterMap
        this.encounter = encounterMap.encounter
        this.cvs = encounterMap.cvs
    }

    /**
     * Start targeting mode for this action
     * @param {Ship} actor - The ship performing the action
     */
    startTargeting(actor = new Ship()) {
        console.log(`ActionHandler.startTargeting (${this.constructor.name})`, { actor });
        throw new Error('startTargeting must be implemented by subclass')
    }

    /**
     * Update targeting visuals as user hovers/moves
     * @param {...any} args - Action-specific targeting parameters
     */
    target(...args) {
        console.log(`ActionHandler.target (${this.constructor.name})`, { args });
        throw new Error('target must be implemented by subclass')
    }

    /**
     * Validate and initiate the action
     * @param {...any} args - Action-specific parameters
     */
    attempt(...args) {
        console.log(`ActionHandler.attempt (${this.constructor.name})`, { args });
        throw new Error('attempt must be implemented by subclass')
    }

    /**
     * Execute the action with animation
     * @param {ShipAction} move - The move to execute
     */
    execute(action =  new ShipAction()) {
        console.log(`ActionHandler.execute (${this.constructor.name})`, { action });
        throw new Error('execute must be implemented by subclass')
    }

    /**
     * Check if a ship can be controlled by the player
     * @param {Ship} ship
     * @returns {boolean}
     */
    calcCanBeControlled(ship = new Ship()) {
        const {activeTurnFleet, playerFleet} = this.encounter
        if (ship.fleet != activeTurnFleet) return false
        if (ship.numActionsRemaining <= 0) return false
        if (ship.fleet != playerFleet) return false
        return true
    }

    /**
     * Start the animation system
     */
    startAnimating() {
        this.encounterMap.startAnimating()
    }

    /**
     * Clean up targeting mode
     */
    stopTargeting() {
        this.encounterMap.stopTargeting()
    }
}
