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
