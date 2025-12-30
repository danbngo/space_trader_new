/**
 * @class MerchantsEncounter
 * @extends {Encounter}
 */
class MerchantsEncounter extends Encounter {
    onStart() {
        if (gs.encounter.luck[0] * gs.fleet.totalRadar * (1+gs.fleet.totalSkills.getAmount(SKILLS.Stealth)/50) > gs.encounter.fleet.totalRadar) {
            showModal(coloredName(gs.encounter.fleet), 'Your long range sensors detect a merchant fleet before they detect you.<br/>You manage to approach them stealthily.', [
                ['View', ()=>closeModal()],
                ['Bypass', ()=>endEncounter()],
                ['Hail', ()=>{
                    gs.encounter.luck[0] = 0
                    gs.encounter.onStart()
                }],
                ['Sneak Attack', ()=>showPlayerAttackFleetModal(-1, 1, false, true)],
            ])
        }
        else if (gs.encounter.luck[1] * gs.captain.calcInfamyForPlanet(gs.encounter.planet) > 100) {
            showModal(coloredName(gs.encounter.fleet), `The ${coloredName(gs.encounter.fleet)} have heard of your fearsome deeds and start fleeing immediately!`, [
                ['View', ()=>closeModal()],
                ['Ignore', ()=>endEncounter()],
                ['Attack', ()=>showPlayerAttackFleetModal(-1, 1, false, true)],
            ])
        }
        else if (gs.encounter.luck[2] > .5) {
            showModal(coloredName(gs.encounter.fleet), `The ${coloredName(gs.encounter.fleet)} eagerly invite you to trade. They claim to have the best prices in the sector!`, [
                ['View', ()=>closeModal()],
                ['Trade', ()=>showTradeOfferModal()],
                ['Ignore', ()=>endEncounter()],
                ['Attack', ()=>showPlayerAttackFleetModal(-1, 1, false, true)],
            ])
        }
        else {
            showModal(coloredName(gs.encounter.fleet), `The ${coloredName(gs.encounter.fleet)} ignore you nervously.`, [
                ['View', ()=>closeModal()],
                ['Ignore', ()=>endEncounter()],
                ['Attack', ()=>showPlayerAttackFleetModal(-1, 1, false, true)],
            ])
        }
    }

    onVictory() {
        showPlayerDefeatedEnemyModal(-1)
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
