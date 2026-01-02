/**
 * @class BountyHuntersEncounter
 * @extends {AuthoritiesEncounter}
 */
class BountyHuntersEncounter extends AuthoritiesEncounter {
    onStart() {
        if (Math.random() * gs.fleet.totalRadar * (1+gs.fleet.totalSkills.getAmount(SKILLS.Stealth)/50) > this.fleet.totalRadar) {
            showModal(coloredName(this.fleet), 'Your long range sensors detect a bounty hunters fleet before they detect you.<br/>You manage to approach them stealthily.', [
                //['View', ()=>closeModal()],
                ['Bypass', ()=>this.endEncounter()],
                ['Hail', ()=>{
                    this.onStart()
                }],
                ['Sneak Attack', ()=>this.showPlayerAttackFleetModal(-2, 1, false)],
            ])
        }
        else if (Math.random() * gs.captain.calcBountyForPlanet(this.planet) > 100) {
            showModal(coloredName(this.fleet), `The ${coloredName(this.fleet)} have heard of you and the active bounty on your head.<br/>They coldly inform you that they're here to collect one way or another.`, [
                //['View', ()=>closeModal()],
                ['Surrender', ()=>this.onSurrender()],
                ['Resist', ()=>this.showPlayerRefuseSurrenderModal(-2, 1)],
            ])
        }
        else {
            showModal(coloredName(this.fleet), `The ${coloredName(this.fleet)} glide past your fleet in eerie silence.`, [
                //['View', ()=>closeModal()],
                ['Ignore', ()=>this.endEncounter()],
                ['Attack', ()=>this.showPlayerAttackFleetModal(-2, 1, false)],
            ])
        }
    }
}
