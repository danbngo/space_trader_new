/**
 * @fileoverview Colonists encounter implementation.
 * @module encounters/ColonistsEncounter
 */

/**
 * Represents a Colonists encounter.
 * Colonists are peaceful settlers traveling to establish new colonies.
 * They prefer to avoid conflict and will flee if threatened.
 * @class ColonistsEncounter
 * @extends NeutralsEncounter
 */
class ColonistsEncounter extends NeutralsEncounter {
    /**
     * Called when the encounter starts.
     * Colonists will try to avoid the player or flee if the player has high infamy.
     * @override
     */
    onStart() {
        if (this.playerUndetected) {
            showModal(coloredName(this.fleet), 'Your long range sensors detect a colonist fleet before they detect you.<br/>You manage to approach them stealthily.', [
                //['View', ()=>closeModal()],
                ['Bypass', ()=>this.endEncounter()],
                ['Hail', ()=>{
                    this.onStart()
                }],
                ['Sneak Attack', ()=>this.showPlayerAttackNeutralsModal()],
            ])
        }
        else if (FameLevel.hasInfamyLevel(gs.captain, this.planet, INFAMY_LEVELS.VILIFIED)) {
            showModal(coloredName(this.fleet), 'The colonists have heard of your fearsome deeds and start fleeing immediately!', [
                //['View', ()=>closeModal()],
                ['Ignore', ()=>this.endEncounter()],
                ['Attack', ()=>this.showPlayerAttackNeutralsModal()],
            ])
        }
        else {
            showModal(coloredName(this.fleet), 'The colonists send a friendly greeting and wave as they continue on their journey.', [
                //['View', ()=>closeModal()],
                ['Ignore', ()=>this.endEncounter()],
                ['Attack', ()=>this.showPlayerAttackNeutralsModal()],
            ])
        }
    }

}
