class LaserAction extends ShipAction {
    constructor(encounter = new Encounter(), actor = new Ship(), target = new Ship()) {
        super(encounter, actor, MOVE_TYPES.Laser, target)
    }

    execute() {
        console.log('LaserAction.execute', { attacker: this.actor, target: this.target });
        // Clear cloak status when attacking
        this.actor.statusEffects.setAmount(STATUS_EFFECTS.CLOAKED, 0)
        //player has a 0% chance to miss at min range and 50% at max range
        const baseMissChance = this.path.distance > 0 ? (0.5 * (this.path.distance / this.actor.maxAttackDistance)) : 0
        
        // Apply Gunner skill (reduces miss chance, 0.5x at 50 skill)
        const gunnerSkill = this.actor.fleet.totalSkills.getAmount(SKILLS.Gunner)
        const gunnerModifier = 1 - (gunnerSkill / 100)
        
        // Apply Stealth skill (increases enemy miss chance, 2x at 50 skill)
        const stealthSkill = this.target.fleet.totalSkills.getAmount(SKILLS.Stealth)
        const stealthModifier = 1 + (stealthSkill / 100)
        
        const adjustedMissChance = baseMissChance * gunnerModifier * stealthModifier
        const didMiss = Math.random() < adjustedMissChance
        if (didMiss) {
            Object.assign(this, {targetBadMessage: 'Missed!'})
        } 
        else {
            const dmg = 1+rng(this.actor.maxLaserDamage)
            const [targetHullDamage, targetShieldDamage, targetDisabled] = this.target.takeDamage(dmg, false, false, this.actor)
            Object.assign(this, {targetHullDamage, targetShieldDamage, targetDisabled})
        }
        const pseudoActions = this.encounter.handleShipActionComplete(this.actor)
        this.completed = true
        return pseudoActions
    }
}
