/**
 * Represents an officer (player captain or crew member).
 * @class Officer
 */
class Officer {
    /**
     * @param {string} name - The name of the officer.
     * @param {Planet|null} planet - The planet the officer is from.
     * @param {number} age - The age of the officer
     * @param {number} credits - The credits owned by the officer.
     */
    constructor(name = "Unnamed", planet = new Planet(), age = 25, credits = 0) {
        /** @type {string} */
        this.uuid = generateUUID('officer_')
        /** @type {string} */
        this.name = name;
        /** @type {Planet} */
        this.planet = planet;
        /** @type {number} */
        this.age = age
        /** @type {number} */
        this.credits = credits;
        // Convert old number values to CountsMap if needed (for backwards compatibility)
        /** @type {CountsMap} Stores reputation for planets */
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
        this.expPoints = 0;
        /** @type {Fleet} */
        this.fleet = null;
        /** @type {Map<Planet, RankType>} */
        this.ranks = new Map();
        
        // Temporary properties used during deserialization (SaveManager)
        /** @type {string} */
        this._planetUUID = undefined;
        /** @type {string} */
        this._fleetUUID = undefined;
        
        gameRegistry.registerOfficer(this)
    }

    get bonusSkills() {
        const skillBonuses = new CountsMap()
        // No faction-based skill bonuses
        return skillBonuses
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
        msg += `You gained ${amount} experience points.<br/>`;
        if (this.canLevelUp) {
            const oldLevel = this.level
            msg += colorSpan(`You leveled up to level ${this.level + 1}!<br/>`, COLORS.LightGreen);
            while (autoLevelUp && this.canLevelUp) {
                this.levelUp(autoImproveSkills);
            }
        }
        return msg
    }

    /**
     * Grants reputation on a specific planet.
     * @param {Planet} target - The planet to gain reputation with.
     * @param {number} amount - The amount of reputation to grant (can be negative).
     * @returns {string} Message describing the reputation change.
     */
    grantReputation(target, amount = 1) {
        // Round amount to ensure no fractional reputation values
        const roundedAmount = Math.round(amount);
        this.reputation.increment(target, roundedAmount);
        const targetName = target.name ? coloredName(target) : target;
        return colorSpan(`You ${roundedAmount >= 0 ? 'gained' : 'lost'} ${Math.abs(roundedAmount)} reputation with ${targetName}.<br/>`, roundedAmount >= 0 ? COLORS.LightGreen : COLORS.LightRed);
    }

    /**
     * Calculates total reputation for a planet (specific + global average).
     * @param {Planet} target - The planet to calculate reputation for.
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
        const planetName = coloredName(planet);
        return colorSpan(`You ${amount >= 0 ? 'gained' : 'lost'} ${Math.abs(amount)} bounty on ${planetName}.<br/>`, amount >= 0 ? COLORS.LightRed : COLORS.LightGreen);
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
        
        if (autoImproveSkills) {
            this.autoImproveSkills();
        }
    }

    /**
     * Automatically spends available skill points on random skills.
     * Considers home planet skill price modifiers.
     */
    autoImproveSkills() {
        let attempts = 100
        while (this.skillPoints > 0 && attempts-- > 0) {
            // Build weighted skill list
            const skillWeights = []
            for (const skill of SKILLS_ALL) {
                let weight = 1.0
                skillWeights.push({ skill, weight })
            }
            
            // Select skill using weighted random
            const totalWeight = skillWeights.reduce((sum, sw) => sum + sw.weight, 0)
            let roll = Math.random() * totalWeight
            let selectedSkill = SKILLS_ALL[0]
            
            for (const sw of skillWeights) {
                roll -= sw.weight
                if (roll <= 0) {
                    selectedSkill = sw.skill
                    break
                }
            }
            
            const costToUpgrade = this.calcSkillPointsToUpgrade(selectedSkill)
            if (this.skillPoints >= costToUpgrade) {
                this.skills.increment(selectedSkill, 1)
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
        return Math.min(100, Math.round( Math.pow(1 + this.level, 1.5) )) / 100
    }

    get maxSubordinates() {
        return 1 + Math.floor(this.level / CAPTAIN_LEVELS_PER_OFFICER)
    }

}