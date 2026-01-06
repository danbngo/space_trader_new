class MagnetizeActionHandler extends ActionHandler {
    constructor(encounterMap ) {
        super(encounterMap)
    }

    startTargeting(attacker = new Ship()) {
        console.log('MagnetizeActionHandler.startTargeting', { attacker });
        if (!this.calcCanBeControlled(attacker)) return

        this.encounterMap.targetingAreas = []
        
        // Scale targeting distance with module quality (1.0 = baseline)
        const quality = attacker.getModuleQuality(SHIP_MODULE_TYPES.MAGNETIZE)
        const baseArea = attacker.calcBeamArea()
        const scaledHeight = baseArea.height * quality
        const targetArea = new Triangle(baseArea.x, baseArea.y, baseArea.base, scaledHeight, baseArea.angle)
        
        // Show targeting triangle in front of ship
        const targetingCvsTriangle = this.cvs.addEmptyTriangle('targetingarea', targetArea.x, targetArea.y, targetArea.base, targetArea.height, 4, COLORS.Targeting, targetArea.angle)
        const targetingCvsCircle = this.cvs.addEmptyCircle('targetingcircle', 0, 0, 0, 12, COLORS.TargetingConfirm, 2)
        targetingCvsCircle.visible = false

        const validTargets = this.encounter.calcBeamTargets(attacker, targetArea)
        if (validTargets.length > 0) this.target(validTargets[0])
        
        this.encounterMap.onHoverObject = (hoveredObj) => this.target(hoveredObj)
        this.encounterMap.onSelectObject = (selectedObj) => this.attempt(attacker, selectedObj)
        
        this.encounterMap.startTargeting('Magnetize', [targetingCvsTriangle, targetingCvsCircle], validTargets)
    }

    target(target = new Ship()) {
        console.log('MagnetizeActionHandler.target', { target });
        if (!this.encounterMap.validTargets.includes(target)) return
        
        const targetingCvsCircle = this.cvs.getObject('targetingcircle')
        Object.assign(targetingCvsCircle, {visible: true, x: target.x, y: target.y, radius: target.radius})
        this.encounterMap.refreshCanvas()
    }

    attempt(attacker = new Ship(), target = new Ship()) {
        console.log('MagnetizeActionHandler.attempt', { attacker, target });
        if (!this.encounterMap.validTargets.includes(target)) return
        const action = new MagnetizeAction(this.encounter, attacker, target)
        this.execute(action)
    }

    execute(action = new MagnetizeAction()) {
        console.log('MagnetizeActionHandler.execute', { action });
        
        
        const beamDuration = 1000
        
        // Wavy line between ships
        const popupId = `magnetize_${Date.now()}_${Math.random()}`
        const beamLine = this.cvs.addLine(popupId, action.actor.x, action.actor.y, action.target.x, action.target.y, COLORS.Purple, 3)
        
        const animation = new Loop(beamDuration, (progressRatio) => {
            action.actor.x = action.startX + (action.toX - action.startX) * progressRatio
            action.actor.y = action.startY + (action.toY - action.startY) * progressRatio
            action.target.x = action.targetStartX + (action.targetToX - action.targetStartX) * progressRatio
            action.target.y = action.targetStartY + (action.targetToY - action.targetStartY) * progressRatio
            beamLine.x = action.actor.x
            beamLine.y = action.actor.y
            beamLine.x2 = action.target.x
            beamLine.y2 = action.target.y
        }, () => {
            this.cvs.deleteObject(beamLine)
            this.completeAction(action)
        })
        
        this.startAnimating(action, animation)
    }
}
