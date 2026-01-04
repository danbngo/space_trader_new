/**
 * @class MerchantsEncounter
 * @extends {MercantileEncounter}
 */
class MerchantsEncounter extends MercantileEncounter {
    onStart() {
        const greeting = this.getGreetingDialogue()
        
        if (FameLevel.hasInfamyLevel(gs.captain, this.planet, INFAMY_LEVELS.INFAMOUS)) {
            // Infamous - they flee
            const message = greeting 
                ? `"${greeting}" The ${coloredName(this.fleet)} recognize you and start fleeing immediately!`
                : `The ${coloredName(this.fleet)} have heard of your fearsome deeds and start fleeing immediately!`
            
            showModal(coloredName(this.fleet), message, [
                ['Ignore', ()=>this.endEncounter()],
                ['Attack', ()=>this.showPlayerAttackNeutralsModal()],
            ])
        }
        else if (Math.random() > .5) {
            // Friendly - offer trade
            const offerTrade = this.getOfferTradeDialogue()
            const message = greeting && offerTrade
                ? `"${greeting}" ${offerTrade ? `"${offerTrade}"` : 'The ' + coloredName(this.fleet) + ' eagerly invite you to trade.'}`
                : greeting 
                    ? `"${greeting}" The ${coloredName(this.fleet)} eagerly invite you to trade.`
                    : `The ${coloredName(this.fleet)} eagerly invite you to trade. They claim to have the best prices in the sector!`
            
            showModal(coloredName(this.fleet), message, [
                ['Trade', ()=>showAdHocMarketMenu(this.fleet, ()=>this.endEncounter(), this)],
                ['Ignore', ()=>this.endEncounter()],
                ['Attack', ()=>this.showPlayerAttackNeutralsModal()],
            ])
        }
        else {
            // Neutral - ignore
            const message = greeting 
                ? `"${greeting}" The ${coloredName(this.fleet)} then turn away nervously.`
                : `The ${coloredName(this.fleet)} ignore you nervously.`
            
            showModal(coloredName(this.fleet), message, [
                ['Ignore', ()=>this.endEncounter()],
                ['Attack', ()=>this.showPlayerAttackNeutralsModal()],
            ])
        }
    }

}
