
function showCaptainMenu(captain = gs.captain) {

    const {name, level, expPoints, expToNextLevel, skills, skillPoints} = captain

    function calcSkillPointCost(skill = SKILLS_ALL[0]) {
        // Cost increases with current skill level
        const currentLevel = skills.getAmount(skill)
        return 1 + Math.floor(currentLevel / 5) // +1 cost per 5 levels
    }

    function improveSkill(skill = SKILLS_ALL[0]) {
        const cost = calcSkillPointCost(skill)
        captain.skills.increment(skill, 1)
        captain.skillPoints -= cost;
        showCaptainMenu(captain)
    }

    function showReputationTab() {
        // Get all planets with non-zero reputation
        const planetsWithReputation = PLANETS.filter(p => 
            captain.fame.getAmount(p) > 0 || 
            captain.infamy.getAmount(p) > 0 || 
            captain.bounty.getAmount(p) > 0
        )

        const reputationContent = planetsWithReputation.length > 0 ? [
            ...planetsWithReputation.map(planet => ce({children:[
                `<b>${coloredName(planet)}</b>`,
                `  Fame: ${statColorSpan(captain.fame.getAmount(planet), captain.fame.getAmount(planet)/50, true)}`,
                `  Infamy: ${statColorSpan(captain.infamy.getAmount(planet), captain.infamy.getAmount(planet)/50, true)}`,
                `  Bounty: ${colorSpan(String(captain.bounty.getAmount(planet)), captain.bounty.getAmount(planet) > 0 ? 'red' : '', true)} CR`,
            ]})),
            `<br/><b>Total Across All Planets:</b>`,
            `  Fame: ${statColorSpan(captain.fame.total, captain.fame.total/50, true)}`,
            `  Infamy: ${statColorSpan(captain.infamy.total, captain.infamy.total/50, true)}`,
            `  Bounty: ${colorSpan(String(captain.bounty.total), captain.bounty.total > 0 ? 'red' : '', true)} CR`,
        ] : [
            `You have no reputation on any planets yet.`,
            `<br/>Gain fame by defeating enemies and helping others.`,
            `Gain infamy by attacking innocents and breaking the law.`,
        ]

        showModal(
            `Captain Reputation`,
            ce({children: reputationContent}),
            [
                ["Skills", () => showCaptainMenu(captain)],
                ["Close", () => closeModal()],
            ],
            'captain_panel'
        )
    }

    showModal(
        `Captain Overview`,
        ce({children:[
            `Name: ${name}`,
            `Level: ${level} | Exp.: ${expPoints} | To Next Lvl: ${expToNextLevel}`,
            ...SKILLS_ALL.map(sk=>ce({children:[
                `${sk}: ${statColorSpan(skills.getAmount(sk), skills.getAmount(sk)*SKILLS_ALL.length/5/SKILL_POINTS_PER_LEVEL, true)}`
            ]})),
            `Skill Points: ${colorSpan(String(skillPoints), skillPoints > 0 ? 'green' : '', true)}`,
        ]}),
        [
            ...SKILLS_ALL.map(sk => {
                const cost = calcSkillPointCost(sk)
                return [`${sk}+ (${cost})`, ()=>improveSkill(sk), skillPoints < cost]
            }),
            ["Reputation", () => showReputationTab()],
            ["Close", () => closeModal()],
        ],
        'captain_panel'
    );
}


function showCaptainCreationMenu(captain = gs.captain, onClose = ()=>{}) {

    const {name, skills, skillPoints} = captain

    function improveSkill(skill = SKILLS_ALL[0]) {
        captain.skills.increment(skill, 1)
        captain.skillPoints--;
        showCaptainCreationMenu(captain, onClose)
    }
    function resetCaptain() {
        captain.skills = new CountsMap()
        captain.skillPoints = STARTING_SKILL_POINTS;
        showCaptainCreationMenu(captain, onClose)
    }

    showModal(
        `Create Captain`,
        ce({children:[
            `Name: ${name}`,
            ...SKILLS_ALL.map(sk=>ce({children:[
                `${sk}: ${statColorSpan(skills.getAmount(sk), skills.getAmount(sk)*SKILLS_ALL.length/5/SKILL_POINTS_PER_LEVEL, true)}`
            ]})),
            `Skill Points: ${statColorSpan(skillPoints, skillPoints > 0 ? 4 : 1, true)}`,
        ]}),
        [
            ...SKILLS_ALL.map(sk=>[`${sk}+`, ()=>improveSkill(sk), skillPoints <= 0]),
            ["Reset", ()=>resetCaptain()],
            ["Finish", () => {
                console.log('finishing captain creation',captain)
                closeModal()
                console.log('going to run:',onClose)
                onClose()
            }],
        ],
        'captain_panel'
    );
}
