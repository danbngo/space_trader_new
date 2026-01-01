/**
 * @class RefugeesEncounter
 * @extends {NeutralsEncounter}
 */
class RefugeesEncounter extends NeutralsEncounter {
    onStart() {
        // Refugees ignore the player for now
        showModal(coloredName(this.fleet), 'A desperate fleet of refugees drifts past. Their ships are crowded and showing signs of wear. They barely have the resources to continue their journey, let alone interact with you.', [
            ['View', ()=>closeModal()],
            ['Continue', ()=>this.endEncounter()],
        ])
    }
}
