class BoosterAction extends ShipAction {
    constructor(encounter, actor = new Ship()) {
        super(encounter, actor, MOVE_TYPES.Booster)
        
        // Scale boost distance with module quality (1.0 = baseline 4x move distance)
        const quality = actor.getModuleQuality(SHIP_MODULE_TYPES.BOOSTER)
        const boostMultiplier = 4 * quality
        const boostDistance = actor.maxMoveDistance * boostMultiplier
        
        const [dx, dy] = rotatePoint(boostDistance, 0, 0, 0, actor.angle)
        this.toX = actor.x + dx
        this.toY = actor.y + dy
        this.path = new Path(actor.x, actor.y, this.toX, this.toY)
        this.actorInfoMessage = 'Boost!'
    }

    execute() {
        console.log('BoosterAction.execute', { actor: this.actor });
        // Clear cloak status when using booster module
        this.actor.statusEffects.setAmount(STATUS_EFFECTS.CLOAKED, 0)
        const ship = this.actor
        
        // Create plasma trail from start to end (uses full boost distance with quality)
        // Trail should match the actual distance traveled
        const quality = this.actor.getModuleQuality(SHIP_MODULE_TYPES.BOOSTER)
        const boostMultiplier = 4 * quality
        const boostDistance = this.actor.maxMoveDistance * boostMultiplier
        
        // Trail extends to the full boost endpoint
        const trailEndProgress = 1.0
        const trailEndX = this.startX + (this.toX - this.startX) * trailEndProgress
        const trailEndY = this.startY + (this.toY - this.startY) * trailEndProgress
        console.log('BoosterAction.execute creating plasma trail to', trailEndX, trailEndY, 'from:', this.startX, this.startY, 'distance:', boostDistance, 'quality:', quality)
        const plasmaTrail = new PlasmaTrailEffect(this.startX, this.startY, trailEndX, trailEndY)
        const pseudoActions = this.encounter.addEffect(plasmaTrail)
        
        // Update ship position
        Object.assign(ship, { x: this.toX, y: this.toY })
        
        pseudoActions.push(...this.encounter.handleShipActionComplete(ship))
        // Check if ship escaped the map
        pseudoActions.push(...this.encounter.checkShipMovementEffects(ship))
        
        ship.moduleCooldowns.setAmount(SHIP_MODULE_TYPES.BOOSTER, SHIP_MODULE_TYPES.BOOSTER.cooldown)
        this.completed = true
        return pseudoActions
    }
}
