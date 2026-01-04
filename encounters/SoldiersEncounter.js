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
        // Soldiers attack enemies of the state (50% chance if sufficiently infamous)
        else if (FameLevel.hasInfamyLevel(gs.captain, this.planet, INFAMY_LEVELS.DISREPUTABLE) && Math.random() < 0.5) {
            showModal(coloredName(this.fleet), `The ${coloredName(this.fleet)} ships power up their weapons the instant you pass by!<br/>You have grown so notorious that even the government considers you a threat!`, [
                ['Resist', ()=>this.showPlayerRefuseSurrenderModal()],
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

    showPlayerDestroyedBySoldiersModal() {
        const planetName = coloredName(this.planet);
        const fleetName = coloredName(this.fleet);
        
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
        
        showModal('Destroyed', `The ${fleetName} open fire without mercy, reducing your fleet to scrap metal and debris. Your flagship barely survives, limping through space as wreckage drifts around you.<br/><br/>They've seized all your cargo and destroyed your escort ships. You're left for dead, adrift in the void.<br/><br/>Your infamy with ${planetName} has been somewhat reduced by this crushing defeat.`, [
            ['Continue', ()=>this.endEncounter()],
        ])
    }
}
