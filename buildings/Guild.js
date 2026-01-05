/**
 * A building where officers can be hired.
 * @class Guild
 * @extends {Building}
 */
class Guild extends Building {
    /**
     * @param {Planet} planet - The planet this guild is on.
     * @param {Moon} moon - The moon this building is on (null if on planet surface).
     */
    constructor(planet = new Planet(), moon = null) {
        super(planet, BUILDING_TYPES.GUILD, moon)
        /** @type {Contract[]} */
        this.contracts = []; // Contract[]
        this.normalize(true)
    }
    calcHirePrice(officer) {
        const basePrice = Math.round(officer.value * (1+this.planet.c.corruption) * this.planet.c.inflation / this.planet.c.army)
        return Math.round(basePrice * (1 + this.planet.c.taxes))
    }
    get baseNumOfficers() {
        const multiplier = this.planet?.objectType?.powerMultiplier ?? 1
        return GUILD_AVERAGE_NUM_OFFICERS*this.planet.c.army*this.level*multiplier
    }
    get baseNumContracts() {
        const multiplier = this.planet?.objectType?.powerMultiplier ?? 1
        return Math.round(GUILD_AVERAGE_NUM_CONTRACTS*this.planet.c.economy*this.level*multiplier)
    }
    normalize(clearExisting = false) {
        super.normalize()
        if (clearExisting) {
            this.officers = []
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
