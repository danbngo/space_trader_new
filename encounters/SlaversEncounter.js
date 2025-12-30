
/**
 * @fileoverview Slavers encounter implementation.
 * @module encounters/SlaversEncounter
 */

/**
 * Represents a Slavers encounter.
 * Slavers are hostile criminals who capture and enslave crews.
 * If the player is defeated or surrenders, some of their officers will be captured.
 * @class SlaversEncounter
 * @extends Encounter
 */
class SlaversEncounter extends Encounter {
    /**
     * @param {EncounterType} encounterType
     * @param {GameState} gameState
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
                [{text: 'Continue', onclick: ()=>hideModal()}]
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
                [{text: 'Continue', onclick: ()=>hideModal()}]
            )
            for (const ship of this.playerShips) ship.escaped = true
            return
        }
        else if (reputation > 0) {
            // Neutral - they ignore you
            showModal('Ignored', ce({textContent: 
                `The ${coloredName(enemyFleet)} note your presence but choose to ignore you.`}),
                [{text: 'Continue', onclick: ()=>hideModal()}]
            )
            for (const ship of this.playerShips) ship.escaped = true
            return
        }

        // Hostile - demand surrender
        const panel = createPanel(ce({children: [
            ce({textContent: `The ${coloredName(enemyFleet)} hail you.`}),
            ce({tag: 'br'}),
            ce({textContent: `"Your ships and crew belong to us now. Surrender immediately or be destroyed!"`}),
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
        showPlayerDefeatedBySlaversModal()
    }

    /**
     * Called when the player surrenders.
     * Slavers capture some of the player's officers.
     * @override
     */
    onSurrender() {
        console.log('SlaversEncounter.onSurrender')
        showPlayerDefeatedBySlaversModal()
    }

    /**
     * Called when the player is victorious.
     * @override
     */
    onVictory() {
        console.log('SlaversEncounter.onVictory')
        showPlayerVictoryModal()
    }

    /**
     * Called when the player escapes.
     * @override
     */
    onEscape() {
        console.log('SlaversEncounter.onEscape')
        showPlayerEscapedModal()
    }

    /**
     * Called at the end of each turn.
     * @override
     */
    onEndTurn() {
        // Default behavior
    }
}
