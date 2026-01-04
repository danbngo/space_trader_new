/**
 * @class SyndicatesEncounter
 * @extends {FleetEncounter}
 */
class SyndicatesEncounter extends FleetEncounter {
    onStart() {
        const extortAmount = Math.max(100, Math.floor(gs.credits * ENCOUNTER_MAX_EXTORT_RATIO))
        const playerCredits = gs.credits
        
        let msg = `A ${coloredName(this.fleet)} fleet materializes from cloak, weapons armed.<br/>`
        msg += `"This is syndicate territory. Pay ${extortAmount}CR for safe passage, or face the consequences."`
        
        if (playerCredits === 0) {
            // No credits - attack them
            showModal(
                coloredName(this.fleet),
                msg + '<br/><br/>You have no credits to pay.<br/><br/>"No credits? Then we\'ll take your ship instead!"',
                [['Fight', ()=>this.startCombat()]]
            )
        } else if (playerCredits < extortAmount) {
            // Can't afford full amount - offer what they have or fight
            showModal(
                coloredName(this.fleet),
                msg + `<br/><br/>You only have ${playerCredits}CR.`,
                [
                    ['Pay All', ()=>{
                        gs.credits = 0
                        showModal(
                            'Extortion',
                            `You transfer all your credits.<br/><br/>"Not enough, but we'll let you go this time. Don't come back broke."<br/><br/>The syndicate ships re-engage their cloaks and vanish.`,
                            [['Continue', ()=>this.endEncounter()]]
                        )
                    }],
                    ['Refuse', ()=>this.startCombat()]
                ]
            )
        } else {
            // Can afford it
            showModal(
                coloredName(this.fleet),
                msg,
                [
                    ['Pay', ()=>{
                        gs.credits -= extortAmount
                        showModal(
                            'Extortion',
                            `You transfer ${extortAmount}CR to the syndicate.<br/><br/>"Smart choice. Now move along."<br/><br/>The syndicate ships re-engage their cloaks and vanish.`,
                            [['Continue', ()=>this.endEncounter()]]
                        )
                    }],
                    ['Refuse', ()=>this.startCombat()]
                ]
            )
        }
    }

    onVictory() {
        this.showPlayerDefeatedEnemyModal()
    }

    onDefeat() {
        this.showPlayerDefeatedBySyndicateModal()
    }

    onEscape() {
        this.showPlayerEscapedFromEnemyModal()
    }

    onSurrender() {
        this.showPlayerDidSurrenderModal()
    }

    showPlayerDefeatedBySyndicateModal() {
        console.log('showPlayerDefeatedBySyndicateModal');
        const {enemyFleet, fleet, disabledPlayerShips} = this
        let msg = `The ${coloredName(enemyFleet)} have defeated you.<br/>`

        if (disabledPlayerShips.length > 0) {
            msg += `${disabledPlayerShips.length} of your ships were disabled in the fighting.<br/>`
            msg += this.loseCargoFromDisabledShips(disabledPlayerShips)
        }

        msg += `The ${coloredName(enemyFleet)} board your ships to collect their "tax".<br/>`
        
        // Take credits
        const maxCreditsToLose = Math.floor(gs.credits * ENCOUNTER_MAX_LOSE_CREDITS_RATIO)
        const creditsLost = Math.max(100, rng(maxCreditsToLose, Math.floor(maxCreditsToLose/2)))
        if (gs.credits > 0) {
            gs.credits = Math.max(0, gs.credits - creditsLost)
            msg += `They take ${creditsLost}CR from your accounts.<br/>`
        }
        
        // Take cargo
        const lootableCargoAmount = gs.fleet.cargo.total
        if (lootableCargoAmount > 0) {
            const canLootAmount = fleet.availableCargoSpace
            if (canLootAmount > 0) {
                const maxLootAmount = Math.min(canLootAmount, lootableCargoAmount)
                const lootAmount = rng(maxLootAmount * ENCOUNTER_MAX_LOSE_CARGO_RATIO, Math.floor(maxLootAmount * ENCOUNTER_MAX_LOSE_CARGO_RATIO / 2))
                msg += `They also seize ${lootAmount} units of cargo from your holds.<br/>`
                const loot = gs.fleet.cargo.randomSubset(lootAmount)
                loot.counts.forEach((amt, cargoType) => {
                    gs.fleet.cargo.increment(cargoType, -amt)
                })
            }
        }

        msg += `"Consider this a lesson. Next time, pay up."<br/>`
        msg += this.conductRepairs()

        showModal(this.encounterType.name, msg, [['Continue', ()=>this.endEncounter()]])
    }
}
