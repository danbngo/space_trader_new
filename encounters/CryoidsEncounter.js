/**
 * @class CryoidsEncounter
 * @extends {Encounter}
 */
class CryoidsEncounter extends Encounter {
    onStart() {
        if (gs.encounter.luck[0] * gs.fleet.totalRadar * (1+gs.fleet.totalSkills.getAmount(SKILLS.Pilot)/50) > gs.encounter.fleet.totalRadar) {
            showModal(coloredName(gs.encounter.fleet), `Your long range sensors detect an incoming cluster of ${coloredName(gs.encounter.fleet)}.<br/>You skillfully steer out of harm's way.<br/>Although, you could choose to plunge back in and mine them if you wish.`, [
                ['View', ()=>closeModal()],
                ['Bypass', ()=>endEncounter()],
                ['Mine', ()=>startCombat(true)],
            ])
        }
        else {
            showModal(coloredName(gs.encounter.fleet), `You encounter a brutal ${coloredName(gs.encounter.fleet)} storm! You must navigate carefully to avoid damage.`, [
                ['View', ()=>closeModal()],
                ['Auto-Navigate', ()=>autoNavigateHazard(gs.encounter)],
                ['Continue', ()=>startCombat(true)],
            ])
        }
    }

    onVictory() {
        showPlayerDefeatedHazardsModal()
    }

    onDefeat() {
        showPlayerDefeatedByHazardsModal()
    }

    onEscape() {
        showPlayerEscapedFromHazardsModal()
    }

    onSurrender() {
        // Not applicable for hazards
    }
}
