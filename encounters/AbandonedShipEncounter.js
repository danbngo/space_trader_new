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
            ['Loot', ()=>this.successfulLoot()],
            ['Leave', ()=>this.endEncounter()]
        ])
    }

    successfulLoot() {
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
        this.successfulLoot()
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
