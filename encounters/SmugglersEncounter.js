/**
 * @class SmugglersEncounter
 * @extends {MercantileEncounter}
 */
class SmugglersEncounter extends MercantileEncounter {
    onStart() {
        if (FameLevel.hasFameLevel(gs.captain, this.planet, FAME_LEVELS.LOVED)) {
            showModal(coloredName(this.fleet), `The ${coloredName(this.fleet)} have heard of your hostility towards the criminal community and quickly flee!`, [
                //['View', ()=>closeModal()],
                ['Ignore', ()=>this.endEncounter()],
                ['Attack', ()=>this.showPlayerAttackFleetModal()],
            ])
        }
        else if (Math.random() > .5) {
            showModal(coloredName(this.fleet), `The ${coloredName(this.fleet)} broadcast a rather seedy invitation to peruse their illicit wares.`, [
                //['View', ()=>closeModal()],
                ['Trade', ()=>this.showTradeOfferModal(false)],
                ['Ignore', ()=>this.endEncounter()],
                ['Attack', ()=>this.showPlayerAttackFleetModal()],
            ])
        }
        else {
            showModal(coloredName(this.fleet), `The ${coloredName(this.fleet)} take no chances and start moving quickly away from you.`, [
                //['View', ()=>closeModal()],
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
