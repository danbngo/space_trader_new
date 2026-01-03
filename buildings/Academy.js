/**
 * A building where officers can upgrade their skills.
 * @class Academy
 * @extends {Building}
 */
class Academy extends Building {
    /**
     * @param {Planet} planet - The planet this academy is on.
     * @param {boolean} isTavern - Whether this is a tavern (less formal training establishment).
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
    calcSkillUpgradeCost(officer = new Officer(), skill = SKILLS_ALL[0]) {
        // Base cost scales exponentially with current skill level
        const baseCost = 250 * officer.calcSkillPointsToUpgrade(skill, false)
        const skillModifier = this.planet.c.skillPriceMultipliers.getAmount(skill) || 1
        return Math.ceil(baseCost * skillModifier * (1 + this.planet.c.corruption) * this.planet.c.inflation)
    }
    calcCanUpgradeSkill(officer = new Officer(), targetLevel = 1) {
        return this.planet.c.education * this.level * officer.level >= targetLevel
    }
    calcHirePrice(officer = new Officer()) {
        const basePrice = Math.round(officer.value * (1+this.planet.c.corruption) * this.planet.c.inflation / (this.isTavern ? this.planet.c.crime : this.planet.c.army))
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
            // Get valid faction types (not criminal or religious)
            const validFactionTypes = FACTION_TYPES_ALL.filter(f => !f.criminal && !f.religious)
            
            for (let i = 0; i < -officerDiffFromBase; i++) {
                const factionType = rndMember(validFactionTypes)
                this.officers.push(generateOfficer(this.planet, factionType))
            }
        }
    }
}
