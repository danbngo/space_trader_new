/**
 * @class MagnetoidsEncounter
 * @extends {HazardEncounter}
 * @description Legacy magnetoid encounter - moderate danger with magnetic hazards.
 */
class MagnetoidsEncounter extends HazardEncounter {
    onStart() {
        showModal(coloredName(this.fleet), `You encounter ${coloredName(this.fleet)}! Magnetic disturbances affect your ship's systems.`, [
            //['View', ()=>closeModal()],
            ['Auto-Navigate', ()=>this.autoNavigateHazard()],
            ['Continue', ()=>this.startCombat(true)],
        ])
    }
}
