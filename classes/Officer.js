
// Officer class
class Officer {
    constructor(name = "Unnamed", credits = 0, fame = 0, infamy = 0, bounty = 0, pilotSkill = 0, engineerSkill = 0, negotiationSkill = 0) {
        this.name = name;
        this.credits = credits;
        this.fame = fame;
        this.infamy = infamy;
        this.bounty = bounty;
        this.pilotSkill = pilotSkill;
        this.engineerSkill = engineerSkill;
        this.negotiationSkill = negotiationSkill;
    }

    get value() {
        return Math.pow(1 + this.pilotSkill + this.engineerSkill + this.negotiationSkill, 2)*100
    }
}