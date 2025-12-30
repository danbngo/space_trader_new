/**
 * @class AbandonedShipEncounter
 * @extends {Encounter}
 */
class AbandonedShipEncounter extends Encounter {
    onStart() {
        const abandonedShip = gs.encounter.fleet.ships[0]
        abandonedShip.disabled = true
        
        // Calculate loot from the abandoned ship
        const cargoRatio = 1 // All cargo is available
        const maxLootAmt = Math.ceil(gs.encounter.fleet.cargo.total * cargoRatio)
        const baseLootAmt = Math.ceil(Math.random() * maxLootAmt)
        const lootAmt = Math.floor(weightedAvg([baseLootAmt, maxLootAmt], [25, gs.fleet.totalSkills.getAmount(SKILLS.Salvage)]))
        const loot = gs.encounter.fleet.cargo.randomSubset(lootAmt)
        
        // Calculate credits
        let creditsAmt = Math.ceil(Math.random() * gs.encounter.fleet.captain.credits)
        const officersShare = gs.fleet.calcTotalCRShare(creditsAmt, true)
        const finalCredits = creditsAmt - officersShare
        
        let msg = `You discover an abandoned ${abandonedShip.shipType.name}!<br/>`
        msg += `The ship appears to have been disabled and abandoned by its crew.<br/>`
        
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
            lootAmt > 0 ? ['Loot', ()=>showLootMenu(loot)] : ['Continue', ()=>endEncounter()]
        ])
    }

    onVictory() {
        // Not applicable for abandoned ships
        endEncounter()
    }

    onDefeat() {
        // Not applicable for abandoned ships
        endEncounter()
    }

    onEscape() {
        showModal('Abandoned Ship', 'You decide to leave the abandoned ship and continue on your way.', [
            ['Continue', ()=>endEncounter()]
        ])
    }

    onSurrender() {
        // Not applicable for abandoned ships
        endEncounter()
    }
}
