/**
 * @class PiratesEncounter
 * @extends {Encounter}
 */
class PiratesEncounter extends Encounter {
    onStart() {
        if (gs.encounter.luck[0] * gs.fleet.totalRadar * (1+gs.fleet.totalSkills.getAmount(SKILLS.Stealth)/50) > gs.encounter.fleet.totalRadar) {
            showModal(coloredName(gs.encounter.fleet), `Your long range sensors detect a ${coloredName(gs.encounter.fleet)} fleet before they detect you.<br/>You manage to approach the ${coloredName(gs.encounter.fleet)} stealthily.`, [
                ['View', ()=>closeModal()],
                ['Bypass', ()=>endEncounter()],
                ['Hail', ()=>{
                    gs.encounter.luck[0] = 0
                    gs.encounter.onStart()
                }],
                ['Sneak Attack', ()=>showPlayerAttackFleetModal(1, 0, false, false)],
            ])
        }
        else if (gs.encounter.luck[1] * gs.captain.calcReputationForPlanet(gs.encounter.planet) > 200) {
            showModal(coloredName(gs.encounter.fleet), `The ${coloredName(gs.encounter.fleet)} are in awe of your fearsome exploits! They broadcast a merry jig and salute you while you pass.`, [
                ['View', ()=>closeModal()],
                ['Ignore', ()=>endEncounter()],
                ['Attack', ()=>showPlayerAttackFleetModal(1, 0, false, true)],
            ])
        }
        else if (gs.encounter.luck[2] < 0.5) {
            showModal(coloredName(gs.encounter.fleet), `The ${coloredName(gs.encounter.fleet)} fire warning shots at your ship!<br/>They demand you surrender and prepare to be boarded!`, [
                ['View', ()=>closeModal()],
                ['Surrender', ()=>gs.encounter.onSurrender()],
                ['Resist', ()=>showPlayerRefuseSurrenderModal(1, 0)],
            ])
        }
        else {
            showModal(coloredName(gs.encounter.fleet), `The ${coloredName(gs.encounter.fleet)} broadcast insults and jeers at your fleet, but let you pass regardless.`, [
                ['View', ()=>closeModal()],
                ['Ignore', ()=>endEncounter()],
                ['Attack', ()=>showPlayerAttackFleetModal(1, 0, false, false)],
            ])
        }
    }

    onVictory() {
        showPlayerDefeatedEnemyModal(1)
    }

    onDefeat() {
        showPlayerDefeatedByPiratesModal()
    }

    onEscape() {
        showPlayerEscapedFromEnemyModal()
    }

    onSurrender() {
        showPlayerDidSurrenderModal(1)
    }
}
