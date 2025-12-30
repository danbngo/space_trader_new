/**
 * @fileoverview Colonists encounter implementation.
 * @module encounters/ColonistsEncounter
 */

/**
 * Represents a Colonists encounter.
 * Colonists are peaceful settlers traveling to establish new colonies.
 * They prefer to avoid conflict and will flee if threatened.
 * @class ColonistsEncounter
 * @extends Encounter
 */
class ColonistsEncounter extends Encounter {
    /**
     * @param {EncounterType} encounterType
     * @param {GameState} gameState
     */
    constructor(encounterType, gameState) {
        super(encounterType, gameState)
    }

    /**
     * Called when the encounter starts.
     * Colonists will try to avoid the player or flee if the player has high infamy.
     * @override
     */
    onStart() {
        if (gs.encounter.luck[0] * gs.fleet.totalRadar * (1+gs.fleet.totalSkills.getAmount(SKILLS.Stealth)/50) > gs.encounter.fleet.totalRadar) {
            showModal(coloredName(gs.encounter.fleet), 'Your long range sensors detect a colonist fleet before they detect you.<br/>You manage to approach them stealthily.', [
                ['View', ()=>closeModal()],
                ['Bypass', ()=>endEncounter()],
                ['Hail', ()=>{
                    gs.encounter.luck[0] = 0
                    gs.encounter.onStart()
                }],
                ['Sneak Attack', ()=>showPlayerAttackFleetModal(-1, 1, false, true)],
            ])
        }
        else if (gs.encounter.luck[1] * gs.captain.calcInfamyForPlanet(gs.encounter.planet) > 200) {
            showModal(coloredName(gs.encounter.fleet), 'The colonists have heard of your fearsome deeds and start fleeing immediately!', [
                ['View', ()=>closeModal()],
                ['Ignore', ()=>endEncounter()],
                ['Attack', ()=>showPlayerAttackFleetModal(-1, 1, false, true)],
            ])
        }
        else {
            showModal(coloredName(gs.encounter.fleet), 'The colonists send a friendly greeting and wave as they continue on their journey.', [
                ['View', ()=>closeModal()],
                ['Ignore', ()=>endEncounter()],
                ['Attack', ()=>showPlayerAttackFleetModal(-1, 1, false, true)],
            ])
        }
    }

    /**
     * Called when the player is victorious.
     * @override
     */
    onVictory() {
        showPlayerDefeatedEnemyModal(-1)
    }

    /**
     * Called when the player is defeated.
     * @override
     */
    onDefeat() {
        showPlayerDefeatedByNeutralsModal(1)
    }

    /**
     * Called when the player escapes.
     * @override
     */
    onEscape() {
        showPlayerEscapedFromEnemyModal()
    }

    /**
     * Called when the player surrenders.
     * @override
     */
    onSurrender() {
        gs.encounter.onDefeat()
    }
}
