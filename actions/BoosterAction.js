class BoosterAction extends ShipAction {
    constructor(encounter = new Encounter(), actor = new Ship()) {
        super(encounter, actor, MOVE_TYPES.Booster)
        const boostDistance = actor.maxMoveDistance * 1.5
        const [dx, dy] = rotatePoint(boostDistance, 0, 0, 0, actor.angle)
        this.toX = actor.x + dx
        this.toY = actor.y + dy
        this.actorInfoMessage = 'Boost!'
    }

    execute() {
        console.log('BoosterAction.execute', { actor: this.actor });
        const ship = this.actor
        const startX = ship.x
        const startY = ship.y
        const newX = this.toX
        const newY = this.toY
        
        // Find enemy ships along the boost path and spin them
        const spinRadius = 10 * ship.radius
        const enemyShips = this.encounter.ships.filter(s => s.fleet !== ship.fleet && !s.disabled)
        
        // Check multiple points along the path
        const numChecks = 10
        for (const enemy of enemyShips) {
            let isInPath = false
            
            // Check distance from enemy to multiple points along the path
            for (let i = 0; i <= numChecks; i++) {
                const progress = i / numChecks
                const checkX = startX + (newX - startX) * progress
                const checkY = startY + (newY - startY) * progress
                const distToEnemy = calcDistance(checkX, checkY, enemy.x, enemy.y)
                
                if (distToEnemy <= spinRadius) {
                    isInPath = true
                    break
                }
            }
            
            if (isInPath) {
                // Spin the enemy ship to a random angle
                enemy.angle = rng(Math.PI * 2, 0, false)
            }
        }
        
        // Update ship position
        Object.assign(ship, { x: newX, y: newY })
        
        ship.numActionsRemaining--
        
        // Check if ship escaped the map
        if (this.encounter) this.encounter.checkShipEscaped(ship)
        
        // Set cooldown
        ship.moduleCooldowns.setAmount(SHIP_MODULES.BOOSTER, SHIP_MODULES.BOOSTER.cooldown)
        this.completed = true
    }
}
