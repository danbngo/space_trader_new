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
        this.normalize(true)
    }
    calcHirePrice(officer = new Officer()) {
        return Math.round(officer.value * (1+this.planet.civilization.corruption) * this.planet.civilization.inflation / this.planet.civilization.army)
    }
    get baseNumOfficers() {
        return GUILD_AVERAGE_NUM_OFFICERS*this.planet.civilization.army
    }
    normalize(clearExisting = false) {
        super.normalize()
        if (clearExisting) {
            this.officers = []
        }
        const officerDiffFromBase = this.officers.length - this.baseNumOfficers
        if (officerDiffFromBase > 0) {
            this.officers.splice(0, officerDiffFromBase)
        } else if (officerDiffFromBase < 0) {
            for (let i = 0; i < -officerDiffFromBase; i++) {
                this.officers.push(generateOfficer(this.planet))
            }
        }
    }
}
