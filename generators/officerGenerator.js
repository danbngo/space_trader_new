/**
 * Generates a procedural name for an officer.
 * @param {Planet} planet - The planet the officer is from.
 * @returns {string} The generated officer name.
 */
function generateOfficerName(planet = new Planet()) {
    //console.log('generating officer name for planet:',planet)
    const syllables = ["ka", "zo", "ri", "tan", "vek", "shi", "lor", "an", "ex", "qu"];
    let name = "";
    const syllableCount = rng(5,2)
    for(let i=0;i<syllableCount;i++) {
        name += syllables[rng(syllables.length-1)];
    }
    name += ' of ' + planet.name
    return name.charAt(0).toUpperCase() + name.slice(1);
}
/**
 * Generates an officer with skills based on planet quality.
 * @param {Planet} planet - The planet the officer is from.
 * @param {FactionType} factionType - The faction type of the officer.
 * @returns {Officer} The generated officer.
 */
function generateOfficer(planet = new Planet(), factionType = FACTION_TYPES_ALL[0]) {
    //console.log('generating officer for planet:',planet)
    const {civilization} = planet
    const {education} = civilization
    const credits = 0
    
    //console.log('determining race..')
    // Assign race based on planet's racial distribution
    let race = null
    if (civilization.races && civilization.races.counts.size > 0) {
        const raceEntries = Array.from(civilization.races.counts.entries())
        const totalWeight = raceEntries.reduce((sum, [_, weight]) => sum + weight, 0)
        const roll = Math.random() * totalWeight
        let cumulative = 0
        for (const [raceCandidate, weight] of raceEntries) {
            cumulative += weight
            if (roll <= cumulative) {
                race = raceCandidate
                break
            }
        }
    }
    
    // Default to random race if no race distribution exists
    if (!race) {
        race = rndMember(RACES_ALL)
    }
    
    // Calculate level based on education and race life extension
    // Races with life extension perks can reach higher levels (androids live longer)
    let lifeExtensionMultiplier = 1.0
    if (race && race.automaticPerks) {
        // Count how many LIFE_EXTENSION perks this race has
        const lifeExtensionPerks = race.automaticPerks.filter(p => p.name.includes('Long Lived'))
        if (lifeExtensionPerks.length > 0) {
            // Each life extension tier adds 20% to max age, which means 20% more potential levels
            // 5 tiers = 100% increase = 2x the levels
            lifeExtensionMultiplier = 1.0 + (lifeExtensionPerks.length * 0.20)
        }
    }
    const baseLevel = Math.round(rng(10*education*lifeExtensionMultiplier, 1))
    
    //console.log('determining religion..')
    // If faction is religious, assign state religion; otherwise use planet distribution
    let religion = null
    if (factionType.religious && civilization.stateReligion) {
        religion = civilization.stateReligion
    } else if (civilization.religions && civilization.religions.counts.size > 0) {
        const religionEntries = Array.from(civilization.religions.counts.entries())
        const totalWeight = religionEntries.reduce((sum, [_, weight]) => sum + weight, 0)
        const roll = Math.random() * totalWeight
        let cumulative = 0
        for (const [religionCandidate, weight] of religionEntries) {
            cumulative += weight
            if (roll <= cumulative) {
                religion = religionCandidate
                break
            }
        }
    }
    
    // Default to AGNOSTICISM if no religion was assigned
    if (!religion) {
        religion = RELIGION_AGNOSTICISM
    }
    
    // Calculate age based on level with proper scaling
    // At age 20: level ~1, at age 100 (base retirement): level ~2*AVERAGE_OFFICER_LEVEL (20)
    // At age 200 (with max life extension): level ~4*AVERAGE_OFFICER_LEVEL (40)
    //console.log('rolling for age..')
    const baseMaxAge = MAXIMUM_RETIREMENT_AGE * lifeExtensionMultiplier
    const yearsOfExperience = (baseLevel / (2 * AVERAGE_OFFICER_LEVEL)) * (MAXIMUM_RETIREMENT_AGE - MINIMUM_OFFICER_AGE)
    const age = Math.round(MINIMUM_OFFICER_AGE + yearsOfExperience)
    
    // Clamp age to reasonable bounds (minimum age to max retirement age with life extension)
    const clampedAge = Math.max(MINIMUM_OFFICER_AGE, Math.min(age, baseMaxAge))
    
    // Recalculate level based on clamped age to ensure consistency
    // Level scaling: at base retirement (80 years exp) = 2x AVERAGE, at 180 years exp = 4x AVERAGE
    const actualYearsOfExperience = clampedAge - MINIMUM_OFFICER_AGE
    const baseYearsToRetirement = MAXIMUM_RETIREMENT_AGE - MINIMUM_OFFICER_AGE // 80 years
    const levelFromAge = 1 + Math.round((actualYearsOfExperience / baseYearsToRetirement) * (2 * AVERAGE_OFFICER_LEVEL - 1) * education)
    const level = Math.max(1, levelFromAge)
    
    // Create officer with determined race, religion, and age
    const officer = new Officer(generateOfficerName(planet), planet, factionType, race, religion, clampedAge, credits)
    
    //console.log('applying levelups..')
    // Level up to target level
    for (let i = 0; i < level; i++) {
        officer.levelUp(false) // Don't auto-improve skills during leveling
    }
    //console.log('improving skills..')
    officer.skillPoints = Math.max(0, officer.skillPoints*rng(2,0.5,false))
    officer.autoImproveSkills()
    
    // Assign CITIZEN rank to planet of origin
    //console.log('assigning citizen rank to planet of origin..')
    officer.ranks.set(planet, RANK_TYPES.CITIZEN)

    //console.log('adding implants...')
    // Add cyber implants if criminal faction (0-3 random implants)
    if (factionType.criminal && CYBER_IMPLANT_TYPES_ALL) {
        const numImplants = rng(3, 0)
        const availableImplants = [...CYBER_IMPLANT_TYPES_ALL]
        for (let i = 0; i < numImplants && availableImplants.length > 0; i++) {
            const implantIndex = rng(availableImplants.length - 1, 0)
            const implantType = availableImplants[implantIndex]
            const quality = rng(1, 0.5, false)
            officer.implants.push(new CyberImplant(implantType, quality))
            // Remove to avoid duplicates
            availableImplants.splice(implantIndex, 1)
        }
    }
    
    //console.log('adding reputation for home planet...')
    // Reputation based on faction type
    const maxReputation = 50 * officer.level
    if (factionType.authority) {
        // Authority factions get positive reputation
        const fame = rng(maxReputation, 0)
        if (fame > 0) {
            officer.reputation.increment(planet, fame)
        }
    } else if (factionType.criminal) {
        // Criminal factions get negative reputation (infamy)
        const infamy = rng(maxReputation, 0)
        if (infamy > 0) {
            officer.reputation.increment(planet, -infamy)
        }
        
        // Add bounty for criminals
        const bounty = rng(officer.level * 1000, officer.level * 100)
        officer.bounty.setAmount(planet, bounty)
    }
    // Otherwise reputation stays at 0

    return officer
}