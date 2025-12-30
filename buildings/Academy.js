/**
 * A building where officers can upgrade their skills.
 * @class Academy
 * @extends {Building}
 */
class Academy extends Building {
    /**
     * @param {Planet} planet - The planet this academy is on.
     */
    constructor(planet = new Planet()) {
        super(planet, BUILDING_TYPES.ACADEMY)
    }
    calcSkillUpgradeCost(officer = new Officer(), skill = SKILLS_ALL[0]) {
        // Base cost scales exponentially with current skill level
        const baseCost = 250 * officer.calcSkillPointsToUpgrade(skill, false)
        const skillModifier = this.planet.civilization.skillPriceModifiers.getAmount(skill) || 1
        return Math.ceil(baseCost * skillModifier * (1 + this.planet.civilization.corruption) * this.planet.civilization.inflation)
    }
    calcCanUpgradeSkill(officer = new Officer(), targetLevel = 1) {
        return this.planet.civilization.education * officer.level >= targetLevel
    }
}
