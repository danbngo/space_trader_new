class HazardEncounter extends Encounter {
    showPlayerEscapedFromHazardsModal() {
        console.log('showPlayerEscapedFromHazardsModal');
        const {enemyFleet, disabledPlayerShips, escapedPlayerShips, playerShips} = this
        
        // Award experience points for successfully escaping
        const expGained = Math.round(AVERAGE_EXP_FROM_ESCAPING * 0.5) // Half XP since hazards are easier to escape
        
        let msg = `You escaped from the ${coloredName(enemyFleet)}!<br/>`
        msg += gs.captain.grantExperience(expGained)
        if (escapedPlayerShips.length > 0) msg += `${escapedPlayerShips.length == playerShips.length ? 'All' : escapedPlayerShips.length} of your ships exited the hazard zone intact.<br/>`
        if (disabledPlayerShips.length > 0) {
            msg += `However, ${disabledPlayerShips.length} were disabled in the hazard.<br/>`
            msg += this.loseCargoFromDisabledShips(disabledPlayerShips)
        }

        msg += this.conductRepairs()

        showModal(this.encounterType.name, msg, [['Continue', ()=>this.endEncounter()]])
    }

    showPlayerDefeatedByHazardsModal() {
        console.log('showPlayerDefeatedByHazardsModal');
        const {enemyFleet, disabledPlayerShips} = this
        
        let msg = ''
        msg += `Your ships were scattered by the ${coloredName(enemyFleet)}.<br/>`

        if (disabledPlayerShips.length > 0) {
            msg += `${disabledPlayerShips.length} of your ships were disabled in the fighting.<br/>`
            msg += this.loseCargoFromDisabledShips(disabledPlayerShips)
        }

        msg += this.conductRepairs()

        showModal(this.encounterType.name, msg, [['Continue', ()=>this.endEncounter()]])
    }
        
    showPlayerDefeatedHazardsModal() {
        console.log('showPlayerDefeatedHazardsModal');
        const {enemyFleet, disabledEnemyShips} = this
        // Only count ships disabled by the player flagship
        //const playerKilledShips = disabledEnemyShips.filter(ship => ship.disabledByShip === playerFlagship)
        const abandonedCargoCapacity = disabledEnemyShips.reduce( (total, ship) => {
            return total + ship.cargoSpace
        }, 0)
        const cargoRatio = abandonedCargoCapacity / enemyFleet.totalCargoSpace
        const maxLootAmt = Math.ceil(enemyFleet.cargo.total * cargoRatio)
        const baseLootAmt = Math.ceil(Math.random() * maxLootAmt)
        const lootAmt = Math.floor(weightedAvg([baseLootAmt, maxLootAmt], [25, gs.fleet.totalSkills.getAmount(SKILLS.Salvage)]))
        const loot = enemyFleet.cargo.randomSubset(lootAmt)
        const disabledPlayerShips = this.playerShips.filter(s=>s.disabled)

        console.log('showPlayerDefeatedHazardsModal stats:', { abandonedCargoCapacity, cargoRatio, maxLootAmt, baseLootAmt, lootAmt, loot, disabledEnemyShips, disabledPlayerShips });
        
        // Award experience points based on mining success
        const expGained = AVERAGE_EXP_FROM_MINING * (1+disabledEnemyShips.length)
        
        let msg = ''
        msg += `You survived the ${coloredName(enemyFleet)}!<br/>`
        msg += gs.captain.grantExperience(expGained)

        if (disabledPlayerShips.length > 0) {
            msg += `${disabledPlayerShips.length} of your ships were disabled.<br/>`
            msg += this.loseCargoFromDisabledShips(disabledPlayerShips)
        }

        msg += this.conductRepairs()

        if (disabledEnemyShips.length > 0) {
            msg += `You destroyed ${disabledEnemyShips.length} ${coloredName(enemyFleet)}!<br/>`
            msg += `Your scanners reveal ${baseLootAmt} units of usable material amid the wreckage.<br/>`
            if (lootAmt > baseLootAmt) msg += `Your salvaging skills allow you to recover an additional ${lootAmt - baseLootAmt} units of usable material.<br/>`
        }
        showModal(this.encounterType.name, msg, [
            lootAmt > 0 ? ['Loot', ()=>showLootMenu(loot)] : ['Continue', ()=>this.endEncounter()]
        ])
    }


    onVictory() {
        this.showPlayerDefeatedHazardsModal()
    }

    onDefeat() {
        this.showPlayerDefeatedByHazardsModal()
    }

    onEscape() {
        this.showPlayerEscapedFromHazardsModal()
    }

    onSurrender() {
        // Not applicable for hazards
    }

    //simulates the player doing his best to escape the hazard, creates a random combat result basically
    autoNavigateHazard() {
        const {playerShips, enemyShips} = this
        const maxDamage = enemyShips.reduce((sum, ship)=>sum + ship.hull[1]*ship.engine*0.001, 0);
        const damage = rng(maxDamage, 0, true)
        console.log('gs.fleet.flagship hull before:', gs.fleet.flagship.hull[0], gs.fleet.flagship.hull[1]);
        this.damageRandomly(playerShips, damage)
        const disabledShips = playerShips.filter(s=>s.disabled)
        const survivedShips = playerShips.filter(s=>!s.disabled)
        for (const s of survivedShips) s.escaped = true
        console.log(`autoNavigateHazard`, {maxDamage, damage, disabledShips, playerShips});
        console.log('gs.fleet.flagship hull after:', gs.fleet.flagship.hull[0], gs.fleet.flagship.hull[1]);
        if (disabledShips.length >= playerShips.length) {
            this.showPlayerDefeatedByHazardsModal()
        }
        else {
            this.showPlayerEscapedFromHazardsModal()
        }
    }


}
