class LaserAction extends ShipAction {
    constructor(encounter = new Encounter(), actor = new Ship(), target = new Ship()) {
        super(encounter, actor, MOVE_TYPES.Laser, target)
    }

    execute() {
        console.log('LaserAction.execute', { attacker: this.actor, target: this.target });
        //player has a 0% chance to miss at min range and 75% at max range
        const baseMissChance = this.path.distance > 0 ? (0.75 * (this.path.distance / this.actor.maxAttackDistance)) : 0
        // Apply accuracy penalty if ship has DUSTY status effect
        //const anyoneIsDusty = this.actor.statusEffects.has(STATUS_EFFECTS.DUSTY) || this.target.statusEffects.has(STATUS_EFFECTS.DUSTY)
        //const adjustedMissChance = anyoneIsDusty ? baseMissChance / 0.75 : baseMissChance
        const didMiss = Math.random() < baseMissChance
        if (didMiss) {
            Object.assign(this, {targetBadMessage: 'Missed!'})
        } 
        else {
            const dmg = 1+rng(this.actor.maxLaserDamage)
            const [targetHullDamage, targetShieldDamage, targetDisabled] = this.target.takeDamage(dmg)
            Object.assign(this, {targetHullDamage, targetShieldDamage, targetDisabled})
        }
        const pseudoActions = this.encounter.handleShipActionComplete(this.actor)
        this.completed = true
        return pseudoActions
    }
}
