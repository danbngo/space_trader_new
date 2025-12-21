class WaitActionHandler extends ActionHandler {
    constructor(encounterMap = new EncounterMap()) {
        super(encounterMap)
    }

    startTargeting(ship = new Ship()) {
        // Wait doesn't need targeting, so this can be skipped
        // Just call attempt directly
        this.attempt(ship)
    }

    target(...args) {
        // No targeting needed for wait
    }

    attempt(ship = new Ship()) {
        console.log('WaitActionHandler.attempt', { ship });
        this.execute(new ShipAction(this.encounter, ship, MOVE_TYPES.Wait))
    }

    execute(action =  new ShipAction()) {
        this.encounterMap.animatingAction = null
        console.log('WaitActionHandler.execute', { action });
        action.execute()
        this.encounterMap.stopAnimating()
    }
}
