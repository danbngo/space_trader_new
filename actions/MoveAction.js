class MoveAction extends ShipAction {
    constructor(encounter, actor, toX = undefined, toY = undefined) {
        super(encounter, actor, MOVE_TYPES.Move, null, toX, toY)
    }

    execute() {
        console.log('MoveAction.execute', { actor: this.actor, toX: this.toX, toY: this.toY });
        Object.assign(this.actor, {x: this.toX, y: this.toY, angle: this.angle})
        
        // Check for collisions with other ships after moving
        const collisionActions = this.handleCollisions()
        
        //let actorEscaped = (this.encounter) ? this.encounter.checkShipMovementEffects(this.actor) : null
        const pseudoActions = this.encounter.checkShipMovementEffects(this.actor)
        pseudoActions.push(...collisionActions)
        pseudoActions.push(...this.encounter.handleShipActionComplete(this.actor))
        //Object.assign(this, {actorEscaped})
        this.completed = true
        return pseudoActions
    }

    
}
