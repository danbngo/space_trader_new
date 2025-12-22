class AttackActionHandler extends ActionHandler {
    constructor(encounterMap = new EncounterMap()) {
        super(encounterMap)
    }

    startTargeting(attacker = new Ship()) {
        console.log('AttackActionHandler.startTargeting', { attacker });
        if (!this.calcCanBeControlled(attacker)) return

        this.encounterMap.uiMode = UI_MODE.Targeting
        this.encounterMap.targetingAreas = []
        
        const [t1, t2] = attacker.calcAttackAreas()
        const targetingCvsObject1 = this.cvs.addTriangle('targetingarea', t1.x, t1.y, t1.base, t1.height, 4, [0,255,0,0.1], t1.angle)
        const targetingCvsObject2 = this.cvs.addTriangle('targetingarea2', t2.x, t2.y, t2.base, t2.height, 4, [0,255,0,0.1], t2.angle)
        const targetingCvsCircle = this.cvs.addEmptyCircle('targetingcircle', 0, 0, 0, 12, COLORS.LightGreen, 2)
        targetingCvsCircle.visible = false

        const validTargets = this.encounter.calcAttackTargets(attacker)
        if (validTargets.length > 0) this.target(validTargets[0])
        
        this.encounterMap.onHoverObject = (hoveredObj) => this.target(hoveredObj)
        this.encounterMap.onSelectObject = (selectedObj) => this.attempt(attacker, selectedObj)
        
        this.encounterMap.startTargeting('Attack', [targetingCvsObject1, targetingCvsObject2, targetingCvsCircle], validTargets)
    }

    target(target = new Ship()) {
        console.log('AttackActionHandler.target', { target });
        if (!this.encounterMap.validTargets.includes(target)) return
        
        const targetingCvsCircle = this.cvs.getObject('targetingcircle')
        Object.assign(targetingCvsCircle, {visible: true, x: target.x, y: target.y, radius: target.radius})
        this.encounterMap.refreshCanvas()
    }

    attempt(attacker = new Ship(), target = new Ship()) {
        console.log('AttackActionHandler.attempt', { attacker, target });
        if (!this.encounterMap.validTargets.includes(target)) {
            return
        }
        this.execute(new ShipAction(this.encounter, attacker, MOVE_TYPES.Attack, target))
    }

    execute(action =  new ShipAction()) {
        this.encounterMap.animatingAction = action
        console.log('AttackActionHandler.execute', { action });
        const animations = this.encounterMap.animations
        const path = action.path
        const animLine = this.cvs.addLine('laserline', 0, 0, 0, 0, COLORS.Red, 2)
        const laserDuration = 400 + 30*Math.pow(calcDistance(action.actor.x, action.actor.y, action.target.x, action.target.y), 0.5)
        
        animations.push(new Loop(laserDuration, (progressRatio)=>{
            const [x2, y2] = path.positionAtProgress(Math.min(progressRatio * 1.25))
            const [x, y] = path.positionAtProgress(Math.max(0, progressRatio*1.25 - 0.25))
            Object.assign(animLine, {x, y, x2, y2})
        }, ()=>{
            action.execute()
            this.cvs.deleteObject(animLine)
            this.encounterMap.showActionPopup(action)
            this.encounterMap.stopAnimating()
        }))
        
        this.startAnimating()
    }
}
