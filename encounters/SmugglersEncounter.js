/**
 * @class SmugglersEncounter
 * @extends {MercantileEncounter}
 */
class SmugglersEncounter extends MercantileEncounter {
    onStart() {
        // Check if player is infamous on smuggler's home planet
        const isInfamous = this.planet && FameLevel.hasInfamyLevel(gs.captain, this.planet, INFAMY_LEVELS.DISLIKED);
        
        if (FameLevel.hasFameLevel(gs.captain, this.planet, FAME_LEVELS.LOVED)) {
            // Player is loved by the planet - smugglers flee
            showModal(coloredName(this.fleet), `The ${coloredName(this.fleet)} have heard of your hostility towards the criminal community and quickly flee!`, [
                ['Ignore', ()=>this.endEncounter()],
                ['Attack', ()=>this.showPlayerAttackFleetModal()],
            ])
        }
        else if (isInfamous && Math.random() < 0.5) {
            // 50% chance to offer trade if player is infamous
            showModal(coloredName(this.fleet), 
                `The ${coloredName(this.fleet)} recognize you as someone with a... questionable reputation.<br/><br/>` +
                `"We deal with people like you. We'll buy your cargo - no questions asked. But we're not selling anything to outsiders."`, [
                ['Trade', ()=>showAdHocMarketMenu(this.fleet, ()=>this.endEncounter(), this, true)],
                ['Ignore', ()=>this.endEncounter()],
                ['Attack', ()=>this.showPlayerAttackFleetModal()],
            ])
        }
        else {
            // Otherwise, smugglers are cautious and flee
            showModal(coloredName(this.fleet), `The ${coloredName(this.fleet)} take no chances and start moving quickly away from you.`, [
                ['Ignore', ()=>this.endEncounter()],
                ['Attack', ()=>this.showPlayerAttackFleetModal()],
            ])
        }
    }

    onVictory() {
        this.showPlayerDefeatedEnemyModal()
    }

    onDefeat() {
        this.showPlayerDefeatedByNeutralsModal(1)
    }

    onEscape() {
        this.showPlayerEscapedFromEnemyModal()
    }

    onSurrender() {
        this.onDefeat()
    }
}
