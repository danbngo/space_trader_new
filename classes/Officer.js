
// Officer class
class Officer {
    constructor(name = "Unnamed", credits = 0, fame = 0, infamy = 0, bounty = 0) {
        this.name = name;
        this.credits = credits;
        // Convert old number values to CountsMap if needed (for backwards compatibility)
        this.fame = (typeof fame === 'number') ? new CountsMap() : fame;
        this.infamy = (typeof infamy === 'number') ? new CountsMap() : infamy;
        this.bounty = (typeof bounty === 'number') ? new CountsMap() : bounty;
        // If we received numbers, we can't assign them to a planet, so leave maps empty
        this.skills = new CountsMap();
        this.level = 1;
        this.skillPoints = STARTING_SKILL_POINTS;
        this.expPoints = 0;
        this.loans = []
        this.fleet = null;
    }

    levelUp(autoImproveSkills = false) {
        this.expPoints -= this.expToNextLevel;
        this.level++;
        this.skillPoints += SKILL_POINTS_PER_LEVEL;
        if (autoImproveSkills) {
            this.autoImproveSkills();
        }
    }

    autoImproveSkills() {
        while (this.skillPoints > 0) {
            const skill = rndMember(SKILLS_ALL)
            this.skills.increment(skill, 1)
            this.skillPoints--
        }
    }

    get expToNextLevel() {
        return (1+Math.pow(this.level,2))*10
    }

    get canLevelUp() {
        return this.expPoints >= this.expToNextLevel
    }

    get value() {
        const totalSkillPoints = this.skills.total
        return Math.pow(1 + totalSkillPoints, 2)*100
    }

    get crShare() {
        if (this == gs.captain) return 0
        return Math.min(100, Math.round( Math.pow(1 + this.level, 1.5) )) / 100
    }

    get maxSubordinates() {
        return 1 + Math.floor(this.level / CAPTAIN_LEVELS_PER_OFFICER)
    }

    calcTotalDebts(onlyOverdue = false) {
        return this.loans.filter(l=>(!onlyOverdue || l.overdue)).reduce((total, loan) => total + loan.outstandingBalance, 0)
    }
}