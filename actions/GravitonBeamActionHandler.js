class GravitonBeamActionHandler extends ActionHandler {
    constructor(encounterMap = new EncounterMap()) {
        super(encounterMap)
    }

    startTargeting(attacker = new Ship()) {
        console.log('GravitonBeamActionHandler.startTargeting', { attacker });
        if (!this.calcCanBeControlled(attacker)) return

        this.encounterMap.uiMode = UI_MODE.Targeting
        this.encounterMap.targetingAreas = []
        
        // Show targeting triangle in front of ship
        const targetArea = attacker.calcGravitonBeamArea()
        const targetingCvsTriangle = this.cvs.addTriangle('targetingarea', targetArea.x, targetArea.y, targetArea.base, targetArea.height, 4, COLORS.Targeting, targetArea.angle)
        const targetingCvsCircle = this.cvs.addEmptyCircle('targetingcircle', 0, 0, 0, 12, COLORS.TargetingConfirm, 2)
        targetingCvsCircle.visible = false

        const validTargets = this.encounter.calcGravitonBeamTargets(attacker)
        if (validTargets.length > 0) this.target(validTargets[0])
        
        this.encounterMap.onHoverObject = (hoveredObj) => this.target(hoveredObj)
        this.encounterMap.onSelectObject = (selectedObj) => this.attempt(attacker, selectedObj)
        
        this.encounterMap.startTargeting('Graviton Beam', [targetingCvsTriangle, targetingCvsCircle], validTargets)
    }

    target(target = new Ship()) {
        console.log('GravitonBeamActionHandler.target', { target });
        if (!this.encounterMap.validTargets.includes(target)) return
        
        const targetingCvsCircle = this.cvs.getObject('targetingcircle')
        Object.assign(targetingCvsCircle, {visible: true, x: target.x, y: target.y, radius: target.radius})
        this.encounterMap.refreshCanvas()
    }

    attempt(attacker = new Ship(), target = new Ship()) {
        console.log('GravitonBeamActionHandler.attempt', { attacker, target });
        if (!this.encounterMap.validTargets.includes(target)) return
        const action = new GravitonBeamAction(this.encounter, attacker, target)
        this.execute(action)
    }

    execute(action = new GravitonBeamAction()) {
        console.log('GravitonBeamActionHandler.execute', { action });
        this.encounterMap.animatingAction = action
        const animations = this.encounterMap.animations
        const beamDuration = 1000
        
        // Wavy line between ships
        const popupId = `gravitonbeam_${Date.now()}_${Math.random()}`
        const beamLine = this.cvs.addLine(popupId, action.actor.x, action.actor.y, action.target.x, action.target.y, COLORS.Purple, 3)
        
        animations.push(new Loop(beamDuration, (progressRatio) => {
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
        }))
        
        this.startAnimating(action)
    }
}
