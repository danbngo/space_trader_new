class CloakAction extends ShipAction {
    constructor(encounter = new Encounter(), actor = new Ship()) {
        super(encounter, actor, MOVE_TYPES.Cloak)
        this.actorInfoMessage = 'Cloaked!'
    }

    execute() {
        console.log('CloakAction.execute', { actor: this.actor });
        const {actor} = this
        actor.statusEffects.increment(STATUS_EFFECTS.CLOAKED, rng(5,3))
        this.encounter.handleShipActionComplete(actor)
        
        
        actor.moduleCooldowns.setAmount(SHIP_MODULES.CLOAK, SHIP_MODULES.CLOAK.cooldown)
        this.completed = true
        return []
    }
}
