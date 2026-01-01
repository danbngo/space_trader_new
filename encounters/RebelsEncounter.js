/**
 * @class RebelsEncounter
 * @extends {NeutralsEncounter}
 */
class RebelsEncounter extends NeutralsEncounter {
    onStart() {
        // Rebels ignore the player for now
        showModal(coloredName(this.fleet), 'A rebel fleet emerges from the shadows. Their commander hails you: "We\'re not interested in civilian ships right now. We have bigger targets." They disengage and continue on their mission.', [
            ['View', ()=>closeModal()],
            ['Continue', ()=>this.endEncounter()],
        ])
    }
}
