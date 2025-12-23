class EMPPulseActionHandler extends ActionHandler {
    constructor(encounterMap = new EncounterMap()) {
        super(encounterMap)
    }

    startTargeting(ship = new Ship()) {
        console.log('EMPPulseActionHandler.startTargeting', { ship });
        if (!this.calcCanBeControlled(ship)) return

        this.encounterMap.uiMode = UI_MODE.Targeting
        this.encounterMap.targetingAreas = []
        
        // Get EMP pulse area (circle centered on ship)
        const pulseArea = ship.calcPulseArea()
        
        // Show the pulse radius that will be affected
        const pulseCircle = this.cvs.addEmptyCircle('targetingarea', pulseArea.x, pulseArea.y, pulseArea.radius, 12, COLORS.TargetingConfirm, 3)
        
        // Calculate which enemies will be hit
        const validTargets = this.encounter.enemyFleet.ships.filter(target => {
            if (target.disabled || target.escaped) return false
            const distance = Math.hypot(target.x - ship.x, target.y - ship.y)
            return distance <= pulseArea.radius
        })
        
        this.encounterMap.onSelectObject = (selectedObj) => this.attempt(ship)
        
        this.encounterMap.startTargeting('EMP Pulse', [pulseCircle], validTargets)
    }

    target(...args) {
        // Pulse is always centered on ship, no dynamic targeting
    }

    attempt(ship = new Ship()) {
        console.log('EMPPulseActionHandler.attempt', { ship });
        const action = new EMPPulseAction(this.encounter, ship)
        this.execute(action)
    }

    execute(action = new EMPPulseAction()) {
        console.log('EMPPulseActionHandler.execute', { action });
        this.encounterMap.animatingAction = action
        const animations = this.encounterMap.animations
        const ship = action.actor
        const pulseDuration = 1000
        
        // Expanding pulse ring
        const popupId = `emppulse_${Date.now()}_${Math.random()}`
        const pulseRing = this.cvs.addEmptyCircle(popupId, ship.x, ship.y, 0, 12, COLORS.LightPurple, 3)
        const maxRadius = ship.calcPulseArea().radius
        
        animations.push(new Loop(pulseDuration, (progressRatio) => {
            pulseRing.size = maxRadius * progressRatio
            pulseRing.strokeColor[3] = 1 - progressRatio
        }, () => {
            this.cvs.deleteObject(pulseRing)
            this.completeAction(action)
        }))
        
        this.startAnimating(action)
    }
}
