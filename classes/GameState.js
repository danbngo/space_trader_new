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
        /** @type {Contract[]} */
        this.contracts = [];
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

    /**
     * Checks if the game has reached the end year and displays game over screen.
     * @returns {boolean} True if game is over, false otherwise
     */
    checkGameOver() {
        if (this.year < GAME_END_YEAR) return false
        //game over - reached end of time period
        if (currentMap && currentMap.togglePause) currentMap.togglePause(true)
        let msg = ''
        msg += `Congratulations, you have reached the end of the year ${GAME_END_YEAR}!<br/>Thank you for playing!<br/>`
        const scoreDetails = this.calcPlayerScore()
        msg += `Your final score is ${scoreDetails.total} points.<br/>`
        msg += `Score breakdown:<br/>`
        msg += `* Ships: ${scoreDetails.shipsScore}<br/>`
        msg += `* Credits: ${scoreDetails.creditsScore}<br/>`
        msg += `* Officers: ${scoreDetails.officerScore}<br/>`
        msg += `* Cargo: ${scoreDetails.cargoScore}<br/>`
        msg += `* Fame: ${scoreDetails.fameScore}<br/>`
        msg += `* Infamy: ${scoreDetails.infamyScore}<br/>`
        msg += `* Bounty: ${scoreDetails.bountyScore}<br/>`
        showModal('Game Over', msg, [['Restart Game', ()=> startNewGame()]])
        return true
    }

    /**
     * Calculates the player's final score based on various factors.
     * @returns {Object} Score breakdown object with total and individual scores
     */
    calcPlayerScore() {
        let shipsScore = 0;
        for (const ship of this.fleet.ships) {
            shipsScore += Math.round(ship.value);
        }

        let creditsScore = this.credits;

        let officerScore = 0;
        for (const officer of this.captain.fleet.officers) {
            officerScore += Math.round(officer.value);
        }

        let cargoScore = 0;
        for (const [ct,amt] of this.fleet.cargo.counts) {
            console.log('ct, amt:', ct, amt);
            cargoScore += (ct.value || 0) * (amt || 0);
        }

        const fameScore = this.captain.fame.total * 10;
        const infamyScore = this.captain.infamy.total * -10;
        const bountyScore = this.captain.bounty.total * -1;

        const total = shipsScore + creditsScore + officerScore + fameScore + infamyScore + bountyScore + cargoScore;
        return { total, shipsScore, creditsScore, officerScore, fameScore, infamyScore, bountyScore, cargoScore };
    }
}
