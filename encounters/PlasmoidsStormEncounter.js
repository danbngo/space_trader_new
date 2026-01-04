/**
 * @class PlasmoidsStormEncounter
 * @extends {HazardEncounter}
 * @description Dense plasmoid storm with many hazards - dangerous but rich with plasma isotopes.
 */
class PlasmoidsStormEncounter extends HazardEncounter {
    onStart() {
        for (const ship of this.fleet.ships) {
            ship.engine *= rng(ASTEROID_STORM_SPEED_MULTIPLIER)
        }
        showModal(coloredName(this.fleet), `You encounter a brutal ${coloredName(this.fleet)}! You must navigate carefully to avoid damage.`, [
            //['View', ()=>closeModal()],
            ['Auto-Navigate', ()=>this.autoNavigateHazard()],
            ['Continue', ()=>this.startCombat(true)],
        ])
    }
}
