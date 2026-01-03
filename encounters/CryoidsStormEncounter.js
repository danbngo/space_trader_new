/**
 * @class CryoidsStormEncounter
 * @extends {HazardEncounter}
 * @description Dense cryoid storm with many hazards - dangerous but rich with water ice.
 */
class CryoidsStormEncounter extends HazardEncounter {
    onStart() {
        showModal(coloredName(this.fleet), `You encounter a brutal ${coloredName(this.fleet)}! You must navigate carefully to avoid damage.`, [
            //['View', ()=>closeModal()],
            ['Auto-Navigate', ()=>this.autoNavigateHazard()],
            ['Continue', ()=>this.startCombat(true)],
        ])
    }
}
