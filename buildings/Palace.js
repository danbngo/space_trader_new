/**
 * A building where the player can take on government contracts and advance their rank.
 * @class Palace
 * @extends {Building}
 */
class Palace extends Building {
    /**
     * @param {Planet} planet - The planet this palace is on.
     * @param {Moon} moon - The moon this building is on (null if on planet surface).
     */
    constructor(planet = new Planet(), moon = null) {
        super(planet, BUILDING_TYPES.PALACE, moon)
        /** @type {Contract[]} */
        this.contracts = []; // Contract[]
        this.normalize(true)
    }

    get baseNumContracts() {
        return Math.round(PALACE_AVERAGE_NUM_CONTRACTS * this.planet.c.culture/this.planet.c.corruption)
    }

    normalize(clearExisting = false) {
        super.normalize()
        if (clearExisting) {
            this.contracts = []
        }
        
        const contractDiffFromBase = this.contracts.length - this.baseNumContracts
        if (contractDiffFromBase > 0) {
            this.contracts.splice(0, contractDiffFromBase)
        } else if (contractDiffFromBase < 0) {
            for (let i = 0; i < -contractDiffFromBase; i++) {
                this.contracts.push(generateContract(this.planet))
            }
        }
    }
}
