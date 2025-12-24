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
        const pseudoActions = []
        
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
            const damage = 1+rng(20 * damageRatio) //attacker.maxLaserDamage * 2 * damageRatio
            
            const [hullDamage, shieldDamage, disabled] = ship.takeDamage(damage, false, false, attacker)
            // Apply knockback
            const knockbackDistance = 15 * damageRatio
            const angle = Math.atan2(ship.y - explosionY, ship.x - explosionX)
            const [kx, ky] = rotatePoint(knockbackDistance, 0, 0, 0, angle)
            ship.x += kx
            ship.y += ky
            
            // Check if knocked out of bounds
            pseudoActions.push(...this.encounter.checkShipMovementEffects(ship))
            pseudoActions.push(ShipAction.getDamageAction(this.encounter, ship, hullDamage, shieldDamage, disabled))
        }
        const morePseudoActions = this.encounter.handleShipActionComplete(this.actor)
        pseudoActions.push(...morePseudoActions)
        
        attacker.moduleCooldowns.setAmount(SHIP_MODULE_TYPES.WARHEAD, SHIP_MODULE_TYPES.WARHEAD.cooldown)
        this.completed = true
        return pseudoActions
    }
}
