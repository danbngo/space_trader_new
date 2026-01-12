class PoliceEncounter extends Encounter {
    
    /**
     * Override onStart to show police contact modal
     */
    onStart() {
        console.log('PoliceEncounter.onStart:', this)
        if (currentMap && currentMap.togglePause) currentMap.togglePause(true)
        gs.encounter = this
        
        // Show police contact modal
        this.showInitialPoliceContactModal()
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
        // Police defeated player - player gets arrested
        const enemyFleet = this.fleet
        const disabledPlayerShips = gs.combat.disabledPlayerShips

        let msg = `The ${coloredName(enemyFleet)} have overwhelmed your forces!<br/>`
        msg += `You are taken into custody.<br/>`
        
        if (disabledPlayerShips.length > 0) {
            msg += `${disabledPlayerShips.length} of your ships were disabled in the fighting.<br/>`
            msg += this.loseCargoFromDisabledShips(disabledPlayerShips)
        }

        showModal('Defeated', msg, [['Continue', ()=>this.showPlayerSurrenderedToAuthoritiesModal()]])
    }

    /**
     * Called when the player escapes the encounter.
     */
    onEscape() {
        this.showPlayerEscapedFromEnemyModal()
    }

    /**
     * Called when the player surrenders.
     */
    onSurrender() {
        this.showPlayerSurrenderedToAuthoritiesModal()
    }
    
    /**
     * Show initial police contact modal
     * Police have 50% chance to ignore player, 50% to search
     */
    showInitialPoliceContactModal() {
        const fleetName = coloredName(this.fleet)
        const wantsToSearch = Math.random() > 0.5
        
        let msg = `You encounter ${fleetName}!<br/><br/>`
        
        if (wantsToSearch) {
            msg += `The police transmit: "This is a routine inspection. Prepare to be boarded for cargo search."<br/>`
            
            showModal(fleetName, msg, [
                ['Submit to Search', () => this.showPoliceSearchModal()],
                ['Resist', () => this.showResistSearchModal()],
                ['Attack', () => this.showPlayerAttackPoliceModal()]
            ], '', null, 0)
        } else {
            msg += `The police scan your vessel briefly, then transmit:<br/>`
            msg += `"All clear. Safe travels, citizen."<br/>`
            msg += `They continue on their patrol route.<br/>`
            
            showModal(fleetName, msg, [
                ['Continue', () => this.endEncounter()],
                ['Attack', () => this.showPlayerAttackPoliceModal()]
            ], '', null, 0)
        }
    }
    
    /**
     * Show police search modal
     * Player submitted to search - check for illegal cargo
     */
    showPoliceSearchModal() {
        const fleetName = coloredName(this.fleet)
        
        // Check if player has illegal cargo
        const illegalCargo = new CountsMap()
        for (const cargoType of gs.fleet.cargo.keys) {
            if (cargoType.illegal) {
                illegalCargo.increment(cargoType, gs.fleet.cargo.getAmount(cargoType))
            }
        }
        const hasIllegalCargo = illegalCargo.total > 0
        
        let msg = `The ${fleetName} board your vessels and begin a thorough cargo inspection.<br/>`
        
        if (hasIllegalCargo) {
            // 50% chance to find illegal cargo
            const foundContraband = Math.random() > 0.5
            
            if (foundContraband) {
                msg += `After several tense minutes, an officer emerges from your cargo hold...<br/>`
                this.showIllegalCargoFoundModal(illegalCargo)
                return
            } else {
                // Got lucky - they didn't find it
                msg += `After a thorough search, the officers find nothing suspicious.<br/>`
                msg += `"Everything appears in order. You're free to go."<br/>`
            }
        } else {
            // No illegal cargo
            msg += `The officers search your cargo holds thoroughly.<br/>`
            msg += `"Clean cargo manifest. You're free to go, citizen."<br/>`
        }
        
        showModal(fleetName, msg, [['Continue', () => this.endEncounter()]], '', null, 0)
    }
    
    /**
     * Show modal when illegal cargo is found
     * @param {CountsMap} illegalCargo - The illegal cargo found
     */
    showIllegalCargoFoundModal(illegalCargo) {
        const fleetName = coloredName(this.fleet)
        const planet = this.planet
        
        // Calculate bounty based on cargo value
        let totalBounty = 0
        let illegalList = []
        for (const cargoType of illegalCargo.keys) {
            const amount = illegalCargo.getAmount(cargoType)
            const value = cargoType.value * amount
            totalBounty += value
            illegalList.push(`${cargoType.symbol} ${coloredName(cargoType)} (${amount})`)
        }
        
        let msg = `<span style="color: rgb(${COLORS.Red.join(',')})">CONTRABAND DETECTED!</span><br/><br/>`
        msg += `The officers have discovered illegal cargo in your holds:<br/>`
        msg += `${illegalList.join(', ')}<br/><br/>`
        msg += `"You're under arrest for smuggling prohibited materials!"<br/>`
        
        if (planet) {
            gs.captain.bounty.increment(planet, totalBounty)
            msg += `<br/>Fine issued: <span style="color: rgb(${COLORS.Red.join(',')})">${totalBounty}CR</span><br/>`
        }
        
        showModal('Contraband Found', msg, [['Continue', () => this.showPlayerSurrenderedToAuthoritiesModal()]], '', null, 0)
    }
    
    /**
     * Show modal when player resists search
     * Grants 5k bounty and gives option to fight or surrender
     */
    showResistSearchModal() {
        const fleetName = coloredName(this.fleet)
        const planet = this.planet
        const resistBounty = 5000
        
        let msg = `You refuse to allow the ${fleetName} to search your vessel!<br/>`
        msg += `"Obstruction of justice! All units, suspect is non-compliant!"<br/>`
        
        if (planet) {
            gs.captain.bounty.increment(planet, resistBounty)
            msg += `<br/>Additional fine issued: <span style="color: rgb(${COLORS.Red.join(',')})">${resistBounty}CR</span><br/>`
        }
        
        msg += `<br/>The ${fleetName} power up weapons and demand your immediate surrender.<br/>`
        
        showModal('Resisting Arrest', msg, [
            ['Surrender', () => this.showPlayerSurrenderedToAuthoritiesModal()],
            ['Fight', () => this.startCombat(false)]
        ], '', null, 0)
    }
    
    /**
     * Show modal when player attacks police
     * Grants large bounty and starts combat
     */
    showPlayerAttackPoliceModal() {
        const {playerUndetected} = this
        const fleetName = coloredName(this.fleet)
        const planet = this.planet
        const attackBounty = 10000
        
        if (playerUndetected) {
            // Drop shields if player was undetected
            for (const ship of this.fleet.ships) ship.shields[0] = 0
        }
        
        let msg = `You ${playerUndetected ? 'sneakily ' : ''}open fire on the ${fleetName}!<br/>`
        if (playerUndetected) msg += `The ${fleetName} are caught completely off-guard!<br/>`
        msg += `<br/>"ALL UNITS! OFFICER UNDER ATTACK! SUSPECT IS HOSTILE!"<br/>`
        
        if (planet) {
            gs.captain.bounty.increment(planet, attackBounty)
            gs.captain.grantReputation(planet, -50) // Large reputation penalty
            msg += `<br/>Warrant issued: <span style="color: rgb(${COLORS.Red.join(',')})">${attackBounty}CR</span><br/>`
            msg += `Your reputation on ${coloredName(planet)} has been severely damaged!<br/>`
        }
        
        showModal('Attacking Police', msg, [['Continue', () => this.startCombat(true)]], '', null, 0)
    }
}
