/**
 * Stores the state of a shipyard transaction for undo functionality.
 * @class ShipyardState
 */
class ShipyardState {
    /**
     * @param {Ship[]} playerShips - The player's ships at transaction start.
     * @param {number} playerCredits - The player's credits at transaction start.
     * @param {Ship[]} shipyardShips - The shipyard's ships at transaction start.
     * @param {number} shipyardCredits - The shipyard's credits at transaction start.
     */
    constructor(playerShips = [], playerCredits = 0, shipyardShips = [], shipyardCredits = 0) {
        /** @type {Ship[]} */
        this.playerShips = playerShips;
        /** @type {number} */
        this.playerCredits = playerCredits;
        /** @type {Ship[]} */
        this.shipyardShips = shipyardShips;
        /** @type {number} */
        this.shipyardCredits = shipyardCredits;
    }
}
