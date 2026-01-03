/**
 * @class MagnetoidsStormEncounter
 * @extends {HazardEncounter}
 * @description Dense magnetoid storm with many hazards - dangerous magnetic disturbances in planetary magnetospheres.
 */
class MagnetoidsStormEncounter extends HazardEncounter {
    onStart() {
        showModal(coloredName(this.fleet), `You encounter a brutal ${coloredName(this.fleet)}! The magnetic interference is wreaking havoc on your systems.`, [
            //['View', ()=>closeModal()],
            ['Auto-Navigate', ()=>this.autoNavigateHazard()],
            ['Continue', ()=>this.startCombat(true)],
        ])
    }
}
