
// Officer class
class Officer {
    constructor(name = "Unnamed", credits = 0, fame = 0, infamy = 0, bounty = 0) {
        this.name = name;
        this.credits = credits;
        this.fame = fame;
        this.infamy = infamy;
        this.bounty = bounty;
        this.skills = new CountsMap();
        this.level = 1;
        this.skillPoints = STARTING_SKILL_POINTS;
        this.expPoints = 0;
        this.loans = []
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
        return Math.pow(1 + this.level, 2)*50
    }

    get crShare() {
        return Math.min(100, Math.round( Math.pow(1 + this.level, 1.5) )) / 100
    }

    get maxSubordinates() {
        return 1 + Math.floor(this.level / CAPTAIN_LEVELS_PER_OFFICER)
    }

    get totalLoans() {
        return this.loans.reduce()
    }
}