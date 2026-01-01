/**
 * Generates a procedural name for an officer.
 * @param {Planet} planet - The planet the officer is from.
 * @returns {string} The generated officer name.
 */
function generateOfficerName(planet = new Planet()) {
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
 * @param {boolean} withImplants - Whether to generate cyber implants (for tavern hires).
 * @param {string|null} reputationType - 'fame' for guild officers, 'both' for tavern officers, null for none.
 * @returns {Officer} The generated officer.
 */
function generateOfficer(planet = new Planet(), withImplants = false, reputationType = null) {
    const {civilization} = planet
    const {education} = civilization
    const level = rng(10*education, 1)
    const credits = 0
    const officer = new Officer(generateOfficerName(planet), credits)
    
    // Assign random race
    officer.race = rndMember(RACES_ALL)
    
    // Assign religion based on planet's religious distribution
    if (civilization.religions && civilization.religions.counts.size > 0) {
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
    
    // Level up to target level
    for (let i = 0; i < level; i++) {
        officer.levelUp(false) // Don't auto-improve skills during leveling
    }
    
    officer.skillPoints = Math.max(0, officer.skillPoints*rng(2,0.5,false))
    officer.autoImproveSkills()
    
    // Calculate age based on level (21-55 years old)
    // Lower levels = younger, higher levels = older
    const minAge = 21
    const maxAge = 55
    const levelFactor = Math.min(officer.level / 10, 1) // Normalize level to 0-1 range
    officer.age = Math.round(minAge + (maxAge - minAge) * levelFactor)
    
    // Assign CITIZEN rank to planet of origin
    officer.ranks.set(planet, RANK_TYPES.CITIZEN)

    // Add cyber implants if from tavern (0-3 random implants)
    if (withImplants && CYBER_IMPLANT_TYPES_ALL) {
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

    // Add reputation for home planet (capped at 50 * level)
    if (reputationType) {
        const maxReputation = 50 * officer.level
        
        if (reputationType === 'fame' || reputationType === 'both') {
            const fame = rng(maxReputation, 0)
            if (fame > 0) {
                officer.fame.increment(planet, fame)
            }
        }
        
        if (reputationType === 'both') {
            const infamy = rng(maxReputation, 0)
            if (infamy > 0) {
                officer.infamy.increment(planet, infamy)
            }
        }
    }

    return officer
}