class DrillActionHandler extends ActionHandler {
    constructor(encounterMap = new EncounterMap()) {
        super(encounterMap)
    }

    startTargeting(attacker = new Ship()) {
        console.log('DrillActionHandler.startTargeting', { attacker });
        if (!this.calcCanBeControlled(attacker)) return
        
        this.encounterMap.targetingAreas = []
        
        const ellipse = attacker.calcMoveArea()
        const targetingCvsObject = this.cvs.addEmptyOval('targetingarea', ellipse.x, ellipse.y, ellipse.radiusX, ellipse.radiusY, 4, COLORS.Targeting, ellipse.angle, 2)
        const targetingCvsCircle = this.cvs.addEmptyCircle('targetingcircle', 0, 0, 0, 12, COLORS.TargetingConfirm, 2)
        targetingCvsCircle.visible = false

        const validTargets = this.encounter.calcRamTargets(attacker) // Use same targeting logic as ram
        if (validTargets.length > 0) this.target(validTargets[0])
        
        this.encounterMap.onHoverObject = (hoveredObj) => this.target(hoveredObj)
        this.encounterMap.onSelectObject = (selectedObj) => this.attempt(attacker, selectedObj)
        
        this.encounterMap.startTargeting('Drill', [targetingCvsObject, targetingCvsCircle], validTargets)
    }

    target(target = new Ship()) {
        console.log('DrillActionHandler.target', { target });
        if (!this.encounterMap.validTargets.includes(target)) return
        
        const targetingCvsCircle = this.cvs.getObject('targetingcircle')
        Object.assign(targetingCvsCircle, {visible: true, x: target.x, y: target.y, radius: target.radius})
        this.encounterMap.refreshCanvas()
    }

    attempt(attacker = new Ship(), target = new Ship()) {
        console.log('DrillActionHandler.attempt', { attacker, target });
        if (!this.encounterMap.validTargets.includes(target)) {
            return
        }
        const action = new DrillAction(this.encounter, attacker, target)
        this.execute(action)
    }

    execute(action = new DrillAction()) {
        console.log('DrillActionHandler.execute', { action });
        const path = action.path
        const attacker = action.actor
        
        const popupId = `drill_${Date.now()}_${Math.random()}`
        const animLine = this.cvs.addLine(popupId, action.path.startX, action.path.startY, action.path.toX, action.path.toY, COLORS.Brown, 3)
        const drillDuration = 600

        const animation = new Loop(drillDuration, (progressRatio)=>{
            const [newX, newY] = path.positionAtProgress(progressRatio)
            Object.assign(attacker, {x: newX, y: newY, angle: path.angle})
        }, ()=>{
            this.cvs.deleteObject(animLine)
            this.completeAction(action)
        })
        
        this.startAnimating(action, animation)
    }
}
