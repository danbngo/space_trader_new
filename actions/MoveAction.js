class MoveAction extends ShipAction {
    constructor(encounter = new Encounter(), actor = new Ship(), target = null, toX = undefined, toY = undefined) {
        super(encounter, actor, MOVE_TYPES.Move, target, toX, toY)
    }

    execute() {
        console.log('MoveAction.execute', { actor: this.actor, toX: this.toX, toY: this.toY });
        Object.assign(this.actor, {x: this.toX, y: this.toY, angle: this.angle})
        this.actor.numActionsRemaining--
        let actorEscaped = (this.encounter) ? this.encounter.checkShipEscaped(this.actor) : null
        Object.assign(this, {actorEscaped})
        this.completed = true
    }
}
