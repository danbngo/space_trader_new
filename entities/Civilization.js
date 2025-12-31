
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
 * @property {number} [inflation] - Higher costs for everything but also higher sales prices in market
 * @property {number} [taxes] - Tax rate applied to most transactions (0 to MAX_TAX_RATE).
 * @property {CountsMap} [religions] - Religious representation on this planet (Religion -> adherent population ratio).
 * @property {Map<Race, number>} [races] - Racial demographics of this civilization (Race -> population proportion).
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
        technology = 1.0, education = 1.0, territory = 1, population = 1, industry = 1,
        economy = 1, security = 1, culture = 1, prestige = 1, policies = new Policies(),
        navy = 1, army = 1, corruption = 1, crime = 1, wealth = 1, reserves = 1, inflation = 1, taxes = 1,
        religions = new CountsMap(), races = new Map()
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
        /** @type {Map<Race, number>} */
        this.races = races
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
        this.inflation = inflation; //higher prices everywhere
        /** @type {number} */
        this.taxes = taxes; //tax rate applied to most transactions (0 to MAX_TAX_RATE)
    }

    get score() {
        const positives = (this.technology + this.education + this.economy + this.industry + this.security + this.culture + this.prestige
            + this.army + this.navy + this.wealth + this.reserves) / 11
        const negatives = (this.corruption + this.crime + this.inflation + this.taxes) / 4
        return positives/negatives
    }

    get taxRate() {
        return this.taxes * MAX_TAX_RATE / 2 //this.taxes ranges from 0-2
    }

    get military() {
        return (this.army + this.navy)/2
    }

    /** @param {CivilizationParams} civMultipliers */
    multiply(civMultipliers) {
        for (const cr of CIVILIZATION_RATINGS_ALL) {
            //if (cr.id === 'cargoPriceMultipliers' || cr.id === 'skillPriceMultipliers') continue;
            const modifier = civMultipliers[cr.id];
            if (modifier == null || modifier == undefined || isNaN(modifier) || modifier == 1) continue;
            this[cr.id] *= civMultipliers[cr.id];
        }
        for (const [ct, mod] of civMultipliers.cargoPriceMultipliers.counts) {
            this.cargoPriceMultipliers.multiply(ct, mod)
        }
        for (const [st, mod] of civMultipliers.skillPriceMultipliers.counts) {
            this.skillPriceMultipliers.multiply(st, mod)
        }
    }
    
    getInverse() {
        const inverseEffect = new Civilization({
            planet: this.planet,
            cargoPriceMultipliers: this.cargoPriceMultipliers.calcInvertedMultipliers(),
            skillPriceMultipliers: this.skillPriceMultipliers.calcInvertedMultipliers(),
        });
        for (const cr of CIVILIZATION_RATINGS_ALL) {
            inverseEffect[cr.id] = 1 / this[cr.id];
        }
        return inverseEffect
    }

    overwrite(withCiv = new Civilization()) {
        if (withCiv.planet) this.planet = withCiv.planet
        if (withCiv.governmentType) this.governmentType = withCiv.governmentType
        if (withCiv.policies) this.policies = withCiv.policies.clone()
        for (const cr of CIVILIZATION_RATINGS_ALL) {
            if (withCiv[cr.id] !== undefined && withCiv[cr.id] !== null && withCiv[cr.id] !== 1.0)
            this[cr.id] = withCiv[cr.id];
        }
        for (const [ct, mod] of withCiv.cargoPriceMultipliers.counts) {
            this.cargoPriceMultipliers.counts.set(ct, mod)
        }
        for (const [st, mod] of withCiv.skillPriceMultipliers.counts) {
            this.skillPriceMultipliers.counts.set(st, mod)
        }
    }

    clone() {
        const clone = new Civilization({
            planet: this.planet,
            policies: this.policies.clone(),
            cargoPriceMultipliers: this.cargoPriceMultipliers.clone(),
            skillPriceMultipliers: this.skillPriceMultipliers.clone(),
            religions: this.religions.clone(),
            races: new Map(this.races),
            governmentType: this.governmentType,
        })
        for (const cr of CIVILIZATION_RATINGS_ALL) {
            clone[cr.id] = this[cr.id];
        }
        return clone
    }

    static areTense(p1 = new Planet(), p2 = new Planet()) {
        return (p1.c.relationships.get(p2) === RELATIONSHIP_TYPES.TENSE || p2.c.relationships.get(p1) === RELATIONSHIP_TYPES.TENSE)
    }
    static areAtWar(p1 = new Planet(), p2 = new Planet()) {
        return (p1.c.relationships.get(p2) === RELATIONSHIP_TYPES.WAR || p2.c.relationships.get(p1) === RELATIONSHIP_TYPES.WAR)
    }
    static areAllies(p1 = new Planet(), p2 = new Planet()) {
        return (p1.c.relationships.get(p2) === RELATIONSHIP_TYPES.ALLY && p2.c.relationships.get(p1) === RELATIONSHIP_TYPES.ALLY)
    }
    static areNeutral(p1 = new Planet(), p2 = new Planet()) {
        return (p1.c.relationships.get(p2) === RELATIONSHIP_TYPES.NEUTRAL && p2.c.relationships.get(p1) === RELATIONSHIP_TYPES.NEUTRAL)
    }
    static areTenseOrAtWar(p1 = new Planet(), p2 = new Planet()) {
        return Civilization.areTense(p1, p2) || Civilization.areAtWar(p1, p2)
    }
    static areAlliesOrNeutral(p1 = new Planet(), p2 = new Planet()) {
        return Civilization.areAllies(p1, p2) || Civilization.areNeutral(p1, p2)
    }
    static areOpposingGovernments(p1 = new Planet(), p2 = new Planet()) {
        return (p1.c.governmentType.opposingType === p2.c.governmentType || p2.c.governmentType.opposingType === p1.c.governmentType)
    }
    static getPlanetsAtWarWith(planet = new Planet()) {
        const atWarPlanets = []
        for (const [otherPlanet, relationship] of planet.c.relationships.entries()) {
            if (relationship === RELATIONSHIP_TYPES.WAR) {
                atWarPlanets.push(otherPlanet)
            }
        }
        return atWarPlanets
    }
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


class Policies {
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

    clone() {
        return new Policies(this.economic, this.labor, this.social, this.foreign)
    }
}