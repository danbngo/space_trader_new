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
        const targetingCvsTriangle = this.cvs.addTriangle('targetingarea', targetArea.x, targetArea.y, targetArea.base, targetArea.height, 4, [0,255,0,0.1], targetArea.angle)
        const targetingCvsCircle = this.cvs.addEmptyCircle('targetingcircle', 0, 0, 0, 12, COLORS.Purple, 2)
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
        const [attackerToX, attackerToY] = [attacker.x*0.75+target.x*0.25, attacker.y*0.75+target.y*0.25]
        const [targetToX, targetToY] = [attacker.x*0.5+target.x*0.5, attacker.y*0.5+target.y*0.5]
        const action = new ShipAction(this.encounter, attacker, MOVE_TYPES.GravitonBeam, target, attackerToX, attackerToY, targetToX, targetToY)
        action.actorGoodMessage = 'Graviton Beam!'
        this.execute(action)
    }

    execute(action = new ShipAction()) {
        console.log('GravitonBeamActionHandler.execute', { action });
        this.encounterMap.animatingAction = action
        const animations = this.encounterMap.animations
        const beamDuration = 1000
        
        // Wavy line between ships
        const beamLine = this.cvs.addLine('gravitonline', action.actor.x, action.actor.y, action.target.x, action.target.y, COLORS.Purple, 3)
        
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
        
        this.startAnimating()
    }
}
