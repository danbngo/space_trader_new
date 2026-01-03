
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
        /** @type {CountsMap} Stores reputation for both planets and factions */
        this.reputation = new CountsMap();
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
        /** @type {Religion} */
        this.religion = RELIGION_AGNOSTICISM; // Religion affiliation, default to Agnosticism
        /** @type {Map<EquipmentSlot, Equipment>} */
        this.equipment = new Map();
    }

    /**
     * Grants experience points to the officer and handles level ups.
     * @param {number} amount - The amount of experience to grant.
     * @param {boolean} autoLevelUp - Whether to automatically level up when possible.
     * @param {boolean} autoImproveSkills - Whether to automatically spend skill points.
     * @returns {string} Message describing what happened.
     */
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

    /**
     * Grants reputation on a specific planet or with a faction.
     * @param {Planet|FactionType} target - The planet or faction to gain reputation with.
     * @param {number} amount - The amount of reputation to grant (can be negative).
     * @returns {string} Message describing the reputation change.
     */
    grantReputation(target, amount = 1) {
        this.reputation.increment(target, amount);
        if (this == gs.captain) {
            const targetName = target.name ? coloredName(target) : (target instanceof FactionType ? `${target.symbol} ${colorSpan(target.name, target.color)}` : target);
            return colorSpan(`You ${amount >= 0 ? 'gained' : 'lost'} ${Math.abs(amount)} reputation with ${targetName}.<br/>`, amount >= 0 ? COLORS.LightGreen : COLORS.LightRed);
        }
        return ''
    }

    /**
     * Calculates total reputation for a planet or faction (specific + global average).
     * @param {Planet|FactionType} target - The planet or faction to calculate reputation for.
     * @returns {number} The calculated reputation value.
     */
    calcReputationForTarget(target) {
        return Math.max(this.reputation.getAmount(target), this.reputation.total / (gs.system?.planets?.length || 20))
    }

    /**
     * Calculates total bounty for a planet (planet-specific + global average).
     * @param {Planet} planet - The planet to calculate bounty for.
     * @returns {number} The calculated bounty value.
     */
    calcBountyForPlanet(planet = new Planet()) {
        return Math.max(this.bounty.getAmount(planet), this.bounty.total / gs.system.planets.length)
    }

    /**
     * Grants a bounty on a specific planet.
     * @param {Planet} planet - The planet to add bounty on.
     * @param {number} amount - The amount of bounty to add (can be negative).
     * @returns {string} Message describing the bounty change.
     */
    grantBounty(planet = new Planet(), amount = 1) {
        this.bounty.increment(planet, amount);
        if (this == gs.captain) {
            return colorSpan(`You ${amount >= 0 ? 'gained' : 'lost'} ${Math.abs(amount)} bounty on ${coloredName(planet)}.<br/>`, amount >= 0 ? COLORS.LightRed : COLORS.LightGreen);
        }
        return ''
    }

    /**
     * Calculates the skill points required to upgrade a specific skill.
     * @param {SkillType} skill - The skill to calculate upgrade cost for.
     * @param {boolean} rounded - Whether to round up the result.
     * @returns {number} The number of skill points required.
     */
    calcSkillPointsToUpgrade(skill = SKILLS_ALL[0], rounded = true) {
        const points = (1+this.skills.getAmount(skill)) / 1.5
        return rounded ? Math.ceil(points) : points
    }

    /**
     * Levels up the officer, consuming exp and granting skill/perk points.
     * @param {boolean} autoImproveSkills - Whether to automatically spend skill points.
     */
    levelUp(autoImproveSkills = false) {
        this.expPoints -= this.expToNextLevel;
        this.level++;
        this.skillPoints += SKILL_POINTS_PER_LEVEL;
        // Grant a perk point every 3 levels
        if (this.level % 3 === 0) {
            this.numPerkPoints += 1;
        }
        
        // Auto-grant race automatic perks if level threshold is met
        if (this.race && this.race.automaticPerks) {
            for (const perk of this.race.automaticPerks) {
                // Check if officer meets level requirement and doesn't already have this perk
                if (this.level >= perk.minLevel && !this.perks.includes(perk)) {
                    this.perks.push(perk)
                    if (this === gs.captain) {
                        console.log(`Auto-granted perk: ${perk.name}`)
                    }
                }
            }
        }
        
        if (autoImproveSkills) {
            this.autoImproveSkills();
        }
    }

    /**
     * Automatically spends available skill points on random skills.
     */
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

    /**
     * Calculates the total outstanding debt from all loans.
     * @param {boolean} onlyOverdue - Whether to only count overdue loans.
     * @returns {number} The total debt amount.
     */
    calcTotalDebts(onlyOverdue = false) {
        return this.loans.filter(l=>(!onlyOverdue || l.overdue)).reduce((total, loan) => total + loan.outstandingBalance, 0)
    }
}