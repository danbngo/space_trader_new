/**
 * @class MagnetoidsEncounter
 * @extends {HazardEncounter}
 * @description Legacy magnetoid encounter - moderate danger with magnetic hazards.
 */
class MagnetoidsEncounter extends HazardEncounter {
    onStart() {
        if (Math.random() * gs.fleet.totalRadar * (1+gs.fleet.totalSkills.getAmount(SKILLS.Pilot)/50) > this.fleet.totalRadar) {
            showModal(coloredName(this.fleet), `Your long range sensors detect ${coloredName(this.fleet)} ahead.<br/>You could bypass them, or mine them if you wish.`, [
                ['View', ()=>closeModal()],
                ['Bypass', ()=>this.endEncounter()],
                ['Mine', ()=>this.startCombat(true)],
            ])
        }
        else {
            showModal(coloredName(this.fleet), `You encounter ${coloredName(this.fleet)}! Magnetic disturbances affect your ship's systems.`, [
                ['View', ()=>closeModal()],
                ['Auto-Navigate', ()=>this.autoNavigateHazard()],
                ['Continue', ()=>this.startCombat(true)],
            ])
        }
    }
}
