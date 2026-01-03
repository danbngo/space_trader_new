/**
 * @class SoldiersEncounter
 * @extends {AuthoritiesEncounter}
 */
class SoldiersEncounter extends AuthoritiesEncounter {
    onStart() {
        if (Math.random()*gs.captain.calcReputationForTarget(this.planet) > 300 && gs.captain.calcBountyForPlanet(this.planet) > 0) {
            showModal(coloredName(this.fleet), `The ${coloredName(this.fleet)} salute you over comms, having heard of your good deeds.<br/>${FameLevel.hasInfamyLevel(gs.captain, this.planet, INFAMY_LEVELS.DISREPUTABLE) ? `In their view, the good you've done far outweighs the bad.` : ''}`, [
                //['View', ()=>closeModal()],
                ['Ignore', ()=>this.endEncounter()],
                ['Attack', ()=>this.showPlayerAttackFleetModal()],
            ])
        }
        if (Math.random()*gs.captain.calcReputationForTarget(this.planet) < 300 && gs.captain.calcBountyForPlanet(this.planet) > 0) {
            showModal(coloredName(this.fleet), `The $${coloredName(this.fleet)} ships power up their weapons the instant you pass by!<br/>You have grown so notorious that even the government considers you a threat!`, [
                //['View', ()=>closeModal()],
                ['Surrender', ()=>this.onSurrender()],
                ['Resist', ()=>this.showPlayerRefuseSurrenderModal()],
            ])
        }
        else {
            showModal(coloredName(this.fleet), `The ${coloredName(this.fleet)} ships blares a platriotic jingle extolling the greatness of ${coloredName(this.planet)}.`, [
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
        this.showPlayerDefeatedByAuthoritiesModal()
    }

    onEscape() {
        this.showPlayerEscapedFromEnemyModal()
    }

    onSurrender() {
        this.showPlayerDidSurrenderModal()
    }
}
