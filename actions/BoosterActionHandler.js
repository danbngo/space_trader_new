class BoosterActionHandler extends ActionHandler {
    constructor(encounterMap = new EncounterMap()) {
        super(encounterMap)
    }

    startTargeting(attacker = new Ship()) {
        console.log('BoosterActionHandler.startTargeting', { attacker });
        if (!this.calcCanBeControlled(attacker)) return

        // Booster doesn't need targeting - just boost in the direction ship is facing
        this.attempt(attacker)
    }

    target(...args) {
        // No targeting needed
    }

    attempt(attacker = new Ship(), target = null, x = 0, y = 0) {
        console.log('BoosterActionHandler.attempt', { attacker });
        const action = new BoosterAction(this.encounter, attacker)
        this.execute(action)
    }

    execute(action = new BoosterAction()) {
        console.log('BoosterActionHandler.execute', { action });
        
        
        const boostDuration = 1000
        const path = action.path
        const attacker = action.actor
        
        // Trail effect
        const popupId = `boosttrail_${Date.now()}_${Math.random()}`
        const trailLine = this.cvs.addLine(popupId, action.path.startX, action.path.startY, action.path.toX, action.path.toY, COLORS.Orange, 4)
        
        const animation = new Loop(boostDuration, (progressRatio) => {
            const [newX, newY] = path.positionAtProgress(progressRatio)
            Object.assign(attacker, {x: newX, y: newY, angle: path.angle})
            trailLine.strokeColor[3] = 1 - progressRatio
        }, () => {
            this.cvs.deleteObject(trailLine)
            this.completeAction(action)
        })
        
        this.startAnimating(action, animation)
    }
}
