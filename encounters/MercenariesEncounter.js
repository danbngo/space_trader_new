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
        showModal(coloredName(this.fleet), 
            `A ${coloredName(this.fleet)} fleet hails you over comms.<br/>` +
            `"We're hired guns, not trouble seekers. Keep your distance and we'll keep ours."`, [
            ['Ignore', () => this.endEncounter()],
            ['Attack', () => this.showPlayerAttackFleetModal()],
            //['Hail', () => this.showTradeMenu()],
        ])
    }

    onVictory() {
        super.onVictory()
        // Defeating mercenaries improves your reputation with them (they respect strength)
        const reputationChange = ENCOUNTER_BASE_REPUTATION_EFFECT_ON_VICTORY * FACTION_TYPES.MERCENARIES.reputationMultiplier
        if (reputationChange) {
            gs.captain.grantReputation(FACTION_TYPES.MERCENARIES, reputationChange)
            if (this.planet) {
                gs.captain.grantReputation(this.planet, reputationChange / 5)
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
        const reputationShrink = ENCOUNTER_BASE_REPUTATION_SHRINK_ON_SURRENDER / Math.abs(FACTION_TYPES.MERCENARIES.reputationMultiplier || 1)
        if (reputationShrink) {
            const currentRep = gs.captain.reputation.getAmount(FACTION_TYPES.MERCENARIES)
            gs.captain.grantReputation(FACTION_TYPES.MERCENARIES, currentRep > 0 ? -reputationShrink : reputationShrink)
        }
    }
}
