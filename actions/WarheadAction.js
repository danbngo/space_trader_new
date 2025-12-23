class WarheadAction extends ShipAction {
    constructor(encounter = new Encounter(), actor = new Ship(), target = null, toX = undefined, toY = undefined) {
        super(encounter, actor, MOVE_TYPES.Warhead, target, toX, toY)
        this.actorInfoMessage = 'Warhead!'
    }

    execute() {
        console.log('WarheadAction.execute', { actor: this.actor });
        const attacker = this.actor
        const explosionX = this.toX
        const explosionY = this.toY
        const explosionRadius = attacker.maxAttackDistance * 0.25
        
        // Find all ships within explosion radius
        const affectedShips = this.encounter.ships.filter(ship => {
            if (ship === attacker || ship.disabled || ship.escaped) return false
            const dist = calcDistance(explosionX, explosionY, ship.x, ship.y)
            return dist <= explosionRadius
        })
        
        // Deal damage and knockback to affected ships
        for (const ship of affectedShips) {
            const dist = calcDistance(explosionX, explosionY, ship.x, ship.y)
            // Damage falls off with distance
            const damageRatio = 1 - (dist / explosionRadius)
            const damage = 20 * damageRatio //attacker.maxLaserDamage * 2 * damageRatio
            
            ship.takeDamage(damage)
            
            // Apply knockback
            const knockbackDistance = 10 * damageRatio
            const angle = Math.atan2(ship.y - explosionY, ship.x - explosionX)
            const [kx, ky] = rotatePoint(knockbackDistance, 0, 0, 0, angle)
            ship.x += kx
            ship.y += ky
            
            // Check if knocked out of bounds
            this.encounter.checkShipEscaped(ship)
        }
        
        attacker.numActionsRemaining--
        
        // Set cooldown
        attacker.moduleCooldowns.setAmount(SHIP_MODULES.WARHEAD, SHIP_MODULES.WARHEAD.cooldown)
        this.completed = true
    }
}
