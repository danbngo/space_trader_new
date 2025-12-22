class MoveActionHandler extends ActionHandler {
    constructor(encounterMap = new EncounterMap()) {
        super(encounterMap)
    }

    startTargeting(mover = new Ship()) {
        console.log('MoveActionHandler.startTargeting', { mover });
        if (!this.calcCanBeControlled(mover)) return
        
        const ellipse = mover.calcMoveArea()
        const targetingCvsObject = this.cvs.addFilledOval('targetingarea', ellipse.x, ellipse.y, ellipse.radiusX, ellipse.radiusY, 4, [0,255,0,0.1], ellipse.angle)
        const targetingCvsCircle = this.cvs.addEmptyCircle('targetingcircle', ellipse.x, ellipse.y, mover.radius, 4, COLORS.LightGreen, 2)
        
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
        this.execute(new ShipAction(this.encounter, mover, MOVE_TYPES.Move, null, x, y))
    }

    execute(action =  new ShipAction()) {
        console.log('MoveActionHandler.execute', { action });
        this.encounterMap.animatingAction = action
        const animations = this.encounterMap.animations
        const mover = action.actor
        mover.angle = action.path.angle
        
        const animLine = this.cvs.addLine('moveline', action.path.startX, action.path.startY, action.path.toX, action.path.toY, mover.color, 1)

        //make asteroids move really fast so player doesn't get annoyed
        const duration = mover.aiType == AI_TYPES.Ship ? 500 : 200
        animations.push(new Loop(duration, (progressRatio)=>{
            const [newX, newY] = action.path.positionAtProgress(progressRatio)
            Object.assign(mover, {x: newX, y: newY, angle:action.path.angle})
        }, ()=>{
            action.execute()
            this.cvs.deleteObject(animLine)
            if (action.actor.fleet == gs.fleet) this.encounterMap.selectedObject = action.actor
            this.encounterMap.stopAnimating()
            this.encounterMap.showActionPopup(action)
        }))
        
        this.startAnimating()
    }
}
