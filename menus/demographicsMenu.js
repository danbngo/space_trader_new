/**
 * Displays demographic information about a planet's population.
 * @param {Planet} planet - The planet to display demographics for.
 */
function showPlanetDemographicsMenu(planet = new Planet()) {
    const {civilization} = planet
    console.log('1',civilization)
    
    let contentContainer
    
    // Check if civilization exists
    if (!civilization) {
        contentContainer = ce({children: ['No civilization detected on this planet.']})
    } else {
        contentContainer = ce({})
    
    // Racial Demographics
    const racialDemographicsSection = ce({
        children: [
            '<u>Racial Demographics</u>'
        ]
    })
    console.log('2',civilization.races)
    
    if (civilization.races.size > 0) {
        // Sort races by proportion (highest first)
        const sortedRaces = Array.from(civilization.races.counts.entries())
            .sort((a, b) => b[1] - a[1])
        
        /** @type {Array<[string, string|HTMLElement]>} */
        const raceRows = [['Race', '% of Population']]
        for (const [race, proportion] of sortedRaces) {
            const percentage = (proportion * 100).toFixed(1)
            const progressBar = new ProgressBar({
                value: parseFloat(percentage),
                fillColor: rgbArrayToString(race.color),
            })
            raceRows.push([coloredName(race), progressBar.container])
        }
        racialDemographicsSection.appendChild(createTable(raceRows))
    } else {
        racialDemographicsSection.appendChild(ce({innerHTML:'(No demographic data available)'}))
    }
    console.log('3',civilization.religions)
    
    // Religious Demographics
    const religiousDemographicsSection = ce({
        children: [
            '<u>Religious Demographics</u>'
        ]
    })
    
    if (civilization.religions && civilization.religions.counts.size > 0) {
        // Sort religions by proportion (highest first)
        const sortedReligions = Array.from(civilization.religions.counts.entries())
            .sort((a, b) => b[1] - a[1])
        
            console.log('sortedReligions:',sortedReligions)

        /** @type {Array<[string, string|HTMLElement]>} */
        const religionRows = [['Religion', '% of Population']]
        for (const [religion, proportion] of sortedReligions) {
            const percentage = (proportion * 100).toFixed(1)
            console.log('r,p',religion,proportion,percentage)
            const progressBar = new ProgressBar({
                value: parseFloat(percentage),
                fillColor: rgbArrayToString(religion.color),
            })
            religionRows.push([coloredName(religion), progressBar.container])
        }
        religiousDemographicsSection.appendChild(createTable(religionRows))
    } else {
        religiousDemographicsSection.appendChild(ce({innerHTML:'(No organized religions present)'}))
    }
    
    // Cultural Demographics
    const culturalDemographicsSection = ce({
        children: [
            '<u>Cultural Demographics</u>'
        ]
    })
    
    if (civilization.cultures && civilization.cultures.counts.size > 0) {
        // Sort cultures by proportion (highest first)
        const sortedCultures = Array.from(civilization.cultures.counts.entries())
            .sort((a, b) => b[1] - a[1])
        
        /** @type {Array<[string, string|HTMLElement]>} */
        const cultureRows = [['Cultural Origin', '% of Population']]
        for (const [culturePlanet, proportion] of sortedCultures) {
            const percentage = (proportion * 100).toFixed(1)
            const progressBar = new ProgressBar({
                value: parseFloat(percentage),
                fillColor: rgbArrayToString(culturePlanet.color),
            })
            cultureRows.push([coloredName(culturePlanet), progressBar.container])
        }
        culturalDemographicsSection.appendChild(createTable(cultureRows))
    } else {
        culturalDemographicsSection.appendChild(ce({innerHTML:'(No cultural data available)'}))
    }
    
        // Use column layout: racial + religious demographics on left, cultural demographics on right
        const leftColumn = ce({children: [racialDemographicsSection, ce({innerHTML: '<br/>'}), religiousDemographicsSection]})
        contentContainer.appendChild(createColumnLayout([leftColumn, culturalDemographicsSection]))
    }

    console.log('4')
    
    showPlanetModal(planet, `${coloredName(planet)} - Demographics`, contentContainer, [
        ["Society", () => showPlanetSocietyMenu(planet), !civilization],
        ["Climate", () => showPlanetClimateMenu(planet)],
        ["News", () => showNewsTimelineMenu(planet, () => showPlanetDemographicsMenu(planet))],
        ["Back", () => showPlanetMenu(planet)]
    ], 'planet_demographics', (nextPlanet) => showPlanetDemographicsMenu(nextPlanet));
}
