class BlinkActionHandler extends ActionHandler {
    constructor(encounterMap = new EncounterMap()) {
        super(encounterMap)
    }

    startTargeting(ship = new Ship()) {
        // Blink doesn't need targeting - random teleport
        this.attempt(ship)
    }

    target(...args) {
        // No targeting needed
    }

    attempt(ship = new Ship()) {
        console.log('BlinkActionHandler.attempt', { ship });
        const action = new BlinkAction(this.encounter, ship)
        this.execute(action)
    }

    execute(action = new BlinkAction()) {
        console.log('BlinkActionHandler.execute', { action });
        
        const ship = action.actor
        const blinkDuration = 1000
        
        const shipIndex = this.encounter.ships.indexOf(ship)
        const shipObj = this.cvs.getObject(`ship${shipIndex}`)
        
        const animation = new Loop(blinkDuration, (progressRatio) => {
            // Fade out then fade in
            shipObj.fillColor[3] = 1 - progressRatio
            //console.log('shipObj fillColor while blinking:',shipObj,shipObj.fillColor[3])
        }, () => {
            this.completeAction(action)
        })
        
        this.startAnimating(action, animation)
    }
}
