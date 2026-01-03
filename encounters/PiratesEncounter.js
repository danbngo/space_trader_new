/**
 * @class PiratesEncounter
 * @extends {FleetEncounter}
 */
class PiratesEncounter extends FleetEncounter {
    onStart() {
        if (Math.random() * gs.captain.calcReputationForTarget(this.planet) > 200) {
            showModal(coloredName(this.fleet), `The ${coloredName(this.fleet)} are in awe of your fearsome exploits! They broadcast a merry jig and salute you while you pass.`, [
                //['View', ()=>closeModal()],
                ['Ignore', ()=>this.endEncounter()],
                ['Attack', ()=>this.showPlayerAttackFleetModal()],
            ])
        }
        else if (Math.random() < 0.5) {
            showModal(coloredName(this.fleet), `The ${coloredName(this.fleet)} fire warning shots at your ship!<br/>They demand you surrender and prepare to be boarded!`, [
                //['View', ()=>closeModal()],
                ['Surrender', ()=>this.onSurrender()],
                ['Resist', ()=>this.showPlayerRefuseSurrenderModal()],
            ])
        }
        else {
            showModal(coloredName(this.fleet), `The ${coloredName(this.fleet)} broadcast insults and jeers at your fleet, but let you pass regardless.`, [
                //['View', ()=>closeModal()],
                ['Ignore', ()=>this.endEncounter()],
                ['Attack', ()=>this.showPlayerAttackFleetModal()],
            ])
        }
    }

    onVictory() {
        this.showPlayerDefeatedEnemyModal()
    }

    onDefeat() {
        this.showPlayerDefeatedByPiratesModal()
    }

    onEscape() {
        this.showPlayerEscapedFromEnemyModal()
    }

    onSurrender() {
        this.showPlayerDidSurrenderModal()
    }

    showPlayerDefeatedByPiratesModal() {
        console.log('showPlayerDefeatedByPiratesModal');
        const {enemyFleet, fleet, disabledPlayerShips} = this
        let msg = `Unfortunately, you were no match for the ${coloredName(enemyFleet)}.<br/>`

        if (disabledPlayerShips.length > 0) {
            msg += `${disabledPlayerShips.length} of your ships were disabled in the fighting.<br/>`
            msg += this.loseCargoFromDisabledShips(disabledPlayerShips)
        }

        msg += `Now that the fighting is over, the ${coloredName(enemyFleet)} eagerly board your ships.<br/>`
        const lootableCargoAmount = gs.fleet.cargo.total
        if (lootableCargoAmount <= 0) {
            msg += 'They are disgusted to find nothing worth looting!<br/>'
        }
        else {
            const canLootAmount = fleet.availableCargoSpace
            if (canLootAmount <= 0) {
                //this should not happen, as generators always leave a little room for cargo
                msg += 'They are embarassed to find their cargo bays are too full to hold any more loot.<br/>'
            }
            else {
                const maxLootAmount = Math.min(canLootAmount, lootableCargoAmount)
                const lootAmount = rng(maxLootAmount * ENCOUNTER_MAX_LOSE_CARGO_RATIO, maxLootAmount * ENCOUNTER_MAX_LOSE_CARGO_RATIO / 2)
                msg += `They take ${lootAmount} units of loot from your cargo bays.<br/>`
                const looted = fleet.cargo.randomSubset(lootAmount)
                fleet.cargo.subtractAmounts(looted)
                //encounter.fleet.add(looted) //not really needed
            }
        }
        if (gs.credits <= 10) {
            msg += `They note with contempt that you have ${gs.credits == 0 ? 'no' : 'barely any'} credits to steal!<br/>`
        }
        else {
            const stolenCreditsAmount = rng(gs.credits * ENCOUNTER_MAX_LOSE_CREDITS_RATIO, gs.credits * ENCOUNTER_MAX_LOSE_CREDITS_RATIO / 2)
            msg += `They help themselves to ${stolenCreditsAmount} of your credits.<br/>`
        }
        msg += `The ${coloredName(enemyFleet)} sadronically thank you for your time and depart.<br/>`

        msg += this.conductRepairs()

        showModal(this.encounterType.name, msg, [['Continue', ()=>this.endEncounter()]])
    }
}
