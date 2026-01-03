/**
 * @class ExplorersEncounter
 * @extends {NeutralsEncounter}
 */
class ExplorersEncounter extends NeutralsEncounter {
    onStart() {
        // Explorers greet the player
        showModal(coloredName(this.fleet), 'An exploration fleet hails you. "Greetings, traveler! We\'re charting the far reaches of the system. Safe travels out there!"', [
            ['Greet them', ()=>this.endEncounter()],
            ['Ignore', ()=>this.endEncounter()],
            ['Attack', ()=>this.attack()],
        ])
    }
}
