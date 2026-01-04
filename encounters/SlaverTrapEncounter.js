/**
 * @class SlaverTrapEncounter
 * @extends {SlaversEncounter}
 */
class SlaverTrapEncounter extends SlaversEncounter {
    onStart() {
        // No option to talk or ignore - it's an immediate ambush
        const {enemyFleet} = this
        showModal('Ambush!', `It's a trap! The ${coloredName(enemyFleet)} decloak from all around you!<br/>Your ships and crew belong to us now. Surrender immediately or be destroyed!`, [
            ['Surrender', ()=>this.showPlayerDidSurrenderModal()],
            ['Fight', ()=>this.startCombat(false)],
        ])
    }

    onDefeat() {
        this.showPlayerDefeatedBySlaversModal()
    }

    onSurrender() {
        this.showPlayerDefeatedBySlaversModal()
    }

    onVictory() {
        this.showPlayerDefeatedEnemyModal()
    }

    onEscape() {
        this.showPlayerEscapedFromEnemyModal()
    }
}
