/**
 * @class RefugeesEncounter
 * @extends {NeutralsEncounter}
 */
class RefugeesEncounter extends NeutralsEncounter {
    onStart() {
        // 50% chance to ask for supplies
        if (Math.random() < 0.5) {
            this.askForSupplies()
        } else {
            this.showStandardGreeting()
        }
    }
    
    askForSupplies() {
        // Check what supplies the player has that refugees need
        const supplyTypes = [CARGO_TYPES.FOOD, CARGO_TYPES.WATER, CARGO_TYPES.MEDICINE]
        const availableSupplies = supplyTypes.filter(ct => gs.fleet.cargo.getAmount(ct) > 0)
        
        if (availableSupplies.length === 0) {
            this.showStandardGreeting()
            return
        }
        
        // Calculate total supplies and value
        let totalAmount = 0
        let totalValue = 0
        const breakdown = []
        for (const cargoType of availableSupplies) {
            const amount = gs.fleet.cargo.getAmount(cargoType)
            totalAmount += amount
            totalValue += amount * cargoType.value
            breakdown.push(`${amount} ${cargoType.symbol} ${cargoType.name}`)
        }
        
        let message = `A desperate fleet of ${coloredName(this.fleet)} hails you with a plea:<br/><br/>`
        message += `"Please, we're fleeing from disaster. Our people are starving and sick. We have nothing to offer, but we desperately need: ${breakdown.join(', ')}. `
        message += `Any help you can provide would save lives."<br/><br/>`
        message += `<b>Total Supplies Requested:</b> ${totalAmount} units<br/>`
        message += `<b>Total Value:</b> ${totalValue} CR`
        
        showModal(coloredName(this.fleet), message, [
            ['Give All Supplies', () => {
                let resultMessage = `You transfer all the requested supplies to the desperate refugees:<br/><br/>`
                
                for (const cargoType of availableSupplies) {
                    const amount = gs.fleet.cargo.getAmount(cargoType)
                    gs.fleet.cargo.increment(cargoType, -amount)
                    this.fleet.cargo.increment(cargoType, amount)
                    resultMessage += `<span style="color: #66ff66">Donated ${amount} ${cargoType.name}</span><br/>`
                }
                
                resultMessage += `<br/>Tears stream down the faces of the refugees as they receive the supplies.<br/><br/>`
                resultMessage += `"Thank you! You've saved so many lives today. We'll never forget this kindness!"`
                
                // Grant reputation with fleet's planet proportional to value given
                if (this.fleet.planet) {
                    const reputationGain = Math.ceil(totalValue / 50) // 1 rep per 50 CR of supplies
                    gs.captain.reputation.increment(this.fleet.planet, reputationGain)
                    resultMessage += `<br/><br/><span style="color: #66ff66">+${reputationGain} reputation with ${colorSpan(this.fleet.planet.name, this.fleet.planet.color)}</span>`
                }
                
                showModal('Supplies Donated', resultMessage, [
                    ['Continue', () => this.endEncounter()]
                ])
            }],
            ['Refuse', () => {
                showModal('Aid Refused',
                    `The refugees look devastated but understanding.<br/><br/>` +
                    `"We... we understand. Not everyone can help. We'll try to make do with what we have."<br/><br/>` +
                    `They continue their desperate journey.`,
                    [['Continue', () => this.endEncounter()]]
                )
            }],
        ])
    }
    
    showStandardGreeting() {
        showModal(coloredName(this.fleet), 
            `A desperate fleet of ${coloredName(this.fleet)} drifts past. Their ships are crowded and showing signs of wear. ` +
            `They barely have the resources to continue their journey, let alone interact with you.`, [
            ['Continue', ()=>this.endEncounter()],
        ])
    }
}
