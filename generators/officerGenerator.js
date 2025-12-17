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
    for (let i = 0; i < level; i++) {
        officer.levelUp(true)
    }
    officer.expPoints = 0
    return officer
}