/**
 * @class DiplomatsEncounter
 * @extends {NeutralsEncounter}
 */
class DiplomatsEncounter extends NeutralsEncounter {
    onStart() {
        // Diplomats ignore the player for now
        showModal(coloredName(this.fleet), 'A diplomatic convoy passes by, focused on their important mission. They acknowledge your presence with a polite transmission but continue on their way.', [
            ['Ignore', ()=>this.endEncounter()],
            ['Attack', ()=>this.startCombat()],
        ])
    }
}
