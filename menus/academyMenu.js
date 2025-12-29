/**
 * Displays the academy menu where the player can upgrade captain skills.
 * @param {Academy} academy - The academy building to interact with.
 * @param {SkillType} selectedSkill - The currently selected skill to highlight (member of SKILLS_ALL).
 */
function showAcademyMenu(academy = new Academy(), selectedSkill = SKILLS_ALL[0]) {
    const {planet} = academy
    const reloadMenu = (skill = selectedSkill) => showAcademyMenu(academy, skill)
    const isDocked = gs.location == planet

    function upgradeSkill(skill = SKILLS_ALL[0]) {
        const cost = academy.calcSkillUpgradeCost(gs.captain, skill)
        
        if (gs.credits >= cost && isDocked) {
            gs.credits -= cost
            gs.captain.skills.increment(skill, 1)
            reloadMenu(skill)
        }
    }

    function onSelectSkill(skill = SKILLS_ALL[0]) {
        const cost = academy.calcSkillUpgradeCost(gs.captain, skill)
        const canAfford = gs.credits >= cost && isDocked
        
        const buttons = [
            ['Upgrade', () => upgradeSkill(skill), !canAfford],
            ['Back', () => showPlanetMenu(planet)]
        ]
        refreshPanelButtons('academy_panel', buttons)
    }

    // Build skills table with columns: Skill Name, CR to Upgrade
    const skillTableRows = [
        ['Skill', 'Current Lvl', 'CR to Upgrade'],
        ...SKILLS_ALL.map(skill => {
            const currentLevel = gs.captain.skills.getAmount(skill)
            const cost = academy.calcSkillUpgradeCost(gs.captain, skill)
            const skillModifier = academy.skillCosts.getAmount(skill) || 1
            const totalMultiplier = skillModifier * (1 + academy.rake)
            // Calculate stat ratio: 1.0 rake and 1.0 skillCost = white (ratio 1)
            // Higher = red (ratio < 1), Lower = green (ratio > 1)
            const statRatio = 1 / totalMultiplier
            
            return [
                skill,
                currentLevel,
                statColorSpan(cost, statRatio, true) + ' CR'
            ]
        })
    ]

    const skillTable = createTable(skillTableRows, (rowIndex) => onSelectSkill(SKILLS_ALL[rowIndex]), selectedSkill ? SKILLS_ALL.indexOf(selectedSkill) + 1 : null)

    let infoContainer = ce({
        children: [
            `<br/>${isDocked ? 'Welcome to the academy. Select a skill to train:' : colorSpan('You must dock to use the academy.', COLORS.Yellow, true)}`,
            skillTable,
            `Your CR: ${gs.credits}<br/>`,
            `Training Fee: ${statColorSpan(roundToPlaces(100*academy.rake, 2), 1/(1+academy.rake), true)}%<br/>`,
        ]
    })

    showPlanetModal(
        planet,
        `${coloredName(planet)} - Academy`,
        ce({
            children:[
                infoContainer,
            ]
        }),
        [
            ['Back', ()=>showPlanetMenu(planet)]
        ],
        'academy_panel',
        (nextPlanet) => nextPlanet.settlement?.academy ? showAcademyMenu(nextPlanet.settlement.academy) : showPlanetMenu(nextPlanet)
    );

    if (selectedSkill) {
        onSelectSkill(selectedSkill);
    }
}
