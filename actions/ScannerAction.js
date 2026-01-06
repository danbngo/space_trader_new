class ScannerAction extends ShipAction {
    constructor(encounter, actor = new Ship()) {
        super(encounter, actor, MOVE_TYPES.Scanner)
        this.actorInfoMessage = 'Scanner Pulse!'
    }

    execute() {
        console.log('ScannerAction.execute', { actor: this.actor });
        // Clear cloak status when using scanner module
        this.actor.statusEffects.setAmount(STATUS_EFFECTS.CLOAKED, 0)
        const pseudoActions = []
        const attacker = this.actor
        
        // Scale scanner radius with module quality (1.5x EMP pulse radius base, then scaled by quality)
        const quality = attacker.getModuleQuality(SHIP_MODULE_TYPES.SCANNER)
        const basePulseRadius = attacker.calcPulseArea().radius * 1.5
        const scannerRadius = basePulseRadius * quality
        
        // Calculate duration based on quality (3-5 turns)
        const baseDuration = 3
        const bonusDuration = Math.floor(quality * 2) // 0-2 bonus turns
        const targetedDuration = baseDuration + bonusDuration
        
        // Find all enemy ships within scanner radius
        const affectedShips = this.encounter.ships.filter(ship => {
            if (ship.fleet === attacker.fleet || ship.disabled || ship.escaped) return false
            const dist = calcDistance(attacker.x, attacker.y, ship.x, ship.y)
            return dist <= scannerRadius
        })
        
        // Apply TARGETED status effect and remove CLOAKED
        for (const ship of affectedShips) {
            // Remove any cloaking
            ship.statusEffects.setAmount(STATUS_EFFECTS.CLOAKED, 0)
            
            // Apply TARGETED status for duration
            ship.statusEffects.setAmount(STATUS_EFFECTS.TARGETED, targetedDuration)
        }
        
        const pseudoActionsFromAttacker = this.encounter.handleShipActionComplete(attacker)
        pseudoActions.push(...pseudoActionsFromAttacker)
        attacker.moduleCooldowns.setAmount(SHIP_MODULE_TYPES.SCANNER, SHIP_MODULE_TYPES.SCANNER.cooldown)
        this.completed = true
        return pseudoActions
    }
}
