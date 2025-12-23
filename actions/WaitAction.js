class WaitAction extends ShipAction {
    constructor(encounter = new Encounter(), actor = new Ship()) {
        super(encounter, actor, MOVE_TYPES.Wait)
        this.actorInfoMessage = '...'
    }

    execute() {
        console.log('WaitAction.execute', { actor: this.actor });
        this.actor.numActionsRemaining = 0
        this.completed = true
        return []
    }
}
