
function showAcademyMenu(academy = new Academy()) {
    const {planet} = academy
    const reloadMenu = ()=>showAcademyMenu(academy)
    const isDocked = gs.location == planet

    function upgradeSkill(skill = SKILLS_ALL[0]) {
        const currentLevel = gs.captain.skills.getAmount(skill)
        const cost = academy.calcSkillUpgradeCost(skill, currentLevel)
        
        if (gs.credits >= cost) {
            gs.credits -= cost
            gs.captain.skills.increment(skill, 1)
            reloadMenu()
        }
    }

    function showSkillUpgradeInfo(skill = SKILLS_ALL[0]) {
        const currentLevel = gs.captain.skills.getAmount(skill)
        const cost = academy.calcSkillUpgradeCost(skill, currentLevel)
        const skillModifier = academy.skillCosts.getAmount(skill) || 1
        
        let msg = `<b>${skill}</b><br/>`
        msg += `Current Level: ${currentLevel}<br/>`
        msg += `Upgrade Cost: ${cost}CR<br/><br/>`
        
        // Show if this academy is good or bad for this skill
        if (skillModifier < 0.8) {
            msg += colorSpan(`This academy specializes in ${skill}!`, 'lightgreen', true) + `<br/>`
        } else if (skillModifier > 1.5) {
            msg += colorSpan(`This academy is not ideal for ${skill}.`, 'orange', true) + `<br/>`
        }
        
        msg += `<br/>Upgrading will increase your ${skill} skill by 1.`
        
        showModal(
            `${skill} Training`,
            msg,
            [
                ['Upgrade', () => {
                    upgradeSkill(skill)
                }, gs.credits < cost || !isDocked],
                ['Back', reloadMenu]
            ]
        )
    }

    const skillButtons = SKILLS_ALL.map(skill => {
        const currentLevel = gs.captain.skills.getAmount(skill)
        const cost = academy.calcSkillUpgradeCost(skill, currentLevel)
        const skillModifier = academy.skillCosts.getAmount(skill) || 1
        
        // Add indicator for good/bad specialization
        let label = `${skill} (${cost}CR)`
        if (skillModifier < 0.8) label += ' ★'
        
        return [label, () => showSkillUpgradeInfo(skill), !isDocked]
    })

    let infoContainer = ce({
        children: [
            `Your CR: ${gs.credits}<br/>`,
            `Academy Quality: ${statColorSpan(roundToPlaces(1/(1+academy.rake), 2), 1/(1+academy.rake), true)}x<br/>`,
            `<br/>${isDocked ? 'Select a skill to train:' : 'You must dock to use the academy.'}`,
        ]
    })

    showModal(
        `${coloredName(planet)} - Academy`,
        ce({
            children:[
                `The academy offers training to enhance your skills for a price.<br/>`,
                `Costs increase with your current skill level.<br/>`,
                `★ indicates this academy specializes in that skill.<br/>`,
                infoContainer,
            ]
        }),
        [
            ...skillButtons,
            ['Back', ()=>showPlanetMenu(planet)]
        ],
        'academy_panel'
    );
}
