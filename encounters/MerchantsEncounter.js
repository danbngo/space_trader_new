/**
 * @class MerchantsEncounter
 * @extends {MercantileEncounter}
 */
class MerchantsEncounter extends MercantileEncounter {
    onStart() {
        if (FameLevel.hasInfamyLevel(gs.captain, this.planet, INFAMY_LEVELS.INFAMOUS)) {
            showModal(coloredName(this.fleet), `The ${coloredName(this.fleet)} have heard of your fearsome deeds and start fleeing immediately!`, [
                //['View', ()=>closeModal()],
                ['Ignore', ()=>this.endEncounter()],
                ['Attack', ()=>this.showPlayerAttackNeutralsModal()],
            ])
        }
        else if (Math.random() > .5) {
            showModal(coloredName(this.fleet), `The ${coloredName(this.fleet)} eagerly invite you to trade. They claim to have the best prices in the sector!`, [
                //['View', ()=>closeModal()],
                ['Trade', ()=>showAdHocMarketMenu(this.fleet, ()=>this.endEncounter())],
                ['Ignore', ()=>this.endEncounter()],
                ['Attack', ()=>this.showPlayerAttackNeutralsModal()],
            ])
        }
        else {
            showModal(coloredName(this.fleet), `The ${coloredName(this.fleet)} ignore you nervously.`, [
                //['View', ()=>closeModal()],
                ['Ignore', ()=>this.endEncounter()],
                ['Attack', ()=>this.showPlayerAttackNeutralsModal()],
            ])
        }
    }

}
