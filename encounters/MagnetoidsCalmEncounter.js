/**
 * @class MagnetoidsCalmEncounter
 * @extends {HazardEncounter}
 * @description Calm magnetoid field with fewer hazards - ideal for peaceful isotope mining.
 */
class MagnetoidsCalmEncounter extends HazardEncounter {
    onStart() {
        if (Math.random() * gs.fleet.totalRadar * (1+gs.fleet.totalSkills.getAmount(SKILLS.Pilot)/50) > this.fleet.totalRadar) {
            showModal(coloredName(this.fleet), `Your long range sensors detect a ${coloredName(this.fleet)} ahead.<br/>You could bypass it, or mine the isotopes if you wish.`, [
                ['View', ()=>closeModal()],
                ['Bypass', ()=>this.endEncounter()],
                ['Mine', ()=>this.startCombat(true)],
            ])
        }
        else {
            showModal(coloredName(this.fleet), `You encounter a ${coloredName(this.fleet)}. The magnetic particles drift slowly through space.`, [
                ['View', ()=>closeModal()],
                ['Auto-Navigate', ()=>this.autoNavigateHazard()],
                ['Auto-Mine', ()=>this.autoMineHazard()],
                ['Continue', ()=>this.startCombat(true)],
            ])
        }
    }
}
