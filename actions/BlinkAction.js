class BlinkAction extends ShipAction {
    constructor(encounter = new Encounter(), actor = new Ship()) {
        super(encounter, actor, MOVE_TYPES.Blink)
        this.actorInfoMessage = 'Blink!'
    }

    execute() {
        console.log('BlinkAction.execute', { actor: this.actor });
        const ship = this.actor
        const blinkDistance = 25
        
        // Teleport to random nearby position
        const randomAngle = rng(Math.PI * 2, 0, false)
        const [dx, dy] = rotatePoint(blinkDistance, 0, 0, 0, randomAngle)
        const newX = ship.x + dx
        const newY = ship.y + dy
        
        // Randomize ship angle
        ship.angle = rng(Math.PI * 2, 0, false)
        
        // Update ship position
        Object.assign(ship, { x: newX, y: newY })
        
        ship.numActionsRemaining--
        
        // Check if ship escaped the map
        if (this.encounter) this.encounter.checkShipEscaped(ship)
        
        // Set cooldown
        ship.moduleCooldowns.setAmount(SHIP_MODULES.BLINK, SHIP_MODULES.BLINK.cooldown)
        this.completed = true
        return []
    }
}
