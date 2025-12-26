/**
 * @class GameState
 * @description Represents the overall state of the game, including the player's fleet, captain, and current star system.
 * @property {number} year - The current year in the game.
 * @property {StarSystem} system - The current star system the player is in.
 * @property {Fleet} fleet - The player's fleet.
 * @property {Encounter|null} encounter - The current encounter, if any.
 */


class GameState {
    constructor() {
        console.log('instantiating gameState for star system:');
        this.year = GAME_START_YEAR;
        this.system = null;
        this.fleet = null;
        this.encounter = null;
    }

    get captain() {
        return this.fleet.captain;
    }

    set captain(captain) {
        this.fleet.captain = captain
    }

    get credits() {
        return this.captain.credits;
    }
    set credits(amt) {
        this.captain.credits = amt
    }

    get loans() {
        return this.captain.loans
    }

    get location() {
        return this.fleet.location
    }
}
