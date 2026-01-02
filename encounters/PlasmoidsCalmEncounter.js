/**
 * @class PlasmoidsCalmEncounter
 * @extends {HazardEncounter}
 * @description Calm plasmoid field with fewer hazards - ideal for peaceful plasma mining.
 */
class PlasmoidsCalmEncounter extends HazardEncounter {
    onStart() {
        showModal(coloredName(this.fleet), `You encounter a calm ${coloredName(this.fleet)} field.<br/>The sparse distribution makes for safe plasma harvesting conditions.`, [
            //['View', ()=>closeModal()],
            ['Bypass', ()=>this.endEncounter()],
            ['Mine', ()=>this.startCombat(true)],
            ['Auto-Mine', ()=>this.autoMineHazard()],
        ])
    }
}
