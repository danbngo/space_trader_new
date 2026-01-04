/**
 * @class DiplomatsEncounter
 * @extends {NeutralsEncounter}
 */
class DiplomatsEncounter extends NeutralsEncounter {
    onStart() {
        const homePlanet = this.fleet.planet
        const greeting = this.getGreetingDialogue()
        const rand = Math.random()
        
        // 50% chance to offer reputation increase
        if (rand < 0.5 && homePlanet) {
            this.offerReputationIncrease(greeting)
            return
        }
        
        // Otherwise, standard diplomat behavior
        const message = greeting 
            ? `"${greeting}" The diplomatic convoy continues on their important mission.`
            : 'A diplomatic convoy passes by, focused on their important mission. They acknowledge your presence with a polite transmission but continue on their way.'
        
        showModal(coloredName(this.fleet), message, [
            ['Ignore', ()=>this.endEncounter()],
            ['Attack', ()=>this.showPlayerAttackFleetModal()],
        ])
    }
    
    offerReputationIncrease(greeting) {
        const homePlanet = this.fleet.planet
        const currentRep = gs.captain.reputation.getAmount(homePlanet)
        const repIncrease = Math.ceil(5 + Math.random() * 10) // 5-15 reputation
        const cost = Math.ceil(repIncrease * 500 * (1 + homePlanet.c.corruption)) // ~2,500-7,500 CR base
        const canAfford = gs.credits >= cost
        
        let message = greeting ? `"${greeting}"<br/><br/>` : ''
        message += `The diplomat from ${coloredName(homePlanet)} offers a proposition:<br/><br/>`
        message += `"For ${cost} CR, I can put in a good word with the leadership back home. `
        message += `Your standing with ${coloredName(homePlanet)} would improve significantly."<br/><br/>`
        message += `Current Reputation: ${currentRep}<br/>`
        message += `After Service: ${currentRep + repIncrease}`
        
        showModal(coloredName(this.fleet), message, [
            ['Accept', ()=>{
                gs.credits -= cost
                const repMsg = gs.captain.grantReputation(homePlanet, repIncrease)
                showModal('Diplomatic Services', 
                    `You transfer ${cost} CR to the diplomat.<br/><br/>` +
                    `"Consider it done. I'll ensure the right people hear about your... cooperation."<br/><br/>` +
                    repMsg,
                    [['Continue', ()=>this.endEncounter()]]
                )
            }, !canAfford],
            ['Decline', ()=>this.endEncounter()],
        ])
    }
    
    offerBountyClearance(greeting) {
        const homePlanet = this.fleet.planet
        const currentBounty = gs.captain.bounty.getAmount(homePlanet)
        
        if (currentBounty <= 0) {
            // No bounty, fall back to standard behavior
            const message = greeting 
                ? `"${greeting}" The diplomatic convoy continues on their way.`
                : 'A diplomatic convoy passes by, focused on their important mission.'
            
            showModal(coloredName(this.fleet), message, [
                ['Ignore', ()=>this.endEncounter()],
                ['Attack', ()=>this.showPlayerAttackFleetModal()],
            ])
            return
        }
        
        const cost = Math.ceil(currentBounty * 1.5 * (1 + homePlanet.c.corruption)) // 1.5x bounty + corruption
        const canAfford = gs.credits >= cost
        
        let message = greeting ? `"${greeting}"<br/><br/>` : ''
        message += `The diplomat from ${coloredName(homePlanet)} notices your... legal troubles:<br/><br/>`
        message += `"I see you have a ${currentBounty} CR bounty on ${coloredName(homePlanet)}. `
        message += `For ${cost} CR, I can make certain records disappear. `
        message += `Clean slate, no questions asked."<br/><br/>`
        message += `Current Bounty: ${currentBounty} CR`
        
        showModal(coloredName(this.fleet), message, [
            ['Accept', ()=>{
                gs.credits -= cost
                const bountyMsg = gs.captain.grantBounty(homePlanet, -currentBounty)
                showModal('Diplomatic Services', 
                    `You transfer ${cost} CR to the diplomat.<br/><br/>` +
                    `"Pleasure doing business. As far as ${coloredName(homePlanet)} is concerned, you're a model citizen."<br/><br/>` +
                    bountyMsg,
                    [['Continue', ()=>this.endEncounter()]]
                )
            }, !canAfford],
            ['Decline', ()=>this.endEncounter()],
        ])
    }
}
