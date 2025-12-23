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
        this.execute(new ShipAction(this.encounter, attacker, MOVE_TYPES.GravitonBeam, target))
    }

    execute(action = new ShipAction()) {
        console.log('GravitonBeamActionHandler.execute', { action });
        this.encounterMap.animatingAction = action
        const animations = this.encounterMap.animations
        const beamDuration = 1000
        
        // Wavy line between ships
        const beamLine = this.cvs.addLine('gravitonline', action.actor.x, action.actor.y, action.target.x, action.target.y, COLORS.Purple, 3)
        
        animations.push(new Loop(beamDuration, (progressRatio) => {
            beamLine.x = action.actor.x
            beamLine.y = action.actor.y
            beamLine.x2 = action.target.x
            beamLine.y2 = action.target.y
        }, () => {
            action.execute()
            this.cvs.deleteObject(beamLine)
            this.encounterMap.stopAnimating()
        }))
        
        this.startAnimating()
    }
}
