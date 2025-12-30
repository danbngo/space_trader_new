/**
 * @class AsteroidsCalmEncounter
 * @extends {HazardEncounter}
 * @description Calm asteroid field with fewer hazards - ideal for peaceful mining operations.
 */
class AsteroidsCalmEncounter extends HazardEncounter {
    onStart() {
        showModal(coloredName(this.fleet), `You encounter a calm ${coloredName(this.fleet)} field.<br/>The sparse distribution makes for safe mining conditions.`, [
            ['View', ()=>closeModal()],
            ['Bypass', ()=>this.endEncounter()],
            ['Mine', ()=>this.startCombat(true)],
            ['Auto-Mine', ()=>this.autoMineHazard()],
        ])
    }
}
