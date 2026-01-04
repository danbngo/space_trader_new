/**
 * @class ScientistsEncounter
 * @extends {NeutralsEncounter}
 */
class ScientistsEncounter extends NeutralsEncounter {
    onStart() {
        const rand = Math.random()
        
        // 25% chance to share anomaly knowledge
        if (rand < 0.25) {
            this.shareAnomalyKnowledge()
            return
        }
        
        // 25% chance to offer ship upgrade
        if (rand < 0.5) {
            this.offerShipUpgrade()
            return
        }
        
        // 50% chance for standard greeting
        this.showGreeting()
    }
    
    shareAnomalyKnowledge() {
        // Get undiscovered anomalies
        const undiscoveredAnomalies = (gs.system.anomalies || []).filter(a => a.discoveredYear === null)
        
        if (undiscoveredAnomalies.length === 0) {
            // No undiscovered anomalies, fall back to greeting
            this.showGreeting()
            return
        }
        
        // Share knowledge of 1-3 random anomalies
        const numToShare = Math.min(rng(3, 1), undiscoveredAnomalies.length)
        const sharedAnomalies = []
        
        for (let i = 0; i < numToShare; i++) {
            const anomaly = rndMember(undiscoveredAnomalies.filter(a => !sharedAnomalies.includes(a)))
            if (anomaly) {
                anomaly.discoveredYear = gs.year
                sharedAnomalies.push(anomaly)
            }
        }
        
        const fleetName = coloredName(this.fleet)
        let message = `The ${fleetName} hail you with excitement:<br/><br/>`
        message += `"Greetings! We've been studying this region and discovered some fascinating anomalies. `
        message += `We'd like to share our findings with you - knowledge should be freely distributed!"<br/><br/>`
        message += `<b>Anomalies Discovered:</b><br/>`
        
        for (const anomaly of sharedAnomalies) {
            message += `• ${anomaly.name} (${anomaly.anomalyType.name})<br/>`
        }
        
        message += `<br/><span style="color: #66ff66">These anomalies now appear on your star map!</span>`
        
        showModal(fleetName, message, [
            ['Thank Them', () => {
                showModal(fleetName, `"Happy to help! Science advances when we work together. Safe travels!"`, [
                    ['Continue', () => this.endEncounter()]
                ])
            }],
            ['Continue', () => this.endEncounter()],
        ])
    }
    
    offerShipUpgrade() {
        // Select a random ship from player's fleet
        if (gs.fleet.ships.length === 0) {
            this.showGreeting()
            return
        }
        
        const ship = rndMember(gs.fleet.ships)
        
        // Calculate fee: 15% of ship value (more expensive than hackers were)
        const fee = Math.ceil(ship.value * 0.15)
        const canAfford = gs.credits >= fee
        
        const fleetName = coloredName(this.fleet)
        let message = `A scientist from the ${fleetName} contacts you:<br/><br/>`
        message += `"We've developed experimental ship enhancement technology. We can apply various upgrades to your ${ship.name}. `
        message += `The modifications are somewhat unpredictable - experimental science, you understand - but generally beneficial. `
        message += `${fee} CR to cover our research costs and materials."<br/><br/>`
        message += `<b>${ship.name}</b> (${ship.shipType.name})<br/>`
        message += `<span style="color: #999999">Value: ${Math.round(ship.value)} CR</span>`
        
        showModal(fleetName, message, [
            ['Accept', () => {
                gs.credits -= fee
                const results = this.upgradeShip(ship)
                
                let resultMessage = `The scientists board your ${ship.name} and conduct a series of precise modifications...<br/><br/>`
                resultMessage += `<b>Upgrades Applied:</b><br/>`
                resultMessage += results.join('<br/>')
                
                showModal('Ship Upgraded', resultMessage, [['Continue', () => this.endEncounter()]])
            }, !canAfford],
            ['Decline', () => this.showGreeting()],
            ['Ignore', () => this.endEncounter()],
        ])
    }
    
