class AuthoritiesEncounter extends FleetEncounter {
    
    showFineOrJailModal(fine = 0) {
        const fleetName = coloredName(this.fleet)
        const planet = this.planet
        const currentBounty = planet ? gs.captain.bounty.getAmount(planet) : gs.captain.bounty.total
        const fineFromBounty = Math.ceil(Math.min(Math.max(currentBounty*Math.random(),100), currentBounty))
        const jailDays = Math.round(JAIL_DAYS_PER_1000CR_FINE*(fine+fineFromBounty)/1000) //1 day of jail time per 1000CR of fine

        let msg = ''
        if (fineFromBounty && planet) msg += gs.captain.grantBounty(planet, -fineFromBounty)
        if (fineFromBounty) msg += `The ${fleetName} are aware of some of the bounties on your head, to the tune of ${fineFromBounty}CR.<br/>`
        if (fine) msg += `The ${fleetName} give you the option to pay a fine of ${fine}CR${fineFromBounty ? `, plus ${fineFromBounty} to clear your bounty` : ''} or serve ${describeTimespan(jailDays/365)} in jail.<br/>`
        else msg += `The ${fleetName} give you the option to pay off your bounty of ${fineFromBounty}CR or serve ${describeTimespan(jailDays/365)} in jail.<br/>`
        showModal(fleetName, msg, [
            ['Pay Fine', ()=>{
                gs.credits -= (fine + fineFromBounty)
                msg += `You pay the fine of ${fine+fineFromBounty}CR.<br/>`
                msg += `Your remaining CR: ${gs.credits}<br/>`
                if (fineFromBounty) msg += `Your bounty has been reduced to: ${planet ? gs.captain.bounty.getAmount(planet) : gs.captain.bounty.total}CR.<br/>`
                showModal(fleetName, msg, [['Continue', ()=>this.endEncounter()]])
            }, gs.credits >= fine + fineFromBounty],
            ['Serve Jail Time', ()=>{
                const [nearestPlanet] = gs.system.calcNearestPlanet(gs.fleet)
                gs.fleet.dock(nearestPlanet)
                gs.year += jailDays / 365.0
                msg += `The ${fleetName} take you to the nearest planet, ${nearestPlanet.name}.<br/>`
                msg += `You serve ${describeTimespan(jailDays/365)} in jail.<br/>`
                if (fineFromBounty) msg += `Your bounty has been reduced to: ${planet ? gs.captain.bounty.getAmount(planet) : gs.captain.bounty.total}CR.<br/>`
                showModal(fleetName, msg, [['Continue', ()=>this.endEncounter()]])
            }],
        ])
    }

    onVictory() {
        this.showPlayerDefeatedEnemyModal(-1)
    }

    onDefeat() {
        this.showFineOrJailModal()
    }

    onEscape() {
        this.showPlayerEscapedFromEnemyModal()
    }

    onSurrender() {
        this.showPlayerDidSurrenderModal(-1)
    }

    
    showPlayerDefeatedByAuthoritiesModal() {
        console.log('showPlayerDefeatedByAuthoritiesModal');
        const {enemyFleet} = this
        let fine = 5000
        let msg = `The ${coloredName(enemyFleet)} are taking you in! You are fined ${fine} for resisting arrest!<br/>`
        msg += `Your ships are roughly searched for illegal goods.<br/>`
        const [smugglingFine, seized] = this.seizePlayerContraband()
        msg += smugglingFine > 0 ? `They confiscate ${seized.total} units of contraband, and add a fine of ${smugglingFine} to your existing bounty.<br/>`
        : `They find no contraband aboard your ships, but that hardly excuses your other crimes.<br/>`
        showModal(coloredName(enemyFleet), msg, [['Continue', ()=> this.showFineOrJailModal(fine+smugglingFine)]])
    }

         
    /**
     * @returns {[number, CountsMap]} - [fine amount, seized cargo]
     */
    seizePlayerContraband() {
        const illegalCargo = gs.fleet.cargo.keys.filter( ct => ct.isIllegal )
        const seized = new CountsMap()
        let fine = 0
        for (const [ct, amt] of gs.fleet.cargo.counts) {
            if (illegalCargo.includes(ct)) {
                const finePerUnit = ct.value*2
                fine += finePerUnit * amt
                seized.increment(ct, amt)
            }
            gs.fleet.cargo.setAmount(ct, 0) //confiscate all illegal cargo
        }
        return [fine, seized]
    }
}