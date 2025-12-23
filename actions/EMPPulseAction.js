class EMPPulseAction extends ShipAction {
    constructor(encounter = new Encounter(), actor = new Ship()) {
        super(encounter, actor, MOVE_TYPES.EMPPulse)
        this.actorInfoMessage = 'EMP Pulse!'
    }

    execute() {
        console.log('EMPPulseAction.execute', { actor: this.actor });
        const attacker = this.actor
        const pulseRadius = attacker.maxAttackDistance * 2
        
        // Find all ships within pulse radius
        const affectedShips = this.encounter.ships.filter(ship => {
            if (ship === attacker || ship.disabled || ship.escaped) return false
            const dist = calcDistance(attacker.x, attacker.y, ship.x, ship.y)
            return dist <= pulseRadius
        })
        
        // Reset shields and increase cooldowns
        for (const ship of affectedShips) {
            // Reset shields to 0
            ship.shields[0] = 0
            
            // Increase all module cooldowns by 1
            for (const moduleType of Object.values(SHIP_MODULES)) {
                const currentCooldown = ship.moduleCooldowns.getAmount(moduleType)
                ship.moduleCooldowns.setAmount(moduleType, currentCooldown + 1)
            }
        }
        
        attacker.numActionsRemaining--
        
        // Set cooldown
        attacker.moduleCooldowns.setAmount(SHIP_MODULES.EMP_PULSE, SHIP_MODULES.EMP_PULSE.cooldown)
        this.completed = true
    }
}
