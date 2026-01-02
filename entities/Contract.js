/**
 * Represents a contract/quest that the player can accept.
 * @class Contract
 */
class Contract {
    /**
     * @param {ContractType} contractType - The type of contract.
     * @param {Planet} planet - The planet where the contract originates.
     * @param {Planet} [targetPlanet] - The destination planet (if applicable).
     * @param {number} [expirationDate] - When the contract expires (game time).
     * @param {CargoType} [cargoType] - The type of cargo involved (if applicable).
     * @param {number} [amount] - Amount of cargo or credits (if applicable).
     * @param {number} [reward] - The reward for completing the contract.
     * @param {string} [description] - A description of the contract.
     */
    constructor(
        contractType = CONTRACT_TYPES_ALL[0],
        planet = new Planet(),
        targetPlanet = null,
        expirationDate = 0,
        cargoType = null,
        amount = 0,
        reward = 0,
        description = ''
    ) {
        /** @type {ContractType} */
        this.contractType = contractType;
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
        /** @type {string} */
        this.description = description;
    }

    get isExpired() {
        return this.expirationDate > 0 && gs.year > this.expirationDate;
    }

    get value() {
        return this.reward || 1000; // Base value if no reward specified
    }
}
