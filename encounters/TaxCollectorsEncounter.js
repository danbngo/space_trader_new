/**
 * @class TaxCollectorsEncounter
 * @extends {NeutralsEncounter}
 */
class TaxCollectorsEncounter extends NeutralsEncounter {
    onStart() {
        // Tax collectors ignore the player for now
        showModal(coloredName(this.fleet), 'A government tax collection fleet scans your identification and cross-references it with their database. After a moment, they transmit: "All taxes current. Proceed."', [
            ['View', ()=>closeModal()],
            ['Continue', ()=>this.endEncounter()],
        ])
    }
}
