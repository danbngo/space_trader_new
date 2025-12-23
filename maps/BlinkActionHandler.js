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
        this.execute(new ShipAction(this.encounter, ship, MOVE_TYPES.Blink))
    }

    execute(action = new ShipAction()) {
        console.log('BlinkActionHandler.execute', { action });
        this.encounterMap.animatingAction = action
        const animations = this.encounterMap.animations
        const ship = action.actor
        const blinkDuration = 400
        
        const shipIndex = this.encounter.ships.indexOf(ship)
        const shipObj = this.cvs.getObject(`ship${shipIndex}`)
        
        animations.push(new Loop(blinkDuration, (progressRatio) => {
            // Fade out then fade in
            if (progressRatio < 0.5) {
                shipObj.fillColor[3] = 1 - progressRatio * 2
            } else {
                shipObj.fillColor[3] = (progressRatio - 0.5) * 2
            }
        }, () => {
            action.execute()
            this.encounterMap.stopAnimating()
        }))
        
        this.startAnimating()
    }
}
