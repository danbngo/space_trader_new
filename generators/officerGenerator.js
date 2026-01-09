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
 * @returns {Officer} The generated officer.
 */
function generateOfficer(planet = new Planet()) {
    //console.log('generating officer for planet:',planet)
    const {civilization} = planet
    const {education} = civilization
    const credits = 0
    
    // Calculate level based on education
    const baseLevel = Math.round(rng(10*education, 1))
    
    // Calculate age based on level with proper scaling
    // At age 20: level ~1, at age 100 (base retirement): level ~2*AVERAGE_OFFICER_LEVEL (20)
    //console.log('rolling for age..')
    const yearsOfExperience = (baseLevel / (2 * AVERAGE_OFFICER_LEVEL)) * (MAXIMUM_RETIREMENT_AGE - MINIMUM_OFFICER_AGE)
    const age = Math.round(MINIMUM_OFFICER_AGE + yearsOfExperience)
    
    // Clamp age to reasonable bounds (minimum age to max retirement age)
    const clampedAge = Math.max(MINIMUM_OFFICER_AGE, Math.min(age, MAXIMUM_RETIREMENT_AGE))
    
    // Recalculate level based on clamped age to ensure consistency
    // Level scaling: at base retirement (80 years exp) = 2x AVERAGE
    const actualYearsOfExperience = clampedAge - MINIMUM_OFFICER_AGE
    const baseYearsToRetirement = MAXIMUM_RETIREMENT_AGE - MINIMUM_OFFICER_AGE // 80 years
    const levelFromAge = 1 + Math.round((actualYearsOfExperience / baseYearsToRetirement) * (2 * AVERAGE_OFFICER_LEVEL - 1) * education)
    const level = Math.max(1, levelFromAge)
    
    // Determine officer's cultural planet of origin
    let culturalPlanet = planet // Default to current planet
    // Create officer with determined age and cultural planet of origin
    const officer = new Officer(generateOfficerName(culturalPlanet), culturalPlanet, clampedAge, credits)
    
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

    //console.log('adding reputation for home planet...')
    // Add some random reputation
    const maxReputation = 50 * officer.level
    const reputation = rng(maxReputation, -maxReputation)
    if (reputation !== 0) {
        officer.reputation.increment(planet, reputation)
    }

    return officer
}