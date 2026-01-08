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

    // Generate random race demographics
    const races = new CountsMap()
    
    // Ensure normalized
    races.normalize()

    // Generate random religion demographics from star system religions
    const religions = new CountsMap()
    let stateReligion = null
    const systemReligions = gs && gs.system ? gs.system.religions : []
    if (systemReligions && systemReligions.length > 0) {
        const numReligions = Math.min(rng(systemReligions.length, 1), systemReligions.length)
        const selectedReligions = rndMembers(systemReligions, numReligions, true)
        
        stateReligion = rndMember(selectedReligions)
        
        // Generate random weights for religions
        const religionWeights = []
        for (let i = 0; i < selectedReligions.length; i++) {
            // If this is the state religion, give it a much higher weight
            if (selectedReligions[i] === stateReligion) {
                religionWeights.push(Math.random() * 15 + 10) // 10-25 weight
            } else {
                religionWeights.push(Math.random() * 5 + 1) // 1-6 weight
            }
        }
        
        // Add agnostic/non-religious population to the mix (no RELIGION_AGNOSTICISM or RELIGION_ATHEISM constants)
        // Just leave some percentage as non-religious by not adding up to 100%
        
        // Normalize to ratios (0-1, not percentages)
        const totalReligionWeight = religionWeights.reduce((sum, w) => sum + w, 0)
        for (let i = 0; i < selectedReligions.length; i++) {
            religions.setAmount(selectedReligions[i], religionWeights[i] / totalReligionWeight)
        }
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
        planet, governmentType, cargoPriceMultipliers, skillPriceMultipliers, technology, education, territory, population,
         army, navy, industry, economy, security, culture, prestige, corruption, crime,
         wealth, reserves, taxes
    })
}
