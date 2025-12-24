class MagnetizeAction extends ShipAction {
    constructor(encounter = new Encounter(), actor = new Ship(), target = new Ship()) {
        super(encounter, actor, MOVE_TYPES.Magnetize, target)
        const [attackerToX, attackerToY] = [actor.x*0.75+target.x*0.25, actor.y*0.75+target.y*0.25]
        const [targetToX, targetToY] = [actor.x*0.5+target.x*0.5, actor.y*0.5+target.y*0.5]
        this.toX = attackerToX
        this.toY = attackerToY
        this.targetToX = targetToX
        this.targetToY = targetToY
        this.actorInfoMessage = 'Magnetize!'
    }

    execute() {
        console.log('MagnetizeAction.execute', { actor: this.actor, target: this.target });
        const pseudoActions = []
        const {actor, target} = this
        actor.x = this.toX
        actor.y = this.toY
        target.x = this.targetToX
        target.y = this.targetToY
        
        // Check if either ship escaped
        pseudoActions.push(...this.encounter.checkShipMovementEffects(actor))
        pseudoActions.push(...this.encounter.checkShipMovementEffects(target))
        pseudoActions.push(...this.encounter.handleShipActionComplete(actor))
        
        actor.moduleCooldowns.setAmount(SHIP_MODULES.MAGNETIZE, SHIP_MODULES.MAGNETIZE.cooldown)
        this.completed = true
        return pseudoActions
    }
}
