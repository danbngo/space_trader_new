/**
 * Displays the captain's skill menu for upgrading skills with skill points.
 * @param {Officer} captain - The captain whose skills to display.
 * @param {SkillType|null} selectedSkill - The currently selected skill to highlight.
 */
function showCaptainSkillsMenu(captain = gs.captain, selectedSkill = null) {
    console.log('showCaptainSkillsMenu called with captain:',captain,'selectedSkill:',selectedSkill)
    const {name, level, expPoints, expToNextLevel, skills, skillPoints, credits} = captain

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
            ['Perks', () => showCaptainPerksMenu(), false, captain.numPerkPoints > 0 ? 'highlighted' : null],
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
            statColorSpan(skills.getAmount(sk), skills.getAmount(sk)*SKILLS_ALL.length/5/SKILL_POINTS_PER_LEVEL),
            captain.calcSkillPointsToUpgrade(sk)
        ])
    ]

    const skillTable = createTable(skillTableRows, (rowIndex) => onSelectSkill(SKILLS_ALL[rowIndex]), selectedSkill ? SKILLS_ALL.indexOf(selectedSkill) + 1 : null)

    const implantsText = captain.implants.length > 0 
        ? captain.implants.map(i => colorSpan(i.implantType.name, i.implantType.color) + ` (${roundToPlaces(i.quality*100, 1)}%)`).join(', ')
        : colorSpan('(None)', COLORS.Gray)

    const raceText = captain.race ? `${captain.race.icon} ${colorSpan(captain.race.name, captain.race.color)}` : 'Human'

    showModal(
        `Captain Overview`,
        ce({children:[
            `Name: ${name} | Race: ${raceText} | Credits ${credits}`,
            `Level: ${level} | Exp.: ${expPoints} | To Next Lvl: ${expToNextLevel}`,
            `Skill Points: ${colorSpan(String(skillPoints), skillPoints > 0 ? COLORS.Green : '')}`,
            skillTable,
            ce({style: 'margin-top: 20px;', children: [
                ce({children: [`<b>Cybernetic Implants:</b><br/>`, implantsText]})
            ]})
        ]}),
        [
            ["Perks", () => showCaptainPerksMenu(), false, captain.numPerkPoints > 0 ? 'highlighted' : null],
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
        const canAfford = numPerkPoints > 0
        const meetsLevel = level >= perk.minLevel
        const canTake = !alreadyHas && canAfford && meetsLevel
        
        let reasonText = ''
        if (alreadyHas) reasonText = 'You already have this perk.'
        else if (!meetsLevel) reasonText = `Requires level ${perk.minLevel}.`
        else if (!canAfford) reasonText = 'You need a perk point.'

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
            ['Reputation', () => showCaptainReputationMenu()],
            ['Close', () => closeModal()],
        ]
        refreshPanelButtons('captain_panel', buttons)
    }

    // Display current perks
    const currentPerksText = perks.length > 0
        ? perks.map(p => colorSpan(p.name, p.color)).join(', ')
        : colorSpan('(None)', COLORS.Gray)

    // Build available perks table
    const availablePerks = PERK_TYPES_ALL.filter(p => !perks.includes(p))
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

function showCaptainReputationMenu() {
    const captain = gs.captain
    // Build table rows: header + planet rows + total row
    const tableRows = [
        // Header row
        ['Planet', 'Bounty', 'Fame', 'Infamy'],
        // Data rows for each planet
        ...gs.system.planets.map(planet => [
            coloredName(planet),
            `${statColorSpan(captain.bounty.getAmount(planet), 1000/(1000+captain.bounty.getAmount(planet)))} CR`,
            statColorSpan(captain.fame.getAmount(planet), 1 + captain.fame.getAmount(planet)/50),
            statColorSpan(captain.infamy.getAmount(planet), 1 / (1 + captain.infamy.getAmount(planet)/50)),
        ]),
        // Total row
        [
            '<b>Total</b>',
            `${statColorSpan(captain.bounty.total, 1000/(1000+captain.bounty.total/(.001+gs.system.planets.length)))} CR`, //hacky, fix this later
            statColorSpan(captain.fame.total, 1 + captain.fame.total/50),
            statColorSpan(captain.infamy.total, 1 / (1 + captain.infamy.total/50)),
        ]
    ]

    const reputationTable = createTable(tableRows)
    
    // Build ranks table
    const ranksTableRows = [
        // Header row
        ['Planet', 'Rank'],
        // Data rows for each planet
        ...gs.system.planets.map(planet => {
            const rank = captain.ranks.get(planet) || RANK_TYPES.NO_RANK
            return [
                coloredName(planet),
                colorSpan(rank.name, rank.color)
            ]
        })
    ]
    
    const ranksTable = createTable(ranksTableRows)

    // Build faction reputation table
    const factionTableRows = [
        // Header row
        ['Faction', 'Fame', 'Infamy'],
        // Data rows for each faction
        ...FACTION_TYPES_ALL.map(faction => [
            `${faction.symbol} ${colorSpan(faction.name, faction.color)}`,
            statColorSpan(captain.fame.getAmount(faction), 1 + captain.fame.getAmount(faction)/50),
            statColorSpan(captain.infamy.getAmount(faction), 1 / (1 + captain.infamy.getAmount(faction)/50)),
        ])
    ]
    
    const factionTable = createTable(factionTableRows)

    showModal(
        `Captain Reputation`,
        ce({children: [
            ce({children: ['<b>Planetary Reputation</b>']}),
            reputationTable,
            ce({style: 'margin-top: 20px;', children: ['<b>Factional Reputation</b>']}),
            factionTable,
            ce({style: 'margin-top: 20px;', children: ['<b>Planetary Ranks</b>']}),
            ranksTable,
        ]}),
        [
            ["Skills", () => showCaptainSkillsMenu(captain)],
            ["Close", () => closeModal()],
        ],
        'captain_panel'
    )
}


