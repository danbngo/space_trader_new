class DetonateAction extends ShipAction {
    constructor(encounter = new Encounter(), actor = new Ship()) {
        super(encounter, actor, MOVE_TYPES.Detonate, null)
        this.actorInfoMessage = 'Self-Destruct!'
    }

    execute() {
        console.log('DetonateAction.execute', { actor: this.actor });
        const attacker = this.actor
        const explosionX = attacker.x
        const explosionY = attacker.y
        const explosionRadius = attacker.maxAttackDistance * 0.5 // Larger than warhead
        const pseudoActions = []
        
        // Find all ships within explosion radius
        const affectedShips = this.encounter.ships.filter(ship => {
            if (ship === attacker || ship.disabled || ship.escaped) return false
            const dist = calcDistance(explosionX, explosionY, ship.x, ship.y)
            return dist <= explosionRadius
        })
        
        // Deal massive damage and knockback to affected ships
        for (const ship of affectedShips) {
            const dist = calcDistance(explosionX, explosionY, ship.x, ship.y)
            // Damage falls off with distance
            const damageRatio = 1 - (dist / explosionRadius)
            const damage = 1 + rng(35 * damageRatio) // Much higher than warhead
            
            const [hullDamage, shieldDamage, disabled] = ship.takeDamage(damage, false, false, attacker)
            
            // Apply strong knockback
            const knockbackDistance = 25 * damageRatio
            const angle = Math.atan2(ship.y - explosionY, ship.x - explosionX)
            const [kx, ky] = rotatePoint(knockbackDistance, 0, 0, 0, angle)
            ship.x += kx
            ship.y += ky
            
            // Check if knocked out of bounds
            pseudoActions.push(...this.encounter.checkShipMovementEffects(ship))
            pseudoActions.push(ShipAction.getDamageAction(this.encounter, ship, hullDamage, shieldDamage, disabled))
        }
        
        // Destroy the attacker
        attacker.takeDamage(attacker.hull[1], true, false, attacker)
        
        const morePseudoActions = this.encounter.handleShipActionComplete(this.actor)
        pseudoActions.push(...morePseudoActions)
        
        this.completed = true
        return pseudoActions
    }
}
