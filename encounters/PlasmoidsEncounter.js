/**
 * @class PlasmoidsEncounter
 * @extends {HazardEncounter}
 */
class PlasmoidsEncounter extends HazardEncounter {
    onStart() {
        showModal(coloredName(this.fleet), `You encounter a brutal ${coloredName(this.fleet)}! You must navigate carefully to avoid damage.`, [
            //['View', ()=>closeModal()],
            ['Auto-Navigate', ()=>this.autoNavigateHazard()],
            ['Continue', ()=>this.startCombat(true)],
        ])
    }
}
