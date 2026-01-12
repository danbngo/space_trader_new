function showCaptainCreationMenu(captain = gs.captain, onClose = ()=>{}, selectedSkill = SKILLS_ALL[0]) {

    const {name, skills, skillPoints} = captain

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
        setFleetLocation(EARTH)
        showCaptainCreationMenu(captain, onClose)
    }

    function randomizeCaptain() {
        captain.skills = new CountsMap()
        captain.skillPoints = STARTING_SKILL_POINTS;
        setFleetLocation(EARTH)
        
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

    const skillTable = createTable(skillTableRows, (rowIndex) => onSelectSkill(SKILLS_ALL[rowIndex]), selectedSkill ? SKILLS_ALL.indexOf(selectedSkill) : null)

    // Add popovers to skill rows
    const skillRows = skillTable.querySelectorAll('tr')
    skillRows.forEach((row, index) => {
        if (index === 0) return // Skip header row
        const skill = SKILLS_ALL[index - 1]
        if (skill && skill.description) {
            createPopoverElement(row, skill.description)
        }
    })

    // Single column layout with name and skills
    const content = ce({
        style: {display: 'flex', flexDirection: 'column', gap: '12px'},
        children: [
            // Name input field
            ce({
                style: {display: 'flex', flexDirection: 'column', gap: '4px'},
                children: [
                    ce({children: ['Name:']}),
                    (() => {
                        const input = createTextInput('Enter captain name', captain.name || '')
                        input.style.width = '300px'
                        input.addEventListener('input', () => {
                            captain.name = input.value
                        })
                        return input
                    })()
                ]
            }),
            
            skillTable,
            `Skill Points: ${statColorSpan(skillPoints, skillPoints > 0 ? 4 : 1)}`,
        ]
    })

    // Calculate upgrade button state
    const cost = selectedSkill ? captain.calcSkillPointsToUpgrade(selectedSkill) : 0
    const canAfford = skillPoints >= cost
    const hasUnspentPoints = skillPoints > 0

    showModal(
        `Captain`,
        ce({children:[
            content,
            ],
            style: {
                width: '500px'
            }
        }),
        [
            ["Upgrade", () => improveSkill(selectedSkill), !canAfford || !selectedSkill],
            ["Randomize", ()=>randomizeCaptain()],
            ["Reset", ()=>resetCaptain()],
            ["Cancel", () => { closeModal(); onClose(); }],
            ["Finish", () => {
                console.log('finishing captain creation',captain)
                
                // Initialize NO_RANK for all planets, dwarf planets, and moons
                const places = [...gs.system.planets, ...gs.system.dwarfPlanets, ...gs.system.moons];
                places.forEach(body => {
                    captain.ranks.set(body, RANK_TYPES.NO_RANK);
                });
                
                // Grant starting reputation with player's chosen attributes
                const startingReputation = 10;
                
                // Reputation with starting planet
                if (gs.fleet.location) {
                    captain.reputation.increment(gs.fleet.location, startingReputation);
                    // Grant citizen rank on starting planet (overrides NO_RANK)
                    captain.ranks.set(gs.fleet.location, RANK_TYPES.CITIZEN);
                }
                
                closeModal()
                console.log('going to run:',onClose)
                onClose()
            }, hasUnspentPoints],
        ],
        'captain_panel'
    );
}
