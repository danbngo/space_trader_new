/**
 * @class AbandonedShipEncounter
 * @extends {PiratesEncounter}
 */
class AbandonedShipEncounter extends PiratesEncounter {
    onStart() {
        const abandonedShip = this.fleet.ships[0]
        abandonedShip.takeDamage(Infinity, false, false, null)
        
        let msg = `You discover an abandoned ${abandonedShip.shipType.name}!<br/>`
        msg += `The ship appears to have been disabled and abandoned by its crew.<br/>`
        msg += `Your scanners detect cargo aboard. Do you want to investigate?<br/>`
        
        showModal('Abandoned Ship', msg, [
            ['Loot', ()=>this.attemptLoot()],
            ['Leave', ()=>this.endEncounter()]
        ])
    }

    attemptLoot() {
        // 50% chance of pirate ambush
        if (Math.random() < 0.5) {
            this.pirateAmbush()
        } else {
            this.successfulLoot()
        }
    }

    pirateAmbush() {
        // Generate pirate ships
        const pirateFleet = generateFleet(FLEET_TYPES.PIRATES, FACTION_TYPES.PIRATES, this.planet)
        pirateFleet.captain = new Officer(`Pirate Captain`, 0)
        pirateFleet.captain.credits = rng(FLEET_TYPES.PIRATES.maxCredits, 0)
        
        // Position pirates near the abandoned ship
        for (const ship of pirateFleet.ships) {
            ship.aiType = AI_TYPES.Ship
            ship.x = this.fleet.ships[0].x + rng(30, -30)
            ship.y = this.fleet.ships[0].y + rng(30, -30)
            this.fleet.addShip(ship)
        }
        
        // Update encounter fleet captain to pirate captain
        this.fleet.captain = pirateFleet.captain
        
        let msg = `It's a trap! Pirates decloak from behind the abandoned ship!<br/>`
        msg += `${pirateFleet.ships.length} pirate ships appear and move to attack!<br/>`
        
        showModal('Pirate Ambush!', msg, [
            ['Fight', ()=>this.startCombat(false)]
        ])
    }

    successfulLoot() {
        const abandonedShip = this.fleet.ships[0]
        
        // Calculate loot from the abandoned ship
        const cargoRatio = 1 // All cargo is available
        const maxLootAmt = Math.ceil(this.fleet.cargo.total * cargoRatio)
        const baseLootAmt = Math.ceil(Math.random() * maxLootAmt)
        const lootAmt = Math.floor(weightedAvg([baseLootAmt, maxLootAmt], [25, gs.fleet.totalSkills.getAmount(SKILLS.Salvage)]))
        const loot = this.fleet.cargo.randomSubset(lootAmt)
        
        // Calculate credits
        let creditsAmt = Math.ceil(Math.random() * this.fleet.captain.credits)
        const officersShare = gs.fleet.calcTotalCRShare(creditsAmt, true)
        const finalCredits = creditsAmt - officersShare
        
        let msg = `No signs of danger. You begin salvaging the abandoned ship.<br/>`
        
        if (baseLootAmt > 0) {
            msg += `Your scanners reveal ${baseLootAmt} units of cargo aboard.<br/>`
            if (lootAmt > baseLootAmt) msg += `Your salvaging skills allow you to recover an additional ${lootAmt - baseLootAmt} units of cargo.<br/>`
        } else {
            msg += `The ship's cargo hold is empty.<br/>`
        }
        
        if (finalCredits > 0) {
            gs.credits += finalCredits
            msg += `You also salvage ${finalCredits}CR from the ship${officersShare ? ` (-${officersShare}CR for officers)` : ''}.<br/>`
        }
        
        showModal('Abandoned Ship', msg, [
            lootAmt > 0 ? ['Loot', ()=>showLootMenu(loot)] : ['Continue', ()=>this.endEncounter()]
        ])
    }

    onVictory() {
        // After defeating pirates, allow looting both pirate ships and abandoned ship
        this.showPlayerDefeatedEnemyModal()
    }

    onDefeat() {
        this.showPlayerDefeatedByPiratesModal()
    }

    onEscape() {
        showModal('Abandoned Ship', 'You decide to leave the abandoned ship and continue on your way.', [
            ['Continue', ()=>this.endEncounter()]
        ])
    }

    onSurrender() {
        this.onDefeat()
    }
}
