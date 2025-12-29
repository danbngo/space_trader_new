
/**
 * Represents the civilization of a planet, including government type, cargo price modifiers, and various quality and rating attributes.
 * @class Civilization
 */
class Civilization {
    /**
     * @param {Planet} planet - The planet this civilization belongs to.
     * @param {GovernmentType} governmentType - The type of government of the civilization.
     * @param {CountsMap} cargoPriceModifiers - Modifiers for cargo prices specific to this civilization.
     * @param {number} technology - Quality rating of ships produced by this civilization.
     * @param {number} education - Quality rating of officers from this civilization.
     * @param {number} territory - The territorial reach of the civilization in Astronomical Units (AUs).
     * @param {number} population - The population factor affecting fleet sizes and officer availability.
     * @param {number} military - Rating affecting war fleets, bounty hunters, and bank credits.
     * @param {number} industry - Rating affecting merchants, miners, and ship availability.
     * @param {number} economy - Rating affecting merchants, smugglers, and market cargo availability.
     * @param {number} security - Rating affecting police and bounty hunter presence.
     * @param {number} culture - 
     * @param {number} prestige - Effects how planets interact with each other.
     * @param {Policies} policies - The active policies for this civilization.
     */
    constructor(planet = new Planet(), governmentType = GT_ALL[0], cargoPriceModifiers = new CountsMap(), technology = 1.0, education = 1.0, territory = 1, population = 1, military = 1, industry = 1, economy = 1, security = 1, culture = 1, prestige = 1, policies = new Policies()) {
        /** @type {CountsMap} */
        this.cargoPriceModifiers = cargoPriceModifiers
        /** @type {number} */
        this.technology = technology;
        /** @type {number} */
        this.education = education;
        /** @type {number} */
        this.territory = territory; //AUs, recall that neptune is 30. encounters for this civilization can be found further from its planet
        /** @type {number} */
        this.population = population; //fleets are larger, more officers available
        /** @type {number} */
        this.military = military; //more war fleets and bounty hunters, more credits at bank
        /** @type {number} */
        this.industry = industry; //more merchants and miners, more ships available
        /** @type {number} */
        this.economy = economy; //more merchants and smugglers, more cargo available in market
        /** @type {number} */
        this.security = security; //more police and bounty hunters
        /** @type {number} */
        this.culture = culture; 
        /** @type {number} */
        this.prestige = prestige
        /** @type {GovernmentType} */
        this.governmentType = governmentType;
        /** @type {Planet} */
        this.planet = planet;
        /** @type {Policies} */
        this.policies = policies;
        /** @type {Map<Planet, RelationshipType>} */
        this.relationships = new Map()
    }
}