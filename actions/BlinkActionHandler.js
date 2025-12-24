class BlinkActionHandler extends ActionHandler {
    constructor(encounterMap = new EncounterMap()) {
        super(encounterMap)
    }

    startTargeting(ship = new Ship()) {
        console.log('BlinkActionHandler.startTargeting', { ship });
        if (!this.calcCanBeControlled(ship)) return

        this.encounterMap.targetingAreas = []
        
        // Blink distance from BlinkAction.js
        const blinkDistance = 25
        
        // Show the blink radius circle centered on ship to indicate where they might blink
        const blinkCircle = this.cvs.addEmptyCircle('targetingarea', ship.x, ship.y, blinkDistance, 12, COLORS.Targeting)
        
        // Click anywhere to confirm blink
        this.cvs.onClickWorldXY = (x, y) => this.attempt(ship)
        
        this.encounterMap.startTargeting('Blink', [blinkCircle], [])
    }

    target(...args) {
        // No dynamic targeting needed - blink is random within radius
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
        
        const shipObj = this.cvs.getObject(`ship${ship.uuid}`)
        
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
