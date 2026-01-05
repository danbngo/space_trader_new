
/**
 * @typedef {Object} CivilizationParams
 * @property {Planet} [planet] - The planet this civilization belongs to.
 * @property {GovernmentType} [governmentType] - The type of government of the civilization.
 * @property {Policies} [policies] - The active policies for this civilization.
 * @property {CountsMap} [cargoPriceMultipliers] - Multipliers for cargo prices specific to this civilization.
 * @property {CountsMap} [skillPriceMultipliers] - Multipliers for cargo prices specific to this civilization.
 * @property {number} [technology] - Quality rating of ships produced by this civilization.
 * @property {number} [education] - Quality rating of officers from this civilization.
 * @property {number} [territory] - The territorial reach of the civilization in Astronomical Units (AUs).
 * @property {number} [population] - The population factor affecting fleet sizes and officer availability.
 * @property {number} [industry] - Rating affecting merchants, miners, and ship availability.
 * @property {number} [economy] - Rating affecting merchants, smugglers, and market cargo availability.
 * @property {number} [security] - Rating affecting police and bounty hunter presence.
 * @property {number} [culture] - More tourists
 * @property {number} [prestige] - Effects how planets interact with each other.
 * @property {number} [army] - More guild officers and army patrols
 * @property {number} [navy] - More shipyard ships
 * @property {number} [corruption] - Higher corruption means LOWER black market prices.
 * @property {number} [crime] - Higher crime means more crime events and black market activity.
 * @property {number} [wealth] - Overall wealth of the civilization.
 * @property {number} [reserves] - Higher reserves means more goods in markets, but lower prices
 * @property {number} [taxes] - Tax rate applied to most transactions (0 to MAX_TAX_RATE).
 * @property {CountsMap} [religions] - Religious representation on this planet (Religion -> adherent population ratio).
 * @property {CountsMap} [races] - Racial demographics of this civilization (Race -> population proportion).
 * @property {CountsMap} [cultures] - Planetary culture demographics of this civilization (Planet -> population proportion).
 * @property {Religion|null} [stateReligion] - The official state religion of this civilization (if any).
 */

/**
 * Represents the civilization of a planet, including government type, cargo price modifiers, and various quality and rating attributes.
 * @class Civilization
 */
class Civilization {
    /**
     * @param {CivilizationParams} params - The civilization parameters.
     */
    constructor({
        planet = null, governmentType = null, cargoPriceMultipliers = new CountsMap(), skillPriceMultipliers = new CountsMap(),
        technology = 1.0, education = 1.0, territory = 1, population = 1, industry = 1, cultures = new CountsMap(),
        economy = 1, security = 1, culture = 1, prestige = 1, policies = new Policies(),
        navy = 1, army = 1, corruption = 1, crime = 1, wealth = 1, reserves = 1, taxes = 1,
        religions = new CountsMap(), races = new CountsMap(), stateReligion = null
    } = {}) {
        /** @type {Planet} */
        this.planet = planet;
        /** @type {GovernmentType} */
        this.governmentType = governmentType; //many effects!
        /** @type {Policies} */
        this.policies = policies; //many effects!
        /** @type {Map<Planet, RelationshipType>} */
        this.relationships = new Map()
        /** @type {CountsMap} */
        this.cargoPriceMultipliers = cargoPriceMultipliers
        /** @type {CountsMap} */
        this.skillPriceMultipliers = skillPriceMultipliers
        /** @type {CountsMap} */
        this.religions = religions
        /** @type {CountsMap} */
        this.races = races
        /** @type {CountsMap} */
        this.cultures = cultures
        /** @type {Religion|null} */
        this.stateReligion = stateReligion
        /** @type {number} */
        this.territory = territory; //AUs, recall that neptune is 30. encounters for this civilization can be found further from its planet
        /** @type {number} */
        this.population = population; //more officers available
        /** @type {number} */
        this.industry = industry; //more miners
        /** @type {number} */
        this.economy = economy; //more merchants
        /** @type {number} */
        this.security = security; //more police and bounty hunters
        /** @type {number} */
        this.culture = culture; //more tourists
        /** @type {number} */
        this.prestige = prestige; //effects how planets interact with each other
        /** @type {number} */
        this.technology = technology; //ship quality
        /** @type {number} */
        this.education = education; //officer quality, academy can train higher/cheaper
        /** @type {number} */
        this.army = army; //more guild officers
        /** @type {number} */
        this.navy = navy; //more shipyard ships, larger army patrols
        /** @type {number} */
        this.corruption = corruption; //higher rakes, LOWER black market prices
        /** @type {number} */
        this.crime = crime; //more cargo in black market
        /** @type {number} */
        this.wealth = wealth; //higher credits in stores
        /** @type {number} */
        this.reserves = reserves; //more goods in markets
        /** @type {number} */
        this.taxes = taxes; //tax rate applied to most transactions (0 to MAX_TAX_RATE)
    }

