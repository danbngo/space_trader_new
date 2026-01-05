/**
 * Encounter with media fleet - journalists, celebrities, advertisers, influencers
 * @class MediaEncounter
 * @extends {NeutralsEncounter}
 */
class MediaEncounter extends NeutralsEncounter {
    onStart() {
        // Check if already met to prevent repeated prestige boosts
        if (this.hasAlreadyVisitedPlayer()) {
            this.showAlreadyMetMessage()
            return
        }
        
        const greeting = this.getGreetingDialogue()
        const planetName = this.planet ? this.planet.name : "an unknown world"
        
        const message = greeting
            ? `"${greeting}" The ${coloredName(this.fleet)} from ${planetName} are journalists, celebrities, and content creators broadcasting across the solar system. They'd like to interview you for their latest story!`
            : `The ${coloredName(this.fleet)} from ${planetName} approach eagerly. They're journalists and content creators looking for an exclusive interview!`
        
        showModal(coloredName(this.fleet), message, [
            ['📸 Grant Interview', ()=>this.grantInterview()],
            ['🚫 Decline', ()=>this.decline()],
            ['💰 Demand Payment', ()=>this.demandPayment()],
            ['Attack', ()=>this.showPlayerAttackModal()],
        ])
    }

    grantInterview() {
        // Boost your planet's prestige
        let msg = '📸 You grant the interview! '
        if (gs.fleet.planet && gs.fleet.planet.civilization) {
            gs.fleet.planet.c.prestige *= 1.02
            msg += `News of your exploits spreads across ${gs.fleet.planet.name}, increasing its prestige!<br/>`
        }

        // Boost media's home planet culture/education
        if (this.fleet.planet && this.fleet.planet.civilization) {
            this.fleet.planet.c.culture *= 1.01
            this.fleet.planet.c.education *= 1.01
        }

        // Small reputation boost
        if (this.fleet.planet) {
            msg += gs.captain.grantReputation(this.fleet.planet, 5)
        }

        this.fleet.fleetAI.visited.push(gs.fleet)
        showModal(coloredName(this.fleet), msg, [['Continue', ()=>this.endEncounter()]])
    }

    decline() {
        const msg = 'You politely decline the interview. The media fleet thanks you for your time and moves on.'
        this.fleet.fleetAI.visited.push(gs.fleet)
        showModal(coloredName(this.fleet), msg, [['Continue', ()=>this.endEncounter()]])
    }

    demandPayment() {
        // Check negotiation skill
        const negotiationSkill = gs.fleet.totalSkills.getAmount(SKILLS.NEGOTIATION)
        const baseCredits = 1000
        const credits = Math.floor(baseCredits * (1 + negotiationSkill * 0.5))

        if (Math.random() < 0.5 + negotiationSkill * 0.1) {
            gs.credits += credits
            let msg = `📰 They agree to pay ${credits} credits for exclusive content rights!<br/>`
            
            // Still get small prestige boost
            if (gs.fleet.planet && gs.fleet.planet.civilization) {
                gs.fleet.planet.c.prestige *= 1.01
                msg += `The coverage boosts ${gs.fleet.planet.name}'s prestige slightly.`
            }
            
            showModal(coloredName(this.fleet), msg, [['Continue', ()=>this.endEncounter()]])
        } else {
            let msg = 'They refuse to pay and seem disappointed by your mercenary attitude.'
            
            // Small reputation loss
            if (this.fleet.planet) {
                msg += '<br/>' + gs.captain.grantReputation(this.fleet.planet, -5)
            }
            
            showModal(coloredName(this.fleet), msg, [['Continue', ()=>this.endEncounter()]])
        }

        this.fleet.fleetAI.visited.push(gs.fleet)
    }
}
