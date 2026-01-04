/**
 * Displays the captain's skill menu for upgrading skills with skill points.
 * @param {Officer} captain - The captain whose skills to display.
 * @param {SkillType|null} selectedSkill - The currently selected skill to highlight.
 */
function showCaptainSkillsMenu(captain = gs.captain, selectedSkill = null) {
    console.log('showCaptainSkillsMenu called with captain:',captain,'selectedSkill:',selectedSkill)
    const {name, level, expPoints, expToNextLevel, skills, skillPoints, credits, geneticModifications = []} = captain

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
            ['Implants', () => showCaptainImplantsMenu()],
            ['Perks', () => showCaptainPerksMenu(), false, captain.numPerkPoints > 0 ? 'highlighted' : null],
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

    // Left column: Skills
    const leftColumn = ce({
        style: {display: 'flex', flexDirection: 'column', gap: '12px'},
        children: [
            ce({children: ['<b><u>Skills</u></b>']}),
            skillTable,
            `Skill Points: ${colorSpan(String(skillPoints), skillPoints > 0 ? COLORS.Green : '')}`,
        ]
    })

    // Right column: Genetics
    const geneticsSection = geneticModifications.length > 0 
        ? ce({
            tag: 'ul',
            style: {marginTop: '4px', marginBottom: '0', paddingLeft: '20px'},
            children: geneticModifications.map(mod => {
                const li = ce({
                    tag: 'li',
                    children: [
                        colorSpan(mod.modificationType.name, mod.modificationType.color),
                        ` (${roundToPlaces(mod.quality*100, 1)}%)`
                    ]
                })
                if (mod.modificationType.description) {
                    createPopoverElement(li, mod.modificationType.description)
                }
                return li
            })
        })
        : ce({children: [colorSpan('(None)', COLORS.Gray)]})

    const rightColumn = ce({
        style: {display: 'flex', flexDirection: 'column', gap: '12px'},
        children: [
            ce({children: [`<b><u>Genetic Modifications (${geneticModifications.length}/${captain.maxGeneticModifications})</u></b>`]}),
            geneticsSection
        ]
    })

    const columnLayout = createColumnLayout([leftColumn, rightColumn])

    const raceText = captain.race ? `${captain.race.symbol} ${colorSpan(captain.race.name, captain.race.color)}` : 'Human'

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
            `Name: ${name} | Race: ${raceText} | Credits: ${credits}`,
            ce({tag:'br'}),
            `Level: ${level} | Exp: ${expPoints} | Next Lvl At: ${expToNextLevel}`,
            expProgressBar.container,
            ce({tag:'br'}),
            columnLayout,
        ]}),
        [
            ["Implants", () => showCaptainImplantsMenu()],
            ["Perks", () => showCaptainPerksMenu(), false, captain.numPerkPoints > 0 ? 'highlighted' : null],
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


/**
 * Displays the captain's perks menu for viewing and purchasing perks.
 * @param {Officer} captain - The captain whose perks to display.
 * @param {PerkType|null} selectedPerk - The currently selected perk to highlight.
 */
function showCaptainPerksMenu(captain = gs.captain, selectedPerk = null) {
    console.log('showCaptainPerksMenu called with captain:', captain, 'selectedPerk:', selectedPerk)
    const {name, level, numPerkPoints, perks} = captain

    function takePerk(perk = PERK_TYPES_ALL[0]) {
        captain.perks.push(perk)
        captain.numPerkPoints -= 1
        showModal(
            'Perk Acquired!',
            `You have acquired ${colorSpan(perk.name, perk.color)}!<br/><br/>${perk.description}`,
            [['Continue', () => showCaptainPerksMenu(captain, perk)]]
        )
    }

    function onSelectPerk(perk = PERK_TYPES_ALL[0]) {
        console.log('on select perk:', perk)
        const alreadyHas = perks.includes(perk)
        const perkCost = 1 // Use perk cost if it exists, default to 1
        const canAfford = numPerkPoints >= perkCost
        const meetsLevel = level >= perk.minLevel
        const canTake = !alreadyHas && canAfford && meetsLevel

        console.log({canTake, meetsLevel, canAfford, perkCost, alreadyHas})
        
        let reasonText = ''
        if (alreadyHas) reasonText = 'You already have this perk.'
        else if (!meetsLevel) reasonText = `Requires level ${perk.minLevel}.`
        else if (!canAfford) reasonText = `You need ${perkCost} perk point${perkCost > 1 ? 's' : ''}.`

        /** @type {ButtonData[]} */
        const buttons = [
            ['Take', () => {
                showModal(
                    'Confirm Perk',
                    `Take ${colorSpan(perk.name, perk.color)}?<br/><br/>${perk.description}<br/><br/>This will cost 1 perk point.`,
                    [
                        ['Confirm', () => takePerk(perk)],
                        ['Cancel', () => showCaptainPerksMenu(captain, perk)]
                    ]
                )
            }, !canTake],
            ['Skills', () => showCaptainSkillsMenu()],
            ['Implants', () => showCaptainImplantsMenu()],
            ['Reputation', () => showCaptainReputationMenu()],
            ['Close', () => closeModal()],
        ]
        refreshPanelButtons('captain_panel', buttons)
    }

    // Display current perks
    const currentPerksText = perks.length > 0
        ? perks.map(p => colorSpan(p.name, p.color)).join(', ')
        : colorSpan('(None)', COLORS.Gray)

    // Build available perks table - only show perks that meet level requirement
    const availablePerks = PERK_TYPES_ALL.filter(p => !perks.includes(p) && level >= p.minLevel)
    const availablePerkRows = [
        ['Perk', 'Min Level', 'Description'],
        ...availablePerks.map(pk => {
            const meetsLevel = level >= pk.minLevel
            const levelText = meetsLevel ? colorSpan(String(pk.minLevel), COLORS.Green) : colorSpan(String(pk.minLevel), COLORS.Red)
            return [
                colorSpan(pk.name, pk.color),
                levelText,
                pk.description
            ]
        })
    ]

    const availablePerksTable = availablePerks.length > 0 
        ? createTable(availablePerkRows, (rowIndex) => onSelectPerk(availablePerks[rowIndex]), selectedPerk ? availablePerks.indexOf(selectedPerk) + 1 : null)
        : ce({children: [colorSpan('No perks available to acquire.', COLORS.Gray)]})

    showModal(
        `Captain Perks`,
        ce({children:[
            `Name: ${name} | Level: ${level}`,
            `Perk Points: ${colorSpan(String(numPerkPoints), numPerkPoints > 0 ? COLORS.Green : '')}`,
            ce({style: 'margin-top: 15px;', children: [
                ce({children: [`<b>Current Perks:</b><br/>`, currentPerksText]})
            ]}),
            ce({style: 'margin-top: 20px;', children: [
                ce({children: [`<b>Available Perks:</b>`]}),
                availablePerksTable
            ]})
        ]}),
        [
            ["Skills", () => showCaptainSkillsMenu()],
            ["Implants", () => showCaptainImplantsMenu()],
            ["Reputation", () => showCaptainReputationMenu()],
            ["Close", () => closeModal()],
        ],
        'captain_panel'
    );

    if (selectedPerk) {
        console.log('auto selecting perk:', selectedPerk)
        onSelectPerk(selectedPerk);
    }
}

/**
 * Displays the captain's cybernetic implants menu.
 * @param {Officer} captain - The captain whose implants to display.
 */
function showCaptainImplantsMenu(captain = gs.captain) {
    // Redirect to the new comprehensive cyberware menu
    showCyberwareMenu(captain)
}

/**
 * Displays the captain's genetic modifications menu.
 * @param {Officer} captain - The captain whose genetic modifications to display.
 */
function showCaptainGeneticsMenu(captain = gs.captain) {
    console.log('showCaptainGeneticsMenu called with captain:', captain)
    const {name, level, geneticModifications = []} = captain

    // Build genetic modifications table
    const geneticsTableRows = [
        ['Genetic Modification', 'Quality'],
        ...geneticModifications.map(mod => [
            colorSpan(mod.modificationType.name, mod.modificationType.color),
            `${roundToPlaces(mod.quality*100, 1)}%`
        ])
    ]

    const geneticsTable = geneticModifications.length > 0 
        ? createTable(geneticsTableRows)
        : ce({children: [colorSpan('No genetic modifications applied.', COLORS.Gray)]})

    showModal(
        `Captain Genetics`,
        ce({children:[
            `Name: ${name} | Level: ${level}`,
            ce({style: 'margin-top: 15px;', children: [
                ce({children: [`<b>Applied Genetic Modifications:</b>`]}),
                geneticsTable
            ]})
        ]}),
        [
            ["Skills", () => showCaptainSkillsMenu()],
            ["Implants", () => showCaptainImplantsMenu()],
            ["Perks", () => showCaptainPerksMenu(), false, captain.numPerkPoints > 0 ? 'highlighted' : null],
            ["Reputation", () => showCaptainReputationMenu()],
            ["Close", () => closeModal()],
        ],
        'captain_panel'
    );
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

    // Build faction reputation tables - split into two columns
    const midpoint = Math.ceil(FACTION_TYPES_ALL.length / 2)
    const leftFactions = FACTION_TYPES_ALL.slice(0, midpoint)
    const rightFactions = FACTION_TYPES_ALL.slice(midpoint)
    
    const leftFactionTableRows = [
        ['Faction', 'Reputation'],
        ...leftFactions.map(faction => [
            `${faction.symbol} ${colorSpan(faction.name, faction.color)}`,
            statColorSpan(captain.reputation.getAmount(faction), 1 / (1 + Math.abs(captain.reputation.getAmount(faction))/50)),
        ])
    ]
    
    const rightFactionTableRows = [
        ['Faction', 'Reputation'],
        ...rightFactions.map(faction => [
            `${faction.symbol} ${colorSpan(faction.name, faction.color)}`,
            statColorSpan(captain.reputation.getAmount(faction), 1 / (1 + Math.abs(captain.reputation.getAmount(faction))/50)),
        ])
    ]
    
    const leftFactionTable = createTable(leftFactionTableRows)
    const rightFactionTable = createTable(rightFactionTableRows)

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

    // Bottom section: Factional reputation in two columns
    const factionSection = createColumnLayout([
        leftFactionTable,
        rightFactionTable
    ])

    showModal(
        `Captain Reputation`,
        ce({children: [
            topSection,
            ce({style: {marginTop: '20px'}, children: [
                ce({children: ['<b>Factional Reputation</b>']}),
                factionSection
            ]})
        ]}),
        [
            ["Skills", () => showCaptainSkillsMenu(captain)],
            ["Implants", () => showCaptainImplantsMenu(captain)],
            ["Perks", () => showCaptainPerksMenu(captain), false, captain.numPerkPoints > 0 ? 'highlighted' : null],
            ["Close", () => closeModal()],
        ],
        'captain_panel'
    )
}

