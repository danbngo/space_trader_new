class FleetEncounter extends Encounter {
    showPlayerEscapedFromEnemyModal() {
        console.log('showPlayerEscapedFromEnemyModal');
        const {enemyFleet, disabledPlayerShips, escapedPlayerShips, playerShips} = this
        
        // Award experience points for successfully escaping
        const expGained = Math.round(AVERAGE_EXP_FROM_ESCAPING * (enemyFleet.combatRating / this.playerFleet.combatRating))
        
        let msg = `You escaped from the ${coloredName(enemyFleet)}!<br/>`
        msg += gs.captain.grantExperience(expGained)
        if (escapedPlayerShips.length > 0) msg += `${escapedPlayerShips.length == playerShips.length ? 'All' : escapedPlayerShips.length} of your ships exited the battlefield intact.<br/>`
        if (disabledPlayerShips.length > 0) {
            msg += `However, ${disabledPlayerShips.length} were disabled in the fighting.<br/>`
            msg += this.loseCargoFromDisabledShips(disabledPlayerShips)
        }

        msg += this.conductRepairs()

        showModal(this.encounterType.name, msg, [['Continue', ()=>this.endEncounter()]])
    }

    showPlayerDefeatedEnemyModal() {
        console.log('showPlayerDefeatedEnemyModal');
        const {enemyFleet, disabledEnemyShips} = this
        const planet = this.planet
        const faction = this.fleet.factionType
        const reputationMultiplier = faction.reputationMultiplier
        const reputation = Math.ceil(ENCOUNTER_BASE_REPUTATION_EFFECT_ON_VICTORY * reputationMultiplier)
        const abandonedCargoCapacity = disabledEnemyShips.reduce( (total, ship) => {
            return total + ship.cargoSpace
        }, 0)
        let creditsAmt = Math.ceil(Math.random() * enemyFleet.captain.credits * (abandonedCargoCapacity / enemyFleet.totalCargoSpace))
        const officersShare = gs.fleet.calcTotalCRShare(creditsAmt, true)
        const finalCredits = creditsAmt - officersShare
        gs.credits += finalCredits
        if (isNaN(gs.credits)) throw new Error('creditsAmt was NaN!')
        creditsAmt = finalCredits
        const cargoRatio = abandonedCargoCapacity / enemyFleet.totalCargoSpace
        const maxLootAmt = Math.ceil(enemyFleet.cargo.total * cargoRatio)
        const baseLootAmt = Math.ceil(Math.random() * maxLootAmt)
        const lootAmt = Math.floor(weightedAvg([baseLootAmt, maxLootAmt], [25, gs.fleet.totalSkills.getAmount(SKILLS.Salvage)]))
        const loot = enemyFleet.cargo.randomSubset(lootAmt)
        const disabledPlayerShips = this.playerShips.filter(s=>s.disabled)

        // Award experience points based on enemy fleet strength
        const expGained = Math.round(AVERAGE_EXP_FROM_COMBAT * (enemyFleet.combatRating / this.playerFleet.combatRating))

        const surrenderDialogue = this.getSurrenderingDialogue()
        
        let msg = `You defeated the ${coloredName(enemyFleet)}!<br/>`
        if (surrenderDialogue) {
            msg += `"${surrenderDialogue}"<br/>`
        }
        msg += gs.captain.grantExperience(expGained)
        if (reputation) {
            if (planet) msg += gs.captain.grantReputation(planet, reputation)
            if (faction) msg += gs.captain.grantReputation(faction, reputation)
        }

        if (disabledPlayerShips.length > 0) {
            msg += `${disabledPlayerShips.length} of your ships were disabled in the fighting.<br/>`
            msg += this.loseCargoFromDisabledShips(disabledPlayerShips)
        }

        msg += this.conductRepairs()

        if (disabledEnemyShips.length > 0) {
            msg += `The ${coloredName(enemyFleet)} left behind ${disabledEnemyShips.length} disabled ships!<br/>`
            msg += `Your scanners reveal ${baseLootAmt} units of cargo amid the wreckage.<br/>`
            if (lootAmt > baseLootAmt) msg += `Your salvaging skills allow you to recover an additional ${lootAmt - baseLootAmt} units of cargo.<br/>`
            if (!isNaN(creditsAmt) && creditsAmt > 0) msg += `You also salvage ${finalCredits}CR from the wreckage${officersShare ? ` (-${officersShare}CR for officers)` : ''}.<br/>`
        }
        showModal(this.encounterType.name, msg, [
            lootAmt > 0 ? ['Loot', ()=>showLootMenu(loot)] : ['Continue', ()=>this.endEncounter()]
        ])
    }
    onVictory() {
        this.showPlayerDefeatedEnemyModal()
    }

    onDefeat() {
        //must implement in subclasses!
        //this.showPlayerDefeatedByNeutralsModal()
    }

    onEscape() {
        this.showPlayerEscapedFromEnemyModal()
    }

    onSurrender() {
        this.showPlayerDidSurrenderModal()
    }

}