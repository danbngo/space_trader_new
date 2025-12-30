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
 * @returns {Officer} The generated officer.
 */
function generateOfficer(planet = new Planet()) {
    const {civilization} = planet
    const {education} = civilization
    const level = rng(10*education, 1)
    const credits = 0
    const officer = new Officer(generateOfficerName(planet), credits)
    
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

    return officer
}