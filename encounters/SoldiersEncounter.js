/**
 * @class SoldiersEncounter
 * @extends {AuthoritiesEncounter}
 */
class SoldiersEncounter extends AuthoritiesEncounter {
    onStart() {
        // Soldiers salute heroes
        if (Math.random()*gs.captain.calcReputationForTarget(this.planet) > 300) {
            showModal(coloredName(this.fleet), `The ${coloredName(this.fleet)} salute you over comms, having heard of your good deeds.`, [
                ['Ignore', ()=>this.endEncounter()],
                ['Attack', ()=>this.showPlayerAttackFleetModal()],
            ])
        }
        // Soldiers demand surrender if player is from enemy planet
        else if (gs.fleet.planet && this.planet.c?.relationships?.get(gs.fleet.planet) === RELATIONSHIP_TYPES.WAR) {
            showModal(coloredName(this.fleet), 
                `The ${coloredName(this.fleet)} intercept you immediately!<br/>` +
                `"${coloredName(gs.fleet.planet)} vessel detected! You're in restricted space during wartime. Surrender your ships immediately or be destroyed!"`, [
                ['Resist', ()=>this.startCombat(true)],
                ['Surrender', ()=>this.impoundPlayerFleet()],
            ])
        }
        // Otherwise, ignore you
        else {
            showModal(coloredName(this.fleet), `The ${coloredName(this.fleet)} ships blare a patriotic jingle extolling the greatness of ${coloredName(this.planet)}.`, [
                ['Ignore', ()=>this.endEncounter()],
                ['Attack', ()=>this.showPlayerAttackFleetModal()],
            ])
        }
    }

    onVictory() {
        this.showPlayerDefeatedEnemyModal()
    }

    onDefeat() {
        this.showPlayerDestroyedBySoldiersModal()
    }

    onEscape() {
        this.showPlayerEscapedFromEnemyModal()
    }

    onSurrender() {
        this.showPlayerDestroyedBySoldiersModal()
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
        
        showModal('Impounded', `You surrender to the ${fleetName}. They escort you to ${planetName} where your escort ships and cargo are immediately impounded.<br/><br/>"You're lucky we're following protocol. Your ships will be held until this war ends... if it ever does."<br/><br/>Your crew is intact, but you've lost everything except your flagship.`, [
            ['Continue', ()=>this.endEncounter()],
        ])
    }

    showPlayerDestroyedBySoldiersModal() {
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
        
        let message = `The ${fleetName} open fire without mercy, reducing your fleet to scrap metal and debris. Your flagship barely survives, limping through space as wreckage drifts around you.<br/><br/>`;
        
        if (casualties.length > 0) {
            message += `<b>Casualties:</b> ${casualties.join(', ')} perished in the battle.<br/><br/>`;
        }
        
        message += `They've seized all your cargo and destroyed your escort ships. You're left for dead, adrift in the void.<br/><br/>Your infamy with ${planetName} has been somewhat reduced by this crushing defeat.`;
        
        showModal('Destroyed', message, [
            ['Continue', ()=>this.endEncounter()],
        ])
    }
}
