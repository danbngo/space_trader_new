/**
 * @class MagnetoidsStormEncounter
 * @extends {HazardEncounter}
 * @description Dense magnetoid storm with many hazards - dangerous magnetic disturbances in planetary magnetospheres.
 */
class MagnetoidsStormEncounter extends HazardEncounter {
    onStart() {
        if (Math.random() * gs.fleet.totalRadar * (1+gs.fleet.totalSkills.getAmount(SKILLS.Pilot)/50) > this.fleet.totalRadar) {
            showModal(coloredName(this.fleet), `Your long range sensors detect an incoming cluster of ${coloredName(this.fleet)}.<br/>You skillfully steer out of harm's way.<br/>Although, you could choose to plunge back in and mine them if you wish.`, [
                ['View', ()=>closeModal()],
                ['Bypass', ()=>this.endEncounter()],
                ['Mine', ()=>this.startCombat(true)],
            ])
        }
        else {
            showModal(coloredName(this.fleet), `You encounter a brutal ${coloredName(this.fleet)} storm! The magnetic interference is wreaking havoc on your systems.`, [
                ['View', ()=>closeModal()],
                ['Auto-Navigate', ()=>this.autoNavigateHazard()],
                ['Continue', ()=>this.startCombat(true)],
            ])
        }
    }
}
