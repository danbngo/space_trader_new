/**
 * A building where officers can upgrade their skills.
 * @class Academy
 * @extends {Building}
 */
class Academy extends Building {
    /**
     * @param {Planet} planet - The planet this academy is on.
     * @param {Moon} moon - The moon this building is on (null if on planet surface).
     */
    constructor(planet = new Planet(), moon = null) {
        super(planet, BUILDING_TYPES.ACADEMY, moon)
    }
    calcSkillUpgradeCost(officer, skill = SKILLS_ALL[0]) {
        // Base cost scales exponentially with current skill level
        const baseCost = 250 * officer.calcSkillPointsToUpgrade(skill, false)
        const skillModifier = this.planet.c.skillPriceMultipliers.getAmount(skill) || 1
        return Math.ceil(baseCost * skillModifier * (1 + this.planet.c.corruption) * this.planet.c.inflationRate)
    }
    calcCanUpgradeSkill(officer, targetLevel = 1) {
        return this.planet.c.education * this.level * officer.level >= targetLevel
    }
}
