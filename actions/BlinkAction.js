class BlinkAction extends ShipAction {
    constructor(encounter, actor ) {
        super(encounter, actor, MOVE_TYPES.Blink)
        this.actorInfoMessage = 'Blink!'
    }

    execute() {
        console.log('BlinkAction.execute', { actor: this.actor });
        // Clear cloak status when using blink module
        this.actor.statusEffects.setAmount(STATUS_EFFECTS.CLOAKED, 0)
        const ship = this.actor
        
        // Scale blink distance with module quality (1.0 = baseline 25)
        const quality = ship.getModuleQuality(SHIP_MODULE_TYPES.BLINK)
        const blinkDistance = 25 * quality
        this.blinkDistance = blinkDistance // Store for handler animation
        
        // Teleport to random nearby position
        const randomAngle = rng(Math.PI * 2, 0, false)
        const [dx, dy] = rotatePoint(blinkDistance, 0, 0, 0, randomAngle)
        const newX = ship.x + dx
        const newY = ship.y + dy
        
        // Randomize ship angle
        ship.angle = rng(Math.PI * 2, 0, false)
        
        // Update ship position
        Object.assign(ship, { x: newX, y: newY })
        
        const pseudoActions = this.encounter.handleShipActionComplete(this.actor)
        
        // Check if ship escaped the map
        pseudoActions.push(...this.encounter.checkShipMovementEffects(ship))
        const collisionActions = this.handleCollisions()
        pseudoActions.push(...collisionActions)

        ship.moduleCooldowns.setAmount(SHIP_MODULE_TYPES.BLINK, SHIP_MODULE_TYPES.BLINK.cooldown)
        this.completed = true
        return pseudoActions
    }
}
