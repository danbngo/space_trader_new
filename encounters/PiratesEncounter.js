class PiratesEncounter extends Encounter {
    
    /**
     * Override onStart to show pirate contact modal
     */
    onStart() {
        super.onStart()
        if (this.playerUndetected) {
            return
        }
        
        const fleetName = coloredName(this.fleet)
        const demandsSurrender = this.alwaysAttack || Math.random() > 0.5 || this.enemyUndetected
        
        let msg = `You encounter ${fleetName}!<br/><br/>`
        
        // If enemy is undetected, inform player and drop shields
        if (this.enemyUndetected) {
            msg += `<span style="color: rgb(${COLORS.Red.join(',')})">Your sensors failed to detect them in time!</span><br/>`
            msg += `<span style="color: rgb(${COLORS.Red.join(',')})">Your shields are offline!</span><br/><br/>`
            
            // Drop player shields
            for (const ship of gs.fleet.ships) {
                ship.shields[0] = 0
            }
        }
        
        if (demandsSurrender) {
            msg += `The pirates transmit: "Power down your weapons and prepare to be boarded. Resist and you'll regret it."<br/>`
            msg += `They're demanding your surrender!<br/>`
            
            showModal(fleetName, msg, [
                ['Surrender', () => this.showPlayerSurrenderedToCriminalsModal()],
                ['Refuse', () => this.showPlayerRefuseSurrenderModal()],
            ], '', null, 0)
        } else {
            msg += `The pirates scan your vessel but don't respond to hails.<br/>`
            msg += `They seem to be ignoring you... for now.<br/>`
            
            showModal(fleetName, msg, [
                ['Continue', () => this.endEncounter()],
                ['Attack', () => this.showPlayerAttackModal()]
            ], '', null, 0)
        }
    }

    /**
     * Called when the player loses the encounter.
     */
    onDefeat() {
        // Pirates defeated player - player gets plundered
        const enemyFleet = this.fleet
        const disabledPlayerShips = gs.combat.disabledPlayerShips

        let msg = `The ${coloredName(enemyFleet)} have overwhelmed your forces!<br/>`
        msg += `You are at their mercy.<br/>`
        
        if (disabledPlayerShips.length > 0) {
            msg += `${disabledPlayerShips.length} of your ships were disabled in the fighting.<br/>`
            msg += this.loseDisabledShipsAndCargo(disabledPlayerShips)
        }

        showModal('Defeated', msg, [['Continue', ()=>this.showPlayerSurrenderedToCriminalsModal()]])
    }

    /**
     * Called when the player surrenders.
     */
    onSurrender() {
        this.showPlayerSurrenderedToCriminalsModal()
    }
}
