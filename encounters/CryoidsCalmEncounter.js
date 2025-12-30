/**
 * @class CryoidsCalmEncounter
 * @extends {HazardEncounter}
 * @description Calm cryoid field with fewer hazards - ideal for peaceful ice mining.
 */
class CryoidsCalmEncounter extends HazardEncounter {
    onStart() {
        showModal(coloredName(this.fleet), `You encounter a calm ${coloredName(this.fleet)} field.<br/>The sparse distribution makes for safe ice mining conditions.`, [
            ['View', ()=>closeModal()],
            ['Bypass', ()=>this.endEncounter()],
            ['Mine', ()=>this.startCombat(true)],
            ['Auto-Mine', ()=>this.autoMineHazard()],
        ])
    }
}
