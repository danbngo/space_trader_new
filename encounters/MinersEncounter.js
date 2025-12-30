/**
 * @class MinersEncounter
 * @extends {NeutralsEncounter}
 */
class MinersEncounter extends NeutralsEncounter {
    onStart() {
        if (this.luck[0] * gs.fleet.totalRadar * (1+gs.fleet.totalSkills.getAmount(SKILLS.Stealth)/50) > this.fleet.totalRadar) {
            showModal(coloredName(this.fleet), 'Your long range sensors detect a mining fleet before they detect you.<br/>You manage to approach them stealthily.', [
                ['View', ()=>closeModal()],
                ['Bypass', ()=>this.endEncounter()],
                ['Hail', ()=>{
                    this.luck[0] = 0
                    this.onStart()
                }],
                ['Sneak Attack', ()=>this.showPlayerAttackFleetModal(-1, 1, false, true)],
            ])
        }
        else if (this.luck[1] * gs.captain.calcInfamyForPlanet(this.planet) > 200) {
            showModal(coloredName(this.fleet), 'The miners have heard of your fearsome deeds and start fleeing immediately!', [
                ['View', ()=>closeModal()],
                ['Ignore', ()=>this.endEncounter()],
                ['Attack', ()=>this.showPlayerAttackFleetModal(-1, 1, false, true)],
            ])
        }
        else {
            showModal(coloredName(this.fleet), 'The miners transmit a surly, perfunctory greeting, but otherwise ignore you.', [
                ['View', ()=>closeModal()],
                ['Ignore', ()=>this.endEncounter()],
                ['Attack', ()=>this.showPlayerAttackFleetModal(-1, 1, false, true)],
            ])
        }
    }
}
