/**
 * @class PilgrimsEncounter
 * @extends {NeutralsEncounter}
 */
class PilgrimsEncounter extends NeutralsEncounter {
    onStart() {
        if (FameLevel.hasInfamyLevel(gs.captain, this.planet, INFAMY_LEVELS.VILIFIED)) {
            showModal(coloredName(this.fleet), `The ${coloredName(this.fleet)} have heard of your fearsome deeds and start fleeing immediately!`, [
                //['View', ()=>closeModal()],
                ['Ignore', ()=>this.endEncounter()],
                ['Attack', ()=>this.showPlayerAttackNeutralsModal()],
            ])
        }
        else {
            const rand = Math.random()
            
            // 33% chance to buy relics (if player has any)
            if (rand < 0.33) {
                this.offerToBuyRelics()
                return
            }
            
            // 33% chance to offer food and water
            if (rand < 0.66) {
                this.offerProvisions()
                return
            }
            
            // 33% chance for standard greetings
            this.showStandardGreeting()
        }
    }
    
    offerToBuyRelics() {
        // Check if player has any relics
        const playerRelics = gs.fleet.cargo.getAmount(CARGO_TYPES.RELICS)
        if (playerRelics === 0) {
            // No relics, try another interaction
            if (Math.random() < 0.5) {
                this.offerProvisions()
            } else {
                this.showStandardGreeting()
            }
            return
        }
        
        // Calculate how many relics they can afford and have space for
        const pilgrimCredits = this.fleet.captain ? this.fleet.captain.credits : 0
        const pilgrimCargoSpace = this.fleet.availableCargoSpace
        
        // Premium price: 150-200% of base value (2000 CR base = 3000-4000 CR per relic)
        const pricePerRelic = Math.floor(CARGO_TYPES.RELICS.value * (1.5 + Math.random() * 0.5))
        const maxAffordable = Math.floor(pilgrimCredits / pricePerRelic)
        const maxCanBuy = Math.min(playerRelics, maxAffordable, pilgrimCargoSpace)
        
        // Don't offer if they can't afford or store any
        if (maxCanBuy === 0) {
            // Fall back to other interactions
            if (Math.random() < 0.5) {
                this.offerProvisions()
            } else {
                this.showStandardGreeting()
            }
            return
        }
        
        const totalPrice = pricePerRelic * maxCanBuy
        
        let message = `The ${coloredName(this.fleet)} hail you with great excitement:<br/><br/>`
        message += `"Greetings, traveler! We sense you carry sacred relics! These artifacts are of immense spiritual significance to our faith. `
        message += `We would be honored to acquire them for our pilgrimage. We can offer ${pricePerRelic} CR per relic - far above typical market rates."<br/><br/>`
        message += `<b>Your Relics:</b> ${playerRelics} units<br/>`
        message += `<b>They can buy:</b> ${maxCanBuy} units<br/>`
        message += `<b>Total Payment:</b> ${totalPrice} CR<br/>`
        message += `<span style="color: #999999">Base Value: ${CARGO_TYPES.RELICS.value} CR/unit</span>`
        
        showModal(coloredName(this.fleet), message, [
            ['Sell', () => {
                // Transfer relics and credits
                gs.fleet.cargo.increment(CARGO_TYPES.RELICS, -maxCanBuy)
                this.fleet.cargo.increment(CARGO_TYPES.RELICS, maxCanBuy)
                gs.credits += totalPrice
                this.fleet.captain.credits -= totalPrice
                
                let resultMessage = `You transfer ${maxCanBuy} sacred relics to the pilgrims.<br/><br/>`
                resultMessage += `The pilgrims handle them with reverence, their eyes filled with joy.<br/><br/>`
                resultMessage += `"These relics will be treasured and protected. You have blessed our journey beyond measure!"<br/><br/>`
                resultMessage += `<span style="color: #ffff66">Received ${totalPrice} CR!</span>`
                
                // Grant reputation with pilgrim's religion based on relic value
                if (this.fleet.planet && this.fleet.planet.civilization && this.fleet.planet.civilization.stateReligion) {
                    const religion = this.fleet.planet.civilization.stateReligion
                    const reputationGain = Math.ceil(totalPrice / 100) // 1 rep per 100 CR value
                    gs.captain.reputation.increment(religion, reputationGain)
                    resultMessage += `<br/><br/><span style="color: #66ff66">+${reputationGain} reputation with ${colorSpan(religion.name, religion.color)}</span>`
                }
                
                showModal('Relics Sold', resultMessage, [
                    ['Continue', () => this.endEncounter()]
                ])
            }],
            ['Keep Them', () => {
                showModal('Offer Declined',
                    `"We understand. Such sacred items should only change hands when the time is right. May they serve you well."`,
                    [['Continue', () => this.endEncounter()]]
                )
            }],
        ])
    }
    
