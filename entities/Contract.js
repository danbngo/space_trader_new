/**
 * Represents a mission/quest that the player can accept.
 * @class Mission
 */
class Mission {
    /**
     * @param {MissionType} missionType - The type of mission.
     * @param {Planet} planet - The planet where the mission originates.
     * @param {Planet} [targetPlanet] - The destination planet (if applicable).
     * @param {number} [expirationDate] - When the mission expires (game time).
     * @param {CargoType} [cargoType] - The type of cargo involved (if applicable).
     * @param {number} [amount] - Amount of cargo or credits (if applicable).
     * @param {number} [reward] - The reward for completing the mission.
     * @param {string} [description] - A description of the mission.
     */
    constructor(
        missionType = MISSION_TYPES_ALL[0],
        planet = new Planet(),
        targetPlanet = null,
        expirationDate = 0,
        cargoType = null,
        amount = 0,
        reward = 0,
    ) {
        /** @type {string} */
        this.uuid = generateUUID('mission_')
        /** @type {MissionType} */
        this.missionType = missionType;
        /** @type {Planet} */
        this.planet = planet;
        /** @type {Planet|null} */
        this.targetPlanet = targetPlanet;
        /** @type {number} */
        this.expirationDate = expirationDate;
        /** @type {CargoType|null} */
        this.cargoType = cargoType;
        /** @type {number} */
        this.amount = amount;
        /** @type {number} */
        this.reward = reward;
        
        gameRegistry.registerMission(this)
    }

    get description() {
        //stuff here
    }

    get isExpired() {
        return this.expirationDate > 0 && gs.year > this.expirationDate;
    }

    get value() {
        return this.reward || 1000; // Base value if no reward specified
    }
}
