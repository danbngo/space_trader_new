class FleetEncounter extends Encounter {
    showPlayerEscapedFromEnemyModal() {
        console.log('showPlayerEscapedFromEnemyModal');
        const {enemyFleet, disabledPlayerShips, escapedPlayerShips, playerShips} = this
        
        // Award experience points for successfully escaping
        const expGained = Math.round(AVERAGE_EXP_FROM_ESCAPING * (enemyFleet.combatRating / 10))
        
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

    showPlayerDefeatedEnemyModal(fameMultiplier = 0) {
        console.log('showPlayerDefeatedEnemyModal', { fameMultiplier });
        const {enemyFleet, disabledEnemyShips} = this
        const planet = this.planet
        const faction = this.fleet.factionType
        const fame = fameMultiplier > 0 ? 5 * fameMultiplier : 0
        const infamy = fameMultiplier < 0 ? 5 * Math.abs(fameMultiplier) : 0
        const abandonedCargoCapacity = disabledEnemyShips.reduce( (total, ship) => {
            return total + ship.cargoSpace
        }, 0)
        let creditsAmt = Math.ceil(Math.random() * enemyFleet.captain.credits * (abandonedCargoCapacity / enemyFleet.totalCargoSpace))
        const officersShare = gs.fleet.calcTotalCRShare(creditsAmt, true)
        const finalCredits = creditsAmt - officersShare
        gs.credits += finalCredits
        if (!isNaN(gs.credits)) throw new Error('creditsAmt was NaN!')
        creditsAmt = finalCredits
        const cargoRatio = abandonedCargoCapacity / enemyFleet.totalCargoSpace
        const maxLootAmt = Math.ceil(enemyFleet.cargo.total * cargoRatio)
        const baseLootAmt = Math.ceil(Math.random() * maxLootAmt)
        const lootAmt = Math.floor(weightedAvg([baseLootAmt, maxLootAmt], [25, gs.fleet.totalSkills.getAmount(SKILLS.Salvage)]))
        const loot = enemyFleet.cargo.randomSubset(lootAmt)
        const disabledPlayerShips = this.playerShips.filter(s=>s.disabled)

        // Award experience points based on enemy fleet strength
        const expGained = Math.round(AVERAGE_EXP_FROM_COMBAT * (enemyFleet.combatRating / 10))

        let msg = `You defeated the ${coloredName(enemyFleet)}!<br/>`
        msg += gs.captain.grantExperience(expGained)
        if (infamy && planet) msg += gs.captain.grantInfamy(planet, infamy)
        if (fame && planet) msg += gs.captain.grantFame(planet, fame)
        if (faction) {
            if (infamy) msg += gs.captain.grantFactionInfamy(faction, infamy)
            if (fame) msg += gs.captain.grantFactionFame(faction, fame)
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
        this.showPlayerDidSurrenderModal(1)
    }

}