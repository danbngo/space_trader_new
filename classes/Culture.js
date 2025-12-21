

class Culture {
    constructor(cargoPriceModifiers = new CountsMap(), shipQuality = 1.0, officerQuality = 1.0, territory = 1, population = 1, governmentRating = 1, industrialRating = 1, commercialRating = 1, securityRating = 1, crimeRating = 1) {
        this.cargoPriceModifiers = cargoPriceModifiers
        this.shipQuality = shipQuality;
        this.officerQuality = officerQuality;
        this.territory = territory; //AUs, recall that neptune is 30. encounters for this culture can be found further from its planet
        this.population = population; //fleets are larger, more officers available
        this.governmentRating = governmentRating; //more war fleets and bounty hunters, more credits at bank
        this.industrialRating = industrialRating; //more merchants and miners, more ships available
        this.commercialRating = commercialRating; //more merchants and smugglers, more cargo available in market
        this.securityRating = securityRating; //more police and bounty hunters
        this.crimeRating = crimeRating; //more pirates and smugglers, more cargo in black market
    }
}