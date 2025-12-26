/**
 * Represents the overall state of the game, including the player's fleet, captain, and current star system.
 * @class GameState
 */
class GameState {
    constructor() {
        console.log('instantiating gameState for star system:');
        /** @type {number} */
        this.year = GAME_START_YEAR;
        /** @type {StarSystem} */
        this.system = null;
        /** @type {Fleet} */
        this.fleet = null;
        /** @type {Encounter} */
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
