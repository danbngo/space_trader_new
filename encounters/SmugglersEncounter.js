/**
 * @class SmugglersEncounter
 * @extends {MercantileEncounter}
 */
class SmugglersEncounter extends MercantileEncounter {
    onStart() {
        if (this.luck[0] * gs.fleet.totalRadar * (1+gs.fleet.totalSkills.getAmount(SKILLS.Stealth)/50) > this.fleet.totalRadar) {
            showModal(coloredName(this.fleet), 'Your long range sensors detect a smuggler fleet before they detect you.<br/>You manage to approach them stealthily.', [
                ['View', ()=>closeModal()],
                ['Bypass', ()=>this.endEncounter()],
                ['Hail', ()=>{
                    this.luck[0] = 0
                    this.onStart()
                }],
                ['Sneak Attack', ()=>this.showPlayerAttackFleetModal(1, 0, false, true)],
            ])
        }
        else if (this.luck[1] * gs.captain.calcFameForPlanet(this.planet) > 100) {
            showModal(coloredName(this.fleet), `The ${coloredName(this.fleet)} have heard of your hostility towards the criminal community and quickly flee!`, [
                ['View', ()=>closeModal()],
                ['Ignore', ()=>this.endEncounter()],
                ['Attack', ()=>this.showPlayerAttackFleetModal(1, 0, false, true)],
            ])
        }
        else if (this.luck[2] > .5) {
            showModal(coloredName(this.fleet), `The ${coloredName(this.fleet)} broadcast a rather seedy invitation to peruse their illicit wares.`, [
                ['View', ()=>closeModal()],
                ['Trade', ()=>this.showTradeOfferModal(false)],
                ['Ignore', ()=>this.endEncounter()],
                ['Attack', ()=>this.showPlayerAttackFleetModal(1, 0, false, true)],
            ])
        }
        else {
            showModal(coloredName(this.fleet), `The ${coloredName(this.fleet)} take no chances and start moving quickly away from you.`, [
                ['View', ()=>closeModal()],
                ['Ignore', ()=>this.endEncounter()],
                ['Attack', ()=>this.showPlayerAttackFleetModal(1, 0, false, true)],
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
