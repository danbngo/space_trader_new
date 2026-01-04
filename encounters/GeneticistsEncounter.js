/**
 * @class GeneticistsEncounter
 * @extends {FleetEncounter}
 */
class GeneticistsEncounter extends FleetEncounter {
    onStart() {
        const greeting = this.getGreetingDialogue()
        const rand = Math.random()
        
        // 50% chance to offer genetic modification
        if (rand < 0.5) {
            this.offerGeneticModification(greeting)
            return
        }
        
        // 50% chance to offer medical supplies (medicine)
        this.offerMedicalSupplies(greeting)
    }
    
    offerGeneticModification(greeting) {
        // Check if player has any officers
        if (gs.fleet.officers.length === 0) {
            this.showStandardGeneticistGreeting(greeting)
            return
        }
        
        // Don't preview the modification or recipient - player must accept blindly
        const price = rng(3000, 1500) // Random price 1500-3000 CR
        const canAfford = gs.credits >= price
        
        let message = greeting ? `"${greeting}"<br/><br/>` : ''
        message += `A geneticist from the ${coloredName(this.fleet)} offers their services:<br/><br/>`
        message += `"We specialize in cutting-edge gene therapy. One of your crew will receive a genetic enhancement - ${price} CR. `
        message += `Mobile facilities, no regulations, no questions. The procedure is... experimental, but the results are usually beneficial."<br/><br/>`
        message += `<span style="color: #ff9999">⚠️ A random crew member will receive a random genetic modification!</span>`
        
        showModal(coloredName(this.fleet), message, [
            ['Accept', () => {
                gs.credits -= price
                
                // Select random officer
                const recipient = rndMember(gs.fleet.officers)
                
                // Generate random modification
                const modification = generateGeneticModification(this.planet)
                
                // Check if officer already has this modification
                const alreadyHas = recipient.geneticModifications.some(m => m.modificationType === modification.modificationType)
                
                if (alreadyHas) {
                    showModal('Procedure Failed',
                        `The geneticists begin the procedure on ${recipient.name}...<br/><br/>` +
                        `"Hmm, genetic markers indicate they already have this modification. The procedure would be redundant. Here's your refund."<br/><br/>` +
                        `<span style="color: #ffff66">Refund: ${price} CR</span>`,
                        [['Continue', () => {
                            gs.credits += price // Refund
                            this.endEncounter()
                        }]]
                    )
                } else {
                    // Apply modification to officer
                    recipient.geneticModifications.push(modification)
                    
                    showModal('Modification Complete',
                        `The geneticists sedate ${recipient.name} and begin their work...<br/><br/>` +
                        `Hours later, the procedure is complete.<br/><br/>` +
                        `<b>Recipient:</b> ${recipient.name}<br/>` +
                        `<b>Modification:</b> ${modification.modificationType.name} (Quality: ${modification.quality.toFixed(2)})<br/>` +
                        `${modification.modificationType.description}<br/><br/>` +
                        `"The modifications are stable. They should notice the effects immediately."`,
                        [['Continue', () => this.endEncounter()]]
                    )
                }
            }, !canAfford],
            ['Decline', () => this.showStandardGeneticistGreeting(greeting)],
            ['Attack', () => this.showPlayerAttackFleetModal()],
        ])
    }
    
    offerCrewHealing(greeting) {
        // Officers don't have health stats in this game, fall back to standard greeting
        this.showStandardGeneticistGreeting(greeting)
    }
    
    offerMedicalSupplies(greeting) {
        // Offer drugs at a good price
        const amount = Math.floor(5 + Math.random() * 15) // 5-20 units
        const basePrice = CARGO_TYPES.DRUGS.value * amount
        const price = Math.floor(basePrice * 0.7) // 30% discount
        const canAfford = gs.credits >= price
        const hasCargoSpace = gs.fleet.availableCargoSpace >= amount
        
        let message = greeting ? `"${greeting}"<br/><br/>` : ''
        message += `A geneticist offers medical supplies:<br/><br/>`
        message += `"We produce high-quality pharmaceuticals for our work. I can spare ${amount} units of medical drugs for ${price} CR. `
        message += `Premium quality, well below market rates."<br/><br/>`
        message += `<b>${amount} ${CARGO_TYPES.DRUGS.name}</b><br/>`
        message += `<span style="color: #999999">Market Value: ~${basePrice} CR</span>`
        
        showModal(coloredName(this.fleet), message, [
            ['Buy', () => {
                gs.credits -= price
                gs.fleet.cargo.increment(CARGO_TYPES.DRUGS, amount)
                showModal('Supplies Acquired',
                    `You transfer ${price} CR.<br/><br/>` +
                    `"These pharmaceuticals are of the highest quality. Handle them carefully."<br/><br/>` +
                    `<span style="color: #66ff66">Acquired ${amount} units of ${CARGO_TYPES.DRUGS.name}!</span>`,
                    [['Continue', () => this.endEncounter()]]
                )
            }, !canAfford || !hasCargoSpace],
            ['Decline', () => this.showStandardGeneticistGreeting(greeting)],
            ['Attack', () => this.showPlayerAttackFleetModal()],
        ])
    }
    
    showStandardGeneticistGreeting(greeting) {
        const message = greeting 
            ? `"${greeting}" The geneticists continue their research mission.`
            : `A ${coloredName(this.fleet)} research fleet passes nearby. Their medical ships broadcast standard health and safety protocols.`
        
        showModal(coloredName(this.fleet), message, [
            ['Ignore', () => this.endEncounter()],
            ['Attack', () => this.showPlayerAttackFleetModal()],
        ])
    }

    onVictory() {
        super.onVictory()
        // Defeating geneticists gives small reputation boost
        const reputationChange = Math.ceil(ENCOUNTER_BASE_REPUTATION_EFFECT_ON_VICTORY * FACTION_TYPES.GENETICISTS.reputationMultiplier)
        if (reputationChange) {
            gs.captain.grantReputation(FACTION_TYPES.GENETICISTS, reputationChange)
        }
    }
}
