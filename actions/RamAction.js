class RamAction extends ShipAction {
    constructor(encounter = new Encounter(), actor = new Ship(), target = new Ship()) {
        super(encounter, actor, MOVE_TYPES.Ram, target)
        //this.actorInfoMessage = 'Ramming Speed!' //clutter-y
    }

    execute() {
        console.log('RamAction.execute', { actor: this.actor, target: this.target });
        const {actor, target} = this

        //player has a 75% chance to miss at min range and 25% at max range
        const didMiss = this.path.distance > 0 ? (Math.random() < (0.75 - (0.5 * (this.path.distance / actor.maxMoveDistance)))) : false
        if (didMiss) {
            // Move past the target instead of landing on it
            const overshoot = actor.radius + target.radius + 1
            const [ox, oy] = rotatePoint(overshoot, 0, 0, 0, this.angle)
            Object.assign(actor, {x: this.toX + ox, y: this.toY + oy, angle: this.angle})
            Object.assign(this, {targetBadMessage: 'Missed!'})
        } 
        else {
            Object.assign(actor, {x: this.toX, y: this.toY, angle: this.angle})

            const dmgModifier = this.path.distance/actor.maxMoveDistance

            const dmg = 1+rng(actor.maxRamDamage * dmgModifier)
            const selfDmg = 1+rng(actor.maxRamDamage/2 * dmgModifier)
            const [targetHullDamage, targetShieldDamage, targetDisabled] = target.takeDamage(dmg, true)
            const [actorHullDamage, actorShieldDamage, actorDisabled] = actor.takeDamage(selfDmg, true)

            const knockback = 1 + (AVERGE_RAMMING_KNOCKBACK_DISTANCE*dmgModifier*(actor.mass/target.mass)) + target.radius + actor.radius
            const [kx,ky] = rotatePoint(knockback, 0, 0, 0, this.angle)
            target.x += kx
            target.y += ky
            target.incrementAngle(rng(Math.PI/2, -Math.PI/2, false))

            const targetEscaped = this.encounter.checkShipMovementEffects(target)
            Object.assign(this, {actorHullDamage, actorShieldDamage, actorDisabled, targetHullDamage, targetShieldDamage, targetDisabled, targetEscaped})
        }

        //seems buggy but let's try it out
        const actorEscaped = this.encounter.checkShipMovementEffects(actor)
        Object.assign(this, {actorEscaped})
        const pseudoActions = this.encounter.handleShipActionComplete(this.actor)
        this.completed = true
        return pseudoActions
    }
}
