class NaniteBeamAction extends ShipAction {
    constructor(encounter, actor = new Ship(), target = new Ship()) {
        super(encounter, actor, MOVE_TYPES.NaniteBeam, target)
        this.actorInfoMessage = 'Nanite Beam!'
        this.healAmount = 0
    }

    execute() {
        console.log('NaniteBeamAction.execute', { actor: this.actor, target: this.target });
        
        // Clear cloak status when using nanite beam module
        this.actor.statusEffects.setAmount(STATUS_EFFECTS.CLOAKED, 0)
        
        // Calculate heal amount based on actor's engineering skill and target's max hull
        const engineeringSkill = this.actor.fleet.totalSkills.getAmount(SKILLS.Engineering)
        const baseHealAmount = 2 + Math.floor(engineeringSkill / 20) // 2-4 healing based on engineering skill
        
        // Can't heal more than missing hull
        const missingHull = this.target.hull[1] - this.target.hull[0]
        this.healAmount = Math.min(baseHealAmount, missingHull)
        
        if (this.healAmount > 0) {
            this.target.repairHull(this.healAmount)
            this.targetGoodMessage = `+${this.healAmount} hull`
        } else {
            this.targetGoodMessage = 'Full hull'
        }
        
        // Remove all negative status effects (DUSTY, FROZEN, IONIZED, OVERHEATED, TARGETED)
        this.target.statusEffects.setAmount(STATUS_EFFECTS.DUSTY, 0)
        this.target.statusEffects.setAmount(STATUS_EFFECTS.FROZEN, 0)
        this.target.statusEffects.setAmount(STATUS_EFFECTS.IONIZED, 0)
        this.target.statusEffects.setAmount(STATUS_EFFECTS.OVERHEATED, 0)
        this.target.statusEffects.setAmount(STATUS_EFFECTS.TARGETED, 0)
        
        const pseudoActions = this.encounter.handleShipActionComplete(this.actor)
        
        this.actor.moduleCooldowns.setAmount(SHIP_MODULE_TYPES.NANITE_BEAM, SHIP_MODULE_TYPES.NANITE_BEAM.cooldown)
        this.completed = true
        return pseudoActions
    }
}
