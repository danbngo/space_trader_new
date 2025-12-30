/**
 * @class BountyHuntersEncounter
 * @extends {Encounter}
 */
class BountyHuntersEncounter extends Encounter {
    onStart() {
        if (gs.encounter.luck[0] * gs.fleet.totalRadar * (1+gs.fleet.totalSkills.getAmount(SKILLS.Stealth)/50) > gs.encounter.fleet.totalRadar) {
            showModal(coloredName(gs.encounter.fleet), 'Your long range sensors detect a bounty hunters fleet before they detect you.<br/>You manage to approach them stealthily.', [
                ['View', ()=>closeModal()],
                ['Bypass', ()=>endEncounter()],
                ['Hail', ()=>{
                    gs.encounter.luck[0] = 0
                    gs.encounter.onStart()
                }],
                ['Sneak Attack', ()=>showPlayerAttackFleetModal(-1, 1, false, false)],
            ])
        }
        else if (gs.encounter.luck[1] * gs.captain.calcBountyForPlanet(gs.encounter.planet) > 100) {
            showModal(coloredName(gs.encounter.fleet), `The ${coloredName(gs.encounter.fleet)} have heard of you and the active bounty on your head.<br/>They coldly inform you that they're here to collect one way or another.`, [
                ['View', ()=>closeModal()],
                ['Surrender', ()=>gs.encounter.onSurrender()],
                ['Resist', ()=>showPlayerRefuseSurrenderModal(-1, 1)],
            ])
        }
        else {
            showModal(coloredName(gs.encounter.fleet), `The ${coloredName(gs.encounter.fleet)} glide past your fleet in eerie silence.`, [
                ['View', ()=>closeModal()],
                ['Ignore', ()=>endEncounter()],
                ['Attack', ()=>showPlayerAttackFleetModal(-1, 1, false, false)],
            ])
        }
    }

    onVictory() {
        showPlayerDefeatedEnemyModal(-1)
    }

    onDefeat() {
        showFineOrJailModal()
    }

    onEscape() {
        showPlayerEscapedFromEnemyModal()
    }

    onSurrender() {
        showPlayerDidSurrenderModal(-1)
    }
}
