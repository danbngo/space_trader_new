class RamActionHandler extends ActionHandler {
    constructor(encounterMap = new EncounterMap()) {
        super(encounterMap)
    }

    startTargeting(attacker = new Ship()) {
        console.log('RamActionHandler.startTargeting', { attacker });
        if (!this.calcCanBeControlled(attacker)) return
        
        this.encounterMap.uiMode = UI_MODE.Targeting
        this.encounterMap.targetingAreas = []
        
        const ellipse = attacker.calcMoveArea()
        const targetingCvsObject = this.cvs.addFilledOval('targetingarea', ellipse.x, ellipse.y, ellipse.radiusX, ellipse.radiusY, 4, [0,255,0,0.1], ellipse.angle)
        const targetingCvsCircle = this.cvs.addEmptyCircle('targetingcircle', 0, 0, 0, 12, COLORS.LightGreen, 2)
        targetingCvsCircle.visible = false

        const validTargets = this.encounter.calcRamTargets(attacker)
        if (validTargets.length > 0) this.target(validTargets[0])
        
        this.encounterMap.onHoverObject = (hoveredObj) => this.target(hoveredObj)
        this.encounterMap.onSelectObject = (selectedObj) => this.attempt(attacker, selectedObj)
        
        this.encounterMap.startTargeting('Ram', [targetingCvsObject, targetingCvsCircle], validTargets)
    }

    target(target = new Ship()) {
        console.log('RamActionHandler.target', { target });
        if (!this.encounterMap.validTargets.includes(target)) return
        
        const targetingCvsCircle = this.cvs.getObject('targetingcircle')
        Object.assign(targetingCvsCircle, {visible: true, x: target.x, y: target.y, radius: target.radius})
        this.encounterMap.refreshCanvas()
    }

    attempt(attacker = new Ship(), target = new Ship()) {
        console.log('RamActionHandler.attempt', { attacker, target });
        if (!this.encounterMap.validTargets.includes(target)) {
            return
        }
        this.execute(new ShipAction(this.encounter, attacker, MOVE_TYPES.Ram, target))
    }

    execute(action =  new ShipAction()) {
        console.log('RamActionHandler.execute', { action });
        this.encounterMap.animatingAction = action
        const animations = this.encounterMap.animations
        const path = action.path
        const attacker = action.actor
        
        const animLine = this.cvs.addLine('ramline', action.path.startX, action.path.startY, action.path.toX, action.path.toY, attacker.color, 2)
        const ramDuration = 500

        animations.push(new Loop(ramDuration, (progressRatio)=>{
            const [newX, newY] = path.positionAtProgress(progressRatio)
            Object.assign(attacker, {x: newX, y: newY, angle: path.angle})
        }, ()=>{
            this.cvs.deleteObject(animLine)
            this.completeAction(action)
        }))
        
        this.startAnimating()
    }
}
