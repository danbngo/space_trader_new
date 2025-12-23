class EMPPulseActionHandler extends ActionHandler {
    constructor(encounterMap = new EncounterMap()) {
        super(encounterMap)
    }

    startTargeting(ship = new Ship()) {
        // EMP Pulse doesn't need targeting, activate immediately
        this.attempt(ship)
    }

    target(...args) {
        // No targeting needed
    }

    attempt(ship = new Ship()) {
        console.log('EMPPulseActionHandler.attempt', { ship });
        this.execute(new ShipAction(this.encounter, ship, MOVE_TYPES.EMPPulse))
    }

    execute(action = new ShipAction()) {
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
            action.execute()
            this.cvs.deleteObject(pulseRing)
            this.encounterMap.stopAnimating()
        }))
        
        this.startAnimating()
    }
}
