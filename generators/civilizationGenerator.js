/**
 * Generates a civilization for a planet with randomized attributes.
 * @param {Planet} planet - The planet to generate civilization for.
 * @returns {Civilization} The generated civilization.
 */
function generateCivilization(planet = new Planet()) {
    const governmentType = rndMember(GT_ALL.filter(gt => gt != GT.PUPPET_STATE))
    // Dwarf planets are small outposts with reduced stats (0.25x)
    const dwarfMultiplier = isDwarfPlanet(planet) ? 0.25 : 1.0
    const technology = rng(4,1,false)/2 * dwarfMultiplier
    const education = rng(4,1,false)/2 * dwarfMultiplier
    const population = rng(8,1,false)/4 * dwarfMultiplier
    const territory = rng(8,1,false)/4 * dwarfMultiplier
    const army = rng(8,1,false)/4 * dwarfMultiplier
    const navy = rng(8,1,false)/4 * dwarfMultiplier
    const security = rng(8,1,false)/4 * dwarfMultiplier
    const economy = rng(8,1,false)/4 * dwarfMultiplier
    const industry = rng(8,1,false)/4 * dwarfMultiplier
    const culture = rng(8,1,false)/4 * dwarfMultiplier
    const prestige = rng(8,1,false)/4 * dwarfMultiplier
    const crime = rng(8,1,false)/4 * dwarfMultiplier
    const corruption = rng(8,1,false)/4 * dwarfMultiplier
    const wealth = rng(8,1,false)/4 * dwarfMultiplier
    const reserves = rng(8,1,false)/4 * dwarfMultiplier
    const inflation = rng(8,1,false)/4 * dwarfMultiplier
    const taxes = rng(8,1,false)/4 * dwarfMultiplier

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
    const races = new Map()
    const numRaces = rng(3, 1) // 1-3 races present
    const selectedRaces = rndMembers(RACES_ALL, numRaces, true)
    
    // Generate random weights
    const weights = []
    for (let i = 0; i < selectedRaces.length; i++) {
        weights.push(Math.random() * 10 + 1) // Random weight between 1-11
    }
    
    // Normalize to sum to 1.0
    const totalWeight = weights.reduce((sum, w) => sum + w, 0)
    for (let i = 0; i < selectedRaces.length; i++) {
        races.set(selectedRaces[i], weights[i] / totalWeight)
    }

    // Generate random religion demographics from star system religions
    const religions = new CountsMap()
    let stateReligion = null
    if (RELIGIONS && RELIGIONS.length > 0) {
        const numReligions = Math.min(rng(RELIGIONS.length, 1), RELIGIONS.length)
        const selectedReligions = rndMembers(RELIGIONS, numReligions, true)
        
        // Set state religion first (70% chance if religions exist)
        if (Math.random() < 0.7 && selectedReligions.length > 0) {
            stateReligion = rndMember(selectedReligions)
        }
        
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
        
        // Normalize to sum to 1.0
        const totalReligionWeight = religionWeights.reduce((sum, w) => sum + w, 0)
        for (let i = 0; i < selectedReligions.length; i++) {
            religions.setAmount(selectedReligions[i], religionWeights[i] / totalReligionWeight)
        }
        
        // Ensure normalized
        religions.normalize()
    }

    return new Civilization({
        planet, governmentType, cargoPriceMultipliers, technology, education, territory, population,
         army, navy, industry, economy, security, culture, prestige, corruption, crime, policies,
         wealth, reserves, inflation, taxes, races, religions, stateReligion
    })
}
