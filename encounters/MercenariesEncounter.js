/**
 * @class MercenariesEncounter
 * @extends {FleetEncounter}
 */
class MercenariesEncounter extends FleetEncounter {
    onStart() {
        // Check player's origin planet
        const originPlanet = gs.fleet.planet
        if (!originPlanet) {
            // No origin planet, treat as neutral
            this.showNeutralMercenaries()
            return
        }
        
        // Check relationship between player's origin and mercenary's planet
        const relationship = this.planet.c?.relationships?.get(originPlanet)
        
        // 75% chance to attack if at war
        if (relationship === RELATIONSHIP_TYPES.WAR && Math.random() < 0.75) {
            showModal(coloredName(this.fleet), 
                `A ${coloredName(this.fleet)} fleet hired by ${coloredName(this.planet)} spots you!<br/>` +
                `"${coloredName(originPlanet)} scum! Our contract is clear - your head has a price on it!"`, [
                ['Fight', () => this.startCombat(true)],
                ['Surrender', () => this.onSurrender()],
            ])
            return
        }
        
        // 50% chance to attack if tense
        if (relationship === RELATIONSHIP_TYPES.TENSE && Math.random() < 0.5) {
            showModal(coloredName(this.fleet), 
                `A ${coloredName(this.fleet)} fleet contracted by ${coloredName(this.planet)} intercepts you!<br/>` +
                `"We've been authorized to deal with ${coloredName(originPlanet)} ships in this sector. Stand down!"`, [
                ['Fight', () => this.startCombat(true)],
                ['Try to Talk', () => this.showNeutralMercenaries()],
            ])
            return
        }
        
        // Otherwise neutral
        this.showNeutralMercenaries()
    }
    
    showNeutralMercenaries() {
        const greeting = this.getGreetingDialogue()
        const rand = Math.random()
        
        // 50% chance to offer hiring an officer
        if (rand < 0.5) {
            this.offerOfficerForHire(greeting)
            return
        }
        
        // Otherwise standard neutral behavior
        const message = greeting 
            ? `A ${coloredName(this.fleet)} fleet hails you.<br/>"${greeting}"`
            : `A ${coloredName(this.fleet)} fleet hails you over comms.<br/>"We're hired guns, not trouble seekers. Keep your distance and we'll keep ours."`
        
        showModal(coloredName(this.fleet), message, [
            ['Ignore', () => this.endEncounter()],
            ['Attack', () => this.showPlayerAttackFleetModal()],
        ])
    }
    
    offerOfficerForHire(greeting) {
        // Generate a mercenary officer
        const officer = generateOfficer(this.planet, FACTION_TYPES.MERCENARIES)
        
        // Price is 70% of guild price (better deal)
        const basePrice = Math.round(officer.value * (1 + this.planet.c.corruption) * this.planet.c.inflation / this.planet.c.army)
        const price = Math.round(basePrice * 0.7)
        const canAfford = gs.credits >= price
        const canHire = gs.fleet.officers.length < gs.captain.maxSubordinates
        
        let message = greeting ? `"${greeting}"<br/><br/>` : ''
        message += `A mercenary from the ${coloredName(this.fleet)} steps forward:<br/><br/>`
        message += `"Looking for experienced muscle? I'm available for hire. ${price} CR and I'm yours."<br/><br/>`
        message += `<b>${officer.name}</b> - Level ${officer.level}<br/>`
        message += `<b>Skills:</b> ${SKILLS_ALL.map(sk => `${sk.symbol}${officer.skills.getAmount(sk)}`).join(' ')}<br/>`
        message += `<b>CR Share:</b> ${Math.round(officer.crShare * 100)}%`
        
        showModal(coloredName(this.fleet), message, [
            ['Hire', () => {
                gs.credits -= price
                gs.fleet.addOfficer(officer)
                showModal('Officer Hired',
                    `You transfer ${price} CR.<br/><br/>` +
                    `"Good. I'll follow your orders... as long as the credits keep flowing."<br/><br/>` +
                    `${officer.name} has joined your crew!`,
                    [['Continue', () => this.endEncounter()]]
                )
            }, !canAfford || !canHire],
            ['Decline', () => this.endEncounter()],
        ])
    }
    