    /**
     * Dynamic inflation based on supply (reserves, industry) vs demand (population, economy).
     * Low reserves = high inflation. Strong economy with weak industry = high inflation.
     * @returns {number} Inflation multiplier (typically 0.8 - 2.0)
     */
    get inflation() {
        // Supply: ability to produce goods (reserves * industry)
        const supply = (this.reserves * this.industry) / 2;
        // Demand: consumption pressure (population * economy)
        const demand = (this.population * this.economy) / 2;
        
        // Base inflation even with perfect balance
        const baseInflation = 0.8;
        // Inflation pressure from demand/supply ratio
        const inflationPressure = demand / Math.max(supply, 0.1);
        
        // Cap between 0.8 and 3.0
        return Math.max(baseInflation, Math.min(inflationPressure, 3.0));
    }

    get score() {
        const positives = (this.technology + this.education + this.economy + this.industry + this.security + this.culture + this.prestige
            + this.army + this.navy + this.wealth + this.reserves) / 11
        const negatives = (this.corruption + this.crime + this.taxes) / 3
        return positives/negatives
    }

    get taxRate() {
        return this.taxes * AVERAGE_TAX_RATE //this.taxes ranges from 0-2
    }

    get inflationRate() {
        return this.inflation * AVERAGE_INFLATION_RATE
    }

    get military() {
        return (this.army + this.navy)/2
    }

    /**
     * Multiplies this civilization's ratings by another civilization's ratings.
     * @param {CivilizationParams} civMultipliers - The multipliers to apply.
     */
    multiply(civMultipliers) {
        for (const cr of CIVILIZATION_RATINGS_ALL) {
            //if (cr.id === 'cargoPriceMultipliers' || cr.id === 'skillPriceMultipliers') continue;
            const modifier = civMultipliers[cr.id];
            if (modifier == null || modifier == undefined || isNaN(modifier) || modifier == 1) continue;
            this[cr.id] *= civMultipliers[cr.id];
        }
        if (civMultipliers.cargoPriceMultipliers) for (const [ct, mod] of civMultipliers.cargoPriceMultipliers.counts) {
            this.cargoPriceMultipliers.multiply(ct, mod)
        }
        if (civMultipliers.skillPriceMultipliers) for (const [st, mod] of civMultipliers.skillPriceMultipliers.counts) {
            this.skillPriceMultipliers.multiply(st, mod)
        }
    }
    
    /**
     * Creates a new Civilization with inverted multipliers (for removing effects).
     * @returns {Civilization} A civilization with inverse multipliers.
     */
    getInverse() {
        const inverseEffect = new Civilization({
            planet: this.planet,
            cargoPriceMultipliers: this.cargoPriceMultipliers ? this.cargoPriceMultipliers.calcInvertedMultipliers() : undefined,
            skillPriceMultipliers: this.skillPriceMultipliers ? this.skillPriceMultipliers.calcInvertedMultipliers() : undefined,
        });
        for (const cr of CIVILIZATION_RATINGS_ALL) {
            inverseEffect[cr.id] = 1 / this[cr.id];
        }
        return inverseEffect
    }

    /**
     * Overwrites this civilization's values with another civilization's non-default values.
     * @param {Civilization} withCiv - The civilization to copy values from.
     */
    overwrite(withCiv = new Civilization()) {
        if (withCiv.planet) this.planet = withCiv.planet
        if (withCiv.governmentType) this.governmentType = withCiv.governmentType
        if (withCiv.policies) this.policies = withCiv.policies.clone()
        for (const cr of CIVILIZATION_RATINGS_ALL) {
            if (withCiv[cr.id] !== undefined && withCiv[cr.id] !== null && withCiv[cr.id] !== 1.0)
            this[cr.id] = withCiv[cr.id];
        }
        if (withCiv.cargoPriceMultipliers) {
            if (!this.cargoPriceMultipliers) this.cargoPriceMultipliers = new CountsMap()
            console.log(withCiv.cargoPriceMultipliers)
            for (const [ct, mod] of withCiv.cargoPriceMultipliers.counts) {
                this.cargoPriceMultipliers.counts.set(ct, mod)
            }
        }
        if (withCiv.skillPriceMultipliers) {
            if (!this.skillPriceMultipliers) this.skillPriceMultipliers = new CountsMap()
            for (const [st, mod] of withCiv.skillPriceMultipliers.counts) {
                this.skillPriceMultipliers.counts.set(st, mod)
            }
        }
    }

    clone() {
        const clone = new Civilization({
            planet: this.planet,
            policies: this.policies.clone(),
            cargoPriceMultipliers: this.cargoPriceMultipliers.clone(),
            skillPriceMultipliers: this.skillPriceMultipliers.clone(),
            religions: this.religions.clone(),
            races: this.races.clone(),
            stateReligion: this.stateReligion,
            governmentType: this.governmentType,
        })
        for (const cr of CIVILIZATION_RATINGS_ALL) {
            clone[cr.id] = this[cr.id];
        }
        return clone
    }

