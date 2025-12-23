class SmokeBombActionHandler extends ActionHandler {
    constructor(encounterMap = new EncounterMap()) {
        super(encounterMap)
    }

    startTargeting(attacker = new Ship()) {
        // Smoke bomb is instant, no targeting needed
        this.attempt(attacker)
    }

    target(...args) {
        // No targeting needed
    }

    attempt(attacker = new Ship()) {
        console.log('SmokeBombActionHandler.attempt', { attacker });
        const action = new SmokeBombAction(this.encounter, attacker)
        this.execute(action)
    }

    execute(action = new SmokeBombAction()) {
        console.log('SmokeBombActionHandler.execute', { action });
        
        const smokeDuration = 700
        
        // Expanding smoke cloud
        const smokeCircle = this.cvs.addFilledCircle('smokebomb', action.toX, action.toY, 0, 16, [100,100,100,0.5], 0)
        const maxRadius = action.actor.maxAttackDistance
        
        const animation = new Loop(smokeDuration, (progressRatio) => {
            smokeCircle.size = maxRadius * progressRatio
            smokeCircle.fillColor[3] = 0.5 * (1 - progressRatio * 0.5)
        }, () => {
            this.cvs.deleteObject(smokeCircle)
            this.completeAction(action)
        })
        
        this.startAnimating(action, animation)
    }
}
