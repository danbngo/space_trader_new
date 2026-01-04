class LaserActionHandler extends ActionHandler {
    constructor(encounterMap ) {
        super(encounterMap)
    }

    startTargeting(attacker = new Ship()) {
        console.log('LaserActionHandler.startTargeting', { attacker });
        if (!this.calcCanBeControlled(attacker)) return

        this.encounterMap.targetingAreas = []
        
        const [t1, t2] = attacker.calcLaserAreas()
        const targetingCvsObject1 = this.cvs.addEmptyTriangle('targetingarea', t1.x, t1.y, t1.base, t1.height, 4, COLORS.Targeting, t1.angle)
        const targetingCvsObject2 = this.cvs.addEmptyTriangle('targetingarea2', t2.x, t2.y, t2.base, t2.height, 4, COLORS.Targeting, t2.angle)
        const targetingCvsCircle = this.cvs.addEmptyCircle('targetingcircle', 0, 0, 0, 12, COLORS.TargetingConfirm, 2)
        targetingCvsCircle.visible = false

        const validTargets = this.encounter.calcLaserTargets(attacker)
        if (validTargets.length > 0) this.target(validTargets[0])
        
        this.encounterMap.onHoverObject = (hoveredObj) => this.target(hoveredObj)
        this.encounterMap.onSelectObject = (selectedObj) => this.attempt(attacker, selectedObj)
        
        this.encounterMap.startTargeting('Attack', [targetingCvsObject1, targetingCvsObject2, targetingCvsCircle], validTargets)
    }

    target(target = new Ship()) {
        console.log('LaserActionHandler.target', { target });
        if (!this.encounterMap.validTargets.includes(target)) return
        
        const targetingCvsCircle = this.cvs.getObject('targetingcircle')
        Object.assign(targetingCvsCircle, {visible: true, x: target.x, y: target.y, radius: target.radius})
        this.encounterMap.refreshCanvas()
    }

    attempt(attacker = new Ship(), target = new Ship()) {
        console.log('LaserActionHandler.attempt', { attacker, target });
        if (!this.encounterMap.validTargets.includes(target)) {
            return
        }
        this.execute(new LaserAction(this.encounter, attacker, target))
    }

    execute(action =  new LaserAction()) {
        
        console.log('LaserActionHandler.execute', { action });
        
        const path = action.path
        const popupId = `laser_${Date.now()}_${Math.random()}`
        const animLine = this.cvs.addLine(popupId, 0, 0, 0, 0, COLORS.Red, 2)
        const laserDuration = 400 + 30*Math.pow(calcDistance(action.actor.x, action.actor.y, action.target.x, action.target.y), 0.5)
        
        const animation = new Loop(laserDuration, (progressRatio)=>{
            const [x2, y2] = path.positionAtProgress(Math.min(progressRatio * 1.25))
            const [x, y] = path.positionAtProgress(Math.max(0, progressRatio*1.25 - 0.25))
            Object.assign(animLine, {x, y, x2, y2})
        }, ()=>{
            this.cvs.deleteObject(animLine)
            this.completeAction(action)
        })
        
        this.startAnimating(action, animation)
    }
}
