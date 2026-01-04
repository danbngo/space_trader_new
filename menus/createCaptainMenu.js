function showCaptainCreationMenu(captain = gs.captain, onClose = ()=>{}, selectedSkill = SKILLS_ALL[0]) {

    const {name, skills, skillPoints} = captain

    // State tracking for dropdowns - read from current captain/fleet state
    let selectedRace = captain.race || RACES.HUMAN
    let selectedPlanet = gs.fleet.location || EARTH
    let selectedFaction = gs.fleet.captain.factionType || PLAYER_FACTIONS[0]
    let selectedReligion = captain.religion || null

    // Helper to set fleet location and position
    function setFleetLocation(planet) {
        gs.fleet.planet = planet
        gs.fleet.dock(planet)
    }

    function improveSkill(skill = SKILLS_ALL[0]) {
        const cost = captain.calcSkillPointsToUpgrade(skill)
        captain.skills.increment(skill, 1)
        captain.skillPoints -= cost;
        showCaptainCreationMenu(captain, onClose, skill)
    }

    function resetCaptain() {
        captain.skills = new CountsMap()
        captain.skillPoints = STARTING_SKILL_POINTS;
        captain.race = RACES.HUMAN
        captain.religion = null
        gs.fleet.captain.factionType = PLAYER_FACTIONS[0]
        setFleetLocation(EARTH)
        showCaptainCreationMenu(captain, onClose)
    }

    function randomizeCaptain() {
        captain.skills = new CountsMap()
        captain.skillPoints = STARTING_SKILL_POINTS;
        captain.race = rndMember(Object.values(RACES))
        captain.religion = gs.system.religions.length > 0 ? (Math.random() < 0.3 ? null : rndMember(gs.system.religions)) : null
        gs.fleet.captain.factionType = rndMember(PLAYER_FACTIONS)
        gs.fleet.factionType = gs.fleet.captain.factionType
        setFleetLocation(rndMember(gs.system.planets))
        
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
        // Re-render the entire menu to show updated skill bonuses
        showCaptainCreationMenu(captain, onClose, skill)
    }

    console.log('CAPTAIN:',captain)

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
                `${coloredName(sk)}`,
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
                            PLAYER_FACTIONS.map(faction => [
                                `${faction.symbol} ${faction.name}`,
                                () => {
                                    selectedFaction = faction
                                    gs.fleet.captain.factionType = faction
                                    gs.fleet.factionType = faction
                                    // Apply faction stat modifiers if needed
                                    showCaptainCreationMenu(captain, onClose, selectedSkill)
                                }
                            ]),
                            false,
                            PLAYER_FACTIONS.indexOf(selectedFaction),
                            250,
                            2
                        )
                        // Add popover to the label showing current selection
                        setTimeout(() => {
                            createPopoverElement(factionDropdown.labelElement, selectedFaction.description)
                            // Add popovers to dropdown items
                            factionDropdown.dropdownButtons.forEach((btn, index) => {
                                createPopoverElement(btn, PLAYER_FACTIONS[index].description)
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
                                setFleetLocation(planet)
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

            // Perks section
            ce({
                style: {display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '12px'},
                children: [
                    ce({tag:'br'}),
                    ce({children: ['<u>Perks</u>']}),
                    (() => {
                        const level1Perks = selectedRace.automaticPerks.filter(perk => perk.minLevel === 1);
                        if (level1Perks.length === 0) {
                            return ce({children: [colorSpan('(None)', COLORS.Gray)]});
                        }
                        return ce({
                            tag: 'ul',
                            style: {marginTop: '4px', marginBottom: '0', paddingLeft: '20px'},
                            children: level1Perks.map(perk => {
                                const li = ce({
                                    tag: 'li',
                                    children: [colorSpan(perk.name, perk.color)]
                                });
                                createPopoverElement(li, perk.description);
                                return li;
                            })
                        });
                    })()
                ]
            }),
        ]
    })

    // Right Column: Skill Points
    const rightColumn = ce({
        style: {display: 'flex', flexDirection: 'column', gap: '12px'},
        children: [
            skillTable,
            `Skill Points: ${statColorSpan(skillPoints, skillPoints > 0 ? 4 : 1)}`,
        ]
    })

    const columnLayout = createColumnLayout([leftColumn, rightColumn])

    // Calculate upgrade button state
    const cost = selectedSkill ? captain.calcSkillPointsToUpgrade(selectedSkill) : 0
    const canAfford = skillPoints >= cost
    const hasUnspentPoints = skillPoints > 0

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
            ["Upgrade", () => improveSkill(selectedSkill), !canAfford || !selectedSkill],
            ["Randomize", ()=>randomizeCaptain()],
            ["Reset", ()=>resetCaptain()],
            ["Finish", () => {
                console.log('finishing captain creation',captain)
                
                // Grant starting reputation with player's chosen attributes
                const startingReputation = 10;
                
                // Reputation with starting planet
                if (gs.fleet.location) {
                    captain.reputation.increment(gs.fleet.location, startingReputation);
                }
                
                // Reputation with race
                if (captain.race) {
                    captain.reputation.increment(captain.race, startingReputation);
                }
                
                // Reputation with religion
                if (captain.religion) {
                    captain.reputation.increment(captain.religion, startingReputation);
                }
                
                // Reputation with faction
                if (gs.fleet.factionType) {
                    captain.reputation.increment(gs.fleet.factionType, startingReputation);
                }
                
                closeModal()
                console.log('going to run:',onClose)
                onClose()
            }, hasUnspentPoints],
        ],
        'captain_panel'
    );
}
