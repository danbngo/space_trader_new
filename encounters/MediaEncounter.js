/**
 * Encounter with media fleet - journalists, celebrities, advertisers, influencers
 * @class MediaEncounter
 */
class MediaEncounter {
    /**
     * @param {Fleet} aiFleet - The media fleet
     * @param {GameState} gs - The game state
     */
    constructor(aiFleet, gs) {
        this.aiFleet = aiFleet;
        this.gs = gs;
    }

    /**
     * Display the encounter menu when meeting a media fleet
     * @returns {void}
     */
    show() {
        const fleetName = this.aiFleet.name;
        const planetName = this.aiFleet.planet ? this.aiFleet.planet.name : "an unknown world";

        // Create encounter content
        const content = ce({
            children: [
                `You've been approached by ${fleetName}, a media fleet from ${planetName}.`,
                `They're journalists, celebrities, and content creators looking for stories to broadcast across the solar system.`,
                `What do you do?`
            ]
        });

        // Create buttons
        /** @type {ButtonData[]} */
        const buttons = [
            {
                text: '📸 Grant Interview',
                onClick: () => this.grantInterview()
            },
            {
                text: '🚫 Decline',
                onClick: () => this.decline()
            },
            {
                text: '💰 Demand Payment',
                onClick: () => this.demandPayment()
            },
            {
                text: '⚔️ Attack',
                onClick: () => this.attack()
            }
        ];

        showModal(`📡 ${fleetName}`, content, buttons);
    }

    grantInterview() {
        // Boost your planet's prestige
        if (gs.fleet.planet && gs.fleet.planet.civilization) {
            gs.fleet.planet.c.prestige *= 1.02;
            logMessage(`Your home planet's prestige increases from media coverage!`, 'info');
        }

        // Boost media's home planet culture/education
        if (this.aiFleet.planet && this.aiFleet.planet.civilization) {
            this.aiFleet.planet.c.culture *= 1.01;
            this.aiFleet.planet.c.education *= 1.01;
        }

        // Small reputation boost
        if (this.aiFleet.planet) {
            gs.adjustReputation(this.aiFleet.planet, 5);
        }

        showToast('📸 Interview granted! Your fame spreads.', 'success');
        this.aiFleet.ai.visited.push(gs.fleet);
        this.endEncounter();
    }

    decline() {
        showToast('You politely decline the interview.', 'info');
        this.aiFleet.ai.visited.push(gs.fleet);
        this.endEncounter();
    }

    demandPayment() {
        // Check negotiation skill
        const captain = gs.fleet.getCaptain();
        const negotiationSkill = captain ? captain.getSkillLevel(SKILLS.Negotiation) : 0;
        const baseCredits = 1000;
        const credits = Math.floor(baseCredits * (1 + negotiationSkill * 0.5));

        if (Math.random() < 0.5 + negotiationSkill * 0.1) {
            gs.credits += credits;
            showToast(`📰 They agree! You receive ${credits} credits for exclusive content rights.`, 'success');
            
            // Still get small prestige boost
            if (gs.fleet.planet && gs.fleet.planet.civilization) {
                gs.fleet.planet.c.prestige *= 1.01;
            }
        } else {
            showToast('They refuse to pay and leave disappointed.', 'warning');
            // Small reputation loss
            if (this.aiFleet.planet) {
                gs.adjustReputation(this.aiFleet.planet, -5);
            }
        }

        this.aiFleet.ai.visited.push(gs.fleet);
        this.endEncounter();
    }

    attack() {
        showToast('⚔️ You attack the media fleet!', 'danger');
        
        // Major reputation hit for attacking non-combatants
        if (this.aiFleet.planet) {
            gs.adjustReputation(this.aiFleet.planet, -20);
        }
        
        // Start combat encounter
        const encounter = generateEncounter(this.aiFleet, gs.system, ENCOUNTER_RESULTS.COMBAT);
        gs.encounter = encounter;
        loadEncounterMap();
    }

    endEncounter() {
        // Clear the encounter and return to star map
        closeModal();
        gs.encounter = null;
        showStarMap();
    }
}
