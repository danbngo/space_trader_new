function generateCulture(planet = new Planet()) {
    const governmentType = rndMember(GOVERNMENT_TYPES_ALL)
    const shipQuality = rng(4,1,false)/2
    const officerQuality = rng(4,1,false)/2
    const population = rng(8,1,false)/4
    const territory = rng(8,1,false)/4
    const militaryRating = rng(8,1,false)/4
    const securityRating = rng(8,1,false)/4
    const commercialRating = rng(8,1,false)/4
    const industrialRating = rng(8,1,false)/4
    const crimeRating = rng(8,1,false)/4
    const prestigeRating = rng(8,1,false)/4

    const cargoPriceModifiers = new CountsMap()
    for (const ct of CARGO_TYPES_ALL) {
        cargoPriceModifiers.setAmount(ct, rng(MARKET_MAX_CARGO_PRICE_MODIFIER, MARKET_MIN_CARGO_PRICE_MODIFIER, false))
    }

    return new Culture(planet, governmentType, cargoPriceModifiers, shipQuality, officerQuality, territory, population, militaryRating, industrialRating, commercialRating, securityRating, crimeRating, prestigeRating)
}
