class SpaceStationNews extends News {
    constructor(planet = new Planet()) {
        // Find 2-4 other participating planets (including potentially tense relations)
        const possiblePartners = PLANETS.filter(p => 
            p !== planet 
            && !Civilization.areAtWar(planet, p)
            && p.c.technology > CL.SLIGHTLY_HIGH
            && p.c.wealth > CL.SLIGHTLY_LOW
        )
        
        const numPartners = Math.min(rng(4, 2), possiblePartners.length)
        const partners = rndMembers(possiblePartners, numPartners)
        
        // Create partner names string
        const partnerNames = partners.map(p => coloredName(p)).join(', ')
        const allPlanets = [planet, ...partners]
        
        super(
            `${coloredName(planet)} proposes an ambitious interplanetary space station project! ${partnerNames} agree to participate in the joint venture!`,
            `The interplanetary space station is completed! Scientists from ${coloredName(planet)}, ${partnerNames} celebrate this triumph of cooperation!`,
            `The interplanetary space station project collapses due to bickering and political disputes between crew members from different worlds. All invested resources are lost!`,
            `Escalating tensions force the abandonment of the interplanetary space station project between ${coloredName(planet)} and partner worlds!`,
            NT.SPACE_STATION, planet
        )
        
        // Store partners for multi-planet effects
        this.partners = partners
        this.allParticipants = allPlanets

        // Effects for initiator planet
        this.addPlanetEffect(
            {
                taxes: CL.VERY_HIGH,
                cargoPriceMultipliers: new CountsMap(new Map([
                    [CARGO_TYPES.NANITES, CL.VERY_HIGH],
                    [CARGO_TYPES.METAL, CL.HIGH],
                    [CARGO_TYPES.ISOTOPES, CL.HIGH]
                ]))
            },
            {
                taxes: CL.HIGH,
                technology: CL.HIGH,
                education: CL.HIGH,
                prestige: CL.SLIGHTLY_HIGH,
                culture: CL.SLIGHTLY_HIGH
            },
            {
                taxes: CL.VERY_HIGH,
                wealth: CL.LOW,
                prestige: CL.LOW
            }
        )

        // Add effects for all partner planets
        for (const partner of this.partners) {
            this.addEffect(
                {
                    planet: partner,
                    taxes: CL.VERY_HIGH,
                    cargoPriceMultipliers: new CountsMap(new Map([
                        [CARGO_TYPES.NANITES, CL.VERY_HIGH],
                        [CARGO_TYPES.METAL, CL.HIGH]
                    ]))
                },
                {
                    taxes: CL.HIGH,
                    technology: CL.HIGH,
                    education: CL.HIGH,
                    prestige: CL.SLIGHTLY_HIGH,
                    culture: CL.SLIGHTLY_HIGH
                },
                {
                    taxes: CL.VERY_HIGH,
                    wealth: CL.LOW,
                    prestige: CL.LOW
                }
            )
        }
    }

    shouldCancel() {
        // Cancel if any participant goes to war with another participant
        for (let i = 0; i < this.allParticipants.length; i++) {
            for (let j = i + 1; j < this.allParticipants.length; j++) {
                if (Civilization.areAtWar(this.allParticipants[i], this.allParticipants[j])) {
                    return true
                }
            }
        }
        return false
    }

    determineOutcome() {
        // Success depends on all participants maintaining cooperation
        // Average their tech, education, and taxes
        let totalTech = 0
        let totalEducation = 0
        let totalTaxes = 0
        let totalCorruption = 0
        
        for (const p of this.allParticipants) {
            totalTech += p.c.technology
            totalEducation += p.c.education
            totalTaxes += p.c.taxes
            totalCorruption += p.c.corruption
        }
        
        const avgTech = totalTech / this.allParticipants.length
        const avgEducation = totalEducation / this.allParticipants.length
        const avgTaxes = totalTaxes / this.allParticipants.length
        const avgCorruption = totalCorruption / this.allParticipants.length
        
        // More participants = higher chance of disputes, but also more resources
        const cooperationFactor = 1 / Math.sqrt(this.allParticipants.length)
        
        this.rollOutcome(avgTech * avgEducation * avgTaxes * cooperationFactor / avgCorruption, CL.MEDIUM)
    }

    isValid() {
        const {planet: p} = this
        // Check if initiator planet is suitable
        const ratingsValid = p.c.technology > CL.SLIGHTLY_HIGH 
            && p.c.education > CL.SLIGHTLY_HIGH
            && p.c.wealth > CL.MEDIUM
        
        // Need at least 2 other planets to participate
        if (!ratingsValid || this.partners.length < 2) return false
        
        // Check for interfering cooperative events
        const hasInterferingEvent = News.hasAnyNewsBidirectional(p, this.partners[0], NT_COOPERATION_PREVENTING)
        
        return !hasInterferingEvent
    }
}
