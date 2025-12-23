class MoveActionHandler extends ActionHandler {
    constructor(encounterMap = new EncounterMap()) {
        super(encounterMap)
    }

    startTargeting(mover = new Ship()) {
        console.log('MoveActionHandler.startTargeting', { mover });
        if (!this.calcCanBeControlled(mover)) return
        
        const ellipse = mover.calcMoveArea()
        const targetingCvsObject = this.cvs.addFilledOval('targetingarea', ellipse.x, ellipse.y, ellipse.radiusX, ellipse.radiusY, 4, COLORS.Targeting, ellipse.angle)
        const targetingCvsCircle = this.cvs.addEmptyCircle('targetingcircle', ellipse.x, ellipse.y, mover.radius, 4, COLORS.TargetingConfirm, 2)
        
        this.cvs.onClickWorldXY = (x, y) => this.attempt(x, y, ellipse, mover)
        this.cvs.onMouseMoveWorldXY = (x, y) => this.target(x, y, ellipse)
        
        this.encounterMap.startTargeting('Move', [targetingCvsObject, targetingCvsCircle])
    }

    target(x = 0, y = 0, ellipse = new Ellipse()) {
        console.log('MoveActionHandler.target', { x, y });
        if (!ellipse.containsPoint(x, y)) {
            return
        }
        const targetingCvsCircle = this.cvs.getObject('targetingcircle')
        Object.assign(targetingCvsCircle, {visible: true, x, y})
        this.encounterMap.refreshCanvas()
    }

    attempt(x = 0, y = 0, ellipse = new Ellipse(), mover = new Ship()) {
        console.log('MoveActionHandler.attempt', { x, y, mover });
        if (!ellipse.containsPoint(x, y)) {
            return
        }
        this.execute(new MoveAction(this.encounter, mover, x, y))
    }

    execute(action =  new MoveAction()) {
        console.log('MoveActionHandler.execute', { action });
        const mover = action.actor
        mover.angle = action.path.angle
        
        const popupId = `move_${Date.now()}_${Math.random()}`
        const animLine = this.cvs.addLine(popupId, action.path.startX, action.path.startY, action.path.toX, action.path.toY, mover.color, 1)

        //make asteroids move really fast so player doesn't get annoyed
        const duration = mover.aiType == AI_TYPES.Ship ? 500 : 200
        const animation = new Loop(duration, (progressRatio)=>{
            const [newX, newY] = action.path.positionAtProgress(progressRatio)
            Object.assign(mover, {x: newX, y: newY, angle:action.path.angle})
        }, ()=>{
            this.cvs.deleteObject(animLine)
            this.completeAction(action)
        })
        
        this.startAnimating(action, animation)
    }
}
