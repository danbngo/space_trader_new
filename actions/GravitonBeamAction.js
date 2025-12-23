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

        const {actor, target} = this
        actor.x = this.toX
        actor.y = this.toY
        target.x = this.targetToX
        target.y = this.targetToY
        
        // Check if either ship escaped
        this.encounter.checkShipEscaped(target)
        this.encounter.checkShipEscaped(actor)
        
        actor.numActionsRemaining--
        
        // Set cooldown
        actor.moduleCooldowns.setAmount(SHIP_MODULES.GRAVITON_BEAM, SHIP_MODULES.GRAVITON_BEAM.cooldown)
        this.completed = true
    }
}
