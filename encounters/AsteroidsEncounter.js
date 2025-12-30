/**
 * @class AsteroidsEncounter
 * @extends {HazardEncounter}
 */
class AsteroidsEncounter extends HazardEncounter {
    onStart() {
        if (this.luck[0] * gs.fleet.totalRadar * (1+gs.fleet.totalSkills.getAmount(SKILLS.Pilot)/50) > this.fleet.totalRadar) {
            showModal(coloredName(this.fleet), `Your long range sensors detect an incoming cluster of ${coloredName(this.fleet)}.<br/>You skillfully steer out of harm's way.<br/>Although, you could choose to plunge back in and mine them if you wish.`, [
                ['View', ()=>closeModal()],
                ['Bypass', ()=>this.endEncounter()],
                ['Mine', ()=>this.startCombat(true)],
            ])
        }
        else {
            showModal(coloredName(this.fleet), `You encounter a brutal ${coloredName(this.fleet)} storm! You must navigate carefully to avoid damage.`, [
                ['View', ()=>closeModal()],
                ['Auto-Navigate', ()=>this.autoNavigateHazard()],
                ['Continue', ()=>this.startCombat(true)],
            ])
        }
    }

}
