class EMPPulseAction extends ShipAction {
    constructor(encounter, actor = new Ship()) {
        super(encounter, actor, MOVE_TYPES.EMPPulse)
        this.actorInfoMessage = 'EMP Pulse!'
    }

    execute() {
        console.log('EMPPulseAction.execute', { actor: this.actor });
        // Clear cloak status when using EMP module
        this.actor.statusEffects.setAmount(STATUS_EFFECTS.CLOAKED, 0)
        const pseudoActions = []
        const attacker = this.actor
        const pulseRadius = attacker.calcPulseArea().radius
        
        // Find all ships within pulse radius
        const affectedShips = this.encounter.ships.filter(ship => {
            if (ship === attacker || ship.disabled || ship.escaped) return false
            const dist = calcDistance(attacker.x, attacker.y, ship.x, ship.y)
            return dist <= pulseRadius
        })
        
        // Reset shields and increase cooldowns
        for (const ship of affectedShips) {
            //hurt shields by a lot
            const [hullDamage, shieldDamage, disabled] = ship.takeDamage(10+rng(30), false, true, this.actor)
            pseudoActions.push(ShipAction.getDamageAction(this.encounter, ship, hullDamage, shieldDamage, disabled))
            
            // Increase all module cooldowns by 1
            for (const moduleType of Object.values(SHIP_MODULE_TYPES)) {
                const currentCooldown = ship.moduleCooldowns.getAmount(moduleType)
                ship.moduleCooldowns.setAmount(moduleType, currentCooldown + 1)
            }
        }
        const pseudoActionsFromAttacker = this.encounter.handleShipActionComplete(attacker)
        pseudoActions.push(...pseudoActionsFromAttacker)
        attacker.moduleCooldowns.setAmount(SHIP_MODULE_TYPES.EMP_PULSE, SHIP_MODULE_TYPES.EMP_PULSE.cooldown)
        this.completed = true
        return pseudoActions
    }
}
