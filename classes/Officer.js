
// Officer class
class Officer {
    constructor(name = "Unnamed", level = 1, credits = 0, fame = 0, infamy = 0, bounty = 0, 
        skills = new CountsMap()) {
        this.name = name;
        this.credits = credits;
        this.fame = fame;
        this.infamy = infamy;
        this.bounty = bounty;
        this.skills = skills;
        this.level = level;
        this.expToNextLevel = Officer.calcExperienceToNextLevel(this.level)
    }

    static calcExperienceToNextLevel(currentLevel = 0) {
        return (1+Math.pow(currentLevel,2))*10
    }

    static calcCanLevelUp() {
        return this.expToNextLevel <= 0
    }

    get value() {
        console.log('getting officer value:',this,this.skills,this.skills.total)
        return Math.pow(1 + this.skills.total, 2)*10
    }

    get maxSubordinates() {
        return 1 + Math.floor(this.level / CAPTAIN_LEVELS_PER_OFFICER)
    }
}