
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
     * @param {EncounterType} encounterType
     */
    constructor(encounterType) {
        super(encounterType)
    }

    /**
     * Called when the encounter starts.
     * Slavers check for stealth, then react based on reputation.
     * @override
     */
    onStart() {
        console.log('SlaversEncounter.onStart')
        const {enemyFleet} = this

        // Check if player avoided detection with stealth
        if (chanceIn(500, gs.fleet.stealthLevel)) {
            showModal('Evaded', ce({textContent: 
                `You noticed the ${coloredName(enemyFleet)} on your scanners, ` +
                `but your stealth systems prevented them from detecting you. ` +
                `You slipped away before they could intercept you.`}),
                [{text: 'Continue', onclick: ()=>closeModal()}]
            )
            // End encounter peacefully
            for (const ship of this.playerShips) ship.escaped = true
            return
        }

        // Check reputation with Slavers
        const reputation = gs.captain.reputation.get(FACTION_TYPES.SLAVERS.name)
        
        if (reputation > 20) {
            // Friendly - they let you pass
            showModal('Recognized', ce({textContent: 
                `The ${coloredName(enemyFleet)} recognize you as an ally. ` +
                `They signal that you may pass freely.`}),
                [{text: 'Continue', onclick: ()=>closeModal()}]
            )
            for (const ship of this.playerShips) ship.escaped = true
            return
        }
        else if (reputation > 0) {
            // Neutral - they ignore you
            showModal('Ignored', ce({textContent: 
                `The ${coloredName(enemyFleet)} note your presence but choose to ignore you.`}),
                [{text: 'Continue', onclick: ()=>closeModal()}]
            )
            for (const ship of this.playerShips) ship.escaped = true
            return
        }

        // Hostile - demand surrender
        const panel = createPanel(ce({children: [
            `The ${coloredName(enemyFleet)} hail you.<br/>
            Your ships and crew belong to us now. Surrender immediately or be destroyed!`
        ]}))

        const buttons = [
            {text: 'Surrender', onclick: ()=>encounterPlayerDidSurrender()},
            {text: 'Refuse', onclick: ()=>hidePanel(panel)},
        ]

        showPanel(panel, buttons)
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
        this.showPlayerDefeatedEnemyModal(2)
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
                const lootAmount = rng(maxLootAmount, maxLootAmount/2)
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
            const creditsStolen = rng(gs.credits, gs.credits/2, true)
            msg += `They take ${creditsStolen} credits from you.<br/>`
            gs.credits -= creditsStolen
        }

        // Capture officers
        const officerCount = gs.fleet.officers.length
        if (officerCount > 0) {
            const officersToCaptureCount = Math.max(1, Math.round(officerCount * rng(0.5, 0.33)))
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
                msg += ce({tag: 'br'})
                msg += ce({tag: 'span', style: 'color: red; font-weight: bold;', 
                    textContent: `The slavers capture ${capturedOfficers.length} of your officers!`})
                msg += ce({tag: 'br'})
                for (const officer of capturedOfficers) {
                    msg += `${officer.name} (${officer.role}) was taken into slavery.<br/>`
                }
            }
        }

        // Grant infamy
        const infamy = rng(5, 3)
        gs.captain.grantInfamy(infamy)
        gs.captain.reputation.add(enemyFleet.faction, infamy)
        msg += `<br/>You gained ${infamy} infamy and ${infamy} reputation with ${enemyFleet.faction}.`
        
        msg += this.conductRepairs()
        
        showModal(coloredName(enemyFleet), msg, [['Continue', ()=>this.endEncounter()]])
    }
}
