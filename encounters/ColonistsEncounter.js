/**
 * @fileoverview Colonists encounter implementation.
 * @module encounters/ColonistsEncounter
 */

/**
 * Represents a Colonists encounter.
 * Colonists are peaceful settlers traveling to establish new colonies.
 * They prefer to avoid conflict and will flee if threatened.
 * @class ColonistsEncounter
 * @extends MercantileEncounter
 */
class ColonistsEncounter extends MercantileEncounter {
    /**
     * Called when the encounter starts.
     * Colonists will try to avoid the player or flee if the player has high infamy.
     * @override
     */
    onStart() {
        // Check if already met
        if (this.hasAlreadyVisitedPlayer()) {
            this.showAlreadyMetMessage()
            return
        }
        
        if (FameLevel.hasInfamyLevel(gs.captain, this.planet, INFAMY_LEVELS.VILIFIED)) {
            showModal(coloredName(this.fleet), 'The colonists have heard of your fearsome deeds and start fleeing immediately!', [
                //['View', ()=>closeModal()],
                ['Ignore', ()=>this.endEncounter()],
                ['Attack', ()=>this.showPlayerAttackModal()],
            ])
        }
        else if (Math.random() > .5) {
            // Colonists want to buy supplies (food, water, medicine, weapons)
            const supplyTypes = [CARGO_TYPES.FOOD, CARGO_TYPES.WATER, CARGO_TYPES.MEDICINE, CARGO_TYPES.WEAPONS];
            this.showTradeOfferModal(true, null, supplyTypes);
            return;
        }
        else {
            showModal(coloredName(this.fleet), 'The colonists send a friendly greeting and wave as they continue on their journey.', [
                //['View', ()=>closeModal()],
                ['Ignore', ()=>this.endEncounter()],
                ['Attack', ()=>this.showPlayerAttackModal()],
            ])
        }
    }

}
