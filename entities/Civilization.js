
/**
 * Represents the civilization of a planet, including government type, cargo price modifiers, and various quality and rating attributes.
 * @class Civilization
 */
class Civilization {
    /**
     * @param {Object} params - The effect parameters.
     * @param {Planet} [params.planet] - The planet this civilization belongs to.
     * @param {GovernmentType} [params.governmentType] - The type of government of the civilization.
     * @param {CountsMap} [params.cargoPriceModifiers] - Modifiers for cargo prices specific to this civilization.
     * @param {CountsMap} [params.skillPriceModifiers] - Modifiers for cargo prices specific to this civilization.
     * @param {number} [params.technology] - Quality rating of ships produced by this civilization.
     * @param {number} [params.education] - Quality rating of officers from this civilization.
     * @param {number} [params.territory] - The territorial reach of the civilization in Astronomical Units (AUs).
     * @param {number} [params.population] - The population factor affecting fleet sizes and officer availability.
     * @param {number} [params.military] - Rating affecting war fleets, bounty hunters, and bank credits.
     * @param {number} [params.industry] - Rating affecting merchants, miners, and ship availability.
     * @param {number} [params.economy] - Rating affecting merchants, smugglers, and market cargo availability.
     * @param {number} [params.security] - Rating affecting police and bounty hunter presence.
     * @param {number} [params.culture] - More tourists
     * @param {number} [params.prestige] - Effects how planets interact with each other.
     * @param {Policies} [params.policies] - The active policies for this civilization.
     * @param {number} [params.army] - More guild officers and army patrols
     * @param {number} [params.navy] - More shipyard ships
     * @param {number} [params.corruption] - Higher corruption means LOWER black market prices.
     * @param {number} [params.crime] - Higher crime means more crime events and black market activity.
     * @param {number} [params.wealth] - Overall wealth of the civilization.
     * @param {number} [params.reserves] - Higher reserves means more goods in markets, but lower prices
     * @param {number} [params.inflation] - Higher costs for everything but also higher sales prices in market
     * @param {number} [params.taxes] - Tax rate applied to most transactions (0 to MAX_TAX_RATE).
     * 
     */
    constructor({
        planet = new Planet(), governmentType = GT_ALL[0], cargoPriceModifiers = new CountsMap(), skillPriceModifiers = new CountsMap(),
        technology = 1.0, education = 1.0, territory = 1, population = 1, industry = 1,
        economy = 1, security = 1, culture = 1, prestige = 1, policies = new Policies(),
        navy = 1, army = 1, corruption = 1, crime = 1, wealth = 1, reserves = 1, inflation = 1, taxes = 0
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
        this.cargoPriceModifiers = cargoPriceModifiers
        /** @type {CountsMap} */
        this.skillPriceModifiers = skillPriceModifiers
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

    //add(civModifiers = new Civilization()) {}
    //subtract(civModifiers = new Civilization()) {}
    multiply(civModifiers = new Civilization()) {
        for (const cr of CIVILIZATION_RATINGS_ALL) {
            //if (cr.id === 'cargoPriceModifiers' || cr.id === 'skillPriceModifiers') continue;
            const modifier = civModifiers[cr.id];
            if (modifier == null || modifier == undefined || isNaN(modifier) || modifier == 1) continue;
            this[cr.id] *= civModifiers[cr.id];
        }
        for (const [ct, mod] of civModifiers.cargoPriceModifiers.counts) {
            this.cargoPriceModifiers.multiply(ct, mod)
        }
        for (const [st, mod] of civModifiers.skillPriceModifiers.counts) {
            this.skillPriceModifiers.multiply(st, mod)
        }
    }
    
    getInverse() {
        const inverseEffect = new Civilization({
            planet: this.planet,
            cargoPriceModifiers: this.cargoPriceModifiers.calcInvertedMultipliers(),
            skillPriceModifiers: this.skillPriceModifiers.calcInvertedMultipliers(),
        });
        for (const cr of CIVILIZATION_RATINGS_ALL) {
            inverseEffect[cr.id] = 1 / this[cr.id];
        }
        return inverseEffect
    }

    clone() {
        const clone = new Civilization({
            planet: this.planet,
            cargoPriceModifiers: this.cargoPriceModifiers.clone(),
            skillPriceModifiers: this.skillPriceModifiers.clone(),
            governmentType: this.governmentType,
        })
        for (const cr of CIVILIZATION_RATINGS_ALL) {
            clone[cr.id] = this[cr.id];
        }
        return clone
    }
}