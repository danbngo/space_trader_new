function showCaptainCreationMenu(captain = gs.captain, onClose = ()=>{}, selectedSkill = SKILLS_ALL[0]) {

    const {name, skills, skillPoints} = captain

    // State tracking for dropdowns - read from current captain/fleet state
    let selectedRace = captain.race || RACES.HUMAN
    let selectedPlanet = gs.fleet.location || EARTH
    let selectedFaction = gs.fleet.factionType || FACTION_TYPES.MERCHANTS
    let selectedReligion = captain.religion || null

    function improveSkill(skill = SKILLS_ALL[0]) {
        const cost = captain.calcSkillPointsToUpgrade(skill)
        captain.skills.increment(skill, 1)
        captain.skillPoints -= cost;
        showCaptainCreationMenu(captain, onClose, skill)
    }

    function resetCaptain() {
        captain.skills = new CountsMap()
        captain.skillPoints = STARTING_SKILL_POINTS;
        // Reset background to defaults
        captain.race = RACES.HUMAN
        gs.fleet.location = EARTH
        gs.fleet.x = EARTH.x
        gs.fleet.y = EARTH.y
        gs.fleet.factionType = FACTION_TYPES.MERCHANTS
        captain.religion = null
        showCaptainCreationMenu(captain, onClose)
    }

    function randomizeCaptain() {
        captain.skills = new CountsMap()
        captain.skillPoints = STARTING_SKILL_POINTS;
        
        // Randomize background
        captain.race = rndMember(Object.values(RACES))
        const randomPlanet = rndMember(gs.system.planets)
        gs.fleet.location = randomPlanet
        gs.fleet.x = randomPlanet.x
        gs.fleet.y = randomPlanet.y
        gs.fleet.factionType = rndMember(FACTION_TYPES_ALL)
        captain.religion = gs.system.religions.length > 0 ? (Math.random() < 0.3 ? null : rndMember(gs.system.religions)) : null
        
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
            `${coloredName(sk)}`,
            statColorSpan(skills.getAmount(sk), skills.getAmount(sk)*SKILLS_ALL.length/5/SKILL_POINTS_PER_LEVEL),
            captain.calcSkillPointsToUpgrade(sk)
        ])
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

    // Left Column: Character Background Dropdowns
    const leftColumn = ce({
        style: {display: 'flex', flexDirection: 'column', gap: '12px'},
        children: [
            ce({children: ['<u>Character Background</u>']}),

                        // Faction dropdown
            ce({
                style: {display: 'flex', flexDirection: 'column', gap: '4px'},
                children: [
                    (() => {
                        const factionDropdown = new Dropdown(
                            FACTION_TYPES_ALL.map(faction => [
                                `${faction.symbol} ${faction.name}`,
                                () => {
                                    selectedFaction = faction
                                    gs.fleet.factionType = faction
                                    // Apply faction stat modifiers if needed
                                    showCaptainCreationMenu(captain, onClose, selectedSkill)
                                }
                            ]),
                            false,
                            FACTION_TYPES_ALL.indexOf(selectedFaction),
                            250,
                            2
                        )
                        // Add popover to the label showing current selection
                        setTimeout(() => {
                            createPopoverElement(factionDropdown.labelElement, selectedFaction.description)
                            // Add popovers to dropdown items
                            factionDropdown.dropdownButtons.forEach((btn, index) => {
                                createPopoverElement(btn, FACTION_TYPES_ALL[index].description)
                            })
                        }, 10)
                        return factionDropdown.container
                    })()
                ]
            }),
            
            // Race dropdown
            ce({
                style: {display: 'flex', flexDirection: 'column', gap: '4px'},
                children: [
                    (() => {
                        const raceDropdown = new Dropdown(
                            Object.values(RACES).map(race => [
                                `${race.symbol} ${race.name}`,
                                () => {
                                    selectedRace = race
                                    captain.race = race
                                    // Apply race stat modifiers if they exist
                                    showCaptainCreationMenu(captain, onClose, selectedSkill)
                                }
                            ]),
                            false,
                            Object.values(RACES).indexOf(selectedRace),
                            250
                        )
                        // Add popover to the label showing current selection
                        setTimeout(() => {
                            createPopoverElement(raceDropdown.labelElement, selectedRace.description)
                            // Add popovers to dropdown items
                            raceDropdown.dropdownButtons.forEach((btn, index) => {
                                createPopoverElement(btn, Object.values(RACES)[index].description)
                            })
                        }, 10)
                        return raceDropdown.container
                    })()
                ]
            }),
            
            // Starting Planet dropdown
            ce({
                style: {display: 'flex', flexDirection: 'column', gap: '4px'},
                children: [
                    new Dropdown(
                        gs.system.planets.map(planet => [
                            coloredName(planet),
                            () => {
                                selectedPlanet = planet
                                gs.fleet.location = planet
                                gs.fleet.x = planet.x
                                gs.fleet.y = planet.y
                                showCaptainCreationMenu(captain, onClose, selectedSkill)
                            }
                        ]),
                        false,
                        gs.system.planets.indexOf(selectedPlanet),
                        250
                    ).container
                ]
            }),
            
            // Religion dropdown
            ce({
                style: {display: 'flex', flexDirection: 'column', gap: '4px'},
                children: [
                    new Dropdown(
                        [['Agnostic', () => {
                            selectedReligion = null
                            captain.religion = null
                            showCaptainCreationMenu(captain, onClose, selectedSkill)
                        }], ...gs.system.religions.map(religion => [
                            coloredName(religion),
                            () => {
                                selectedReligion = religion
                                captain.religion = religion
                                // Apply religion stat modifiers if needed
                                showCaptainCreationMenu(captain, onClose, selectedSkill)
                            }
                        ])],
                        false,
                        selectedReligion ? gs.system.religions.indexOf(selectedReligion) + 1 : 0,
                        250
                    ).container
                ]
            }),
        ]
    })

    // Right Column: Skill Points
    const rightColumn = ce({
        style: {display: 'flex', flexDirection: 'column', gap: '12px'},
        children: [
            ce({children: ['<u>Skills</u>']}),
            `Skill Points: ${statColorSpan(skillPoints, skillPoints > 0 ? 4 : 1)}`,
            skillTable,
        ]
    })

    const columnLayout = createColumnLayout([leftColumn, rightColumn])

    showModal(
        `Create Captain`,
        ce({children:[
            columnLayout,
            ],
            style: {
                width: '800px'
            }
        }),
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
