/**
 * @class BountyHuntersEncounter
 * @extends {AuthoritiesEncounter}
 */
class BountyHuntersEncounter extends AuthoritiesEncounter {
    onStart() {
        if (Math.random() * gs.captain.calcBountyForPlanet(this.planet) > 100) {
            showModal(coloredName(this.fleet), `The ${coloredName(this.fleet)} have heard of you and the active bounty on your head.<br/>They coldly inform you that they're here to collect one way or another.`, [
                //['View', ()=>closeModal()],
                ['Surrender', ()=>this.onSurrender()],
                ['Resist', ()=>this.showPlayerRefuseSurrenderModal()],
            ])
        }
        else {
            showModal(coloredName(this.fleet), `The ${coloredName(this.fleet)} glide past your fleet in eerie silence.`, [
                //['View', ()=>closeModal()],
                ['Ignore', ()=>this.endEncounter()],
                ['Attack', ()=>this.showPlayerAttackModal()],
            ])
        }
    }
}
