/**
 * @class PirateTrapEncounter
 * @extends {PiratesEncounter}
 */
class PirateTrapEncounter extends PiratesEncounter {
    onStart() {
        // No option to talk or ignore - it's an immediate ambush
        showModal(coloredName(this.fleet), `It's a trap! The ${coloredName(this.fleet)} decloak from all around you!<br/>They fire warning shots and demand you surrender immediately!`, [
            ['Surrender', ()=>this.onSurrender()],
            ['Fight', ()=>this.showPlayerRefuseSurrenderModal()],
        ])
    }

    onVictory() {
        this.showPlayerDefeatedEnemyModal()
    }

    onDefeat() {
        this.showPlayerDefeatedByPiratesModal()
    }

    onEscape() {
        this.showPlayerEscapedFromEnemyModal()
    }

    onSurrender() {
        this.showPlayerDidSurrenderModal()
    }
}
