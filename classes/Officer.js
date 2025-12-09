
// Officer class
class Officer {
    constructor(name = "Unnamed", credits = 0, fame = 0, infamy = 0, bounty = 0,
        skills = new CountsMap([[SKILLS.Diplomacy,1],[SKILLS.Engineering,1],[SKILLS.Navigation,1]])) {
        this.name = name;
        this.credits = credits;
        this.fame = fame;
        this.infamy = infamy;
        this.bounty = bounty;
        this.skills = skills;
    }

    get value() {
        return Math.pow(1 + this.skills.total, 2)*10
    }
}