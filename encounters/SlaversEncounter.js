
/**
 * @fileoverview Slavers encounter implementation.
 * @module encounters/SlaversEncounter
 */

/**
 * Represents a Slavers encounter.
 * Slavers are hostile criminals who capture and enslave crews.
 * If the player is defeated or surrenders, some of their officers will be captured.
 * @class SlaversEncounter
 * @extends FleetEncounter
 */
class SlaversEncounter extends FleetEncounter {
    /**
     * Called when the encounter starts.
     * Slavers check for stealth, then react based on reputation.
     * @override
     */
    onStart() {
        console.log('SlaversEncounter.onStart')
        const {enemyFleet} = this

        if (Math.random()*gs.captain.reputation.getAmount(FACTION_TYPES.SLAVERS) > 250) {
            // Friendly - they let you pass
            showModal('Recognized', `The ${coloredName(enemyFleet)} recognize you as an ally.<br/>They signal that you may pass freely.`,
            [
                ['Ignore', ()=>this.endEncounter()],
                ['Attack', ()=>this.showPlayerAttackFleetModal()],
            ])
        }
        else if (gs.captain.reputation.getAmount(FACTION_TYPES.SLAVERS) > 0) {
            // Neutral - they ignore you
            showModal('Ignored', `The ${coloredName(enemyFleet)} note your presence but choose to ignore you.`,
                ['Continue', ()=>this.endEncounter()]
            )
        }

        // Hostile - demand surrender
        showModal('Demand Surrender', `The ${coloredName(enemyFleet)} hail you.<br/>Your ships and crew belong to us now. Surrender immediately or be destroyed!`,
            [
                ['Surrender', ()=>this.showPlayerDidSurrenderModal()],
                ['Refuse', ()=>closeModal()],
            ])
    }

    /**
     * Called when the player is defeated.
     * Slavers capture some of the player's officers.
     * @override
     */
    onDefeat() {
        console.log('SlaversEncounter.onDefeat')
        this.showPlayerDefeatedBySlaversModal()
    }

    /**
     * Called when the player surrenders.
     * Slavers capture some of the player's officers.
     * @override
     */
    onSurrender() {
        console.log('SlaversEncounter.onSurrender')
        this.showPlayerDefeatedBySlaversModal()
    }

    /**
     * Called when the player is victorious.
     * @override
     */
    onVictory() {
        console.log('SlaversEncounter.onVictory')
        this.showPlayerDefeatedEnemyModal()
    }

    /**
     * Called when the player escapes.
     * @override
     */
    onEscape() {
        console.log('SlaversEncounter.onEscape')
        this.showPlayerEscapedFromEnemyModal()
    }

    /**
     * Called at the end of each turn.
     * @override
     */
    onEndTurn() {
        // Default behavior
    }

    showPlayerDefeatedBySlaversModal() {
        console.log('showPlayerDefeatedBySlaversModal');
        const {enemyFleet, fleet, disabledPlayerShips} = this
        let msg = `Unfortunately, you were no match for the ${coloredName(enemyFleet)}.<br/>`

        if (disabledPlayerShips.length > 0) {
            msg += `${disabledPlayerShips.length} of your ships were disabled in the fighting.<br/>`
            msg += this.loseCargoFromDisabledShips(disabledPlayerShips)
        }

        msg += `Now that the fighting is over, the ${coloredName(enemyFleet)} eagerly board your ships.<br/>`
        
        // Take cargo
        const lootableCargoAmount = gs.fleet.cargo.total
        if (lootableCargoAmount <= 0) {
            msg += 'They are disgusted to find nothing worth looting!<br/>'
        }
        else {
            const canLootAmount = fleet.availableCargoSpace
            if (canLootAmount <= 0) {
                msg += 'They are embarrassed to find their cargo bays are too full to hold any more loot.<br/>'
            }
            else {
                const maxLootAmount = Math.min(canLootAmount, lootableCargoAmount)
                const lootAmount = rng(maxLootAmount * ENCOUNTER_MAX_LOSE_CARGO_RATIO, maxLootAmount * ENCOUNTER_MAX_LOSE_CARGO_RATIO / 2)
                msg += `They take ${lootAmount} units of loot from your cargo bays.<br/>`
                const looted = fleet.cargo.randomSubset(lootAmount)
                fleet.cargo.subtractAmounts(looted)
            }
        }
        
        // Take credits
        if (gs.credits <= 10) {
            msg += `They note with contempt that you have ${gs.credits == 0 ? 'no' : 'barely any'} credits to steal!<br/>`
        }
        else {
            const creditsStolen = rng(gs.credits * ENCOUNTER_MAX_LOSE_CREDITS_RATIO, gs.credits * ENCOUNTER_MAX_LOSE_CREDITS_RATIO / 2, true)
            msg += `They take ${creditsStolen} credits from you.<br/>`
            gs.credits -= creditsStolen
        }

        // Capture officers
        const officerCount = gs.fleet.officers.length
        if (officerCount > 0) {
            const officersToCaptureCount = Math.max(1, Math.round(officerCount * rng(ENCOUNTER_MAX_LOSE_OFFICERS_RATIO, ENCOUNTER_MAX_LOSE_OFFICERS_RATIO * 0.66)))
            const capturedOfficers = []
            
            // Remove random officers
            for (let i = 0; i < officersToCaptureCount; i++) {
                if (gs.fleet.officers.length > 0) {
                    const randomIndex = Math.floor(Math.random() * gs.fleet.officers.length)
                    const officer = gs.fleet.officers.splice(randomIndex, 1)[0]
                    capturedOfficers.push(officer)
                }
            }
            
            if (capturedOfficers.length > 0) {
                msg += ''+colorSpan(`The slavers capture ${capturedOfficers.length} of your officers!<br/>`, COLORS.Red)
                for (const officer of capturedOfficers) {
                    msg += `${officer.name} was taken into slavery.<br/>`
                }
            }
        }

        msg += this.conductRepairs()
        
        showModal(coloredName(enemyFleet), msg, [['Continue', ()=>this.endEncounter()]])
    }
}
