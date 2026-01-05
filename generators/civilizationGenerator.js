/**
 * Generates a civilization for a planet with randomized attributes.
 * @param {Planet|SpaceStation} planet - The planet to generate civilization for.
 * @returns {Civilization} The generated civilization.
 */
function generateCivilization(planet) {
    console.log('generating civ for planet:',planet)
    const governmentType = rndMember(GT_ALL.filter(gt => gt != GT.PUPPET_STATE))
    // Dwarf planets are small outposts with reduced stats (0.25x)
    const multiplier = planet.objectType == OBJECT_TYPES.DWARF_PLANET ? 0.25 : planet.objectType == OBJECT_TYPES.SPACE_STATION ? 0.5 : 1.0
    const technology = rng(4,1,false)/2 * 1
    const education = rng(4,1,false)/2 * 1
    const population = rng(8,1,false)/4 * multiplier
    const territory = rng(8,1,false)/4 * multiplier
    const army = rng(8,1,false)/4 * multiplier
    const navy = rng(8,1,false)/4 * multiplier
    const security = rng(8,1,false)/4 * multiplier
    const economy = rng(8,1,false)/4 * multiplier
    const industry = rng(8,1,false)/4 * multiplier
    const culture = rng(8,1,false)/4 * 1
    const prestige = rng(8,1,false)/4 * multiplier
    const crime = rng(8,1,false)/4 * 1
    const corruption = rng(8,1,false)/4 * 1
    const wealth = rng(8,1,false)/4 * multiplier
    const reserves = rng(8,1,false)/4 * multiplier
    const inflation = rng(8,1,false)/4 * 1
    const taxes = rng(8,1,false)/4 * 1

    const cargoPriceMultipliers = new CountsMap()
    for (const ct of CARGO_TYPES_ALL) {
        cargoPriceMultipliers.setAmount(ct, rng(MARKET_MAX_CARGO_PRICE_MODIFIER, MARKET_MIN_CARGO_PRICE_MODIFIER, false))
    }

    const skillPriceMultipliers = new CountsMap()
    for (const sk of SKILLS_ALL) {
        skillPriceMultipliers.setAmount(sk, rng(ACADEMY_MAX_SKILL_PRICE_MODIFIER, ACADEMY_MIN_SKILL_PRICE_MODIFIER, false))
    }

    // Generate random policies that are valid for this government type
    const validEconomicPolicies = ECONOMIC_POLICIES.filter(p => !p.forbiddenGovs.includes(governmentType))
    const validLaborPolicies = LABOR_POLICIES.filter(p => !p.forbiddenGovs.includes(governmentType))
    const validSocialPolicies = SOCIAL_POLICIES.filter(p => !p.forbiddenGovs.includes(governmentType))
    const validForeignPolicies = FOREIGN_POLICIES.filter(p => !p.forbiddenGovs.includes(governmentType))

    // Weight selection towards favorite policies for this government
    const selectPolicy = (validPolicies) => {
        const favoritePolicies = validPolicies.filter(p => p.favoriteGovs.includes(governmentType))
        // 60% chance to pick a favorite if available, otherwise pick randomly from all valid
        if (favoritePolicies.length > 0 && Math.random() < 0.6) {
            return rndMember(favoritePolicies)
        }
        return rndMember(validPolicies)
    }

    const policies = new Policies(
        selectPolicy(validEconomicPolicies),
        selectPolicy(validLaborPolicies),
        selectPolicy(validSocialPolicies),
        selectPolicy(validForeignPolicies)
    )

    // Generate random race demographics
    const races = new CountsMap()
    const numRaces = rng(3, 1) // 1-3 races present
    
    // Use weighted selection based on race.weight property
    const selectedRaces = []
    for (let i = 0; i < numRaces; i++) {
        // Create weighted pool
        const weightedPool = []
        for (const race of RACES_ALL) {
            // Skip if already selected (unless it's the first selection)
            if (i > 0 && selectedRaces.includes(race)) continue
            // Add race multiple times based on weight
            for (let w = 0; w < race.weight; w++) {
                weightedPool.push(race)
            }
        }
        selectedRaces.push(rndMember(weightedPool))
    }
    
    // Generate random population weights for selected races
    const weights = []
    for (let i = 0; i < selectedRaces.length; i++) {
        // Base random weight, then multiply by race weight for population distribution
        weights.push((Math.random() * 10 + 1) * selectedRaces[i].weight)
    }
    
    // Normalize to sum to 1.0
    const totalWeight = weights.reduce((sum, w) => sum + w, 0)
    for (let i = 0; i < selectedRaces.length; i++) {
        races.setAmount(selectedRaces[i], weights[i] / totalWeight)
    }
    
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
         army, navy, industry, economy, security, culture, prestige, corruption, crime, policies,
         wealth, reserves, inflation, taxes, races, religions, stateReligion, cultures
    })
}
