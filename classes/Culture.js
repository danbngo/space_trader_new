
/**
 * Represents the culture of a planet, including government type, cargo price modifiers, and various quality and rating attributes.
 * @class Culture
 */
class Culture {
    /**
     * @param {Planet} planet - The planet this culture belongs to.
     * @param {GovernmentType} governmentType - The type of government of the culture.
     * @param {CountsMap} cargoPriceModifiers - Modifiers for cargo prices specific to this culture.
     * @param {number} shipQuality - Quality rating of ships produced by this culture.
     * @param {number} officerQuality - Quality rating of officers from this culture.
     * @param {number} territory - The territorial reach of the culture in Astronomical Units (AUs).
     * @param {number} population - The population factor affecting fleet sizes and officer availability.
     * @param {number} military - Rating affecting war fleets, bounty hunters, and bank credits.
     * @param {number} industry - Rating affecting merchants, miners, and ship availability.
     * @param {number} economy - Rating affecting merchants, smugglers, and market cargo availability.
     * @param {number} security - Rating affecting police and bounty hunter presence.
     * @param {number} crime - Rating affecting pirate and smuggler activity and black market cargo.
     * @param {number} prestige - Effects how planets interact with each other.
     */
    constructor(planet = new Planet(), governmentType = GOVERNMENT_TYPES_ALL[0], cargoPriceModifiers = new CountsMap(), shipQuality = 1.0, officerQuality = 1.0, territory = 1, population = 1, military = 1, industry = 1, economy = 1, security = 1, crime = 1, prestige = 1) {
        /** @type {CountsMap} */
        this.cargoPriceModifiers = cargoPriceModifiers
        /** @type {number} */
        this.shipQuality = shipQuality;
        /** @type {number} */
        this.officerQuality = officerQuality;
        /** @type {number} */
        this.territory = territory; //AUs, recall that neptune is 30. encounters for this culture can be found further from its planet
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
        this.crime = crime; //more pirates and smugglers, more cargo in black market
        /** @type {number} */
        this.prestige = prestige
        /** @type {GovernmentType} */
        this.governmentType = governmentType;
        /** @type {Planet} */
        this.planet = planet;
        /** @type {Map<Planet, RelationshipType>} */
        this.relationships = new Map()
    }
}