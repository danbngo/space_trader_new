class SmokeBombAction extends ShipAction {
    constructor(encounter = new Encounter(), actor = new Ship(), target = null, toX = undefined, toY = undefined) {
        super(encounter, actor, MOVE_TYPES.SmokeBomb, target, toX, toY)
        this.actorInfoMessage = 'Smoke Bomb!'
    }

    execute() {
        console.log('SmokeBombAction.execute', { actor: this.actor });
        const attacker = this.actor
        
        // Create dust cloud effect near the player (somewhat randomized)
        const offsetDistance = rng(attacker.maxAttackDistance * 0.5, 0, true)
        const randomAngle = rng(Math.PI * 2, 0, false)
        const [dx, dy] = rotatePoint(offsetDistance, 0, 0, 0, randomAngle)
        const effectX = attacker.x + dx
        const effectY = attacker.y + dy
        
        const dustCloud = new Effect(EFFECT_TYPES.DUST_CLOUD, effectX, effectY, effectX, effectY)
        this.encounter.effects.push(dustCloud)
        
        attacker.numActionsRemaining--
        
        attacker.moduleCooldowns.setAmount(SHIP_MODULES.SMOKEBOMB, SHIP_MODULES.SMOKEBOMB.cooldown)
        this.completed = true
        return []
    }
}
