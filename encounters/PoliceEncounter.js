class PoliceEncounter extends Encounter {
    
    /**
     * Override onStart to show police contact modal
     */
    onStart() {
        super.onStart()
        if (this.playerUndetected) {
            return
        }
        const fleetName = coloredName(this.fleet)
        const wantsToSearch = Math.random() > 0.5
        
        let msg = `You encounter ${fleetName}!<br/><br/>`
        
        if (wantsToSearch) {
            msg += `The police transmit: "This is a routine inspection. Prepare to be boarded for cargo search."<br/>`
            
            showModal(fleetName, msg, [
                ['Submit to Search', () => this.showPoliceSearchModal()],
                ['Resist', () => this.showPlayerRefuseSurrenderModal()],
            ], '', null, 0)
        } else {
            msg += `The police scan your vessel briefly, then transmit:<br/>`
            msg += `"All clear. Safe travels, citizen."<br/>`
            msg += `They continue on their patrol route.<br/>`
            
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
        // Police defeated player - player gets arrested
        const enemyFleet = this.fleet
        const disabledPlayerShips = gs.combat.disabledPlayerShips

        let msg = `The ${coloredName(enemyFleet)} have overwhelmed your forces!<br/>`
        msg += `You are taken into custody.<br/>`
        
        if (disabledPlayerShips.length > 0) {
            msg += `${disabledPlayerShips.length} of your ships were disabled in the fighting.<br/>`
            msg += this.loseDisabledShipsAndCargo(disabledPlayerShips)
        }

        showModal('Defeated', msg, [['Continue', ()=>this.showPlayerSurrenderedToAuthoritiesModal()]])
    }

    /**
     * Called when the player surrenders.
     */
    onSurrender() {
        this.showPlayerSurrenderedToAuthoritiesModal()
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
        
        // Build list of illegal cargo for display
        let illegalList = []
        for (const cargoType of illegalCargo.keys) {
            const amount = illegalCargo.getAmount(cargoType)
            illegalList.push(`${cargoType.symbol} ${coloredName(cargoType)} (${amount})`)
        }
        
        let msg = `<span style="color: rgb(${COLORS.Red.join(',')})">CONTRABAND DETECTED!</span><br/><br/>`
        msg += `The officers have discovered illegal cargo in your holds:<br/>`
        msg += `${illegalList.join(', ')}<br/><br/>`
        msg += `"You're under arrest for smuggling prohibited materials!"<br/>`
        msg += `<br/><span style="color: rgb(${COLORS.Yellow.join(',')})">The authorities will confiscate contraband and assess fines when you're processed.</span><br/>`
        
        showModal('Contraband Found', msg, [['Continue', () => this.showPlayerSurrenderedToAuthoritiesModal()]], '', null, 0)
    }
}
