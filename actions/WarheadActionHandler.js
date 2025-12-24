class WarheadActionHandler extends ActionHandler {
    constructor(encounterMap = new EncounterMap()) {
        super(encounterMap)
    }

    startTargeting(attacker = new Ship()) {
        console.log('WarheadActionHandler.startTargeting', { attacker });
        if (!this.calcCanBeControlled(attacker)) return

        this.encounterMap.targetingAreas = []
        
        // Get targeting area (circle in front of ship)
        const targetArea = attacker.calcBombArea()
        
        // Show the targeting area boundary
        const targetingAreaCircle = this.cvs.addEmptyCircle('targetingarea', targetArea.x, targetArea.y, targetArea.radius, 12, COLORS.Targeting, 2)
        
        // Show the explosion preview (smaller circle that follows mouse)
        const explosionRadius = attacker.maxAttackDistance * 0.25
        const targetingCvsCircle = this.cvs.addEmptyCircle('targetingcircle', targetArea.x, targetArea.y, explosionRadius, 12, COLORS.TargetingConfirm, 2)
        
        this.cvs.onClickWorldXY = (x, y) => this.attempt(attacker, targetArea, x, y)
        this.cvs.onMouseMoveWorldXY = (x, y) => this.target(x, y, targetArea)
        
        this.encounterMap.startTargeting('Warhead', [targetingAreaCircle, targetingCvsCircle], [])
    }

    target(x = 0, y = 0, targetArea = new Circle()) {
        console.log('WarheadActionHandler.target', { x, y });
        if (!targetArea.containsPoint(x, y)) {
            return
        }
        const targetingCvsCircle = this.cvs.getObject('targetingcircle')
        Object.assign(targetingCvsCircle, {visible: true, x, y})
        this.encounterMap.refreshCanvas()
    }

    attempt(attacker = new Ship(), targetArea = new Circle(), x = 0, y = 0) {
        console.log('WarheadActionHandler.attempt', { attacker, x, y });
        if (!targetArea.containsPoint(x, y)) {
            return
        }
        const action = new WarheadAction(this.encounter, attacker, null, x, y)
        this.execute(action)
    }

    execute(action = new WarheadAction()) {
        console.log('WarheadActionHandler.execute', { action });
        const explosionDuration = 1000
        
        // Expanding explosion circle
        const popupId = `warhead_${Date.now()}_${Math.random()}`
        const explosionCircle = this.cvs.addFilledCircle(popupId, action.toX, action.toY, 0, 16, COLORS.Orange, 0)
        const maxRadius = action.actor.maxAttackDistance * 0.25
        
        const animation = new Loop(explosionDuration, (progressRatio) => {
            explosionCircle.size = maxRadius * progressRatio
            explosionCircle.fillColor[3] = 1 - progressRatio
        }, () => {
            this.cvs.deleteObject(explosionCircle)
            this.completeAction(action)
        })
        this.startAnimating(action, animation)
    }
}
