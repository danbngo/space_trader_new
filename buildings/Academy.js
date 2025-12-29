/**
 * A building where officers can upgrade their skills.
 * @class Academy
 * @extends {Building}
 */
class Academy extends Building {
    /**
     * @param {Planet} planet - The planet this academy is on.
     * @param {CountsMap} skillCosts - Skill cost modifiers (0.5-2 range).
     */
    constructor(planet = new Planet(), skillCosts = new CountsMap()) {
        super(planet, BUILDING_TYPES.ACADEMY)
        /** @type {CountsMap} */
        this.skillCosts = skillCosts // CountsMap with skill cost modifiers (0.5-2 range)
    }
    calcSkillUpgradeCost(officer = new Officer(), skill = SKILLS_ALL[0]) {
        // Base cost scales exponentially with current skill level
        const baseCost = 250 * officer.calcSkillPointsToUpgrade(skill, false)
        const skillModifier = this.skillCosts.getAmount(skill) || 1
        return Math.ceil(baseCost * skillModifier * (1 + this.planet.civilization.corruption))
    }
}
