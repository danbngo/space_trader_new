class PolicyChangeNews extends News {
    constructor(planet = new Planet()) {
        // Determine which policy category to change
        const policyCategories = ['economic', 'labor', 'social', 'foreign']
        const categoryToChange = rndMember(policyCategories)
        
        // Get valid policies for this planet's government
        let validPolicies = []
        let currentPolicy = null

        const pl = planet
        
        switch(categoryToChange) {
            case 'economic':
                validPolicies = ECONOMIC_POLICIES.filter(p => !p.forbiddenGovs.includes(pl.c.governmentType))
                currentPolicy = pl.c.policies.economic
                break
            case 'labor':
                validPolicies = LABOR_POLICIES.filter(p => !p.forbiddenGovs.includes(pl.c.governmentType))
                currentPolicy = pl.c.policies.labor
                break
            case 'social':
                validPolicies = SOCIAL_POLICIES.filter(p => !p.forbiddenGovs.includes(pl.c.governmentType))
                currentPolicy = pl.c.policies.social
                break
            case 'foreign':
                validPolicies = FOREIGN_POLICIES.filter(p => !p.forbiddenGovs.includes(pl.c.governmentType))
                currentPolicy = pl.c.policies.foreign
                break
        }
        
        // Filter out current policy and get a new one
        validPolicies = validPolicies.filter(p => p !== currentPolicy)
        const newPolicy = rndMember(validPolicies)
        
        super(
            `${coloredName(planet)} adopts a new ${categoryToChange} policy: ${coloredName(newPolicy)}!`,
            `${coloredName(planet)} successfully implements ${coloredName(newPolicy)} policy!`,
            `${coloredName(planet)} struggles to implement ${coloredName(newPolicy)} policy and abandons the reforms!`,
            '',
            NT.POLICY_CHANGE, planet
        )

        this.categoryToChange = categoryToChange
        this.oldPolicy = currentPolicy
        this.newPolicy = newPolicy

        // Base effects with variation based on policy flavor
        const baseParams = {
            prestige: CL.LOW,
        }

        if (newPolicy.flavor === NF.ECONOMY) {
            baseParams.economy = CL.SLIGHTLY_LOW
            baseParams.inflation = CL.SLIGHTLY_HIGH
        } else if (newPolicy.flavor === NF.LABOR) {
            baseParams.industry = CL.SLIGHTLY_LOW
            baseParams.reserves = CL.SLIGHTLY_LOW
        } else if (newPolicy.flavor === NF.CULTURE) {
            baseParams.culture = CL.SLIGHTLY_LOW
            baseParams.prestige = CL.SLIGHTLY_LOW
        } else if (newPolicy.flavor === NF.POLITICS) {
            baseParams.crime = CL.SLIGHTLY_HIGH
            baseParams.corruption = CL.SLIGHTLY_HIGH
        }

        const invertedBaseParams = new Civilization(baseParams).getInverse()

        this.addPlanetEffect(
            baseParams,
            {
                onApply: () => {
                    switch(this.categoryToChange) {
                        case 'economic':
                            this.planet.c.policies.economic = this.newPolicy
                            break
                        case 'labor':
                            this.planet.c.policies.labor = this.newPolicy
                            break
                        case 'social':
                            this.planet.c.policies.social = this.newPolicy
                            break
                        case 'foreign':
                            this.planet.c.policies.foreign = this.newPolicy
                            break
                    }
                }
            },
            invertedBaseParams,
            baseParams //retain bad effects
        )
    }

    determineOutcome() {
        const {planet: p} = this
        // Higher prestige, culture, and stability make policy changes more likely to succeed
        const successProbability = (p.c.prestige + p.c.culture + p.c.security) / 3
        this.rollOutcome(successProbability, CL.MEDIUM)
    }

    isValid() {
        const {planet: p} = this
        // cultures with higher culture, education more prone to change
        const ratingsValid = p.c.culture > CL.HIGH || p.c.education > CL.HIGH &&
        //something needs to be going bad
            (p.c.economy < CL.LOW || p.c.industry < CL.LOW || p.c.security < CL.LOW || p.c.taxes > CL.HIGH || p.c.culture < CL.LOW || p.c.corruption > CL.HIGH || p.c.crime > CL.HIGH || p.c.prestige < CL.LOW || p.c.wealth < CL.LOW)
        
        // Can't change policy during major upheaval
        const interferingEvent = News.planetHasAnyNews(p, NT_GOVERNANCE_PREVENTING) || News.planetHasAnyNewsTargeting(p, NT_WARLIKE)
        
        return ratingsValid && !interferingEvent
    }
}
