/**
 * @class SalvagersEncounter
 * @extends {NeutralsEncounter}
 */
class SalvagersEncounter extends NeutralsEncounter {
    onStart() {
        // Salvagers ignore the player for now
        showModal(coloredName(this.fleet), 'A salvage fleet is busy scanning for debris and wrecks. They barely notice your ship as they continue their search for valuable scrap.', [
            ['View', ()=>closeModal()],
            ['Continue', ()=>this.endEncounter()],
        ])
    }
}
