/**
 * Generates a procedural name for an officer.
 * @param {Planet} planet - The planet the officer is from.
 * @returns {string} The generated officer name.
 */
function generateOfficerName(planet = new Planet()) {
    console.log('generating officer name for planet:',planet)
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
    console.log('generating officer for planet:',planet)
    const {civilization} = planet
    const {education} = civilization
    const level = rng(10*education, 1)
    const credits = 0
    const officer = new Officer(generateOfficerName(planet), planet, factionType, credits)
    
    console.log('determining race..')
    // Assign random race
    officer.race = rndMember(RACES_ALL)
    
    console.log('determining religion..')
    // If faction is religious, assign state religion; otherwise use planet distribution
    if (factionType.religious && civilization.stateReligion) {
        officer.religion = civilization.stateReligion
    } else if (civilization.religions && civilization.religions.counts.size > 0) {
        const religionEntries = Array.from(civilization.religions.counts.entries())
        const totalWeight = religionEntries.reduce((sum, [_, weight]) => sum + weight, 0)
        const roll = Math.random() * totalWeight
        let cumulative = 0
        for (const [religion, weight] of religionEntries) {
            cumulative += weight
            if (roll <= cumulative) {
                officer.religion = religion
                break
            }
        }
    }
    
    // Default to AGNOSTICISM if no religion was assigned
    if (!officer.religion) {
        officer.religion = RELIGION_AGNOSTICISM
    }
    
    console.log('applying levelups..')
    // Level up to target level
    for (let i = 0; i < level; i++) {
        officer.levelUp(false) // Don't auto-improve skills during leveling
    }
    console.log('improving skills..')
    officer.skillPoints = Math.max(0, officer.skillPoints*rng(2,0.5,false))
    officer.autoImproveSkills()
    
    // Calculate age based on level (21-55 years old)
    // Lower levels = younger, higher levels = older
    console.log('rolling for age..')
    const minAge = 21
    const maxAge = 55
    const levelFactor = Math.min(officer.level / 10, 1) // Normalize level to 0-1 range
    officer.age = Math.round(minAge + (maxAge - minAge) * levelFactor)
    
    // Assign CITIZEN rank to planet of origin
    console.log('assigning citizen rank to planet of origin..')
    officer.ranks.set(planet, RANK_TYPES.CITIZEN)

    console.log('adding implants...')
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
    
    console.log('adding reputation for home planet...')
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