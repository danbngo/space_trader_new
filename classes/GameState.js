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
        /** @type {any} */ // REMOVED: Encounter type
        this.encounter = null;
        /** @type {Combat|null} */
        this.combat = null;
        /** @type {Mission[]} */
        this.missions = [];
        /** @type {Mission[]} */
        this.oldMissions = [];
        /** @type {Map<Planet, Settlement>} - Memorized settlements from player's last visit */
        this.memorizedSettlements = new Map();
        /** @type {Map<Planet, number>} - Last visit dates (year) for each planet */
        this.lastVisitedDates = new Map();
        /** @type {Map<SpaceObject, number>} - Last seen dates (year) for each space object */
        this.lastSeenDates = new Map();
        /** @type {boolean} - Whether the game was saved this tick */
        this.savedThisTick = false;
        
        /** @type {Planet|SpaceStation|null} - Previous location before travel */
        this.previousLocation = null;
        /** @type {Planet|null} - Destination planet */
        this.destination = null;
        /** @type {number|null} - Remaining years of travel */
        this.travelYearsRemaining = null;
        /** @type {number|null} - Travel progress (0-100) */
        this.travelProgress = null;
        /** @type {number|null} - Year when travel started */
        this.travelStartYear = null;
    }

    get captain() {
        return this.fleet?.captain;
    }

    set captain(captain) {
        if (!this.fleet) {
            console.error('Cannot set captain: fleet is null');
            return;
        }
        this.fleet.captain = captain
    }

    get credits() {
        return this.captain.credits;
    }
    set credits(amt) {
        this.captain.credits = amt
    }

    get location() {
        return this.fleet.location
    }

    /**
     * Checks if the game has reached retirement age and displays game over screen.
     * @returns {boolean} True if game is over, false otherwise
     */
    checkGameOver() {
        // Calculate retirement age based on life extension perks
        let retirementAge = MAXIMUM_RETIREMENT_AGE
        if (this.captain.age < retirementAge) return false
        //game over - reached retirement age
        if (currentMap && currentMap.togglePause) currentMap.togglePause(true)
        let msg = ''
        msg += `Your captain has reached retirement age (${Math.round(retirementAge)})!<br/>Thank you for playing!<br/>`
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

        const reputationScore = this.captain.reputation.total * 5;
        const bountyScore = this.captain.bounty.total * -1;

        const total = shipsScore + creditsScore + officerScore + reputationScore + bountyScore + cargoScore;
        return { total, shipsScore, creditsScore, officerScore, reputationScore, bountyScore, cargoScore };
    }

    /**
     * Update travel time remaining (simple helper used by combat map)
     * @param {number} elapsedYears - Years elapsed since last update
     */
    updateTravelProgress(elapsedYears) {
        if (!this.destination || this.travelYearsRemaining === null) {
            return; // Not traveling
        }

        // Reduce remaining travel time
        this.travelYearsRemaining -= elapsedYears;
    }
}
