class SmokeBombAction extends ShipAction {
    constructor(encounter = new Encounter(), actor = new Ship(), toX = undefined, toY = undefined) {
        super(encounter, actor, MOVE_TYPES.SmokeBomb, null, toX, toY)
        this.actorInfoMessage = 'Smoke Bomb!'
    }

    execute() {
        console.log('SmokeBombAction.execute', { actor: this.actor });
        const attacker = this.actor
        
        // Use toX/toY if provided, otherwise create near the player with random offset
        const dustCloud = new DebrisCloudEffect(this.toX, this.toY, this.path ? this.path.angle + Math.PI/2 : rng(Math.PI * 2, 0, false))
        const pseudoActions = this.encounter.addEffect(dustCloud)
        pseudoActions.push(...this.encounter.handleShipActionComplete(this.actor))
        
        attacker.moduleCooldowns.setAmount(SHIP_MODULE_TYPES.SMOKE_BOMB, SHIP_MODULE_TYPES.SMOKE_BOMB.cooldown)
        this.completed = true
        return pseudoActions
    }
}
