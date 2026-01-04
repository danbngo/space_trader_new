class BoosterActionHandler extends ActionHandler {
    constructor(encounterMap ) {
        super(encounterMap)
    }

    startTargeting(attacker = new Ship()) {
        console.log('BoosterActionHandler.startTargeting', { attacker });
        if (!this.calcCanBeControlled(attacker)) return

        this.encounterMap.targetingAreas = []
        
        // Calculate where the ship will boost to
        const boostDistance = attacker.maxMoveDistance * 4
        const [dx, dy] = rotatePoint(boostDistance, 0, 0, 0, attacker.angle)
        const toX = attacker.x + dx
        const toY = attacker.y + dy
        
        // Show a line indicating where the ship will boost
        const boostLine = this.cvs.addLine('targetingline', attacker.x, attacker.y, toX, toY, COLORS.Targeting, 8)
        
        // Click anywhere to confirm boost
        this.cvs.onClickWorldXY = (x, y) => this.attempt(attacker)
        this.encounterMap.cvs.objClickEnabled = false
        this.encounterMap.startTargeting('Booster', [boostLine], [])
    }

    target(...args) {
        // No dynamic targeting needed - boost is in the direction ship is facing
    }

    attempt(attacker = new Ship()) {
        console.log('BoosterActionHandler.attempt', { attacker });
        const action = new BoosterAction(this.encounter, attacker)
        this.encounterMap.cvs.objClickEnabled = true
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
