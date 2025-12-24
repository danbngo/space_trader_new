
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

        // Build table rows: header + planet rows + total row
        const tableRows = [
            // Header row
            ['Planet', 'Bounty', 'Fame', 'Infamy'],
            // Data rows for each planet
            ...gs.system.planets.map(planet => [
                coloredName(planet),
                `${statColorSpan(captain.bounty.getAmount(planet), 1000/(1000+captain.bounty.getAmount(planet)), true)} CR`,
                statColorSpan(captain.fame.getAmount(planet), 1 + captain.fame.getAmount(planet)/50, true),
                statColorSpan(captain.infamy.getAmount(planet), 1 / (1 + captain.infamy.getAmount(planet)/50), true),
            ]),
            // Total row
            [
                '<b>Total</b>',
                `${statColorSpan(captain.bounty.total, (1+gs.system.planets.length)*1000/(2000+captain.bounty.total), true)} CR`,
                statColorSpan(captain.fame.total, 1 + captain.fame.total/50, true),
                statColorSpan(captain.infamy.total, 1 / (1 + captain.infamy.total/50), true),
            ]
        ]

        const reputationTable = createTable(tableRows)

        showModal(
            `Captain Reputation`,
            ce({children: [
                reputationTable,
            ]}),
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
