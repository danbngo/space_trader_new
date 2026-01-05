/**
 * @class CommissarsEncounter
 * @extends {AuthoritiesEncounter}
 */
class CommissarsEncounter extends AuthoritiesEncounter {
    onStart() {
        const civ = this.planet.civilization;
        if (!civ) {
            this.endEncounter();
            return;
        }
        
        let isPoliticallyImpure = false;
        const impurityReasons = [];
        
        // Check for different state religion
        if (civ.stateReligion && gs.captain.religion !== civ.stateReligion) {
            isPoliticallyImpure = true;
            impurityReasons.push(`your religion (${gs.captain.religion?.name || 'none'}) differs from the state religion (${civ.stateReligion.name})`);
        }
        
        // Check for different ethnicity from major race
        if (civ.races && civ.races.counts.size > 0) {
            let majorRace = null;
            let maxCount = 0;
            for (const [race, count] of civ.races.counts.entries()) {
                if (count > maxCount) {
                    maxCount = count;
                    majorRace = race;
                }
            }
            if (majorRace && gs.captain.race !== majorRace) {
                isPoliticallyImpure = true;
                impurityReasons.push(`your ethnicity (${gs.captain.race?.name || 'Human'}) differs from the dominant ethnicity (${majorRace.name})`);
            }
        }
        
        // Check for different culture from majority planet
        if (gs.captain.planet !== this.planet) {
            isPoliticallyImpure = true;
            impurityReasons.push(`your cultural origin (${coloredName(gs.captain.planet)}) is not from ${coloredName(this.planet)}`);
        }
        
        if (!isPoliticallyImpure) {
            showModal(coloredName(this.fleet), `The ${coloredName(this.fleet)} scan your ship and verify your political loyalty to ${coloredName(this.planet)}. They allow you to pass without incident.`, [
                ['Continue', ()=>this.endEncounter()],
                ['Attack', ()=>this.showPlayerAttackModal()],
            ]);
        } else {
            const reasonsText = impurityReasons.join(', ');
            showModal(coloredName(this.fleet), 
                `The ${coloredName(this.fleet)} intercept you!<br/><br/>` +
                `"Halt! Political screening required. Our records indicate ${reasonsText}. You are classified as politically unreliable. Prepare for inspection and potential... re-education."<br/><br/>` +
                `The commissar's voice is cold and bureaucratic.`, [
                ['Comply', ()=>this.handleCompliance()],
                ['Resist', ()=>this.startCombat(true)],
                ['Bribe', ()=>this.attemptBribe(), gs.credits < 10000],
            ]);
        }
    }
    
    handleCompliance() {
        const roll = Math.random();
        
        if (roll < 0.3) {
            // Execution
            this.executeRandomOfficer();
        } else if (roll < 0.6) {
            // Confiscation
            this.confiscateCargo();
        } else {
            // Let go with warning
            showModal('Released', `After hours of interrogation and political lectures, the commissars reluctantly let you go with a stern warning about ideological purity.<br/><br/>"Remember citizen, loyalty to ${coloredName(this.planet)} is the highest virtue. Deviation will not be tolerated."`, [
                ['Continue', ()=>this.endEncounter()],
            ]);
        }
    }
    
    executeRandomOfficer() {
        if (gs.fleet.subordinates.length === 0) {
            showModal('Spare him execution', `The commissars prepare to execute you as an example, but hesitate when they realize you're the only crew member. Instead, they subject you to brutal "re-education" before releasing you.<br/><br/>You've lost ${colorSpan('1000 CR', COLORS.Red)} and significant morale.`, [
                ['Continue', ()=> {
                    gs.credits = Math.max(0, gs.credits - 1000);
                    this.endEncounter();
                }],
            ]);
            return;
        }
        
        const victim = rndMember(gs.fleet.subordinates);
        gs.fleet.removeOfficer(victim);
        
        showModal('Execution', `The commissars board your ship and, after a brief show trial, drag ${colorSpan(victim.name, COLORS.Red)} to the airlock.<br/><br/>"${victim.name} has been found guilty of ideological contamination and crimes against the state. The sentence is death."<br/><br/>The airlock opens to the void of space. Your crew watches in horror as an example is made.`, [
            ['Continue', ()=>this.endEncounter()],
        ]);
    }
    
    confiscateCargo() {
        if (gs.fleet.cargo.total === 0) {
            showModal('Nothing to confiscate', `The commissars board your ship to confiscate contraband, but find nothing. They seem disappointed and leave after delivering a lengthy political lecture.`, [
                ['Continue', ()=>this.endEncounter()],
            ]);
            return;
        }
        
        const confiscatedAmount = Math.ceil(gs.fleet.cargo.total * 0.5);
        const confiscatedCargo = gs.fleet.cargo.randomSubset(confiscatedAmount);
        
        // Remove confiscated cargo
        for (const [cargoType, amount] of confiscatedCargo.counts.entries()) {
            gs.fleet.cargo.increment(cargoType, -amount);
        }
        
        showModal('Confiscation', `The commissars board your ship and confiscate ${colorSpan(confiscatedAmount + ' units', COLORS.Red)} of cargo as "politically unreliable goods."<br/><br/>"These materials could be used to undermine state security. They are now property of ${coloredName(this.planet)}."`, [
            ['Continue', ()=>this.endEncounter()],
        ]);
    }
    
    attemptBribe() {
        const bribeAmount = 10000;
        
        if (gs.credits < bribeAmount) {
            showModal('Insufficient Funds', `You don't have enough credits to bribe the commissars.`, [
                ['Back', ()=>this.onStart()],
            ]);
            return;
        }
        
        const roll = Math.random();
        
        if (roll < 0.5) {
            // Bribe succeeds
            gs.credits -= bribeAmount;
            showModal('Bribe Accepted', `You discreetly transfer ${colorSpan(bribeAmount + ' CR', COLORS.Red)} to the commissar's account. They glance at their datapad, then back at you.<br/><br/>"Your records appear to have been... updated. You may proceed, citizen. For now."<br/><br/>You quickly leave before they change their mind.`, [
                ['Continue', ()=>this.endEncounter()],
            ]);
        } else {
            // Bribe fails - they're insulted
            showModal('Bribe Rejected', `The commissar's eyes narrow as you attempt the bribe.<br/><br/>"CORRUPTION?! You dare attempt to bribe an officer of the state?! This compounds your crimes!"<br/><br/>They immediately open fire!`, [
                ['Continue', ()=>this.startCombat(true)],
            ]);
        }
    }
    
    onVictory() {
        this.showPlayerDefeatedEnemyModal();
    }
    
    onDefeat() {
        this.showPlayerDefeatedByAuthoritiesModal();
    }
    
    onEscape() {
        this.showPlayerEscapedFromEnemyModal();
    }
    
    onSurrender() {
        this.showPlayerDefeatedByAuthoritiesModal();
    }
}
