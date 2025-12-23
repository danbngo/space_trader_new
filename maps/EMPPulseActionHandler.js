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
        const pulseArea = ship.calcEMPPulseArea()
        
        // Show the pulse radius that will be affected
        const pulseCircle = this.cvs.addEmptyCircle('targetingarea', pulseArea.x, pulseArea.y, pulseArea.radius, 12, [0,255,255,0.5], 3)
        
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
        const pulseDuration = 600
        
        // Expanding pulse ring
        const pulseRing = this.cvs.addEmptyCircle('emppulse', ship.x, ship.y, 0, 12, COLORS.Cyan, 3)
        const maxRadius = ship.maxAttackDistance * 2
        
        animations.push(new Loop(pulseDuration, (progressRatio) => {
            pulseRing.size = maxRadius * progressRatio
            pulseRing.strokeColor[3] = 1 - progressRatio
        }, () => {
            this.cvs.deleteObject(pulseRing)
            this.completeAction(action)
        }))
        
        this.startAnimating()
    }
}
