class MoveActionHandler extends ActionHandler {
    constructor(encounterMap ) {
        super(encounterMap)
    }

    startTargeting(mover = new Ship()) {
        console.log('MoveActionHandler.startTargeting', { mover });
        if (!this.calcCanBeControlled(mover)) return
        
        const ellipse = mover.calcMoveArea()
        const targetingCvsObject = this.cvs.addEmptyOval('targetingarea', ellipse.x, ellipse.y, ellipse.radiusX, ellipse.radiusY, 4, COLORS.Targeting, ellipse.angle, 2)
        const targetingCvsCircle = this.cvs.addEmptyCircle('targetingcircle', ellipse.x, ellipse.y, mover.radius, 4, COLORS.TargetingConfirm, 2)
        
        // Calculate valid ram targets (enemies within move range)
        const validRamTargets = this.encounter.calcRamTargets(mover)
        
        this.cvs.onClickWorldXY = (x, y) => this.attempt(x, y, ellipse, mover)
        this.cvs.onMouseMoveWorldXY = (x, y) => this.target(x, y, ellipse, mover)
        
        // Allow clicking on ships for ramming
        this.encounterMap.onSelectObject = (selectedObj) => {
            if (selectedObj instanceof Ship && validRamTargets.includes(selectedObj)) {
                this.attemptRam(mover, selectedObj)
            }
        }
        this.encounterMap.onHoverObject = (hoveredObj) => {
            if (hoveredObj instanceof Ship && validRamTargets.includes(hoveredObj)) {
                this.targetRam(hoveredObj)
            } else {
                // Reset to move targeting visual when not hovering ram target
                const targetingCvsCircle = this.cvs.getObject('targetingcircle')
                Object.assign(targetingCvsCircle, {visible: true, x: ellipse.x, y: ellipse.y, radius: mover.radius})
                this.encounterMap.refreshCanvas()
            }
        }
        
        this.encounterMap.startTargeting('Move (click enemy to ram)', [targetingCvsObject, targetingCvsCircle], validRamTargets)
    }

    target(x = 0, y = 0, ellipse = new Ellipse(), mover = new Ship()) {
        console.log('MoveActionHandler.target', { x, y });
        
        // If outside ellipse, clamp to the edge
        let targetX = x
        let targetY = y
        if (!ellipse.containsPoint(x, y)) {
            // Calculate angle from ellipse center to mouse position
            const dx = x - ellipse.x
            const dy = y - ellipse.y
            const angleToMouse = Math.atan2(dy, dx)
            
            // Rotate to ellipse's local coordinate system
            const localAngle = angleToMouse - ellipse.angle
            
            // Calculate point on ellipse edge at this angle
            const cos = Math.cos(localAngle)
            const sin = Math.sin(localAngle)
            const scale = Math.sqrt(1 / (cos*cos/(ellipse.radiusX*ellipse.radiusX) + sin*sin/(ellipse.radiusY*ellipse.radiusY)))
            
            // Rotate back to world coordinates
            const localX = cos * scale
            const localY = sin * scale
            targetX = ellipse.x + localX * Math.cos(ellipse.angle) - localY * Math.sin(ellipse.angle)
            targetY = ellipse.y + localX * Math.sin(ellipse.angle) + localY * Math.cos(ellipse.angle)
        }
        
        const targetingCvsCircle = this.cvs.getObject('targetingcircle')
        Object.assign(targetingCvsCircle, {visible: true, x: targetX, y: targetY, radius: mover.radius})
        this.encounterMap.refreshCanvas()
    }
    
    targetRam(target = new Ship()) {
        console.log('MoveActionHandler.targetRam', { target });
        const targetingCvsCircle = this.cvs.getObject('targetingcircle')
        Object.assign(targetingCvsCircle, {visible: true, x: target.x, y: target.y, radius: target.radius})
        this.encounterMap.refreshCanvas()
    }
    
    attemptRam(attacker = new Ship(), target = new Ship()) {
        console.log('MoveActionHandler.attemptRam', { attacker, target });
        const action = new RamAction(this.encounter, attacker, target)
        this.executeRam(action)
    }
    
    executeRam(action = new RamAction()) {
        console.log('MoveActionHandler.executeRam', { action });
        const path = action.path
        const attacker = action.actor
        
        const popupId = `ram_${Date.now()}_${Math.random()}`
        const animLine = this.cvs.addLine(popupId, action.path.startX, action.path.startY, action.path.toX, action.path.toY, attacker.color, 2)
        const ramDuration = 500

        const animation = new Loop(ramDuration, (progressRatio)=>{
            const [newX, newY] = path.positionAtProgress(progressRatio)
            Object.assign(attacker, {x: newX, y: newY, angle: path.angle})
        }, ()=>{
            this.cvs.deleteObject(animLine)
            this.completeAction(action)
        })
        
        this.startAnimating(action, animation)
    }

    attempt(x = 0, y = 0, ellipse = new Ellipse(), mover = new Ship()) {
        console.log('MoveActionHandler.attempt', { x, y, mover });
        
        // If outside ellipse, clamp to the edge
        let targetX = x
        let targetY = y
        if (!ellipse.containsPoint(x, y)) {
            // Calculate angle from ellipse center to mouse position
            const dx = x - ellipse.x
            const dy = y - ellipse.y
            const angleToMouse = Math.atan2(dy, dx)
            
            // Rotate to ellipse's local coordinate system
            const localAngle = angleToMouse - ellipse.angle
            
            // Calculate point on ellipse edge at this angle
            const cos = Math.cos(localAngle)
            const sin = Math.sin(localAngle)
            const scale = Math.sqrt(1 / (cos*cos/(ellipse.radiusX*ellipse.radiusX) + sin*sin/(ellipse.radiusY*ellipse.radiusY)))
            
            // Rotate back to world coordinates
            const localX = cos * scale
            const localY = sin * scale
            targetX = ellipse.x + localX * Math.cos(ellipse.angle) - localY * Math.sin(ellipse.angle)
            targetY = ellipse.y + localX * Math.sin(ellipse.angle) + localY * Math.cos(ellipse.angle)
        }
        
        this.encounterMap.cvs.objClickEnabled = true
        this.execute(new MoveAction(this.encounter, mover, targetX, targetY))
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
