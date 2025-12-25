
function showCaptainSkillsMenu(captain = gs.captain, selectedSkill = SKILLS_ALL[0]) {
    console.log('showCaptainSkillsMenu called with captain:',captain,'selectedSkill:',selectedSkill)
    const {name, level, expPoints, expToNextLevel, skills, skillPoints} = captain

    function improveSkill(skill = SKILLS_ALL[0]) {
        const cost = captain.calcSkillPointsToUpgrade(skill)
        captain.skills.increment(skill, 1)
        captain.skillPoints -= cost;
        showCaptainSkillsMenu(captain, skill)
    }

    function onSelectSkill(skill = SKILLS_ALL[0]) {
        console.log('on select skill:',skill)
        const cost = captain.calcSkillPointsToUpgrade(skill)
        const canAfford = skillPoints >= cost
        const buttons = [
            ['Upgrade', () => improveSkill(skill), !canAfford],
            ['Reputation', () => showCaptainReputationMenu()],
            ['Close', () => closeModal()],
        ]
        refreshPanelButtons('captain_panel', buttons)
    }

    // Build skills table
    const skillTableRows = [
        ['Skill', 'Level', 'Cost to Upgrade'],
        ...SKILLS_ALL.map(sk => [
            sk,
            statColorSpan(skills.getAmount(sk), skills.getAmount(sk)*SKILLS_ALL.length/5/SKILL_POINTS_PER_LEVEL, true),
            captain.calcSkillPointsToUpgrade(sk)
        ])
    ]

    const skillTable = createTable(skillTableRows, (rowIndex) => onSelectSkill(SKILLS_ALL[rowIndex]), selectedSkill ? SKILLS_ALL.indexOf(selectedSkill) + 1 : null)

    showModal(
        `Captain Overview`,
        ce({children:[
            `Name: ${name}`,
            `Level: ${level} | Exp.: ${expPoints} | To Next Lvl: ${expToNextLevel}`,
            `Skill Points: ${colorSpan(String(skillPoints), skillPoints > 0 ? 'green' : '', true)}`,
            skillTable,
        ]}),
        [
            ["Reputation", () => showCaptainReputationMenu()],
            ["Close", () => closeModal()],
        ],
        'captain_panel'
    );

    if (selectedSkill) {
        console.log('auto selecting skill:',selectedSkill)
        onSelectSkill(selectedSkill);
    }
}


function showCaptainReputationMenu() {
    const captain = gs.captain
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
            `${statColorSpan(captain.bounty.total, 1000/(1000+captain.bounty.total/(.001+gs.system.planets.length)), true)} CR`, //hacky, fix this later
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
            ["Skills", () => showCaptainSkillsMenu(captain)],
            ["Close", () => closeModal()],
        ],
        'captain_panel'
    )
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
