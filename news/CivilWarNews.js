class CivilWarNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)} is being torn apart by two factions! Civil war has begun!`,
            `${coloredName(planet)}'s civil war ends with minimal fighting as the two sides are able to reach a political compromise!`,
            `${coloredName(planet)}'s civil war ends in mass devastation as one side brutally crushes the other!`,
            '',
            NT.CIVIL_WAR, planet
        )

        const buildingsDisabled = rndMembers(News.calcDestroyableBuildings(this.planet), rng(3, 1), true)
        const newGovernmentType = Math.random() > .5 ? this.planet.culture.governmentType : rndMember(GT_ALL.filter(g => g !== GT.PUPPET_STATE))

        this.startEffects = [
            new NewsEffect({
                planet: this.planet,
                //newGovernmentType: GT.ANARCHY, //there IS a government still
                territory: CL.SLIGHTLY_LOW,
                military: CL.VERY_LOW,
                security: CL.VERY_LOW,
                crime: CL.VERY_HIGH,
                //population: CL.LOW,
                economy: CL.LOW,
                industry: CL.LOW,
                marketCargoAmounts: CL.LOW,
                marketPrices: CL.HIGH,
                credits: CL.LOW,
                prestige: CL.LOW,
                cargoPriceModifiers: new Map([[CARGO_TYPES.WEAPONS, CL.ASTRONOMICAL], [CARGO_TYPES.ANTIMATTER, CL.EXTREMELY_HIGH]]),
            })
        ]

        this.endEffects = this.startEffects.map(effect => effect.getInverse())
        Object.assign(this.endEffects[0], {newGovernmentType})

        this.failEndEffects = this.startEffects.map(effect => effect.getHalfRegression())
        Object.assign(this.failEndEffects[0], {
            buildingsDisabled,
            newGovernmentType,
        })
    }

    determineOutcome() {
        const {planet} = this
        this.rollOutcome(0.5*(planet.culture.security+planet.culture.prestige)/planet.culture.population, CL.HIGH)
    }
    isValid() {
        const {planet} = this
        //usually happens when military or security is large
        const ratingsValid = planet.culture.military > CL.VERY_HIGH || planet.culture.security > CL.VERY_HIGH
        //cant be having any of: construction, economic boom, revolution
        const interferingEvent =
            News.planetHasAnyNews(planet, [NT.CIVIL_WAR, NT.ECONOMIC_BOOM, NT.REVOLUTION]) ||
            News.hasNewsTargeting(NT.WAR, planet)
        return ratingsValid && !interferingEvent
    }
}
