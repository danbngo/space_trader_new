class SocialMediaNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)} launches revolutionary neural social networks connecting minds across the system!`,
            `${coloredName(planet)}'s social networks foster unprecedented communication, empathy, and intellectual growth!`,
            `${coloredName(planet)}'s social networks spread misinformation and algorithmic manipulation!`,
            '',
            NT.SOCIAL_MEDIA, planet
        )

        this.addPlanetEffect(
            {
                wealth: CL.HIGH,
                economy: CL.SLIGHTLY_HIGH,
                prestige: CL.SLIGHTLY_HIGH,
                taxes: CL.SLIGHTLY_LOW,
            },
            {
                wealth: CL.HIGH,
                economy: CL.SLIGHTLY_HIGH,
                prestige: CL.HIGH,
                taxes: CL.SLIGHTLY_LOW,
                culture: CL.SLIGHTLY_HIGH,
                technology: CL.SLIGHTLY_HIGH,
                security: CL.SLIGHTLY_HIGH,
            },
            {
                wealth: CL.HIGH,
                economy: CL.SLIGHTLY_HIGH,
                taxes: CL.SLIGHTLY_LOW,
                culture: CL.LOW,
                security: CL.LOW,
                crime: CL.SLIGHTLY_HIGH,
                corruption: CL.SLIGHTLY_HIGH,
                education: CL.SLIGHTLY_LOW,
            }
        )
    }

    determineOutcome() {
        // Success based on education, technology, and culture
        this.rollOutcome(this.planet.c.education * this.planet.c.technology * this.planet.c.culture, CL.MEDIUM)
    }

    isValid() {
        const {planet: p} = this
        // More likely in high-tech, educated societies
        const ratingsValid = p.c.technology > CL.HIGH && p.c.education > CL.MEDIUM && p.c.wealth > CL.SLIGHTLY_HIGH
        return ratingsValid
    }
}
