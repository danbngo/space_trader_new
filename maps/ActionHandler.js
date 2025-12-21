class ActionHandler {
    constructor(encounterMap = new EncounterMap()) {
        this.encounterMap = encounterMap
        this.encounter = encounterMap.encounter
        this.cvs = encounterMap.cvs
    }

    startTargeting(actor = new Ship()) {
        console.log(`ActionHandler.startTargeting (${this.constructor.name})`, { actor });
        throw new Error('startTargeting must be implemented by subclass')
    }

    target(...args) {
        console.log(`ActionHandler.target (${this.constructor.name})`, { args });
        throw new Error('target must be implemented by subclass')
    }

    attempt(...args) {
        console.log(`ActionHandler.attempt (${this.constructor.name})`, { args });
        throw new Error('attempt must be implemented by subclass')
    }

    execute(action =  new ShipAction()) {
        console.log(`ActionHandler.execute (${this.constructor.name})`, { action });
        throw new Error('execute must be implemented by subclass')
    }

    calcCanBeControlled(ship = new Ship()) {
        const {activeTurnFleet, playerFleet} = this.encounter
        if (ship.fleet != activeTurnFleet) return false
        if (ship.numActionsRemaining <= 0) return false
        if (ship.fleet != playerFleet) return false
        return true
    }

    startAnimating() {
        this.encounterMap.startAnimating()
    }

    stopTargeting() {
        this.encounterMap.stopTargeting()
    }
}
