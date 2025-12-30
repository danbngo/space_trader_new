/**
 * Generates a civilization for a planet with randomized attributes.
 * @param {Planet} planet - The planet to generate civilization for.
 * @returns {Civilization} The generated civilization.
 */
function generateCivilization(planet = new Planet()) {
    const governmentType = rndMember(GT_ALL.filter(gt => gt != GT.PUPPET_STATE))
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
    const inflation = rng(8,1,false)/4
    const taxes = rng(8,1,false)/4

    const cargoPriceMultipliers = new CountsMap()
    for (const ct of CARGO_TYPES_ALL) {
        cargoPriceMultipliers.setAmount(ct, rng(MARKET_MAX_CARGO_PRICE_MODIFIER, MARKET_MIN_CARGO_PRICE_MODIFIER, false))
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

    return new Civilization({
        planet, governmentType, cargoPriceMultipliers, technology, education, territory, population,
         army, navy, industry, economy, security, culture, prestige, corruption, crime, policies,
         wealth, reserves, inflation, taxes
    })
}
