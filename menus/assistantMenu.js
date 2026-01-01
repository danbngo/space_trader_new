/**
 * Displays information about all religions in the star system.
 * @param {Planet} planet - The planet from which the menu is accessed (for back navigation).
 */
function showReligionsMenu(planet = null) {
    const religions = RELIGIONS || []
    
    if (religions.length === 0) {
        showModal(
            'Religions Database',
            'No organized religions detected in this star system.',
            [["Back", () => planet ? showAssistantMenu(planet) : closeModal()]]
        )
        return
    }

    const contentContainer = ce({style: 'display: flex; flex-direction: column; gap: 20px;'})
    
    // Header
    const header = ce({
        children: [`There are ${religions.length} major organized religions in the ${gs.system.name} system:`]
    })
    contentContainer.appendChild(header)

    // List each religion with its traits
    for (const religion of religions) {
        const religionSection = ce({
            style: 'border-left: 3px solid ' + rgbArrayToString(religion.color) + '; padding-left: 15px; margin-bottom: 15px;',
            children: [
                ce({
                    tag: 'div',
                    style: 'font-weight: bold; margin-bottom: 5px; font-size: 1.1em;',
                    children: ['✦ ', colorSpan(religion.name, religion.color)]
                })
            ]
        })

        if (religion.traits && religion.traits.length > 0) {
            const traitsHeader = ce({
                style: 'margin-top: 10px; margin-bottom: 5px; opacity: 0.8;',
                children: ['Doctrinal Traits:']
            })
            religionSection.appendChild(traitsHeader)

            for (const trait of religion.traits) {
                const traitEl = ce({
                    style: 'margin-left: 10px; margin-bottom: 5px;',
                    children: [
                        `• ${colorSpan(trait.name, trait.color)}`,
                        ce({
                            tag: 'span',
                            style: 'opacity: 0.7; font-size: 0.9em; margin-left: 5px;',
                            children: [` - ${trait.description}`]
                        })
                    ]
                })
                religionSection.appendChild(traitEl)
            }
        } else {
            const noTraits = ce({
                style: 'margin-top: 5px; opacity: 0.6; font-style: italic;',
                children: ['This faith has no documented doctrinal traits.']
            })
            religionSection.appendChild(noTraits)
        }

        contentContainer.appendChild(religionSection)
    }

    showModal(
        'Religions Database',
        contentContainer,
        [["Back", () => planet ? showAssistantMenu(planet) : closeModal()]]
    )
}

/**
 * Shows the assistant/computer menu with various information access options.
 * @param {Planet} planet - The planet from which the assistant is accessed.
 */
function showAssistantMenu(planet = new Planet()) {
    const msg = `Welcome to the ${coloredName(planet)} information terminal. What would you like to access?`
    
    showModal(
        'Assistant',
        msg,
        [
            ["Religions", () => showReligionsMenu(planet)],
            ["Back", () => showPlanetMenu(planet)]
        ]
    )
}
