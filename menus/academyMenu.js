/**
 * Creates an HTML table displaying available officers for hire at academy/tavern.
 * @param {Officer[]} officers - Array of officers available for hire.
 * @param {Academy | Tavern} academy - The academy or tavern building.
 * @param {(officer: Officer) => void} onSelectOfficer - Callback when an officer is selected.
 * @returns {HTMLTableElement|string} The table element or "(None)" if no officers.
 */
function createAcademyHireOfficerMenu(officers = [], academy, onSelectOfficer = (officer)=>{}) {
    if (officers.length == 0) return `(None)`
    const rows = [
        ['Name', 'Race', 'Age', 'Level', 'CR Share', ...SKILLS_ALL, 'Implants', 'Hire Price']
    ]
    for (const officer of officers) {
        if (!(academy instanceof Tavern)) continue; // Type guard
        const hirePrice = academy.calcHirePrice(officer)
        const implantCount = officer.implants.length
        const raceDisplay = officer.race ? `${officer.race.symbol} ${officer.race.name}` : 'Human'
        rows.push([
            officer.name,
            raceDisplay,
            ''+officer.age,
            statColorSpan(officer.level, officer.level/5),
            statColorSpan(officer.crShare*100+'%', 5/officer.level),
            ...SKILLS_ALL.map(sk=>statColorSpan(officer.skills.getAmount(sk), officer.skills.getAmount(sk)*SKILLS_ALL.length/5/SKILL_POINTS_PER_LEVEL)),
            implantCount > 0 ? colorSpan(''+implantCount, COLORS.Cyan) : colorSpan('-', COLORS.Gray),
            statColorSpan(hirePrice, officer.value/hirePrice)
        ])
    }
    return createTable(rows, (rowIndex = 0)=>onSelectOfficer(officers[rowIndex]))
}

/**
 * Displays the academy menu where the player can upgrade captain skills.
 * @param {Academy | Tavern} academy - The academy or tavern building to interact with.
 * @param {SkillType} selectedSkill - The currently selected skill to highlight (member of SKILLS_ALL).
 * @param {boolean} showHiring - Whether to show the hiring tab instead of training.
 */
