/**
 * @class SoldiersEncounter
 * @extends {Encounter}
 */
class SoldiersEncounter extends Encounter {
    onStart() {
        if (gs.encounter.luck[0] * gs.fleet.totalRadar * (1+gs.fleet.totalSkills.getAmount(SKILLS.Stealth)/50) > gs.encounter.fleet.totalRadar) {
            showModal(coloredName(gs.encounter.fleet), `Your long range sensors detect a ${coloredName(gs.encounter.fleet)} fleet before they detect you.<br/>You manage to approach the ${coloredName(gs.encounter.fleet)} stealthily.`, [
                ['View', ()=>closeModal()],
                ['Bypass', ()=>endEncounter()],
                ['Hail', ()=>{
                    gs.encounter.luck[0] = 0
                    gs.encounter.onStart()
                }],
                ['Sneak Attack', ()=>showPlayerAttackFleetModal(-2, 2, false, false)],
            ])
        }
        else if (gs.encounter.luck[1]*gs.captain.calcReputationForPlanet(gs.encounter.planet) > 300 && gs.captain.calcBountyForPlanet(gs.encounter.planet) > 0) {
            showModal(coloredName(gs.encounter.fleet), `The ${coloredName(gs.encounter.fleet)} salute you over comms, having heard of your good deeds.<br/>${gs.captain.calcInfamyForPlanet(gs.encounter.planet) > 25 ? `In their view, the good you've done far outweighs the bad.` : ''}`, [
                ['View', ()=>closeModal()],
                ['Ignore', ()=>endEncounter()],
                ['Attack', ()=>showPlayerAttackFleetModal(-2, 2, false, false)],
            ])
        }
        if (gs.encounter.luck[2]*gs.captain.calcReputationForPlanet(gs.encounter.planet) < 300 && gs.captain.calcBountyForPlanet(gs.encounter.planet) > 0) {
            showModal(coloredName(gs.encounter.fleet), `The $${coloredName(gs.encounter.fleet)} ships power up their weapons the instant you pass by!<br/>You have grown so notorious that even the government considers you a threat!`, [
                ['View', ()=>closeModal()],
                ['Surrender', ()=>gs.encounter.onSurrender()],
                ['Resist', ()=>showPlayerRefuseSurrenderModal(-2, 2)],
            ])
        }
        else {
            showModal(coloredName(gs.encounter.fleet), `The ${coloredName(gs.encounter.fleet)} ships blares a platriotic jingle extolling the greatness of ${coloredName(gs.encounter.planet)}.`, [
                ['View', ()=>closeModal()],
                ['Ignore', ()=>endEncounter()],
                ['Attack', ()=>showPlayerAttackFleetModal(-2, 2, false, false)],
            ])
        }
    }

    onVictory() {
        showPlayerDefeatedEnemyModal(-4)
    }

    onDefeat() {
        showPlayerDefeatedByPoliceModal()
    }

    onEscape() {
        showPlayerEscapedFromEnemyModal()
    }

    onSurrender() {
        showPlayerDidSurrenderModal(-1)
    }
}
