/**
 * @class SoldiersEncounter
 * @extends {AuthoritiesEncounter}
 */
class SoldiersEncounter extends AuthoritiesEncounter {
    onStart() {
        if (Math.random() * gs.fleet.totalRadar * (1+gs.fleet.totalSkills.getAmount(SKILLS.Stealth)/50) > this.fleet.totalRadar) {
            showModal(coloredName(this.fleet), `Your long range sensors detect a ${coloredName(this.fleet)} fleet before they detect you.<br/>You manage to approach the ${coloredName(this.fleet)} stealthily.`, [
                ['View', ()=>closeModal()],
                ['Bypass', ()=>this.endEncounter()],
                ['Hail', ()=>{
                    this.onStart()
                }],
                ['Sneak Attack', ()=>this.showPlayerAttackFleetModal(-2, 2, false, false)],
            ])
        }
        else if (Math.random()*gs.captain.calcReputationForPlanet(this.planet) > 300 && gs.captain.calcBountyForPlanet(this.planet) > 0) {
            showModal(coloredName(this.fleet), `The ${coloredName(this.fleet)} salute you over comms, having heard of your good deeds.<br/>${gs.captain.calcInfamyForPlanet(this.planet) > 25 ? `In their view, the good you've done far outweighs the bad.` : ''}`, [
                ['View', ()=>closeModal()],
                ['Ignore', ()=>this.endEncounter()],
                ['Attack', ()=>this.showPlayerAttackFleetModal(-2, 2, false, false)],
            ])
        }
        if (Math.random()*gs.captain.calcReputationForPlanet(this.planet) < 300 && gs.captain.calcBountyForPlanet(this.planet) > 0) {
            showModal(coloredName(this.fleet), `The $${coloredName(this.fleet)} ships power up their weapons the instant you pass by!<br/>You have grown so notorious that even the government considers you a threat!`, [
                ['View', ()=>closeModal()],
                ['Surrender', ()=>this.onSurrender()],
                ['Resist', ()=>this.showPlayerRefuseSurrenderModal(-2, 2)],
            ])
        }
        else {
            showModal(coloredName(this.fleet), `The ${coloredName(this.fleet)} ships blares a platriotic jingle extolling the greatness of ${coloredName(this.planet)}.`, [
                ['View', ()=>closeModal()],
                ['Ignore', ()=>this.endEncounter()],
                ['Attack', ()=>this.showPlayerAttackFleetModal(-2, 2, false, false)],
            ])
        }
    }

    onVictory() {
        this.showPlayerDefeatedEnemyModal(-4)
    }

    onDefeat() {
        this.showPlayerDefeatedByAuthoritiesModal()
    }

    onEscape() {
        this.showPlayerEscapedFromEnemyModal()
    }

    onSurrender() {
        this.showPlayerDidSurrenderModal(-1)
    }
}
