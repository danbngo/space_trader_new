class CloakAction extends ShipAction {
    constructor(encounter, actor ) {
        super(encounter, actor, MOVE_TYPES.Cloak)
        this.actorInfoMessage = 'Cloaked!'
    }

    execute() {
        console.log('CloakAction.execute', { actor: this.actor });
        const {actor} = this
        
        // Scale cloak duration with module quality (1.0 = baseline 3-5 turns)
        const quality = actor.getModuleQuality(SHIP_MODULE_TYPES.CLOAK)
        const baseTurns = rng(5, 3)
        const cloakTurns = Math.floor(baseTurns * quality)
        
        actor.statusEffects.increment(STATUS_EFFECTS.CLOAKED, cloakTurns)
        const pseudoActions = this.encounter.handleShipActionComplete(actor)
        actor.moduleCooldowns.setAmount(SHIP_MODULE_TYPES.CLOAK, SHIP_MODULE_TYPES.CLOAK.cooldown)
        this.completed = true
        return pseudoActions
    }
}
