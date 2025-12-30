/**
 * A building where officers can be hired.
 * @class Guild
 * @extends {Building}
 */
class Guild extends Building {
    /**
     * @param {Planet} planet - The planet this guild is on.
     */
    constructor(planet = new Planet()) {
        super(planet, BUILDING_TYPES.GUILD)
        /** @type {Officer[]} */
        this.officers = []; // Officer[]
        /** @type {Contract[]} */
        this.contracts = []; // Contract[]
        this.normalize(true)
    }
    calcHirePrice(officer = new Officer()) {
        const basePrice = Math.round(officer.value * (1+this.planet.civilization.corruption) * this.planet.civilization.inflation / this.planet.civilization.army)
        return Math.round(basePrice * (1 + this.planet.civilization.taxes))
    }
    get baseNumOfficers() {
        return GUILD_AVERAGE_NUM_OFFICERS*this.planet.civilization.army
    }
    get baseNumContracts() {
        return Math.round(GUILD_AVERAGE_NUM_CONTRACTS*this.planet.civilization.economy)
    }
    normalize(clearExisting = false) {
        super.normalize()
        if (clearExisting) {
            this.officers = []
            this.contracts = []
        }
        const officerDiffFromBase = this.officers.length - this.baseNumOfficers
        if (officerDiffFromBase > 0) {
            this.officers.splice(0, officerDiffFromBase)
        } else if (officerDiffFromBase < 0) {
            for (let i = 0; i < -officerDiffFromBase; i++) {
                this.officers.push(generateOfficer(this.planet))
            }
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
