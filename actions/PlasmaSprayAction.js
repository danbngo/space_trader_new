class PlasmaSprayAction extends ShipAction {
    constructor(encounter, actor, target ) {
        super(encounter, actor, MOVE_TYPES.PlasmaSpray, target)
        this.actorInfoMessage = 'Plasma Spray!'
    }

    execute() {
        console.log('PlasmaSprayAction.execute', { actor: this.actor });
        const attacker = this.actor
        
        // Clear cloak status when attacking
        attacker.statusEffects.setAmount(STATUS_EFFECTS.CLOAKED, 0)
        
        // Scale area of effect with module quality (1.0 = baseline)
        const quality = attacker.getModuleQuality(SHIP_MODULE_TYPES.PLASMA_SPRAY)
        
        // Get all targets in the triangular spray pattern (similar to laser targeting)
        const sprayTargets = this.encounter.calcPlasmaSprayTargets(attacker, quality)
        
        const pseudoActions = []
        
        // Hit all targets in the spray area
        for (const target of sprayTargets) {
            // Deal plasma damage
            const damage = 1 + rng(attacker.maxLaserDamage * 0.8) // Slightly less than laser damage per target
            const [hullDamage, shieldDamage, disabled] = target.takeDamage(damage, false, false, attacker)
            
            // Apply OVERHEATED status effect
            target.statusEffects.raiseTo(STATUS_EFFECTS.OVERHEATED)
            
            pseudoActions.push(ShipAction.getDamageAction(this.encounter, target, hullDamage, shieldDamage, disabled))
        }
        
        const morePseudoActions = this.encounter.handleShipActionComplete(this.actor)
        pseudoActions.push(...morePseudoActions)
        
        this.completed = true
        return pseudoActions
    }
}
