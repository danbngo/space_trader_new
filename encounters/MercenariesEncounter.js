/**
 * @class MercenariesEncounter
 * @extends {FleetEncounter}
 */
class MercenariesEncounter extends FleetEncounter {
    onStart() {
        // Check if player is from enemy planet or has infamy
        const originPlanet = gs.fleet.planet
        const isAtWar = originPlanet && this.planet.c?.relationships?.get(originPlanet) === RELATIONSHIP_TYPES.WAR
        const hasInfamy = this.planet && FameLevel.hasInfamyLevel(gs.captain, this.planet, INFAMY_LEVELS.DISREPUTABLE)
        
        // Mercenaries demand surrender if at war or infamous (50% chance for infamy)
        if (isAtWar || (hasInfamy && Math.random() < 0.5)) {
            const reason = isAtWar 
                ? `"${coloredName(originPlanet)} vessel detected! Our contract with ${coloredName(this.planet)} is clear - surrender or die!"` 
                : `"We've been hired to deal with you. You've made too many enemies. Surrender your ships or we open fire!"`;
            
            showModal(coloredName(this.fleet), 
                `The ${coloredName(this.fleet)} intercept you immediately!<br/>` + reason, [
                ['Resist', () => this.startCombat(true)],
                ['Surrender', () => this.impoundPlayerFleet()],
            ])
            return
        }
        
        // Check for tense relationships
        if (originPlanet) {
            const relationship = this.planet.c?.relationships?.get(originPlanet)
            
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
        }
        
        // Otherwise neutral - only offer officer hiring
        this.showNeutralMercenaries()
    }
    
    showNeutralMercenaries() {
        const greeting = this.getGreetingDialogue()
        
        // Always try to offer an officer for hire
        this.offerOfficerForHire(greeting)
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
            ['Attack', () => this.showPlayerAttackModal()],
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

    onDefeat() {
        this.showPlayerDestroyedByMercenariesModal()
    }

    onSurrender() {
        this.showPlayerDestroyedByMercenariesModal()
    }

    impoundPlayerFleet() {
        const planetName = coloredName(this.planet);
        const fleetName = coloredName(this.fleet);
        
        // Destroy all ships except flagship
        for (let i = 1; i < gs.fleet.ships.length; i++) {
            gs.fleet.ships[i].hull[0] = 0;
        }
        
        // Clear all cargo
        gs.fleet.cargo.clear();
        
        // Teleport player to this planet
        gs.fleet.dock(this.planet);
        
        showModal('Impounded', `You surrender to the ${fleetName}. They escort you to ${planetName} where your escort ships and cargo are turned over to their employer.<br/><br/>"Smart choice. Our contract didn't require killing you - just taking your assets. You're free to go... for now."<br/><br/>Your crew is intact, but you've lost everything except your flagship.`, [
            ['Continue', ()=>showPlanetMenu(this.planet)],
        ])
    }

    showPlayerDestroyedByMercenariesModal() {
        const planetName = coloredName(this.planet);
        const fleetName = coloredName(this.fleet);
        
        // 50% chance each crew member dies
        const casualties = [];
        for (let i = gs.fleet.officers.length - 1; i >= 0; i--) {
            if (Math.random() < 0.5) {
                casualties.push(gs.fleet.officers[i].name);
                gs.fleet.officers.splice(i, 1);
            }
        }
        
        // Destroy all ships except flagship
        for (let i = 1; i < gs.fleet.ships.length; i++) {
            gs.fleet.ships[i].hull[0] = 0;
        }
        
        // Clear all cargo
        gs.fleet.cargo.clear();
        
        // Halve infamy with this planet
        const currentRep = gs.captain.reputation.getAmount(this.planet);
        if (currentRep < 0) {
            const halvedInfamy = currentRep * 0.5;
            gs.captain.reputation.setAmount(this.planet, halvedInfamy);
        }
        
        let message = `The ${fleetName} execute their contract with ruthless efficiency, reducing your fleet to scrap metal and debris. Your flagship barely survives, drifting through the wreckage.<br/><br/>`;
        
        if (casualties.length > 0) {
            message += `<b>Casualties:</b> ${casualties.join(', ')} perished in the battle.<br/><br/>`;
        }
        
        message += `They've seized all your cargo and destroyed your escort ships. "Contract fulfilled. Nothing personal."<br/><br/>Your infamy with ${planetName} has been somewhat reduced by this defeat.`;
        
        showModal('Destroyed', message, [
            ['Continue', ()=>this.endEncounter()],
        ])
    }
}
