/**
 * @class PoliceEncounter
 * @extends {Encounter}
 */
class PoliceEncounter extends Encounter {
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
        else if (gs.encounter.luck[1]*gs.captain.calcReputationForPlanet(gs.encounter.planet) > 200) {
            showModal(coloredName(gs.encounter.fleet), `The ${coloredName(gs.encounter.fleet)} greet you respectfully, having heard of your good deeds.<br/>They don't even trouble you with the routine inspection.`, [
                ['View', ()=>closeModal()],
                ['Ignore', ()=>endEncounter()],
                ['Attack', ()=>showPlayerAttackFleetModal(-2, 2, false, false)],
            ])
        }
        if (gs.encounter.luck[2]*gs.captain.calcInfamyForPlanet(gs.encounter.planet) > 50 && gs.captain.calcBountyForPlanet(gs.encounter.planet) > 0) {
            showModal(coloredName(gs.encounter.fleet), `The ${coloredName(gs.encounter.fleet)} activate their sirens the instant you pass by!<br/>It seems your bad reputation has preceded you.`, [
                ['View', ()=>closeModal()],
                ['Surrender', ()=>gs.encounter.onSurrender()],
                ['Resist', ()=>showPlayerRefuseSurrenderModal(-2, 2)],
            ])
        }
        else if (gs.encounter.luck[3] < 0.5) {
            showModal(coloredName(gs.encounter.fleet), `The ${coloredName(gs.encounter.fleet)} ships pull alongside your fleet and order you to submit to a routine inspection.`, [
                ['View', ()=>closeModal()],
                ['Accept', ()=>showPlayerPoliceInspectionModal()],
                ['Resist', ()=>showPlayerRefuseSurrenderModal(-2, 2)],
            ])
        }
        else {
            showModal(coloredName(gs.encounter.fleet), `The ${coloredName(gs.encounter.fleet)} ships speed past your fleet, perhaps responding to some other incident.`, [
                ['View', ()=>closeModal()],
                ['Ignore', ()=>endEncounter()],
                ['Attack', ()=>showPlayerAttackFleetModal(-2, 2, false, false)],
            ])
        }
    }

    onVictory() {
        showPlayerDefeatedEnemyModal(-2)
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