function showCaptainCreationMenu(captain = gs.captain, onClose = ()=>{}, selectedSkill = SKILLS_ALL[0]) {

    const {name, skills, skillPoints} = captain

    function improveSkill(skill = SKILLS_ALL[0]) {
        const cost = captain.calcSkillPointsToUpgrade(skill)
        captain.skills.increment(skill, 1)
        captain.skillPoints -= cost;
        showCaptainCreationMenu(captain, onClose, skill)
    }

    function resetCaptain() {
        captain.skills = new CountsMap()
        captain.skillPoints = STARTING_SKILL_POINTS;
        showCaptainCreationMenu(captain, onClose)
    }

    function randomizeCaptain() {
        captain.skills = new CountsMap()
        captain.skillPoints = STARTING_SKILL_POINTS;
        
        // Randomly spend all skill points
        while (captain.skillPoints > 0) {
            const randomSkill = rndMember(SKILLS_ALL)
            const cost = captain.calcSkillPointsToUpgrade(randomSkill)
            
            // If we can afford this skill, upgrade it
            if (captain.skillPoints >= cost) {
                captain.skills.increment(randomSkill, 1)
                captain.skillPoints -= cost
            } else {
                // If we can't afford any upgrades, we're done
                // Check if any skill can be afforded
                const affordableSkill = SKILLS_ALL.find(sk => captain.calcSkillPointsToUpgrade(sk) <= captain.skillPoints)
                if (!affordableSkill) {
                    break // No more affordable upgrades
                }
            }
        }
        
        showCaptainCreationMenu(captain, onClose)
    }

    function onSelectSkill(skill = SKILLS_ALL[0]) {
        const cost = captain.calcSkillPointsToUpgrade(skill)
        const canAfford = skillPoints >= cost
        const hasUnspentPoints = skillPoints > 0
        const buttons = [
            ['Upgrade', () => improveSkill(skill), !canAfford],
            ['Randomize', () => randomizeCaptain()],
            ['Reset', () => resetCaptain()],
            ['Finish', () => {
                console.log('finishing captain creation',captain)
                closeModal()
                console.log('going to run:',onClose)
                onClose()
            }, hasUnspentPoints],
        ]
        refreshPanelButtons('captain_panel', buttons)
    }

    // Build skills table
    const skillTableRows = [
        ['Skill', 'Level', 'Cost to Upgrade'],
        ...SKILLS_ALL.map(sk => [
            sk,
            statColorSpan(skills.getAmount(sk), skills.getAmount(sk)*SKILLS_ALL.length/5/SKILL_POINTS_PER_LEVEL),
            captain.calcSkillPointsToUpgrade(sk)
        ])
    ]

    const skillTable = createTable(skillTableRows, (rowIndex) => onSelectSkill(SKILLS_ALL[rowIndex]), selectedSkill ? SKILLS_ALL.indexOf(selectedSkill) + 1 : null)

    showModal(
        `Create Captain`,
        ce({children:[
            `Name: ${name}`,
            `Skill Points: ${statColorSpan(skillPoints, skillPoints > 0 ? 4 : 1)}`,
            skillTable,
        ]}),
        [
            ["Randomize", ()=>randomizeCaptain()],
            ["Reset", ()=>resetCaptain()],
            ["Finish", () => {
                console.log('finishing captain creation',captain)
                closeModal()
                console.log('going to run:',onClose)
                onClose()
            }, skillPoints > 0],
        ],
        'captain_panel'
    );

    if (selectedSkill) {
        onSelectSkill(selectedSkill);
    }
}
