/**
 * @class InquisitorsEncounter
 * @extends {AuthoritiesEncounter}
 */
class InquisitorsEncounter extends AuthoritiesEncounter {
    onStart() {
        // Get the inquisitor's religion from their planet's state religion
        const inquisitorReligion = this.planet?.civilization?.stateReligion;
        
        if (!inquisitorReligion) {
            // No state religion, just ignore
            this.showStandardGreeting();
            return;
        }
        
        // If player is same religion, they let you go
        if (gs.captain.religion === inquisitorReligion) {
            showModal(coloredName(this.fleet), `The ${coloredName(this.fleet)} scan your vessel and detect your religious affiliation.<br/><br/>"You are one of the faithful. Go in peace, sibling."`, [
                ['Continue', () => this.endEncounter()],
                ['Attack', () => this.showPlayerAttackFleetModal()],
            ]);
            return;
        }
        
        // Check if player has high infamy with this religion
        const infamyWithReligion = gs.captain.reputation.getAmount(inquisitorReligion);
        const hasHighInfamy = infamyWithReligion <= -INFAMY_LEVELS.DISREPUTABLE.minReputation;
        
        if (hasHighInfamy) {
            // Attack on sight - player is a known enemy of the faith
            showModal(coloredName(this.fleet), `The ${coloredName(this.fleet)} power up their weapons immediately!<br/><br/>"Heretic detected! You have committed grave offenses against ${coloredName(inquisitorReligion)}! Prepare to face divine judgment!"`, [
                ['Resist', () => this.showPlayerRefuseSurrenderModal()],
            ]);
        } else {
            // 50% chance to demand conversion
            if (Math.random() < 0.5) {
                this.offerConversion(inquisitorReligion);
            } else {
                this.showStandardGreeting();
            }
        }
    }
    
    offerConversion(inquisitorReligion) {
        const fleetName = coloredName(this.fleet);
        const religionName = coloredName(inquisitorReligion);
        
        let message = `The ${fleetName} hail you with stern authority:<br/><br/>`;
        message += `"We are agents of ${religionName}, enforcing divine law in this sector. `;
        
        if (gs.captain.religion) {
            message += `Your allegiance to ${coloredName(gs.captain.religion)} has been noted. `;
        } else {
            message += `You appear to be agnostic. `;
        }
        
        message += `We offer you a choice: embrace the true faith of ${religionName}, or face the consequences of your heresy."`;
        
        showModal(fleetName, message, [
            ['Convert', () => this.convertToReligion(inquisitorReligion)],
            ['Refuse', () => this.refuseConversion(inquisitorReligion)],
        ]);
    }
    
    convertToReligion(newReligion) {
        const oldReligion = gs.captain.religion;
        const fleetName = coloredName(this.fleet);
        const newReligionName = coloredName(newReligion);
        
        // Change captain's religion
        gs.captain.religion = newReligion;
        
        let resultMessage = `You accept their demand and undergo a forced conversion ceremony...<br/><br/>`;
        resultMessage += `"Excellent. You have seen the light. Go forth and sin no more."<br/><br/>`;
        resultMessage += `<span style="color: #ffaa00">Your religion is now: ${newReligionName}</span>`;
        
        // Grant positive reputation with new religion
        const reputationGain = 10;
        gs.captain.reputation.increment(newReligion, reputationGain);
        resultMessage += `<br/><span style="color: #66ff66">+${reputationGain} reputation with ${newReligionName}</span>`;
        
        // Grant massive infamy with old religion (if any)
        if (oldReligion) {
            const infamyPenalty = -50; // Large infamy penalty
            gs.captain.reputation.increment(oldReligion, infamyPenalty);
            const oldReligionName = coloredName(oldReligion);
            resultMessage += `<br/><br/><span style="color: #ff6666">You have betrayed ${oldReligionName}!</span>`;
            resultMessage += `<br/>${infamyPenalty} reputation with ${oldReligionName}`;
        }
        
        showModal('Converted', resultMessage, [
            ['Continue', () => this.endEncounter()]
        ]);
    }
    
    refuseConversion(inquisitorReligion) {
        const fleetName = coloredName(this.fleet);
        const religionName = coloredName(inquisitorReligion);
        
        // 25% chance they attack
        if (Math.random() < 0.25) {
            showModal(fleetName, `"Your defiance is noted, heretic! You will be purged!"<br/><br/>The ${fleetName} open fire!`, [
                ['Resist', () => this.showPlayerRefuseSurrenderModal()],
            ]);
        } else {
            // Just gain infamy with their religion
            const infamyGain = -10;
            gs.captain.reputation.increment(inquisitorReligion, infamyGain);
            
            let message = `"Your stubbornness is foolish, but we will not waste resources on you today. `;
            message += `Know that your heresy has been recorded."<br/><br/>`;
            message += `The ${fleetName} power down their weapons and depart.<br/><br/>`;
            message += `<span style="color: #ff6666">${infamyGain} reputation with ${religionName}</span>`;
            
            showModal('Refused Conversion', message, [
                ['Continue', () => this.endEncounter()]
            ]);
        }
    }
    
    showStandardGreeting() {
        const fleetName = coloredName(this.fleet);
        const inquisitorReligion = this.planet?.civilization?.stateReligion;
        const religionName = inquisitorReligion ? coloredName(inquisitorReligion) : 'their faith';
        
        showModal(fleetName, `The ${fleetName} broadcast a religious sermon extolling the virtues of ${religionName}.`, [
            ['Ignore', () => this.endEncounter()],
            ['Attack', () => this.showPlayerAttackFleetModal()],
        ]);
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
        this.showPlayerDidSurrenderModal();
    }
}
