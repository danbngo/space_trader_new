class DrillAction extends ShipAction {
    constructor(encounter, actor = new Ship(), target = new Ship()) {
        super(encounter, actor, MOVE_TYPES.Drill, target)
    }

    execute() {
        console.log('DrillAction.execute', { actor: this.actor, target: this.target });
        // Clear cloak status when drilling
        this.actor.statusEffects.setAmount(STATUS_EFFECTS.CLOAKED, 0)
        const {actor, target} = this
        const pseudoActions = []
        
        // Player has a 50% chance to miss at min range and 25% at max range
        const didMiss = this.path.distance > 0 ? (Math.random() < (0.50 - (0.25 * (this.path.distance / actor.maxMoveDistance)))) : false
        
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

            // Drill does more hull damage than ramming but less total damage
            const drillDmg = 1.5 + rng(actor.maxRamDamage * dmgModifier * 1.2)
            const selfDmg = 0.5 + rng(actor.maxRamDamage/4 * dmgModifier) // Less self damage than ramming
            
            // Drill primarily damages hull (bypasses shields partially)
            const [targetHullDamage, targetShieldDamage, targetDisabled] = target.takeDamage(drillDmg, true, false, actor)
            const [actorHullDamage, actorShieldDamage, actorDisabled] = actor.takeDamage(selfDmg, true, false, actor)

            // Spin the target around (randomize angle)
            target.incrementAngle(rng(Math.PI * 2, 0, false))

            // Small knockback
            const knockback = 0.5 + (actor.radius + target.radius)
            const [kx, ky] = rotatePoint(knockback, 0, 0, 0, this.angle)
            target.x += kx
            target.y += ky

            pseudoActions.push(...this.encounter.checkShipMovementEffects(target))

            const collisionActions = this.handleCollisions()
            pseudoActions.push(...collisionActions)

            Object.assign(this, {actorHullDamage, actorShieldDamage, actorDisabled, targetHullDamage, targetShieldDamage, targetDisabled})
        }

        pseudoActions.push(...this.encounter.checkShipMovementEffects(actor))
        pseudoActions.push(...this.encounter.handleShipActionComplete(actor))
        this.completed = true
        return pseudoActions
    }
}
