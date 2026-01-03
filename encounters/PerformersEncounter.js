/**
 * @class PerformersEncounter
 * @extends {NeutralsEncounter}
 */
class PerformersEncounter extends NeutralsEncounter {
    onStart() {
        // Performers greet the player
        showModal(coloredName(this.fleet), 'A troupe of performers hails you. "Greetings, traveler! We bring art and entertainment to the far reaches of space. Perhaps our paths will cross again at a more opportune time!"', [
            ['Greet them', ()=>this.endEncounter()],
            ['Ignore', ()=>this.endEncounter()],
            ['Attack', ()=>this.attack()],
        ])
    }
}
