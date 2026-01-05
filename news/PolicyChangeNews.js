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
        this.oldGovernmentType = planet.c.governmentType
        this.categoryToChange = categoryToChange
        this.oldPolicy = currentPolicy
        this.newPolicy = newPolicy

        // Base effects with variation based on policy flavor
        const baseParams = {
            prestige: CL.LOW,
        }

        if (newPolicy.flavor === NF.ECONOMY) {
            baseParams.economy = CL.SLIGHTLY_LOW
            baseParams.taxes = CL.SLIGHTLY_LOW
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
        const successProbability = (p.c.prestige + p.c.culture + p.c.security + p.c.taxes) / 4
        this.rollOutcome(successProbability, CL.MEDIUM)
    }

    shouldCancel() {
        const {planet: p} = this
        // Policy change cancelled if government type changes (new government abandons reforms)
        return p.c.governmentType !== this.oldGovernmentType
    }

    isValid() {
        const {planet: p} = this
        // cultures with higher culture, education more prone to change
        //something needs to be going bad
        //relaxed all ratings requirements, doesnt make sense...
        const ratingsValid = p.c.score < CL.MEDIUM //(p.c.culture > CL.MEDIUM || p.c.education > CL.MEDIUM) && p.c.score < CL.MEDIUM
        
        // Can't change policy during major upheaval
        const interferingEvent = News.planetHasAnyNews(p, NT_GOVERNANCE_PREVENTING) || News.planetHasAnyNewsTargeting(p, NT_WARLIKE)
        
        return ratingsValid && !interferingEvent
    }
}
