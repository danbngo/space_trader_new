class BoosterAction extends ShipAction {
    constructor(encounter = new Encounter(), actor = new Ship()) {
        super(encounter, actor, MOVE_TYPES.Booster)
        const boostDistance = actor.maxMoveDistance * 4
        const [dx, dy] = rotatePoint(boostDistance, 0, 0, 0, actor.angle)
        this.toX = actor.x + dx
        this.toY = actor.y + dy
        this.path = new Path(actor.x, actor.y, this.toX, this.toY)
        this.actorInfoMessage = 'Boost!'
    }

    execute() {
        console.log('BoosterAction.execute', { actor: this.actor });
        const ship = this.actor
        
        // Create plasma trail from start to near end (90% of the way to avoid burning self)
        const trailEndProgress = 1//0.85
        const trailEndX = this.startX + (this.toX - this.startX) * trailEndProgress
        const trailEndY = this.startY + (this.toY - this.startY) * trailEndProgress
        console.log('BoosterAction.execute creating plasma trail to', trailEndX, trailEndY, 'from:', this.startX, this.startY,'progress:', trailEndProgress)
        const plasmaTrail = new PlasmaTrailEffect(this.startX, this.startY, trailEndX, trailEndY)
        const pseudoActions = this.encounter.addEffect(plasmaTrail)
        
        // Update ship position
        Object.assign(ship, { x: this.toX, y: this.toY })
        
        pseudoActions.push(...this.encounter.handleShipActionComplete(ship))
        // Check if ship escaped the map
        pseudoActions.push(...this.encounter.checkShipMovementEffects(ship))
        
        ship.moduleCooldowns.setAmount(SHIP_MODULES.BOOSTER, SHIP_MODULES.BOOSTER.cooldown)
        this.completed = true
        return pseudoActions
    }
}
