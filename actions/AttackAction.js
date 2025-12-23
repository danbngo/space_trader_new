class AttackAction extends ShipAction {
    constructor(encounter = new Encounter(), actor = new Ship(), target = new Ship()) {
        super(encounter, actor, MOVE_TYPES.Laser, target)
    }

    execute() {
        console.log('AttackAction.execute', { attacker: this.actor, target: this.target });
        //player has a 0% chance to miss at min range and 75% at max range
        const didMiss = this.path.distance > 0 ? (Math.random() < (0.75 * (this.path.distance / this.actor.maxAttackDistance))) : false
        if (didMiss) {
            Object.assign(this, {targetBadMessage: 'Missed!'})
        } 
        else {
            const dmg = 1+rng(this.actor.maxLaserDamage)
            const [targetHullDamage, targetShieldDamage, targetDisabled] = this.target.takeDamage(dmg)
            Object.assign(this, {targetHullDamage, targetShieldDamage, targetDisabled})
        }
        this.actor.numActionsRemaining--
        this.completed = true
    }
}
