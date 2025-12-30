/**
 * @class SmugglersEncounter
 * @extends {Encounter}
 */
class SmugglersEncounter extends Encounter {
    onStart() {
        if (gs.encounter.luck[0] * gs.fleet.totalRadar * (1+gs.fleet.totalSkills.getAmount(SKILLS.Stealth)/50) > gs.encounter.fleet.totalRadar) {
            showModal(coloredName(gs.encounter.fleet), 'Your long range sensors detect a smuggler fleet before they detect you.<br/>You manage to approach them stealthily.', [
                ['View', ()=>closeModal()],
                ['Bypass', ()=>endEncounter()],
                ['Hail', ()=>{
                    gs.encounter.luck[0] = 0
                    gs.encounter.onStart()
                }],
                ['Sneak Attack', ()=>showPlayerAttackFleetModal(1, 0, false, true)],
            ])
        }
        else if (gs.encounter.luck[1] * gs.captain.calcFameForPlanet(gs.encounter.planet) > 100) {
            showModal(coloredName(gs.encounter.fleet), `The ${coloredName(gs.encounter.fleet)} have heard of your hostility towards the criminal community and quickly flee!`, [
                ['View', ()=>closeModal()],
                ['Ignore', ()=>endEncounter()],
                ['Attack', ()=>showPlayerAttackFleetModal(1, 0, false, true)],
            ])
        }
        else if (gs.encounter.luck[2] > .5) {
            showModal(coloredName(gs.encounter.fleet), `The ${coloredName(gs.encounter.fleet)} broadcast a rather seedy invitation to peruse their illicit wares.`, [
                ['View', ()=>closeModal()],
                ['Trade', ()=>showTradeOfferModal(false)],
                ['Ignore', ()=>endEncounter()],
                ['Attack', ()=>showPlayerAttackFleetModal(1, 0, false, true)],
            ])
        }
        else {
            showModal(coloredName(gs.encounter.fleet), `The ${coloredName(gs.encounter.fleet)} take no chances and start moving quickly away from you.`, [
                ['View', ()=>closeModal()],
                ['Ignore', ()=>endEncounter()],
                ['Attack', ()=>showPlayerAttackFleetModal(1, 0, false, true)],
            ])
        }
    }

    onVictory() {
        showPlayerDefeatedEnemyModal(1)
    }

    onDefeat() {
        showPlayerDefeatedByNeutralsModal(1)
    }

    onEscape() {
        showPlayerEscapedFromEnemyModal()
    }

    onSurrender() {
        gs.encounter.onDefeat()
    }
}
