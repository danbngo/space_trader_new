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
    const {culture} = planet
    const {officerQuality} = culture
    const level = rng(10*officerQuality, 1)
    const fame = rng(level, -level)
    const infamy = rng(level, -level)
    const bounty = 0
    const credits = 0
    const officer = new Officer(generateOfficerName(planet), credits, fame, infamy, bounty)
    
    // Level up to target level
    for (let i = 0; i < level; i++) {
        officer.levelUp(false) // Don't auto-improve skills during leveling
    }
    
    officer.skillPoints = Math.max(0, officer.skillPoints*rng(2,0.5,false))
    officer.autoImproveSkills()

    return officer
}