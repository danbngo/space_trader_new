class LaserAction extends ShipAction {
    constructor(encounter, actor = new Ship(), target = new Ship()) {
        super(encounter, actor, MOVE_TYPES.Laser, target)
    }

    execute() {
        console.log('LaserAction.execute', { attacker: this.actor, target: this.target });
        // Clear cloak status when attacking
        this.actor.statusEffects.setAmount(STATUS_EFFECTS.CLOAKED, 0)
        
        // TARGETED ships cannot evade - always hit
        const isTargeted = this.target.statusEffects.has(STATUS_EFFECTS.TARGETED)
        
        let didMiss = false
        if (!isTargeted) {
            // Distance-based miss chance: miss = 0.5 * (distance/maxRange)
            // At half range: 25% miss, at max range: 50% miss
            const distance = calcDistance(this.actor.x, this.actor.y, this.target.x, this.target.y)
            const maxRange = (1 + this.actor.maxAttackDistance) * 2 // 2x multiplier for doubled range
            const baseMissChance = 0.5 * (distance / maxRange)
            
            // Apply Gunner skill (reduces miss chance, 0.5x at 50 skill)
            const gunnerSkill = this.actor.fleet.totalSkills.getAmount(SKILLS.Gunner)
            const gunnerModifier = 1 - (gunnerSkill / 100)
            
            // Apply Stealth skill (increases enemy miss chance, 2x at 50 skill)
            const stealthSkill = this.target.fleet.totalSkills.getAmount(SKILLS.Stealth)
            const stealthModifier = 1 + (stealthSkill / 100)
            
            // Apply DUSTY status effect (halves hit chance by doubling miss chance)
            const dustyModifier = this.actor.statusEffects.has(STATUS_EFFECTS.DUSTY) ? 2 : 1
            
            const adjustedMissChance = baseMissChance * gunnerModifier * stealthModifier * dustyModifier
            didMiss = Math.random() < adjustedMissChance
        }
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
