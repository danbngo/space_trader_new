function generateCulture(planet = new Planet()) {
    const shipQuality = rng(4,1,false)/2
    const officerQuality = rng(4,1,false)/2
    const population = rng(8,1,false)/4
    const territory = rng(8,1,false)/4
    const governmentRating = rng(8,1,false)/4
    const securityRating = rng(8,1,false)/4
    const commercialRating = rng(8,1,false)/4
    const industrialRating = rng(8,1,false)/4
    const crimeRating = rng(8,1,false)/4

    const cargoPriceModifiers = new CountsMap()
    for (const ct of CARGO_TYPES_ALL) {
        cargoPriceModifiers.setAmount(ct, Math.random() > .5 ? 1/rng(5,1,false) : rng(5,1,false))
    }

    return new Culture(cargoPriceModifiers, shipQuality, officerQuality, territory, population, governmentRating, industrialRating, commercialRating, securityRating, crimeRating)
}