    upgradeShip(ship) {
        const results = []
        
        // Modify lasers
        if (Math.random() < 0.9) {
            const change = Math.random() < 0.5 ? 1 : -1
            ship.lasers = Math.max(0, ship.lasers + change)
            results.push(`Lasers: ${change > 0 ? '+' : ''}${change} → ${ship.lasers.toFixed(1)}`)
        } else {
            const change = Math.ceil(ship.lasers * 0.1) * (Math.random() < 0.5 ? 1 : -1)
            ship.lasers = Math.max(0, ship.lasers + change)
            results.push(`Lasers: ${change > 0 ? '+' : ''}${change} → ${ship.lasers.toFixed(1)} ${colorSpan('(!)', change > 0 ? COLORS.Green : COLORS.Red)}`)
        }
        
        // Modify hull[1] (max hull)
        if (Math.random() < 0.9) {
            const change = Math.random() < 0.5 ? 1 : -1
            ship.hull[1] = Math.max(1, ship.hull[1] + change)
            ship.hull[0] = Math.min(ship.hull[0], ship.hull[1]) // Clamp current hull
            results.push(`Max Hull: ${change > 0 ? '+' : ''}${change} → ${ship.hull[1]}`)
        } else {
            const change = Math.ceil(ship.hull[1] * 0.1) * (Math.random() < 0.5 ? 1 : -1)
            ship.hull[1] = Math.max(1, ship.hull[1] + change)
            ship.hull[0] = Math.min(ship.hull[0], ship.hull[1])
            results.push(`Max Hull: ${change > 0 ? '+' : ''}${change} → ${ship.hull[1]} ${colorSpan('(!)', change > 0 ? COLORS.Green : COLORS.Red)}`)
        }
        
        // Modify shields[1] (max shields)
        if (Math.random() < 0.9) {
            const change = Math.random() < 0.5 ? 1 : -1
            ship.shields[1] = Math.max(0, ship.shields[1] + change)
            ship.shields[0] = Math.min(ship.shields[0], ship.shields[1])
            results.push(`Max Shields: ${change > 0 ? '+' : ''}${change} → ${ship.shields[1]}`)
        } else {
            const change = Math.ceil(ship.shields[1] * 0.1) * (Math.random() < 0.5 ? 1 : -1)
            ship.shields[1] = Math.max(0, ship.shields[1] + change)
            ship.shields[0] = Math.min(ship.shields[0], ship.shields[1])
            results.push(`Max Shields: ${change > 0 ? '+' : ''}${change} → ${ship.shields[1]} ${colorSpan('(!)', change > 0 ? COLORS.Green : COLORS.Red)}`)
        }
        
        // Modify engine
        if (Math.random() < 0.9) {
            const change = Math.random() < 0.5 ? 1 : -1
            ship.engine = Math.max(0, ship.engine + change)
            results.push(`Engine: ${change > 0 ? '+' : ''}${change} → ${ship.engine.toFixed(1)}`)
        } else {
            const change = Math.ceil(ship.engine * 0.1) * (Math.random() < 0.5 ? 1 : -1)
            ship.engine = Math.max(0, ship.engine + change)
            results.push(`Engine: ${change > 0 ? '+' : ''}${change} → ${ship.engine.toFixed(1)} ${colorSpan('(!)', change > 0 ? COLORS.Green : COLORS.Red)}`)
        }
        
        // Modify radars
        if (Math.random() < 0.9) {
            const change = Math.random() < 0.5 ? 1 : -1
            ship.radars = Math.max(0, ship.radars + change)
            results.push(`Radars: ${change > 0 ? '+' : ''}${change} → ${ship.radars.toFixed(1)}`)
        } else {
            const change = Math.ceil(ship.radars * 0.1) * (Math.random() < 0.5 ? 1 : -1)
            ship.radars = Math.max(0, ship.radars + change)
            results.push(`Radars: ${change > 0 ? '+' : ''}${change} → ${ship.radars.toFixed(1)} ${colorSpan('(!)', change > 0 ? COLORS.Green : COLORS.Red)}`)
        }
        
        // Modify cargoSpace
        if (Math.random() < 0.9) {
            const change = Math.random() < 0.5 ? 1 : -1
            ship.cargoSpace = Math.max(0, ship.cargoSpace + change)
            results.push(`Cargo Space: ${change > 0 ? '+' : ''}${change} → ${ship.cargoSpace.toFixed(1)}`)
        } else {
            const change = Math.ceil(ship.cargoSpace * 0.1) * (Math.random() < 0.5 ? 1 : -1)
            ship.cargoSpace = Math.max(0, ship.cargoSpace + change)
            results.push(`Cargo Space: ${change > 0 ? '+' : ''}${change} → ${ship.cargoSpace.toFixed(1)} ${colorSpan('(!)', change > 0 ? COLORS.Green : COLORS.Red)}`)
        }
        
        // 5% chance to install random module (even if no slots)
        if (Math.random() < 0.05) {
            const moduleType = rndMember(SHIP_MODULE_TYPES_ALL)
            const quality = rng(1.5, 0.5, false) * (this.planet.c?.technology || 1)
            const module = new ShipModule(moduleType, quality)
            ship.localModules.push(module)
            results.push(`${colorSpan(`BONUS: Installed ${moduleType.name}!`, COLORS.Purple)}`)
        }
        
        return results
    }

    showGreeting() {
        const fleetName = coloredName(this.fleet)
        const greetings = [
            `The ${fleetName} hail you on an open channel. "Greetings traveler! We are on a research expedition. Safe travels!"`,
            `The ${fleetName} broadcast scientific data on all frequencies. "Fascinating readings in this sector. Good day, Captain!"`,
            `The ${fleetName} acknowledge you politely. "Hello! We're conducting surveys here. Please excuse our scanning equipment."`,
            `The ${fleetName} transmit: "Attention unidentified vessel. We are a peaceful scientific mission. Stand by for data exchange if interested."`,
            `The ${fleetName} send a friendly ping. "Research vessel here. We mean no harm. Clear skies, Captain!"`,
        ]
        const greeting = rndMember(greetings)
        
        showModal(fleetName, greeting, [
            //['View', ()=>closeModal()],
            ['Respond Kindly', ()=>{
                showModal(fleetName, `The ${fleetName} seem pleased by your response and continue their work.`, [
                    ['Continue', ()=>this.endEncounter()]
                ])
            }],
            ['Ignore', ()=>this.endEncounter()],
            ['Attack', ()=>this.showPlayerAttackNeutralsModal()],
        ])
    }
}
