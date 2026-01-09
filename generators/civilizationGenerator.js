/**
 * Generates a civilization for a planet with randomized attributes.
 * @param {Planet|SpaceStation} planet - The planet to generate civilization for.
 * @returns {Civilization} The generated civilization.
 */
function generateCivilization(planet) {
    console.log('generating civ for planet:',planet)
    const governmentType = rndMember(GT_ALL.filter(gt => gt != GT.PUPPET_STATE))
    // Dwarf planets are small outposts with reduced stats (0.25x)
    const technology = rng(4,1,false)/2
    const education = rng(4,1,false)/2
    const population = rng(8,1,false)/4
    const territory = rng(8,1,false)/4
    const army = rng(8,1,false)/4
    const navy = rng(8,1,false)/4
    const security = rng(8,1,false)/4
    const economy = rng(8,1,false)/4
    const industry = rng(8,1,false)/4
    const culture = rng(8,1,false)/4
    const prestige = rng(8,1,false)/4
    const crime = rng(8,1,false)/4
    const corruption = rng(8,1,false)/4
    const wealth = rng(8,1,false)/4
    const reserves = rng(8,1,false)/4
    const taxes = rng(8,1,false)/4

    const cargoPriceMultipliers = new CountsMap()
    for (const ct of CARGO_TYPES_ALL) {
        cargoPriceMultipliers.setAmount(ct, 1) //used to randomize this but news and climate covers that pretty well
    }

    return new Civilization({
        planet, governmentType, cargoPriceMultipliers, technology, education, territory, population,
         army, navy, industry, economy, security, culture, prestige, corruption, crime,
         wealth, reserves, taxes
    })
}
