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

    const skillPriceMultipliers = new CountsMap()
    for (const sk of SKILLS_ALL) {
        skillPriceMultipliers.setAmount(sk, rng(ACADEMY_MAX_SKILL_PRICE_MODIFIER, ACADEMY_MIN_SKILL_PRICE_MODIFIER, false))
    }

    // Generate culture demographics
    const cultures = new CountsMap()
    const majorPlanets = gs && gs.system ? gs.system.planets.filter(p => p !== planet) : []
    
    if (majorPlanets.length > 0) {
        // Start with own planet having at least 0.4 (40%) culture
        let ownCulture = 0.4 + Math.random() * 0.3; // 0.4 to 0.7
        cultures.setAmount(planet, ownCulture);
        
        // Distribute remaining culture among other major planets (up to 0.2 each)
        const remainingCulture = 1.0 - ownCulture;
        
        for (const otherPlanet of majorPlanets) {
            // Random amount up to 0.2, but also constrained by remaining culture
            const maxAmount = Math.min(0.2, remainingCulture);
            if (maxAmount > 0) {
                const amount = Math.random() * maxAmount;
                if (amount > 0.01) { // Only add if meaningful
                    cultures.setAmount(otherPlanet, amount);
                }
            }
        }
        
        // Normalize to ensure total is exactly 1.0
        cultures.normalize();
    } else {
        // If no other planets, this planet is 100% its own culture
        cultures.setAmount(planet, 1.0);
    }

    return new Civilization({
        planet, governmentType, cargoPriceMultipliers, technology, education, territory, population,
         army, navy, industry, economy, security, culture, prestige, corruption, crime,
         wealth, reserves, taxes
    })
}
