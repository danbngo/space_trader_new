class SmokeBombActionHandler extends ActionHandler {
    constructor(encounterMap = new EncounterMap()) {
        super(encounterMap)
    }

    startTargeting(attacker = new Ship()) {
        console.log('SmokeBombActionHandler.startTargeting', { attacker });
        if (!this.calcCanBeControlled(attacker)) return

        this.encounterMap.uiMode = UI_MODE.Targeting
        this.encounterMap.targetingAreas = []
        
        // Targeting circle for smoke placement
        const smokeRadius = attacker.maxAttackDistance
        const targetingCircle = this.cvs.addEmptyCircle('targetingcircle', 0, 0, smokeRadius, 12, COLORS.LightGreen, 2)
        
        this.cvs.onClickWorldXY = (x, y) => {
            this.attempt(attacker, null, x, y)
        }
        
        this.cvs.onMouseMoveWorldXY = (x, y) => {
            targetingCircle.x = x
            targetingCircle.y = y
            this.encounterMap.refreshCanvas()
        }
        
        this.encounterMap.startTargeting('Smoke Bomb', [targetingCircle], [])
    }

    target(...args) {
        // Handled by mouse move
    }

    attempt(attacker = new Ship(), target = null, x = 0, y = 0) {
        console.log('SmokeBombActionHandler.attempt', { attacker, x, y });
        const action = new ShipAction(this.encounter, attacker, MOVE_TYPES.SmokeBomb, null, x, y)
        action.actorGoodMessage = 'Smoke Bomb!'
        this.execute(action)
    }

    execute(action = new ShipAction()) {
        console.log('SmokeBombActionHandler.execute', { action });
        this.encounterMap.animatingAction = action
        const animations = this.encounterMap.animations
        const smokeDuration = 700
        
        // Expanding smoke cloud
        const smokeCircle = this.cvs.addFilledCircle('smokebomb', action.toX, action.toY, 0, 16, [100,100,100,0.5], 0)
        const maxRadius = action.actor.maxAttackDistance
        
        animations.push(new Loop(smokeDuration, (progressRatio) => {
            smokeCircle.size = maxRadius * progressRatio
            smokeCircle.fillColor[3] = 0.5 * (1 - progressRatio * 0.5)
        }, () => {
            this.cvs.deleteObject(smokeCircle)
            this.completeAction(action)
        }))
        
        this.startAnimating()
    }
}
