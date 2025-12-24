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
    
    // Manually distribute skill points with more variance
    // Some officers might have spent more or fewer points than they've earned
    const totalSkillPoints = officer.skillPoints + (level - 1) * SKILL_POINTS_PER_LEVEL
    const pointsToSpend = Math.floor(totalSkillPoints * rng(1.2, 0.5, false)) // 50% to 120% of available points
    
    for (let i = 0; i < pointsToSpend; i++) {
        const skill = rndMember(SKILLS_ALL)
        officer.skills.increment(skill, 1)
    }
    
    // Update remaining skill points
    officer.skillPoints = Math.max(0, totalSkillPoints - pointsToSpend)
    officer.expPoints = 0
    return officer
}