
/**
 * Represents an officer (player captain or crew member).
 * @class Officer
 */
class Officer {
    /**
     * @param {string} name - The name of the officer.
     * @param {number} credits - The credits owned by the officer.
     */
    constructor(name = "Unnamed", credits = 0) {
        /** @type {string} */
        this.name = name;
        /** @type {number} */
        this.credits = credits;
        // Convert old number values to CountsMap if needed (for backwards compatibility)
        /** @type {CountsMap} */
        this.fame = new CountsMap()
        /** @type {CountsMap} */
        this.infamy = new CountsMap();
        /** @type {CountsMap} */
        this.bounty = new CountsMap();
        // If we received numbers, we can't assign them to a planet, so leave maps empty
        /** @type {CountsMap} */
        this.skills = new CountsMap();
        /** @type {number} */
        this.level = 1;
        /** @type {number} */
        this.skillPoints = STARTING_SKILL_POINTS;
        /** @type {number} */
        this.numPerkPoints = 0;
        /** @type {number} */
        this.expPoints = 0;
        /** @type {BankLoan[]} */
        this.loans = []
        /** @type {Fleet} */
        this.fleet = null;
        /** @type {CyberImplant[]} */
        this.implants = [];
        /** @type {Map<Planet, RankType>} */
        this.ranks = new Map();
        /** @type {PerkType[]} */
        this.perks = [];
        /** @type {number} */
        this.age = 25; // Default age
        /** @type {Race} */
        this.race = RACES.HUMAN; // Default race
        /** @type {Religion|null} */
        this.religion = null; // Religion affiliation
        /** @type {Map<EquipmentSlot, Equipment>} */
        this.equipment = new Map();
    }

    grantExperience(amount = 0, autoLevelUp = (this !== gs.captain), autoImproveSkills = (this !== gs.captain)) {
        let msg = ''
        this.expPoints += amount;
        if (this == gs.captain) {
            msg += `You gained ${amount} experience points.<br/>`;
        }
        if (this.canLevelUp) {
            const oldLevel = this.level
            if (this == gs.captain) msg += colorSpan(`You leveled up to level ${this.level + 1}!<br/>`, COLORS.LightGreen);
            while (autoLevelUp && this.canLevelUp) {
                this.levelUp(autoImproveSkills);
            }
            // Check if perk point was earned
            if (this == gs.captain && Math.floor(this.level / 3) > Math.floor(oldLevel / 3)) {
                msg += colorSpan(`You earned a perk point!<br/>`, COLORS.Gold);
            }
        }
        return msg
    }

    grantInfamy(planet = new Planet(), amount = 1) {
        this.infamy.increment(planet, amount);
        if (this == gs.captain) {
            return colorSpan(`You ${amount >= 0 ? 'gained' : 'lost'} ${Math.abs(amount)} infamy on ${coloredName(planet)}.<br/>`, amount >= 0 ? COLORS.LightRed : COLORS.LightGreen);
        }
        return ''
    }

    grantFame(planet = new Planet(), amount = 1) {
        this.fame.increment(planet, amount);
        if (this == gs.captain) {
            return colorSpan(`You ${amount >= 0 ? 'gained' : 'lost'} ${Math.abs(amount)} fame on ${coloredName(planet)}.<br/>`, amount >= 0 ? COLORS.LightGreen : COLORS.LightRed);
        }
        return ''
    }

    grantFactionInfamy(faction = FACTION_TYPES_ALL[0], amount = 1) {
        this.infamy.increment(faction, amount);
        if (this == gs.captain) {
            return colorSpan(`You ${amount >= 0 ? 'gained' : 'lost'} ${Math.abs(amount)} infamy with ${faction.symbol} ${colorSpan(faction.name, faction.color)}.<br/>`, amount >= 0 ? COLORS.LightRed : COLORS.LightGreen);
        }
        return ''
    }

    grantFactionFame(faction = FACTION_TYPES_ALL[0], amount = 1) {
        this.fame.increment(faction, amount);
        if (this == gs.captain) {
            return colorSpan(`You ${amount >= 0 ? 'gained' : 'lost'} ${Math.abs(amount)} fame with ${faction.symbol} ${colorSpan(faction.name, faction.color)}.<br/>`, amount >= 0 ? COLORS.LightGreen : COLORS.LightRed);
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
            return colorSpan(`You ${amount >= 0 ? 'gained' : 'lost'} ${Math.abs(amount)} bounty on ${coloredName(planet)}.<br/>`, amount >= 0 ? COLORS.LightRed : COLORS.LightGreen);
        }
        return ''
    }

    calcSkillPointsToUpgrade(skill = SKILLS_ALL[0], rounded = true) {
        const points = (1+this.skills.getAmount(skill)) / 1.5
        return rounded ? Math.ceil(points) : points
    }

    levelUp(autoImproveSkills = false) {
        this.expPoints -= this.expToNextLevel;
        this.level++;
        this.skillPoints += SKILL_POINTS_PER_LEVEL;
        // Grant a perk point every 3 levels
        if (this.level % 3 === 0) {
            this.numPerkPoints += 1;
        }
        if (autoImproveSkills) {
            this.autoImproveSkills();
        }
    }

    autoImproveSkills() {
        let attempts = 100
        while (this.skillPoints > 0 && attempts-- > 0) {
            const skill = rndMember(SKILLS_ALL)
            const costToUpgrade = this.calcSkillPointsToUpgrade(skill)
            if (this.skillPoints >= costToUpgrade) {
                this.skills.increment(skill, 1)
                this.skillPoints -= costToUpgrade
            }
        }
    }

    get expToNextLevel() {
        return (1+Math.pow(this.level,2))*25
    }

    get canLevelUp() {
        return this.expPoints >= this.expToNextLevel
    }

    get value() {
        const totalSkillPoints = this.skills.total
        return Math.pow(1 + totalSkillPoints, 2)*10
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