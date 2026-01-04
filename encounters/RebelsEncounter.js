/**
 * @class RebelsEncounter
 * @extends {NeutralsEncounter}
 */
class RebelsEncounter extends NeutralsEncounter {
    onStart() {
        // Check if player is from the same planet as the rebels
        const playerPlanet = gs.fleet.planet
        const rebelPlanet = this.fleet.planet
        
        if (playerPlanet && rebelPlanet && playerPlanet === rebelPlanet) {
            // Player is from the same planet
            const reputationWithPlanet = gs.captain.reputation.getAmount(playerPlanet)
            
            if (reputationWithPlanet > 0) {
                // Positive reputation with planet - 50% chance to attack
                if (Math.random() < 0.5) {
                    this.attackLoyalist()
                    return
                }
            } else if (reputationWithPlanet < 0) {
                // Negative reputation with planet - greet warmly and 50% chance to give support
                this.supportFellowRebel()
                return
            }
        }
        
        // Otherwise, 50% chance to demand supplies
        if (Math.random() < 0.5) {
            this.demandSupplies()
        } else {
            this.showStandardGreeting()
        }
    }
    
    attackLoyalist() {
        showModal(coloredName(this.fleet), 
            `The ${coloredName(this.fleet)} recognize you as a loyalist to the corrupt regime!<br/><br/>` +
            `"You're part of the problem! Your cooperation with the establishment makes you our enemy!"`, [
            ['Fight', () => this.startCombat(true)],
            ['Try to Explain', () => {
                showModal('No Compromise',
                    `"There's no middle ground in revolution! You're either with us or against us!"`,
                    [['Prepare for Combat', () => this.startCombat(true)]]
                )
            }],
        ])
    }
    
    supportFellowRebel() {
        let message = `The ${coloredName(this.fleet)} recognize you as a fellow enemy of the regime!<br/><br/>`
        message += `"Comrade! It's good to see another who opposes the corrupt establishment. The enemy of our enemy is our friend!"<br/><br/>`
        message += `"Stay strong in the fight. Together we'll bring down the tyrants!"`
        
        showModal(coloredName(this.fleet), message, [
            ['Solidarity', () => this.endEncounter()],
        ])
    }
    
    demandSupplies() {
        // Check what supplies the player has that rebels want
        const supplyTypes = [CARGO_TYPES.FOOD, CARGO_TYPES.WEAPONS, CARGO_TYPES.MEDICINE, CARGO_TYPES.WATER]
        const availableSupplies = supplyTypes.filter(ct => gs.fleet.cargo.getAmount(ct) > 0)
        
        if (availableSupplies.length === 0) {
            this.showStandardGreeting()
            return
        }
        
        // Calculate total supplies to take
        let totalAmount = 0
        const breakdown = []
        for (const cargoType of availableSupplies) {
            const amount = gs.fleet.cargo.getAmount(cargoType)
            totalAmount += amount
            breakdown.push(`${amount} ${cargoType.symbol} ${cargoType.name}`)
        }
        
        let message = `The ${coloredName(this.fleet)} moves to intercept you!<br/><br/>`
        message += `"We need supplies for the revolution. Hand over your cargo: ${breakdown.join(', ')}. `
        message += `This is not a request - the cause demands it!"<br/><br/>`
        message += `<b>Total Cargo Demanded:</b> ${totalAmount} units`
        
        showModal(coloredName(this.fleet), message, [
            ['Hand Over Supplies', () => {
                let resultMessage = `You reluctantly transfer the supplies to the rebels:<br/><br/>`
                
                for (const cargoType of availableSupplies) {
                    const amount = gs.fleet.cargo.getAmount(cargoType)
                    gs.fleet.cargo.increment(cargoType, -amount)
                    this.fleet.cargo.increment(cargoType, amount)
                    resultMessage += `<span style="color: #ff6666">-${amount} ${cargoType.name}</span><br/>`
                }
                
                resultMessage += `<br/>"The revolution thanks you for your... contribution. Move along."`
                
                showModal('Supplies Taken', resultMessage, [
                    ['Continue', () => this.endEncounter()]
                ])
            }],
            ['Refuse', () => {
                showModal('Resistance',
                    `"Then you leave us no choice! We'll take what we need by force!"`,
                    [['Fight', () => this.startCombat(true)]]
                )
            }],
        ])
    }
    
    showStandardGreeting() {
        showModal(coloredName(this.fleet), 
            `A ${coloredName(this.fleet)} emerges from the shadows. Their commander hails you:<br/><br/>` +
            `"We're not interested in civilian ships right now. We have bigger targets." They disengage and continue on their mission.`, [
            ['Continue', ()=>this.endEncounter()],
        ])
    }
}
