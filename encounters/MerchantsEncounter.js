/**
 * @class MerchantsEncounter
 * @extends {MercantileEncounter}
 */
class MerchantsEncounter extends MercantileEncounter {
    onStart() {
        if (this.luck[0] * gs.fleet.totalRadar * (1+gs.fleet.totalSkills.getAmount(SKILLS.Stealth)/50) > this.fleet.totalRadar) {
            showModal(coloredName(this.fleet), 'Your long range sensors detect a merchant fleet before they detect you.<br/>You manage to approach them stealthily.', [
                ['View', ()=>closeModal()],
                ['Bypass', ()=>this.endEncounter()],
                ['Hail', ()=>{
                    this.luck[0] = 0
                    this.onStart()
                }],
                ['Sneak Attack', ()=>this.showPlayerAttackFleetModal(-1, 1, false, true)],
            ])
        }
        else if (this.luck[1] * gs.captain.calcInfamyForPlanet(this.planet) > 100) {
            showModal(coloredName(this.fleet), `The ${coloredName(this.fleet)} have heard of your fearsome deeds and start fleeing immediately!`, [
                ['View', ()=>closeModal()],
                ['Ignore', ()=>this.endEncounter()],
                ['Attack', ()=>this.showPlayerAttackFleetModal(-1, 1, false, true)],
            ])
        }
        else if (this.luck[2] > .5) {
            showModal(coloredName(this.fleet), `The ${coloredName(this.fleet)} eagerly invite you to trade. They claim to have the best prices in the sector!`, [
                ['View', ()=>closeModal()],
                ['Trade', ()=>this.showTradeOfferModal()],
                ['Ignore', ()=>this.endEncounter()],
                ['Attack', ()=>this.showPlayerAttackFleetModal(-1, 1, false, true)],
            ])
        }
        else {
            showModal(coloredName(this.fleet), `The ${coloredName(this.fleet)} ignore you nervously.`, [
                ['View', ()=>closeModal()],
                ['Ignore', ()=>this.endEncounter()],
                ['Attack', ()=>this.showPlayerAttackFleetModal(-1, 1, false, true)],
            ])
        }
    }

}
