/**
 * @class MagnetoidsCalmEncounter
 * @extends {HazardEncounter}
 * @description Calm magnetoid field with fewer hazards - ideal for peaceful isotope mining.
 */
class MagnetoidsCalmEncounter extends HazardEncounter {
    onStart() {
        showModal(coloredName(this.fleet), `You encounter a ${coloredName(this.fleet)}. The magnetic particles drift slowly through space.`, [
            //['View', ()=>closeModal()],
            ['Auto-Navigate', ()=>this.autoNavigateHazard()],
            ['Auto-Mine', ()=>this.autoMineHazard()],
            ['Continue', ()=>this.startCombat(true)],
        ])
    }
}
