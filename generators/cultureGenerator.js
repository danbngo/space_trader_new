function generateCulture(planet = new Planet()) {
    const governmentType = rndMember(GOVERNMENT_TYPES_ALL.filter(gt => gt != GOVERNMENT_TYPES.PUPPET_STATE))
    const shipQuality = rng(4,1,false)/2
    const officerQuality = rng(4,1,false)/2
    const population = rng(8,1,false)/4
    const territory = rng(8,1,false)/4
    const military = rng(8,1,false)/4
    const security = rng(8,1,false)/4
    const commerce = rng(8,1,false)/4
    const industry = rng(8,1,false)/4
    const crime = rng(8,1,false)/4
    const prestige = rng(8,1,false)/4

    const cargoPriceModifiers = new CountsMap()
    for (const ct of CARGO_TYPES_ALL) {
        cargoPriceModifiers.setAmount(ct, rng(MARKET_MAX_CARGO_PRICE_MODIFIER, MARKET_MIN_CARGO_PRICE_MODIFIER, false))
    }

    return new Culture(planet, governmentType, cargoPriceModifiers, shipQuality, officerQuality, territory, population, military, industry, commerce, security, crime, prestige)
}
