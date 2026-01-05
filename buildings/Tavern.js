/**
 * A building where you can hire officers
 * @class Tavern
 * @extends {Building}
 */
class Tavern extends Building {
    /**
     * @param {Planet} planet - The planet this academy is on.
     * @param {Moon} moon - The moon this building is on (null if on planet surface).
     */
    constructor(planet = new Planet(), isTavern = false, moon = null) {
        super(planet, BUILDING_TYPES.ACADEMY, moon)
        /** @type {boolean} */
        this.isTavern = isTavern;
        /** @type {Officer[]} */
        this.officers = [];
        this.normalize(true)
    }
    calcHirePrice(officer) {
        const basePrice = Math.round(officer.value * (1+this.planet.c.corruption) * this.planet.c.inflationRate / (this.isTavern ? this.planet.c.crime : this.planet.c.army))
        // Taverns don't charge taxes (similar to black market)
        if (this.isTavern) {
            return basePrice
        }
        return Math.round(basePrice * (1 + this.planet.c.taxRate))
    }
    get baseNumOfficers() {
        return GUILD_AVERAGE_NUM_OFFICERS * (this.isTavern ? this.planet.c.crime : this.planet.c.army) * this.planet.c.population * this.level
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
            // Filter for player-available factions only, and filter by criminal status (tavern = criminals, academy = non-criminals)
            // Neither stocks religious people
            const validFactionTypes = PLAYER_FACTIONS.filter(f => 
                !f.religious && (this.isTavern ? f.criminal : !f.criminal)
            )
            
            for (let i = 0; i < -officerDiffFromBase; i++) {
                const factionType = rndMember(validFactionTypes)
                this.officers.push(generateOfficer(this.planet, factionType))
            }
        }
    }
}
