/**
 * @class PiratesEncounter
 * @extends {FleetEncounter}
 */
class PiratesEncounter extends FleetEncounter {
    onStart() {
        if (this.luck[0] * gs.fleet.totalRadar * (1+gs.fleet.totalSkills.getAmount(SKILLS.Stealth)/50) > this.fleet.totalRadar) {
            showModal(coloredName(this.fleet), `Your long range sensors detect a ${coloredName(this.fleet)} fleet before they detect you.<br/>You manage to approach the ${coloredName(this.fleet)} stealthily.`, [
                ['View', ()=>closeModal()],
                ['Bypass', ()=>this.endEncounter()],
                ['Hail', ()=>{
                    this.luck[0] = 0
                    this.onStart()
                }],
                ['Sneak Attack', ()=>this.showPlayerAttackFleetModal(1, 0, false, false)],
            ])
        }
        else if (this.luck[1] * gs.captain.calcReputationForPlanet(this.planet) > 200) {
            showModal(coloredName(this.fleet), `The ${coloredName(this.fleet)} are in awe of your fearsome exploits! They broadcast a merry jig and salute you while you pass.`, [
                ['View', ()=>closeModal()],
                ['Ignore', ()=>this.endEncounter()],
                ['Attack', ()=>this.showPlayerAttackFleetModal(1, 0, false, true)],
            ])
        }
        else if (this.luck[2] < 0.5) {
            showModal(coloredName(this.fleet), `The ${coloredName(this.fleet)} fire warning shots at your ship!<br/>They demand you surrender and prepare to be boarded!`, [
                ['View', ()=>closeModal()],
                ['Surrender', ()=>this.onSurrender()],
                ['Resist', ()=>this.showPlayerRefuseSurrenderModal(1, 0)],
            ])
        }
        else {
            showModal(coloredName(this.fleet), `The ${coloredName(this.fleet)} broadcast insults and jeers at your fleet, but let you pass regardless.`, [
                ['View', ()=>closeModal()],
                ['Ignore', ()=>this.endEncounter()],
                ['Attack', ()=>this.showPlayerAttackFleetModal(1, 0, false, false)],
            ])
        }
    }

    onVictory() {
        this.showPlayerDefeatedEnemyModal(1)
    }

    onDefeat() {
        this.showPlayerDefeatedByPiratesModal()
    }

    onEscape() {
        this.showPlayerEscapedFromEnemyModal()
    }

    onSurrender() {
        this.showPlayerDidSurrenderModal(1)
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
                const lootAmount = rng(maxLootAmount, maxLootAmount/2)
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
            const stolenCreditsAmount = rng(gs.credits*0.5, gs.credits*0.1)
            msg += `They help themselves to ${stolenCreditsAmount} of your credits.<br/>`
        }
        msg += `The ${coloredName(enemyFleet)} sadronically thank you for your time and depart.<br/>`

        msg += this.conductRepairs()

        showModal(this.encounterType.name, msg, [['Continue', ()=>this.endEncounter()]])
    }
}