function showAcademyMenu(academy, selectedSkill = SKILLS_ALL[0], showHiring = false) {
    const {planet} = academy
    const reloadMenu = (skill = selectedSkill, hiring = showHiring) => showAcademyMenu(academy, skill, hiring)
    const isDocked = gs.location == planet
    
    // Type check to determine if this is a Tavern or Academy
    const isTavern = academy instanceof Tavern
    const buildingName = isTavern ? 'Tavern' : 'Academy'
    const trainVerb = isTavern ? 'Practice' : 'Train'
    const welcomeMsg = isTavern ? 'Welcome to the tavern. Select a skill to practice:' : 'Welcome to the academy. Select a skill to train:'
    const hireMsg = isTavern ? 'Available mercenaries for hire:' : 'Available officers for hire:'
    
    // Get sellable discoveries (discovered but not sold anomalies)
    const sellableAnomalies = (gs.system.anomalies || []).filter(a => a.discoveredYear !== null && !a.sold)

    function upgradeSkill(skill = SKILLS_ALL[0]) {
        if (!(academy instanceof Academy)) return; // Type guard
        const cost = academy.calcSkillUpgradeCost(gs.captain, skill)
        
        if (gs.credits >= cost && isDocked) {
            gs.credits -= cost
            gs.captain.skills.increment(skill, 1)
            reloadMenu(skill)
        }
    }
    
    function showSellDiscoveriesMenu() {
        if (!isTavern && sellableAnomalies.length > 0) {
            const anomalyList = sellableAnomalies.map(a => {
                const baseValue = 5000 + rng(10000, 2000)
                const value = Math.round(baseValue * planet.c.education * planet.c.economy * (1 + planet.c.prestige))
                return {anomaly: a, value}
            })
            
            let message = `The academy is interested in purchasing your anomaly discoveries for research purposes:<br/><br/>`
            message += `<b>Discoveries You Can Sell:</b><br/>`
            for (const {anomaly, value} of anomalyList) {
                message += `• ${anomaly.name} (${anomaly.anomalyType.name}): ${value} CR<br/>`
            }
            message += `<br/>Select which discoveries to sell:`
            
            /** @type {ButtonData[]} */
            const buttons = anomalyList.map(({anomaly, value}) => [
                    `Sell ${anomaly.name} (${value} CR)`,
                    () => {
                        anomaly.sold = true
                        gs.credits += value
                        showModal(
                            'Discovery Sold!',
                            `You sold your discovery of ${anomaly.name} for ${value} CR!<br/><br/>` +
                            `The academy thanks you for advancing scientific knowledge.`,
                            [['Continue', () => reloadMenu(selectedSkill)]]
                        )
                    }
            ])
            buttons.push(['Back', () => reloadMenu(selectedSkill)])
            
            showModal('Sell Discoveries', message, buttons)
        } else if (isTavern) {
            showModal('Not Available', 'Taverns are not interested in purchasing scientific discoveries. Try an academy.', [
                ['Continue', () => reloadMenu(selectedSkill)]
            ])
        } else {
            showModal('No Discoveries', 'You have no unsold anomaly discoveries to sell.', [
                ['Continue', () => reloadMenu(selectedSkill)]
            ])
        }
    }

    function showUpgradeConfirmation(skill = SKILLS_ALL[0]) {
        if (!(academy instanceof Academy)) return; // Type guard
        const cost = academy.calcSkillUpgradeCost(gs.captain, skill)
        const currentLevel = gs.captain.skills.getAmount(skill)
        
        showModal(
            `${trainVerb} ${skill.name}?`,
            `${trainVerb} <b>${skill.name}</b> from level ${currentLevel} to ${currentLevel + 1} for <b>${cost} CR</b>?<br/><br/>Your CR after training: ${gs.credits - cost}`,
            [
                [`${trainVerb} ${skill.name}`, () => upgradeSkill(skill)],
                ['Cancel', () => reloadMenu(skill)]
            ]
        )
    }

    function onSelectSkill(skill = SKILLS_ALL[0]) {
        if (!(academy instanceof Academy)) return; // Type guard
        const cost = academy.calcSkillUpgradeCost(gs.captain, skill)
        const currentLevel = gs.captain.skills.getAmount(skill)
        const targetLevel = currentLevel + 1
        const canUpgrade = academy.calcCanUpgradeSkill(gs.captain, targetLevel)
        const canAfford = gs.credits >= cost && isDocked
        const canTrain = canUpgrade && canAfford
        
        /** @type {ButtonData[]} */
        const buttons = [
            ['Upgrade', () => showUpgradeConfirmation(skill), !canTrain || !isDocked]
        ]
        if (!isTavern) {
            const canSell = sellableAnomalies.length > 0
            const sellDisabledReason = canSell ? null : 'No unsold anomaly discoveries to sell'
            buttons.push(['Sell Discoveries', () => showSellDiscoveriesMenu(), !canSell, sellDisabledReason])
        }
        buttons.push(['Back', () => showPlanetMenu(planet)])
        refreshPanelButtons('academy_panel', buttons)
    }

    function hireOfficer(officer) {
        if (!(academy instanceof Tavern)) return; // Type guard
        const hirePrice = academy.calcHirePrice(officer)
        gs.credits -= hirePrice
        gs.fleet.addOfficer(officer)
        safeRemove(academy.officers, officer)
        reloadMenu(selectedSkill, true)
    }

    function showHireOfficerModal(officer) {
        if (!(academy instanceof Tavern)) return; // Type guard
        const hirePrice = academy.calcHirePrice(officer)
        const implantsText = officer.implants.length > 0 
            ? '<br/><b>Cybernetic Implants:</b><br/>' + officer.implants.map(i => colorSpan(i.implantType.name, i.implantType.color) + ` (${roundToPlaces(i.quality*100, 1)}%)`).join(', ')
            : ''
        const reputationText = officer.reputation.total !== 0 
            ? `<br/><b>Reputation:</b> ${officer.reputation.total} (${coloredName(officer.reputation.keys[0])})`
            : ''
        const raceText = officer.race ? `${officer.race.symbol} ${colorSpan(officer.race.name, officer.race.color)}` : 'Human'
        
        showModal(
            `Hire ${officer.name}?`,
            `Hire ${officer.name} for ${hirePrice} credits?<br/><br/><b>Race:</b> ${raceText}<br/><b>Level:</b> ${officer.level}<br/><b>Skills:</b> ${SKILLS_ALL.map(sk => `${sk}: ${officer.skills.getAmount(sk)}`).join(', ')}${implantsText}${reputationText}`,
            [
                ['Hire', () => hireOfficer(officer)],
                ['Cancel', () => reloadMenu(selectedSkill, true)],
            ],
        )
    }

    function onSelectOfficer(officer) {
        if (!(academy instanceof Tavern)) return; // Type guard
        const hirePrice = academy.calcHirePrice(officer)
        const canHire = isDocked && gs.credits >= hirePrice && gs.fleet.officers.length < gs.captain.maxSubordinates
        /** @type {ButtonData[]} */
        const buttons = [
            ['Hire', ()=>showHireOfficerModal(officer), canHire],
            ['Train Skills', () => reloadMenu(selectedSkill, false)],
            ['Back', () => showPlanetMenu(planet)],
        ]
        refreshPanelButtons('academy_panel', buttons)
    }

    // Build skills table with columns: Skill Name, CR to Upgrade
    const skillTableRows = academy instanceof Academy ? [
        ['Skill', 'Current Lvl', 'Can Upgrade?', 'CR to Upgrade'],
        ...SKILLS_ALL.map(skill => {
            const currentLevel = gs.captain.skills.getAmount(skill)
            const targetLevel = currentLevel + 1
            const canUpgrade = academy.calcCanUpgradeSkill(gs.captain, targetLevel)
            const cost = academy.calcSkillUpgradeCost(gs.captain, skill)
            const skillModifier = planet.c.skillPriceMultipliers.getAmount(skill) || 1
            const totalMultiplier = skillModifier * (1 + academy.rake)
            // Calculate stat ratio: 1.0 rake and 1.0 skillCost = white (ratio 1)
            // Higher = red (ratio < 1), Lower = green (ratio > 1)
            const statRatio = 1 / totalMultiplier
            
            return [
                skill.name,
                currentLevel,
                colorSpan(canUpgrade ? 'Yes' : 'No', canUpgrade ? COLORS.Green : COLORS.Red),
                ''+statColorSpan(cost, statRatio) + ' CR'
            ]
        })
    ] : [['Skill', 'Current Lvl', 'Can Upgrade?', 'CR to Upgrade']]

    const skillTable = createTable(skillTableRows, (rowIndex) => onSelectSkill(SKILLS_ALL[rowIndex]), selectedSkill ? SKILLS_ALL.indexOf(selectedSkill) + 1 : null)

    let trainingContainer = ce({
        children: [
            skillTable,
            `Your CR: ${gs.credits}<br/>`,
            createBuildingPriceInfo(academy, isTavern ? 'Tavern' : 'Academy', {showBuyPrice: true, showSellPrice: false}),
        ]
    })

    let hiringContainer = academy instanceof Tavern ? ce({
        children: [
            createAcademyHireOfficerMenu(academy.officers, academy, (officer)=>onSelectOfficer(officer)),
            `Your # officers: ${gs.fleet.officers.length}/${gs.captain.maxSubordinates} | Your credits: ${gs.credits}<br/>`,
            `${isTavern ? 'Tavern' : 'Academy'} Credits: ${academy.credits} | Hire Price: ${isTavern ? colorSpan('No Fee', COLORS.Green) : statColorSpan(`+${roundToPlaces(100*planet.c.taxRate, 1)}%`, 1/(1+planet.c.taxRate))}<br/>`,
        ]
    }) : ce({children: ['Officer hiring not available']})

    /** @type {ButtonData[]} */
    const buttons = [
            [showHiring ? 'Train Skills' : 'Hire Officers', ()=>reloadMenu(selectedSkill, !showHiring)],
    ]
    if (!isTavern) {
        const canSell = !showHiring && sellableAnomalies.length > 0
        const sellDisabledReason = showHiring ? 'Switch to Train Skills tab to sell discoveries' : 'No unsold anomaly discoveries to sell'
        buttons.push(['Sell Discoveries', () => showSellDiscoveriesMenu(), !canSell, sellDisabledReason])
    }
    buttons.push(
            ['Back', ()=>showPlanetMenu(planet)]
    )

    showPlanetModal(
        planet,
        `${coloredName(planet)} - ${buildingName}`,
        ce({
            children:[
                showHiring ? hiringContainer : trainingContainer,
            ]
        }),
        [

        ],
        'academy_panel',
        (nextPlanet) => {
            const nextAcademy = isTavern ? nextPlanet.settlement?.tavern : nextPlanet.settlement?.academy
            return nextAcademy ? showAcademyMenu(nextAcademy, selectedSkill, showHiring) : showPlanetMenu(nextPlanet)
        }
    );

    if (selectedSkill && !showHiring) {
        onSelectSkill(selectedSkill);
    } else if (!showHiring && SKILLS_ALL.length > 0) {
        // Auto-select first skill if showing training and no skill selected
        onSelectSkill(SKILLS_ALL[0]);
    } else if (showHiring && !selectedSkill && academy instanceof Tavern && academy.officers.length > 0) {
        // Auto-select first officer if showing hiring and no selection
        onSelectOfficer(academy.officers[0]);
    }
}
