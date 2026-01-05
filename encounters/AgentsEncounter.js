/**
 * @class AgentsEncounter
 * @extends {AuthoritiesEncounter}
 */
class AgentsEncounter extends AuthoritiesEncounter {
    onStart() {
        // Check if already met to prevent repeated intel gathering
        if (this.hasAlreadyVisitedPlayer()) {
            this.showAlreadyMetMessage()
            return
        }
        
        const greeting = this.getGreetingDialogue()
        
        // Check if player is from hostile/tense planet
        const isHostilePlanet = this.fleet.planet && gs.fleet.planet && 
            (this.fleet.planet.c.relationships.get(gs.fleet.planet) === RELATIONSHIP_TYPES.WAR ||
             this.fleet.planet.c.relationships.get(gs.fleet.planet) === RELATIONSHIP_TYPES.TENSE)
        
        // Check if player is infamous or a criminal
        const isNotorious = FameLevel.hasInfamyLevel(gs.captain, this.planet, INFAMY_LEVELS.NOTORIOUS)
        const hasBounty = gs.captain.calcBountyForPlanet(this.planet) > 0
        
        if (isHostilePlanet) {
            // Hostile planet - agents are aggressive
            const message = greeting
                ? `"${greeting}" The ${coloredName(this.fleet)} have been tracking your movements. Your government is not on friendly terms with ours.`
                : `The ${coloredName(this.fleet)} materialize from the shadows. "Your planet is hostile to ours. This is your only warning."`
            
            showModal(coloredName(this.fleet), message, [
                ['Surrender', ()=>this.onSurrender()],
                ['Resist', ()=>this.showPlayerRefuseSurrenderModal()],
            ])
        } else if (isNotorious || hasBounty) {
            // Criminal/notorious - targeted for elimination
            const message = greeting
                ? `"${greeting}" You've attracted our attention. That's unfortunate... for you.`
                : `The ${coloredName(this.fleet)} decloak around your position. "We have a file on you. A very thick file."`
            
            showModal(coloredName(this.fleet), message, [
                ['Surrender', ()=>this.onSurrender()],
                ['Resist', ()=>this.showPlayerRefuseSurrenderModal()],
            ])
        } else {
            // Neutral/friendly - just observing
            const roll = Math.random()
            
            if (roll < 0.33) {
                // Brief questioning
                const message = greeting
                    ? `"${greeting}" The ${coloredName(this.fleet)} ask you a few pointed questions about your recent activities, then let you go.`
                    : `The ${coloredName(this.fleet)} briefly scan your ship and ask routine questions before moving on.`
                
                showModal(coloredName(this.fleet), message, [
                    ['Continue', ()=>this.endEncounter()],
                    ['Attack', ()=>this.showPlayerAttackModal()],
                ])
            } else if (roll < 0.66) {
                // Request information
                showModal(
                    coloredName(this.fleet), 
                    `The ${coloredName(this.fleet)} contact you on a secure channel. They're gathering intelligence and want information about nearby criminal activity.`,
                    [
                        ['Cooperate', ()=>this.cooperateWithAgents()],
                        ['Refuse', ()=>this.refuseAgents()],
                        ['Attack', ()=>this.showPlayerAttackModal()],
                    ]
                )
            } else {
                // Just surveillance - barely notice you
                const message = greeting
                    ? `"${greeting}" The ${coloredName(this.fleet)} acknowledge you briefly before vanishing into the void.`
                    : `You barely notice the ${coloredName(this.fleet)} as they silently observe and move on.`
                
                showModal(coloredName(this.fleet), message, [
                    ['Continue', ()=>this.endEncounter()],
                    ['Attack', ()=>this.showPlayerAttackModal()],
                ])
            }
        }
    }
    
    cooperateWithAgents() {
        let msg = 'You share what you know about local criminal activity.<br/>'
        
        // Small reputation boost
        if (this.fleet.planet) {
            msg += gs.captain.grantReputation(this.fleet.planet, 10)
        }
        
        // Small credit reward
        const reward = Math.floor(500 + Math.random() * 1000)
        gs.credits += reward
        msg += `They thank you for your cooperation and transfer ${reward} credits as compensation.`
        
        showModal(coloredName(this.fleet), msg, [['Continue', ()=>this.endEncounter()]])
    }
    
    refuseAgents() {
        let msg = 'You decline to provide information.<br/>'
        msg += `The agents seem disappointed but accept your decision.`
        
        // Very small reputation loss
        if (this.fleet.planet) {
            msg += '<br/>' + gs.captain.grantReputation(this.fleet.planet, -3)
        }
        
        showModal(coloredName(this.fleet), msg, [['Continue', ()=>this.endEncounter()]])
    }
    
    onVictory() {
        this.showPlayerDefeatedEnemyModal()
    }

    onDefeat() {
        this.showPlayerDefeatedByAuthoritiesModal()
    }

    onSurrender() {
        this.showPlayerDidSurrenderModal()
    }
}
