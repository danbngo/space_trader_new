class SmokeBombActionHandler extends ActionHandler {
    constructor(encounterMap = new EncounterMap()) {
        super(encounterMap)
    }

    startTargeting(attacker = new Ship()) {
        console.log('SmokeBombActionHandler.startTargeting', { attacker });
        if (!this.calcCanBeControlled(attacker)) return

        this.encounterMap.targetingAreas = []
        
        // Get targeting area (circle in front of ship)
        const targetArea = attacker.calcPulseArea()
        
        // Show the targeting area boundary
        const targetingAreaCircle = this.cvs.addEmptyCircle('targetingarea', targetArea.x, targetArea.y, targetArea.radius, 12, COLORS.Targeting, 2)
        
        // Show the smoke cloud preview (ellipse that follows mouse)
        const avgDebrisRadius = (EFFECT_TYPES.DEBRIS_CLOUD.maxSize + EFFECT_TYPES.DEBRIS_CLOUD.minSize)/2
        const majorAxis = avgDebrisRadius
        const minorAxis = avgDebrisRadius * 0.5
        // Initial angle perpendicular to ship's forward direction
        const initialAngle = attacker.angle + Math.PI / 2
        const targetingCvsEllipse = this.cvs.addEmptyOval('targetingcircle', targetArea.x, targetArea.y, majorAxis, minorAxis, 2, COLORS.TargetingConfirm, initialAngle, 2)
        
        this.cvs.onClickWorldXY = (x, y) => this.attempt(attacker, targetArea, x, y)
        this.cvs.onMouseMoveWorldXY = (x, y) => this.target(attacker, x, y, targetArea)
        
        this.encounterMap.startTargeting('Smoke Bomb', [targetingAreaCircle, targetingCvsEllipse], [])
    }

    target(attacker = new Ship(), x = 0, y = 0, targetArea = new Circle()) {
        console.log('SmokeBombActionHandler.target', { x, y });
        if (!targetArea.containsPoint(x, y)) {
            return
        }
        const targetingCvsEllipse = this.cvs.getObject('targetingcircle')
        // Calculate angle from ship to target position (perpendicular to aiming direction)
        const aimAngle = Math.atan2(y - attacker.y, x - attacker.x)
        const ellipseAngle = aimAngle + Math.PI / 2
        Object.assign(targetingCvsEllipse, {visible: true, x, y, angle: ellipseAngle})
        this.encounterMap.refreshCanvas()
    }

    attempt(attacker = new Ship(), targetArea = new Circle(), x = 0, y = 0) {
        console.log('SmokeBombActionHandler.attempt', { attacker, x, y });
        if (!targetArea.containsPoint(x, y)) {
            return
        }
        const action = new SmokeBombAction(this.encounter, attacker, x, y)
        this.execute(action)
    }

    execute(action = new SmokeBombAction()) {
        console.log('SmokeBombActionHandler.execute', { action });
        
        const smokeDuration = 700
        
        // Expanding smoke cloud
        const smokeCircle = this.cvs.addFilledCircle('smokebomb', action.toX, action.toY, 0, 16, [100,100,100,0.5], 0)
        const maxRadius = (EFFECT_TYPES.DEBRIS_CLOUD.maxSize + EFFECT_TYPES.DEBRIS_CLOUD.minSize)/4
        
        const animation = new Loop(smokeDuration, (progressRatio) => {
            smokeCircle.size = maxRadius * progressRatio
            smokeCircle.fillColor[3] = 0.5 * (1 - progressRatio * 0.5)
        }, () => {
            this.cvs.deleteObject(smokeCircle)
            this.completeAction(action)
        })
        
        this.startAnimating(action, animation)
    }
}
