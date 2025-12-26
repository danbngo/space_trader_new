
/**
 * @class Culture
 * @description Represents the culture of a planet, including government type, cargo price modifiers, and various quality and rating attributes.
 * @property {Government} governmentType - The type of government of the culture.
 * @property {CountsMap} cargoPriceModifiers - Modifiers for cargo prices specific to this culture.
 * @property {number} shipQuality - Quality rating of ships produced by this culture.
 * @property {number} officerQuality - Quality rating of officers from this culture.
 * @property {number} territory - The territorial reach of the culture in Astronomical Units (AUs).
 * @property {number} population - The population factor affecting fleet sizes and officer availability.
 * @property {number} militaryRating - Rating affecting war fleets, bounty hunters, and bank credits.
 * @property {number} industrialRating - Rating affecting merchants, miners, and ship availability.
 * @property {number} commercialRating - Rating affecting merchants, smugglers, and market cargo availability.
 * @property {number} securityRating - Rating affecting police and bounty hunter presence.
 * @property {number} crimeRating - Rating affecting pirate and smuggler activity and black market cargo.
 * @property {number} prestigeRating - Effects how planets interact with each other
 * @property {Map<Planet, RELATIONSHIP_TYPES>} relationships - Relationships with other cultures or entities.
 */
class Culture {
    constructor(planet = new Planet(), governmentType = GOVERNMENT_TYPES_ALL[0], cargoPriceModifiers = new CountsMap(), shipQuality = 1.0, officerQuality = 1.0, territory = 1, population = 1, militaryRating = 1, industrialRating = 1, commercialRating = 1, securityRating = 1, crimeRating = 1, prestigeRating = 1) {
        this.cargoPriceModifiers = cargoPriceModifiers
        this.shipQuality = shipQuality;
        this.officerQuality = officerQuality;
        this.territory = territory; //AUs, recall that neptune is 30. encounters for this culture can be found further from its planet
        this.population = population; //fleets are larger, more officers available
        this.militaryRating = militaryRating; //more war fleets and bounty hunters, more credits at bank
        this.industrialRating = industrialRating; //more merchants and miners, more ships available
        this.commercialRating = commercialRating; //more merchants and smugglers, more cargo available in market
        this.securityRating = securityRating; //more police and bounty hunters
        this.crimeRating = crimeRating; //more pirates and smugglers, more cargo in black market
        this.prestigeRating = prestigeRating
        this.governmentType = governmentType;
        this.planet = planet;
        this.relationships = new Map()
    }
}