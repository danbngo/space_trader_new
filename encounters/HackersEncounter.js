/**
 * @class HackersEncounter
 * @extends {FleetEncounter}
 */
class HackersEncounter extends FleetEncounter {
    onStart() {
        const greeting = this.getGreetingDialogue()
        const rand = Math.random()
        
        // 33% chance to siphon credits (hostile action)
        if (rand < 0.33) {
            this.siphonCredits(greeting)
            return
        }
        
        // 33% chance to offer ship upgrade
        if (rand < 0.66) {
            this.offerShipUpgrade(greeting)
            return
        }
        
        // 33% chance to offer cyber implant
        this.offerCyberImplant(greeting)
    }
    
    siphonCredits(greeting) {
        // Calculate amount to steal (up to 50% of player credits)
        const maxSteal = Math.floor(gs.credits * 0.5)
        const stolenAmount = Math.floor(maxSteal * (0.5 + Math.random() * 0.5)) // 25-50% of total
        
        if (stolenAmount <= 0) {
            // Player has no money, fall back to standard behavior
            this.showStandardHackerGreeting(greeting)
            return
        }
        
        let message = greeting ? `"${greeting}"<br/><br/>` : ''
        message += `Before you can react, the ${coloredName(this.fleet)} executes a lightning-fast digital intrusion!<br/><br/>`
        message += `"Too easy. Your credits are ours now. Come and take them back... if you dare."<br/><br/>`
        message += `<span style="color: #ff6666">They've siphoned ${stolenAmount} CR from your accounts!</span>`
        
        // Transfer credits to their fleet captain (will be recovered if player defeats them)
        gs.credits -= stolenAmount
        this.fleet.captain.credits += stolenAmount
        
        showModal(coloredName(this.fleet), message, [
            ['Attack!', () => this.startCombat(true)],
            ['Let them go', () => {
                showModal('Credits Lost',
                    `You watch helplessly as the ${coloredName(this.fleet)} disappears into the void with your credits.<br/><br/>` +
                    `<span style="color: #ff6666">Lost ${stolenAmount} CR</span>`,
                    [['Continue', () => this.endEncounter()]]
                )
            }],
        ])
    }
    
