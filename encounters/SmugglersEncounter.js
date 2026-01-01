/**
 * @class SmugglersEncounter
 * @extends {MercantileEncounter}
 */
class SmugglersEncounter extends MercantileEncounter {
    onStart() {
        if (Math.random() * gs.fleet.totalRadar * (1+gs.fleet.totalSkills.getAmount(SKILLS.Stealth)/50) > this.fleet.totalRadar) {
            showModal(coloredName(this.fleet), 'Your long range sensors detect a smuggler fleet before they detect you.<br/>You manage to approach them stealthily.', [
                ['View', ()=>closeModal()],
                ['Bypass', ()=>this.endEncounter()],
                ['Hail', ()=>{
                    this.onStart()
                }],
                ['Sneak Attack', ()=>this.showPlayerAttackFleetModal(1, 0, true)],
            ])
        }
        else if (FameLevel.hasFameLevel(gs.captain, this.planet, FAME_LEVELS.LOVED)) {
            showModal(coloredName(this.fleet), `The ${coloredName(this.fleet)} have heard of your hostility towards the criminal community and quickly flee!`, [
                ['View', ()=>closeModal()],
                ['Ignore', ()=>this.endEncounter()],
                ['Attack', ()=>this.showPlayerAttackFleetModal(1, 0, false)],
            ])
        }
        else if (Math.random() > .5) {
            showModal(coloredName(this.fleet), `The ${coloredName(this.fleet)} broadcast a rather seedy invitation to peruse their illicit wares.`, [
                ['View', ()=>closeModal()],
                ['Trade', ()=>this.showTradeOfferModal(false)],
                ['Ignore', ()=>this.endEncounter()],
                ['Attack', ()=>this.showPlayerAttackFleetModal(1, 0, false)],
            ])
        }
        else {
            showModal(coloredName(this.fleet), `The ${coloredName(this.fleet)} take no chances and start moving quickly away from you.`, [
                ['View', ()=>closeModal()],
                ['Ignore', ()=>this.endEncounter()],
                ['Attack', ()=>this.showPlayerAttackFleetModal(1, 0, false)],
            ])
        }
    }

    onVictory() {
        this.showPlayerDefeatedEnemyModal(1)
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
