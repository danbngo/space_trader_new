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
        const boostDistance = 10
        const [dx, dy] = rotatePoint(boostDistance, 0, 0, 0, attacker.angle)
        const toX = attacker.x + dx
        const toY = attacker.y + dy
        this.execute(new ShipAction(this.encounter, attacker, MOVE_TYPES.Booster, null, toX, toY))
    }

    execute(action = new ShipAction()) {
        console.log('BoosterActionHandler.execute', { action });
        this.encounterMap.animatingAction = action
        const animations = this.encounterMap.animations
        const boostDuration = 600
        const path = action.path
        const attacker = action.actor
        
        // Trail effect
        const trailLine = this.cvs.addLine('boosttrail', action.path.startX, action.path.startY, action.path.toX, action.path.toY, COLORS.Orange, 4)
        
        animations.push(new Loop(boostDuration, (progressRatio) => {
            const [newX, newY] = path.positionAtProgress(progressRatio)
            Object.assign(attacker, {x: newX, y: newY, angle: path.angle})
            trailLine.strokeColor[3] = 1 - progressRatio
        }, () => {
            action.execute()
            this.cvs.deleteObject(trailLine)
            this.encounterMap.stopAnimating()
        }))
        
        this.startAnimating()
    }
}
