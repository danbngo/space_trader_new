class PolicyChangeNews extends News {
    constructor(planet = new Planet()) {
        // Determine which policy category to change
        const policyCategories = ['economic', 'labor', 'social', 'foreign']
        const categoryToChange = rndMember(policyCategories)
        
        // Get valid policies for this planet's government
        let validPolicies = []
        let currentPolicy = null
        
        switch(categoryToChange) {
            case 'economic':
                validPolicies = ECONOMIC_POLICIES.filter(p => !p.forbiddenGovs.includes(p.c.governmentType))
                currentPolicy = p.c.policies.economic
                break
            case 'labor':
                validPolicies = LABOR_POLICIES.filter(p => !p.forbiddenGovs.includes(p.c.governmentType))
                currentPolicy = p.c.policies.labor
                break
            case 'social':
                validPolicies = SOCIAL_POLICIES.filter(p => !p.forbiddenGovs.includes(p.c.governmentType))
                currentPolicy = p.c.policies.social
                break
            case 'foreign':
                validPolicies = FOREIGN_POLICIES.filter(p => !p.forbiddenGovs.includes(p.c.governmentType))
                currentPolicy = p.c.policies.foreign
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

        // Base effects depend on policy category being changed
        const baseEffects = {
            planet: this.planet,
            civilizationMultipliers: new Civilization({
                prestige: CL.LOW,\n                economy: CL.LOW
            })
        }

        // Add some variation based on policy flavor
        if (newPolicy.flavor === NF.ECONOMY) {
            baseEffects.civilizationMultipliers.inflation = CL.MEDIUM
        } else if (newPolicy.flavor === NF.LABOR) {
            baseEffects.civilizationMultipliers.economy = CL.MEDIUM
        } else if (newPolicy.flavor === NF.CULTURE) {
            baseEffects.civilizationMultipliers.culture = CL.MEDIUM
            baseEffects.civilizationMultipliers.crime = CL.MEDIUM
        } else if (newPolicy.flavor === NF.POLITICS) {
            baseEffects.civilizationMultipliers.prestige = CL.MEDIUM
        }

        this.startEffects = [new NewsEffect(baseEffects)]
        
        // On completion, apply the policy change
        this.completeEffects = this.startEffects.map(effect => effect.getInverse())
        this.completeEffects[0].onApply = () => {
            switch(this.categoryToChange) {
                case 'economic':
                    this.p.c.policies.economic = this.newPolicy
                    break
                case 'labor':
                    this.p.c.policies.labor = this.newPolicy
                    break
                case 'social':
                    this.p.c.policies.social = this.newPolicy
                    break
                case 'foreign':
                    this.p.c.policies.foreign = this.newPolicy
                    break
            }
        }

        // On failure, revert the economic/prestige hits but don't change policy
        this.failEffects = this.startEffects.map(effect => effect.getInverse())
        this.failEffects[0].civilizationMultipliers.multiply(new Civilization({
            prestige: CL.SLIGHTLY_LOW,
            economy: CL.SLIGHTLY_LOW
        }))

        this.cancelEffects = this.startEffects.map(effect => effect.getInverse())
    }

    determineOutcome() {
        const {planet: p} = this
        // Higher prestige, culture, and stability make policy changes more likely to succeed
        const successProbability = (p.c.prestige + p.c.culture + p.c.security) / 3
        this.rollOutcome(successProbability, CL.MEDIUM)
    }

    isValid() {
        const {planet: p} = this
        // More likely during stable times with decent prestige
        const ratingsValid = p.c.prestige > CL.LOW && p.c.security > CL.LOW
        
        // Can't change policy during major upheaval
        const interferingEvent = News.planetHasAnyNews(planet, [
            NT.REVOLUTION, NT.CIVIL_WAR, NT.COUP_DETAT, NT.POLICY_CHANGE, NT.WAR
        ]) || News.hasNewsTargeting(NT.WAR, planet)
        
        return ratingsValid && !interferingEvent
    }
}
