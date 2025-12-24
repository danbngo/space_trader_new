
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

    grantExperience(amount = 0, autoLevelUp = (this !== gs.captain), autoImproveSkills = (this !== gs.captain)) {
        let msg = ''
        this.expPoints += amount;
        if (this == gs.captain) {
            msg += `You gained ${amount} experience points.\n`;
        }
        if (this.canLevelUp) {
            if (this == gs.captain) msg += colorSpan(`You leveled up to level ${this.level + 1}!\n`, colorArrToRgbaString(COLORS.LightGreen), true);
            while (autoLevelUp && this.canLevelUp) {
                this.levelUp(autoImproveSkills);
            }
        }
    }

    grantInfamy(planet = new Planet(), amount = 1) {
        this.infamy.increment(planet, amount);
        if (this == gs.captain) {
            return colorSpan(`You ${amount >= 0 ? 'gained' : 'lost'} ${Math.abs(amount)} infamy on ${planet.name}.<br/>`, colorArrToRgbaString(amount >= 0 ? COLORS.LightRed : COLORS.LightGreen));
        }
        return ''
    }

    grantFame(planet = new Planet(), amount = 1) {
        this.fame.increment(planet, amount);
        if (this == gs.captain) {
            return colorSpan(`You ${amount >= 0 ? 'gained' : 'lost'} ${Math.abs(amount)} fame on ${planet.name}.<br/>`, colorArrToRgbaString(amount >= 0 ? COLORS.LightGreen : COLORS.LightRed));
        }
        return ''
    }

    calcInfamyForPlanet(planet = new Planet()) {
        return Math.max(this.infamy.getAmount(planet), this.infamy.total / gs.system.planets.length)
    }

    calcFameForPlanet(planet = new Planet()) {
        return Math.max(this.fame.getAmount(planet), this.fame.total / gs.system.planets.length)
    }
    
    calcReputationForPlanet(planet = new Planet()) {
        return this.calcFameForPlanet(planet) - this.calcInfamyForPlanet(planet)
    }

    calcBountyForPlanet(planet = new Planet()) {
        return Math.max(this.bounty.getAmount(planet), this.bounty.total / gs.system.planets.length)
    }

    grantBounty(planet = new Planet(), amount = 1) {
        this.bounty.increment(planet, amount);
        if (this == gs.captain) {
            return colorSpan(`You ${amount >= 0 ? 'gained' : 'lost'} ${Math.abs(amount)} bounty on ${planet.name}.<br/>`, colorArrToRgbaString(amount >= 0 ? COLORS.LightRed : COLORS.LightGreen));
        }
        return ''
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