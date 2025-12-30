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

    function showUpgradeConfirmation(skill = SKILLS_ALL[0]) {
        const cost = academy.calcSkillUpgradeCost(gs.captain, skill)
        const currentLevel = gs.captain.skills.getAmount(skill)
        
        showModal(
            `Train ${skill}?`,
            `Train <b>${skill}</b> from level ${currentLevel} to ${currentLevel + 1} for <b>${cost} CR</b>?<br/><br/>Your CR after training: ${gs.credits - cost}`,
            [
                ['Train', () => upgradeSkill(skill)],
                ['Cancel', () => reloadMenu(skill)]
            ]
        )
    }

    function onSelectSkill(skill = SKILLS_ALL[0]) {
        const cost = academy.calcSkillUpgradeCost(gs.captain, skill)
        const currentLevel = gs.captain.skills.getAmount(skill)
        const targetLevel = currentLevel + 1
        const canUpgrade = academy.calcCanUpgradeSkill(gs.captain, targetLevel)
        const canAfford = gs.credits >= cost && isDocked
        const canTrain = canUpgrade && canAfford
        
        const buttons = [
            ...(isDocked ? [['Upgrade', () => showUpgradeConfirmation(skill), !canTrain]] : []),
            ['Back', () => showPlanetMenu(planet)]
        ]
        refreshPanelButtons('academy_panel', buttons)
    }

    // Build skills table with columns: Skill Name, CR to Upgrade
    const skillTableRows = [
        ['Skill', 'Current Lvl', 'Can Upgrade?', 'CR to Upgrade'],
        ...SKILLS_ALL.map(skill => {
            const currentLevel = gs.captain.skills.getAmount(skill)
            const targetLevel = currentLevel + 1
            const canUpgrade = academy.calcCanUpgradeSkill(gs.captain, targetLevel)
            const cost = academy.calcSkillUpgradeCost(gs.captain, skill)
            const skillModifier = planet.civilization.skillPriceModifiers.getAmount(skill) || 1
            const totalMultiplier = skillModifier * (1 + academy.rake)
            // Calculate stat ratio: 1.0 rake and 1.0 skillCost = white (ratio 1)
            // Higher = red (ratio < 1), Lower = green (ratio > 1)
            const statRatio = 1 / totalMultiplier
            
            return [
                skill,
                currentLevel,
                colorSpan(canUpgrade ? 'Yes' : 'No', canUpgrade ? COLORS.Green : COLORS.Red),
                ''+statColorSpan(cost, statRatio) + ' CR'
            ]
        })
    ]

    const skillTable = createTable(skillTableRows, (rowIndex) => onSelectSkill(SKILLS_ALL[rowIndex]), selectedSkill ? SKILLS_ALL.indexOf(selectedSkill) + 1 : null)

    let infoContainer = ce({
        children: [
            `<br/>${isDocked ? 'Welcome to the academy. Select a skill to train:' : colorSpan('You must dock to use the academy.', COLORS.Yellow)}`,
            skillTable,
            `Your CR: ${gs.credits}<br/>`,
            `Training Fee: ${statColorSpan(roundToPlaces(100*academy.rake, 2), 1/(1+academy.rake))}%<br/>`,
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
