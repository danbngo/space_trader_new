class DetonateActionHandler extends ActionHandler {
    constructor(encounterMap = new EncounterMap()) {
        super(encounterMap)
    }

    startTargeting(attacker = new Ship()) {
        console.log('DetonateActionHandler.startTargeting', { attacker });
        if (!this.calcCanBeControlled(attacker)) return

        this.encounterMap.targetingAreas = []
        
        // Show the explosion preview centered on the ship
        const explosionRadius = attacker.maxAttackDistance * 0.5
        const explosionCircle = new Circle(attacker.x, attacker.y, explosionRadius)
        const targetingCvsCircle = this.cvs.addEmptyCircle('targetingcircle', attacker.x, attacker.y, explosionRadius, 12, COLORS.Red, 3)
        this.encounterMap.startTargeting('Self-Destruct', [targetingCvsCircle], [explosionCircle])
    }

    attempt(attacker = new Ship()) {
        console.log('DetonateActionHandler.attempt', { attacker });
        const action = new DetonateAction(this.encounter, attacker)
        this.execute(action)
    }

    execute(action = new DetonateAction()) {
        console.log('DetonateActionHandler.execute', { action });
        const explosionDuration = 1200
        
        // Massive expanding explosion circle
        const popupId = `detonate_${Date.now()}_${Math.random()}`
        const explosionCircle = this.cvs.addFilledCircle(popupId, action.actor.x, action.actor.y, 0, 16, COLORS.Yellow, 0)
        const maxRadius = action.actor.maxAttackDistance * 0.5
        
        // Add secondary red explosion ring
        const popupId2 = `detonate2_${Date.now()}_${Math.random()}`
        const explosionCircle2 = this.cvs.addFilledCircle(popupId2, action.actor.x, action.actor.y, 0, 16, COLORS.Red, 0)
        
        const animation = new Loop(explosionDuration, (progressRatio) => {
            explosionCircle.size = maxRadius * progressRatio
            explosionCircle.fillColor[3] = 1 - progressRatio
            
            explosionCircle2.size = maxRadius * progressRatio * 0.7
            explosionCircle2.fillColor[3] = (1 - progressRatio) * 0.5
        }, () => {
            this.cvs.deleteObject(explosionCircle)
            this.cvs.deleteObject(explosionCircle2)
            this.completeAction(action)
        })
        this.startAnimating(action, animation)
    }
}
