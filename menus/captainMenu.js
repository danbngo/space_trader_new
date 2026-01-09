/**
 * Displays the captain's skill menu for upgrading skills with skill points.
 * @param {Officer} captain - The captain whose skills to display.
 * @param {SkillType|null} selectedSkill - The currently selected skill to highlight.
 */
function showCaptainSkillsMenu(captain = gs.captain, selectedSkill = null) {
    console.log('showCaptainSkillsMenu called with captain:',captain,'selectedSkill:',selectedSkill)
    const {name, level, expPoints, expToNextLevel, skills, skillPoints, credits, planet = []} = captain

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
        /** @type {ButtonData[]} */
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
        ...SKILLS_ALL.map(sk => {
            const baseSkill = skills.getAmount(sk);
            const bonusSkill = captain.bonusSkills.getAmount(sk);
            const displayLevel = bonusSkill > 0 
                ? `${baseSkill}\u00A0${colorSpan('(+' + bonusSkill + ')', COLORS.White)}`
                : baseSkill;
            return [
                coloredName(sk),
                statColorSpan(displayLevel, baseSkill*SKILLS_ALL.length/5/SKILL_POINTS_PER_LEVEL),
                captain.calcSkillPointsToUpgrade(sk)
            ];
        })
    ]

    const skillTable = createTable(skillTableRows, (rowIndex) => onSelectSkill(SKILLS_ALL[rowIndex]), selectedSkill ? SKILLS_ALL.indexOf(selectedSkill) + 1 : null)

    // Add popovers to skill rows
    const skillRows = skillTable.querySelectorAll('tr')
    skillRows.forEach((row, index) => {
        if (index === 0) return // Skip header row
        const skill = SKILLS_ALL[index - 1]
        if (skill && skill.description) {
            createPopoverElement(row, skill.description)
        }
    })

    const retirementAge = MAXIMUM_RETIREMENT_AGE
    const yearsToRetirement = retirementAge - captain.age
    const retirementRatio = captain.age / retirementAge
    const retirementColor = statColorSpan(yearsToRetirement, 1 - retirementRatio)
    
    // Left column: Skills
    const leftColumn = ce({
        style: {display: 'flex', flexDirection: 'column', gap: '12px'},
        children: [
            ce({children: ['<b><u>Skills</u></b>']}),
            skillTable,
            `Skill Points: ${colorSpan(String(skillPoints), skillPoints > 0 ? COLORS.Green : '')}`,
            `Age: ${captain.age} | Retirement: ${retirementColor}`,
        ]
    })

    // Calculate experience progress percentage
    const totalExpForLevel = expPoints + expToNextLevel
    const expProgress = (expPoints / totalExpForLevel) * 100
    
    const expProgressBar = new ProgressBar({
        value: expProgress,
        fillColor: rgbArrayToString(COLORS.Blue),
        width: 50
    })

    showModal(
        `Captain Overview`,
        ce({children:[
            `Name: ${name} | `, 
            `Credits: ${credits}`,
            ce({tag:'br'}),
            `Level: ${level} | Exp: ${expPoints} | Next Lvl At: ${expToNextLevel}`,
            expProgressBar.container,
            ce({tag:'br'}),
            leftColumn,
        ]}),
        [
            ["Reputation", () => showCaptainReputationMenu()],
            ["Close", () => closeModal()],
        ],
        'captain_panel'
    );

    // Select first skill by default if no skill is selected
    if (!selectedSkill && SKILLS_ALL.length > 0) {
        console.log('auto selecting first skill')
        onSelectSkill(SKILLS_ALL[0]);
    } else if (selectedSkill) {
        console.log('auto selecting skill:',selectedSkill)
        onSelectSkill(selectedSkill);
    }
}


function showCaptainReputationMenu() {
    const captain = gs.captain
    // Build table rows: header + planet rows + total row
    const tableRows = [
        // Header row
        ['Planet', 'Bounty', 'Reputation'],
        // Data rows for each planet
        ...gs.system.planets.map(planet => [
            coloredName(planet),
            `${statColorSpan(captain.bounty.getAmount(planet), 1000/(1000+captain.bounty.getAmount(planet)))} CR`,
            statColorSpan(captain.reputation.getAmount(planet), 1 / (1 + Math.abs(captain.reputation.getAmount(planet))/50)),
        ]),
        // Total row
        [
            '<b>Total</b>',
            `${statColorSpan(captain.bounty.total, 1000/(1000+captain.bounty.total/(.001+gs.system.planets.length)))} CR`, //hacky, fix this later
            statColorSpan(captain.reputation.total, 1 / (1 + Math.abs(captain.reputation.total)/50)),
        ]
    ]

    const reputationTable = createTable(tableRows)
    
    // Build ranks table - only include planets where player has a rank (not NO_RANK)
    const rankedPlanets = gs.system.planets.filter(planet => {
        const rank = captain.ranks.get(planet) || RANK_TYPES.NO_RANK
        return rank !== RANK_TYPES.NO_RANK
    })
    
    const ranksTableRows = [
        // Header row
        ['Planet', 'Rank'],
        // Data rows for planets with ranks
        ...rankedPlanets.map(planet => {
            const rank = captain.ranks.get(planet)
            return [
                coloredName(planet),
                colorSpan(rank.name, rank.color)
            ]
        })
    ]
    
    const ranksTable = rankedPlanets.length > 0 
        ? createTable(ranksTableRows)
        : ce({children: [colorSpan('No planetary ranks yet.', COLORS.Gray)]})

    // Top section: Planetary ranks and reputation side-by-side
    const topSection = createColumnLayout([
        ce({children: [
            ce({children: ['<b>Planetary Ranks</b>']}),
            ranksTable
        ]}),
        ce({children: [
            ce({children: ['<b>Planetary Reputation</b>']}),
            reputationTable
        ]})
    ])


    showModal(
        `Captain Reputation`,
        ce({children: [
            topSection,
        ]}),
        [
            ["Skills", () => showCaptainSkillsMenu(captain)],
            ["Close", () => closeModal()],
        ],
        'captain_panel'
    )
}