    offerShipUpgrade(greeting) {
        // Select a random ship from player's fleet
        if (gs.fleet.ships.length === 0) {
            this.showStandardHackerGreeting(greeting)
            return
        }
        
        const ship = rndMember(gs.fleet.ships)
        
        // Calculate fee: 10% of ship value (cheaper than scientists)
        const fee = Math.ceil(ship.value * 0.1)
        const canAfford = gs.credits >= fee
        
        let message = greeting ? `"${greeting}"<br/><br/>` : ''
        message += `A hacker from the ${coloredName(this.fleet)} opens a secure channel:<br/><br/>`
        message += `"We can upgrade your ${ship.name}. Hardware mods, firmware exploits, system overclocking - the works. `
        message += `Can't guarantee exactly what you'll get - our methods are... creative. But it'll be different. ${fee} CR."<br/><br/>`
        message += `<b>${ship.name}</b> (${ship.shipType.name})<br/>`
        message += `<span style="color: #999999">Value: ${Math.round(ship.value)} CR</span>`
        
        showModal(coloredName(this.fleet), message, [
            ['Accept', () => {
                gs.credits -= fee
                const results = this.upgradeShip(ship)
                
                let resultMessage = `The hackers board your ${ship.name} and get to work. Sparks fly, systems flicker...<br/><br/>`
                resultMessage += `<b>Upgrades Applied:</b><br/>`
                resultMessage += results.join('<br/>')
                
                showModal('Ship Upgraded', resultMessage, [['Continue', () => this.endEncounter()]])
            }, !canAfford],
            ['Decline', () => this.showStandardHackerGreeting(greeting)],
            ['Attack', () => this.showPlayerAttackFleetModal()],
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
    
    offerFleetRepair(greeting) {
        // Calculate total damage across fleet
        const totalMaxHull = gs.fleet.ships.reduce((sum, ship) => sum + ship.hull[1], 0)
        const totalCurrentHull = gs.fleet.ships.reduce((sum, ship) => sum + ship.hull[0], 0)
        const totalDamage = totalMaxHull - totalCurrentHull
        
        if (totalDamage <= 0) {
            // No damage, fall back to standard greeting
            this.showStandardHackerGreeting(greeting)
            return
        }
        
        // Price is based on damage amount, cheaper than typical repair costs
        // Base repair cost is ~100 CR per hull point, hackers charge 60 CR per hull point
        const price = Math.floor(totalDamage * 60 * (1 + this.planet.c.corruption / 4))
        const canAfford = gs.credits >= price
        
        let message = greeting ? `"${greeting}"<br/><br/>` : ''
        message += `The hacker scans your fleet:<br/><br/>`
        message += `"Your ships are beat up. We've got nanite repair tech - black market stuff, but it works. `
        message += `${price} CR and we'll fix up your whole fleet. No paperwork, no waiting."<br/><br/>`
        message += `<b>Fleet Status:</b><br/>`
        message += `Total Hull Damage: ${totalDamage}<br/>`
        message += `<span style="color: #999999">Standard Repair: ~${Math.floor(totalDamage * 100)} CR</span>`
        
        showModal(coloredName(this.fleet), message, [
            ['Accept', () => {
                gs.credits -= price
                // Repair all ships to full
                for (const ship of gs.fleet.ships) {
                    ship.repairHull(ship.hull[1])
                }
                showModal('Fleet Repaired',
                    `You transfer ${price} CR.<br/><br/>` +
                    `The hackers deploy sophisticated repair nanites. Within minutes, your ships' hull integrity is fully restored.<br/><br/>` +
                    `"Pleasure doing business. Our tech leaves no trace - just how we like it."<br/><br/>` +
                    `<span style="color: #66ff66">All ships repaired to full hull!</span>`,
                    [['Continue', () => this.endEncounter()]]
                )
            }, !canAfford],
            ['Decline', () => this.showStandardHackerGreeting(greeting)],
            ['Attack', () => this.showPlayerAttackFleetModal()],
        ])
    }
    
    offerCyberImplant(greeting) {
        // Don't preview the implant - player must accept blindly
        const price = rng(3000, 1000) // Random price 1000-3000 CR
        const canAfford = gs.credits >= price
        
        let message = greeting ? `"${greeting}"<br/><br/>` : ''
        message += `A hacker offers you an unmarked container:<br/><br/>`
        message += `"High-end cyberware, fresh off the black market. Don't ask what it is - that's part of the deal. `
        message += `${price} CR and it's yours. No refunds, no returns."<br/><br/>`
        message += `<span style="color: #ff9999">⚠️ The implant will be randomly selected!</span>`
        
        showModal(coloredName(this.fleet), message, [
            ['Buy', () => {
                gs.credits -= price
                
                // Generate random implant now
                const implant = generateCyberImplant(this.planet)
                
                // Add to fleet cyberModules
                gs.fleet.cyberModules.push(implant)
                
                showModal('Implant Acquired',
                    `You transfer ${price} CR through untraceable channels.<br/><br/>` +
                    `The hacker tosses you the unmarked container. Inside you find:<br/><br/>` +
                    `<b>${implant.implantType.name}</b> (Quality: ${implant.quality.toFixed(2)})<br/>` +
                    `${implant.implantType.description}<br/><br/>` +
                    `"Good luck. Serial numbers are already scrubbed. It's in your fleet's inventory now."`,
                    [['Continue', () => this.endEncounter()]]
                )
            }, !canAfford],
            ['Decline', () => this.showStandardHackerGreeting(greeting)],
            ['Attack', () => this.showPlayerAttackFleetModal()],
        ])
    }
    
    showStandardHackerGreeting(greeting) {
        const message = greeting 
            ? `"${greeting}" The hackers maintain their distance, clearly wary.`
            : `A ${coloredName(this.fleet)} fleet watches you from a safe distance. Their ships' signatures are heavily encrypted.`
        
        showModal(coloredName(this.fleet), message, [
            ['Ignore', () => this.endEncounter()],
            ['Attack', () => this.showPlayerAttackFleetModal()],
        ])
    }

    onVictory() {
        super.onVictory()
        // Defeating hackers gives small reputation boost (they respect skill)
        const reputationChange = Math.ceil(ENCOUNTER_BASE_REPUTATION_EFFECT_ON_VICTORY * FACTION_TYPES.HACKERS.reputationMultiplier)
        if (reputationChange) {
            gs.captain.grantReputation(FACTION_TYPES.HACKERS, reputationChange)
        }
    }
}
