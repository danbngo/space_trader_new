class NaniteBeamActionHandler extends ActionHandler {
    constructor(encounterMap) {
        super(encounterMap)
    }

    startTargeting(attacker ) {
        console.log('NaniteBeamActionHandler.startTargeting', { attacker });
        if (!this.calcCanBeControlled(attacker)) return

        this.encounterMap.targetingAreas = []
        
        // Show targeting triangle in front of ship (same as magnetize)
        const targetArea = attacker.calcBeamArea()
        const targetingCvsTriangle = this.cvs.addEmptyTriangle('targetingarea', targetArea.x, targetArea.y, targetArea.base, targetArea.height, 4, COLORS.Targeting, targetArea.angle)
        const targetingCvsCircle = this.cvs.addEmptyCircle('targetingcircle', 0, 0, 0, 12, COLORS.TargetingConfirm, 2)
        targetingCvsCircle.visible = false

        // Only target allied ships (same fleet)
        const allBeamTargets = this.encounter.calcBeamTargets(attacker)
        const validTargets = allBeamTargets.filter(ship => ship.fleet === attacker.fleet && !ship.disabled)
        
        if (validTargets.length > 0) this.target(validTargets[0])
        
        this.encounterMap.onHoverObject = (hoveredObj) => this.target(hoveredObj)
        this.encounterMap.onSelectObject = (selectedObj) => this.attempt(attacker, selectedObj)
        
        this.encounterMap.startTargeting('Nanites', [targetingCvsTriangle, targetingCvsCircle], validTargets)
    }

    target(target ) {
        console.log('NaniteBeamActionHandler.target', { target });
        if (!this.encounterMap.validTargets.includes(target)) return
        
        const targetingCvsCircle = this.cvs.getObject('targetingcircle')
        Object.assign(targetingCvsCircle, {visible: true, x: target.x, y: target.y, radius: target.radius})
        this.encounterMap.refreshCanvas()
    }

    attempt(attacker, target ) {
        console.log('NaniteBeamActionHandler.attempt', { attacker, target });
        if (!this.encounterMap.validTargets.includes(target)) return
        const action = new NaniteBeamAction(this.encounter, attacker, target)
        this.execute(action)
    }

    execute(action = new NaniteBeamAction()) {
        console.log('NaniteBeamActionHandler.execute', { action });
        
        const beamDuration = 800
        
        // Green healing beam between ships
        const popupId = `nanitebeam_${Date.now()}_${Math.random()}`
        const beamLine = this.cvs.addLine(popupId, action.actor.x, action.actor.y, action.target.x, action.target.y, COLORS.Green, 3)
        
        // Add pulsing green glow effect on target
        const glowId = `glow_${Date.now()}_${Math.random()}`
        const glowCircle = this.cvs.addEmptyCircle(glowId, action.target.x, action.target.y, action.target.radius * 1.5, 0, COLORS.Green, 2)
        
        const animation = new Loop(beamDuration, (progressRatio) => {
            // Pulse the glow
            const pulseSize = action.target.radius * (1.5 + 0.3 * Math.sin(progressRatio * Math.PI * 4))
            glowCircle.radius = pulseSize
        }, () => {
            this.cvs.deleteObject(beamLine)
            this.cvs.deleteObject(glowCircle)
            this.completeAction(action)
        })
        
        this.startAnimating(action, animation)
    }
}