    offerShipForSale(greeting) {
        // Generate a mercenary ship (weighted toward combat ships)
        const shipType = Math.random() < 0.7 
            ? rndMember([SHIP_TYPES.FIGHTER, SHIP_TYPES.CORVETTE, SHIP_TYPES.FRIGATE, SHIP_TYPES.DESTROYER])
            : rndMember(SHIP_TYPES_ALL)
        const ship = generateShip(this.planet, shipType)
        
        // Price is 75% of shipyard price (better deal)
        const basePrice = Math.round(ship.value * (1 + this.planet.c.corruption/4) * (1 + this.planet.c.inflation/4) * (1 + this.planet.c.taxes/4) / this.planet.c.navy)
        const price = Math.round(basePrice * 0.75)
        const canAfford = gs.credits >= price
        
        let message = greeting ? `"${greeting}"<br/><br/>` : ''
        message += `The mercenary captain gestures to one of their ships:<br/><br/>`
        message += `"Got a surplus ship here. Battle-tested but still solid. ${price} CR and it's yours - no questions asked."<br/><br/>`
        message += `<b>${ship.shipType.name}</b><br/>`
        message += `<b>Hull:</b> ${ship.hull[1]} | <b>Shields:</b> ${ship.shields[1]} | <b>Lasers:</b> ${ship.lasers}<br/>`
        message += `<b>Engine:</b> ${ship.engine} | <b>Cargo:</b> ${ship.cargoSpace}`
        
        showModal(coloredName(this.fleet), message, [
            ['Buy', () => {
                gs.credits -= price
                gs.fleet.addShip(ship)
                showModal('Ship Purchased',
                    `You transfer ${price} CR.<br/><br/>` +
                    `"Pleasure doing business. She'll serve you well in a fight."<br/><br/>` +
                    `${ship.shipType.name} added to your fleet!`,
                    [['Continue', () => this.endEncounter()]]
                )
            }, !canAfford],
            ['Decline', () => this.endEncounter()],
        ])
    }

    onVictory() {
        super.onVictory()
        // Defeating mercenaries improves your reputation with them (they respect strength)
        const reputationChange = Math.ceil(ENCOUNTER_BASE_REPUTATION_EFFECT_ON_VICTORY * FACTION_TYPES.MERCENARIES.reputationMultiplier)
        if (reputationChange) {
            gs.captain.grantReputation(FACTION_TYPES.MERCENARIES, reputationChange)
            if (this.planet) {
                gs.captain.grantReputation(this.planet, Math.ceil(reputationChange / 5))
            }
        }
    }

    onSurrender() {
        // Mercenaries take cargo and some credits
        const creditsTaken = Math.min(gs.credits, rng(gs.credits * ENCOUNTER_MAX_LOSE_CREDITS_RATIO, gs.credits * ENCOUNTER_MAX_LOSE_CREDITS_RATIO / 2, true))
        gs.credits -= creditsTaken
        
        // Take random cargo
        const cargoTaken = []
        const cargoTypes = gs.fleet.cargo.keys
        for (let i = 0; i < Math.min(3, cargoTypes.length); i++) {
            const ct = rndMember(cargoTypes)
            const amount = Math.min(gs.fleet.cargo.getAmount(ct), rng(gs.fleet.cargo.getAmount(ct) * ENCOUNTER_MAX_LOSE_CARGO_RATIO, gs.fleet.cargo.getAmount(ct) * ENCOUNTER_MAX_LOSE_CARGO_RATIO / 2, true))
            gs.fleet.cargo.increment(ct, -amount)
            cargoTaken.push(`${amount} ${ct.name}`)
        }
        
        showModal('Surrender', 
            `You surrender to the ${coloredName(this.fleet)}.<br/>` +
            `They take ${creditsTaken} CR` + (cargoTaken.length > 0 ? ` and ${cargoTaken.join(', ')}` : '') + `.<br/>` +
            `"Professional courtesy - we're letting you live. Next time, stay out of our way."`, [
            ['Continue', () => this.endEncounter()]
        ])
        
        // Surrendering shrinks reputation toward 0
        const reputationShrink = Math.ceil(ENCOUNTER_BASE_REPUTATION_SHRINK_ON_SURRENDER / Math.abs(FACTION_TYPES.MERCENARIES.reputationMultiplier || 1))
        if (reputationShrink) {
            const currentRep = gs.captain.reputation.getAmount(FACTION_TYPES.MERCENARIES)
            gs.captain.grantReputation(FACTION_TYPES.MERCENARIES, currentRep > 0 ? -reputationShrink : reputationShrink)
        }
    }
}
