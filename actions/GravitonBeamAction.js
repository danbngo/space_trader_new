class GravitonBeamAction extends ShipAction {
    constructor(encounter = new Encounter(), actor = new Ship(), target = new Ship()) {
        super(encounter, actor, MOVE_TYPES.GravitonBeam, target)
        const [attackerToX, attackerToY] = [actor.x*0.75+target.x*0.25, actor.y*0.75+target.y*0.25]
        const [targetToX, targetToY] = [actor.x*0.5+target.x*0.5, actor.y*0.5+target.y*0.5]
        this.toX = attackerToX
        this.toY = attackerToY
        this.targetToX = targetToX
        this.targetToY = targetToY
        this.actorInfoMessage = 'Graviton Beam!'
    }

    execute() {
        console.log('GravitonBeamAction.execute', { actor: this.actor, target: this.target });
        const attacker = this.actor
        const target = this.target
        
        // Calculate pull distance - target gets pulled more than attacker
        const distance = calcDistance(attacker.x, attacker.y, target.x, target.y)
        const targetPullDistance = Math.min(distance * 0.6, attacker.maxAttackDistance)
        const attackerPullDistance = Math.min(distance * 0.3, attacker.maxAttackDistance * 0.5)
        
        // Pull target towards attacker
        const angleToAttacker = Math.atan2(attacker.y - target.y, attacker.x - target.x)
        const [targetDx, targetDy] = rotatePoint(targetPullDistance, 0, 0, 0, angleToAttacker)
        target.x += targetDx
        target.y += targetDy
        
        // Pull attacker towards target (less than target is pulled)
        const angleToTarget = Math.atan2(target.y - attacker.y, target.x - attacker.x)
        const [attackerDx, attackerDy] = rotatePoint(attackerPullDistance, 0, 0, 0, angleToTarget)
        attacker.x += attackerDx
        attacker.y += attackerDy
        
        // Check if either ship escaped
        this.encounter.checkShipEscaped(target)
        this.encounter.checkShipEscaped(attacker)
        
        attacker.numActionsRemaining--
        
        // Set cooldown
        attacker.moduleCooldowns.setAmount(SHIP_MODULES.GRAVITON_BEAM, SHIP_MODULES.GRAVITON_BEAM.cooldown)
        this.completed = true
    }
}