    /**
     * Checks if two planets have tense diplomatic relations.
     * @param {Planet} p1 - First planet.
     * @param {Planet} p2 - Second planet.
     * @returns {boolean} True if relations are tense.
     */
    static areTense(p1 = new Planet(), p2 = new Planet()) {
        return (p1.c.relationships.get(p2) === RELATIONSHIP_TYPES.TENSE || p2.c.relationships.get(p1) === RELATIONSHIP_TYPES.TENSE)
    }
    /**
     * Checks if two planets are at war.
     * @param {Planet} p1 - First planet.
     * @param {Planet} p2 - Second planet.
     * @returns {boolean} True if at war.
     */
    static areAtWar(p1 = new Planet(), p2 = new Planet()) {
        return (p1.c.relationships.get(p2) === RELATIONSHIP_TYPES.WAR || p2.c.relationships.get(p1) === RELATIONSHIP_TYPES.WAR)
    }
    /**
     * Checks if two planets are allies.
     * @param {Planet} p1 - First planet.
     * @param {Planet} p2 - Second planet.
     * @returns {boolean} True if allied.
     */
    static areAllies(p1 = new Planet(), p2 = new Planet()) {
        return (p1.c.relationships.get(p2) === RELATIONSHIP_TYPES.ALLY && p2.c.relationships.get(p1) === RELATIONSHIP_TYPES.ALLY)
    }
    /**
     * Checks if two planets are neutral.
     * @param {Planet} p1 - First planet.
     * @param {Planet} p2 - Second planet.
     * @returns {boolean} True if neutral.
     */
    static areNeutral(p1 = new Planet(), p2 = new Planet()) {
        return (p1.c.relationships.get(p2) === RELATIONSHIP_TYPES.NEUTRAL && p2.c.relationships.get(p1) === RELATIONSHIP_TYPES.NEUTRAL)
    }
    /**
     * Checks if two planets are either tense or at war.
     * @param {Planet} p1 - First planet.
     * @param {Planet} p2 - Second planet.
     * @returns {boolean} True if tense or at war.
     */
    static areTenseOrAtWar(p1 = new Planet(), p2 = new Planet()) {
        return Civilization.areTense(p1, p2) || Civilization.areAtWar(p1, p2)
    }
    /**
     * Checks if two planets are either allies or neutral.
     * @param {Planet} p1 - First planet.
     * @param {Planet} p2 - Second planet.
     * @returns {boolean} True if allied or neutral.
     */
    static areAlliesOrNeutral(p1 = new Planet(), p2 = new Planet()) {
        return Civilization.areAllies(p1, p2) || Civilization.areNeutral(p1, p2)
    }
    /**
     * Checks if two planets have opposing government types.
     * @param {Planet} p1 - First planet.
     * @param {Planet} p2 - Second planet.
     * @returns {boolean} True if governments oppose each other.
     */
    static areOpposingGovernments(p1 = new Planet(), p2 = new Planet()) {
        return (p1.c.governmentType.opposingType === p2.c.governmentType || p2.c.governmentType.opposingType === p1.c.governmentType)
    }
    /**
     * Gets all planets that are at war with the given planet.
     * @param {Planet} planet - The planet to check.
     * @returns {Array<Planet>} Array of planets at war.
     */
    static getPlanetsAtWarWith(planet = new Planet()) {
        const atWarPlanets = []
        for (const [otherPlanet, relationship] of planet.c.relationships.entries()) {
            if (relationship === RELATIONSHIP_TYPES.WAR) {
                atWarPlanets.push(otherPlanet)
            }
        }
        return atWarPlanets
    }
    /**
     * Gets all planets that are tense or at war with the given planet.
     * @param {Planet} planet - The planet to check.
     * @returns {Array<Planet>} Array of planets with hostile relations.
     */
    static getPlanetsTenseOrAtWarWith(planet = new Planet()) {
        const tenseOrAtWarPlanets = []
        for (const [otherPlanet, relationship] of planet.c.relationships.entries()) {
            if (relationship === RELATIONSHIP_TYPES.WAR || relationship === RELATIONSHIP_TYPES.TENSE) {
                tenseOrAtWarPlanets.push(otherPlanet)
            }
        }
        return tenseOrAtWarPlanets
    }
}


/**
 * Represents the active policies of a civilization.
 * @class Policies
 */
class Policies {
    /**
     * @param {PolicyType} economic - Economic policy.
     * @param {PolicyType} labor - Labor policy.
     * @param {PolicyType} social - Social policy.
     * @param {PolicyType} foreign - Foreign policy.
     */
    constructor(economic = ECONOMIC_POLICIES[0], labor = LABOR_POLICIES[0], social = SOCIAL_POLICIES[0], foreign = FOREIGN_POLICIES[0]) {
        /** @type {PolicyType} */
        this.economic = economic
        /** @type {PolicyType} */
        this.labor = labor
        /** @type {PolicyType} */
        this.social = social
        /** @type {PolicyType} */
        this.foreign = foreign
    }

    get all() {
        return [this.economic, this.labor, this.social, this.foreign]
    }

    /**
     * Creates a copy of this Policies object.
     * @returns {Policies} A cloned Policies object.
     */
    clone() {
        return new Policies(this.economic, this.labor, this.social, this.foreign)
    }
}