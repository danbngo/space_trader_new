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
        const startX = ship.x
        const startY = ship.y
        const newX = this.toX
        const newY = this.toY
        
        // Create plasma trail from start to near end (90% of the way to avoid burning self)
        const trailEndProgress = 0.9
        const trailEndX = startX + (newX - startX) * trailEndProgress
        const trailEndY = startY + (newY - startY) * trailEndProgress
        const plasmaTrail = new PlasmaTrailEffect(startX, startY, trailEndX, trailEndY)
        this.encounter.effects.push(plasmaTrail)
        
        // Update ship position
        Object.assign(ship, { x: newX, y: newY })
        
        this.encounter.handleShipActionComplete(ship)
        
        // Check if ship escaped the map
        if (this.encounter) this.encounter.checkShipMovementEffects(ship)
        
        
        ship.moduleCooldowns.setAmount(SHIP_MODULES.BOOSTER, SHIP_MODULES.BOOSTER.cooldown)
        this.completed = true
        return []
    }
}
