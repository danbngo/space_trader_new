/**
 * A building where officers can be hired.
 * @class Guild
 * @extends {Building}
 */
class Guild extends Building {
    /**
     * @param {Planet} planet - The planet this guild is on.
     * @param {Officer[]} officers - The officers available for hire.
     */
    constructor(planet = new Planet(), officers = []) {
        super(planet, BUILDING_TYPES.GUILD)
        /** @type {Officer[]} */
        this.officers = officers; // Officer[]
        /** @type {number} */
        this.baseNumOfficers = officers.length
    }
    calcHirePrice(officer = new Officer()) {
        return Math.round(officer.value * (1+this.planet.civilization.corruption))
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