    offerProvisions() {
        // Calculate what pilgrims can offer (20% of their cargo, rounded up)
        const foodAmount = Math.ceil(this.fleet.cargo.getAmount(CARGO_TYPES.FOOD) * 0.2)
        const waterAmount = Math.ceil(this.fleet.cargo.getAmount(CARGO_TYPES.WATER) * 0.2)
        
        // Check if they have anything to offer
        if (foodAmount === 0 && waterAmount === 0) {
            this.showStandardGreeting()
            return
        }
        
        // Check if player has cargo space
        const totalAmount = foodAmount + waterAmount
        const hasSpace = gs.fleet.availableCargoSpace >= totalAmount
        
        let message = `The ${coloredName(this.fleet)} hail you with warmth:<br/><br/>`
        message += `"Greetings, traveler! We are on a sacred pilgrimage, and it is our custom to share our blessings with those we meet. `
        message += `Please, accept these provisions as a gift."<br/><br/>`
        message += `<b>Offering:</b><br/>`
        if (foodAmount > 0) message += `${foodAmount} units of ${CARGO_TYPES.FOOD.symbol} Food<br/>`
        if (waterAmount > 0) message += `${waterAmount} units of ${CARGO_TYPES.WATER.symbol} Water<br/>`
        
        showModal(coloredName(this.fleet), message, [
            ['Accept Gratefully', () => {
                this.fleet.cargo.increment(CARGO_TYPES.FOOD, -foodAmount)
                this.fleet.cargo.increment(CARGO_TYPES.WATER, -waterAmount)
                gs.fleet.cargo.increment(CARGO_TYPES.FOOD, foodAmount)
                gs.fleet.cargo.increment(CARGO_TYPES.WATER, waterAmount)
                
                let resultMessage = `The pilgrims transfer the provisions to your ships with genuine kindness.<br/><br/>`
                resultMessage += `"May these sustain you on your journey. Safe travels, friend."<br/><br/>`
                resultMessage += `<span style="color: #66ff66">Received ${foodAmount > 0 ? foodAmount + ' Food' : ''}${foodAmount > 0 && waterAmount > 0 ? ' and ' : ''}${waterAmount > 0 ? waterAmount + ' Water' : ''}!</span>`
                
                showModal('Provisions Received', resultMessage, [
                    ['Continue', () => this.endEncounter()]
                ])
            }, !hasSpace],
            ['Decline Politely', () => {
                showModal('Offer Declined',
                    `"We understand. May your path be blessed nonetheless."`,
                    [['Continue', () => this.endEncounter()]]
                )
            }],
        ])
    }
    
    askForAlms() {
        const almsAmount = Math.floor(gs.credits * 0.1) // 10% of player's credits
        
        if (almsAmount === 0) {
            this.showStandardGreeting()
            return
        }
        
        let message = `The ${coloredName(this.fleet)} hail you humbly:<br/><br/>`
        message += `"Greetings, traveler. We are on a sacred journey to our holy sites, but our resources grow thin. `
        message += `Would you consider a donation to support our pilgrimage? Any amount would be a blessing."<br/><br/>`
        message += `<span style="color: #999999">Suggested donation: ${almsAmount} CR (10% of your credits)</span>`
        
        showModal(coloredName(this.fleet), message, [
            ['Give Alms', () => {
                gs.credits -= almsAmount
                
                // Grant reputation with the fleet's planet's state religion
                let resultMessage = `You transfer ${almsAmount} CR to the pilgrims.<br/><br/>`
                resultMessage += `"Thank you, generous soul! Your kindness will be remembered in our prayers."<br/><br/>`
                
                // Grant reputation with state religion if available
                if (this.fleet.planet && this.fleet.planet.civilization && this.fleet.planet.civilization.stateReligion) {
                    const religion = this.fleet.planet.civilization.stateReligion
                    const reputationGain = Math.ceil(almsAmount / 100) // 1 rep per 100 CR donated
                    gs.captain.reputation.increment(religion, reputationGain)
                    resultMessage += `<br/><span style="color: #66ff66">+${reputationGain} reputation with ${colorSpan(religion.name, religion.color)}</span>`
                }
                
                showModal('Alms Given', resultMessage, [
                    ['Continue', () => this.endEncounter()]
                ])
            }],
            ['Decline', () => {
                showModal('Offer Declined',
                    `"We understand. Not all are in a position to give. May your journey be blessed."`,
                    [['Continue', () => this.endEncounter()]]
                )
            }],
        ])
    }
    
    showStandardGreeting() {
        const rand = Math.random()
        
        if (rand < 0.33) {
            showModal(coloredName(this.fleet), `The ${coloredName(this.fleet)} greet you with peaceful blessings and continue their journey.`, [
                ['Ignore', ()=>this.endEncounter()],
                ['Attack', ()=>this.showPlayerAttackNeutralsModal()],
            ])
        }
        else if (rand < 0.66) {
            showModal(coloredName(this.fleet), `The ${coloredName(this.fleet)} broadcast prayers and hymns as they journey to their holy destination.`, [
                ['Ignore', ()=>this.endEncounter()],
                ['Attack', ()=>this.showPlayerAttackNeutralsModal()],
            ])
        }
        else {
            showModal(coloredName(this.fleet), `The ${coloredName(this.fleet)} acknowledge you with a respectful nod before continuing their pilgrimage.`, [
                ['Ignore', ()=>this.endEncounter()],
                ['Attack', ()=>this.showPlayerAttackNeutralsModal()],
            ])
        }
    }
}
