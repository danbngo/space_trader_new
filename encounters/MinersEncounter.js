class MinersEncounter extends Encounter {
    
    /**
     * Override onStart to show miner contact modal
     * Miners always ignore the player (don't offer to trade)
     */
    onStart() {
        super.onStart()
        if (this.playerUndetected) {
            return
        }
        const fleetName = coloredName(this.fleet)
        
        let msg = `You encounter ${fleetName}!<br/><br/>`
        msg += `The mining fleet is busy with their operations and doesn't respond to hails.<br/>`
        msg += `They seem focused on their work and are ignoring you completely.<br/>`
        
        showModal(fleetName, msg, [
            ['Attack', () => this.showPlayerAttackModal()],
            ['Leave', () => this.endEncounter()]
        ], '', null, 0)
    }

    /**
     * Called when the player wins the encounter.
     */
    onVictory() {
        this.showPlayerDefeatedEnemyModal()
    }

    /**
     * Called when the player loses the encounter.
     */
    onDefeat() {
        this.showPlayerDefeatedByNeutralsModal()
    }

    /**
     * Called when the player escapes the encounter.
     */
    onEscape() {
        this.showPlayerEscapedFromEnemyModal()
    }
}
