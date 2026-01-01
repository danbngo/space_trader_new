/**
 * Displays demographic information about a planet's population.
 * @param {Planet} planet - The planet to display demographics for.
 */
function showPlanetDemographicsMenu(planet = new Planet()) {
    const {civilization} = planet
    
    const contentContainer = ce({style: 'display: flex; flex-direction: column; gap: 20px;'})
    
    // Population Section
    const populationSection = ce({
        children: [
            ce({tag: 'div', style: 'text-decoration: underline; margin-bottom: 10px;', children: ['Population']}),
            ce({children: [`👥 Total Population: ${describePopulation(civilization.population)}`]})
        ]
    })
    contentContainer.appendChild(populationSection)
    
    // Racial Demographics
    const racialDemographicsSection = ce({
        children: [
            ce({tag: 'div', style: 'text-decoration: underline; margin-bottom: 10px;', children: ['Racial Demographics']})
        ]
    })
    
    if (civilization.races.size > 0) {
        // Sort races by proportion (highest first)
        const sortedRaces = Array.from(civilization.races.entries())
            .sort((a, b) => b[1] - a[1])
        
        for (const [race, proportion] of sortedRaces) {
            const percentage = (proportion * 100).toFixed(1)
            const raceLabel = ce({
                tag: 'div',
                style: 'margin-bottom: 5px;',
                children: [`${race.icon} `, colorSpan(race.name, race.color), `: ${percentage}%`]
            })
            const progressBar = new ProgressBar({
                id: `race_${race.name.replace(/\s+/g, '_')}`,
                label: '',
                value: parseFloat(percentage),
                height: 20,
                fillColor: rgbArrayToString(race.color),
                showPercentage: false
            })
            const barContainer = ce({
                style: 'margin-bottom: 15px;',
                children: [raceLabel, progressBar.container]
            })
            racialDemographicsSection.appendChild(barContainer)
        }
    } else {
        racialDemographicsSection.appendChild(ce({
            style: 'opacity: 0.6;',
            children: ['No demographic data available']
        }))
    }
    
    contentContainer.appendChild(racialDemographicsSection)
    
    // Territory Section
    const territorySection = ce({
        children: [
            ce({tag: 'div', style: 'text-decoration: underline; margin-bottom: 10px;', children: ['Territory']}),
            ce({children: [`🗺️ Territorial Reach: ${describeTerritory(civilization.territory)}`]})
        ]
    })
    contentContainer.appendChild(territorySection)
    
    // Religious Demographics
    const religiousDemographicsSection = ce({
        children: [
            ce({tag: 'div', style: 'text-decoration: underline; margin-bottom: 10px;', children: ['Religious Demographics']})
        ]
    })
    
    if (civilization.religions && civilization.religions.counts.size > 0) {
        // Sort religions by proportion (highest first)
        const sortedReligions = Array.from(civilization.religions.counts.entries())
            .sort((a, b) => b[1] - a[1])
        
        for (const [religion, proportion] of sortedReligions) {
            const percentage = (proportion * 100).toFixed(1)
            const religionLabel = ce({
                tag: 'div',
                style: 'margin-bottom: 5px;',
                children: ['✦ ', colorSpan(religion.name, religion.color), `: ${percentage}%`]
            })
            const progressBar = new ProgressBar({
                id: `religion_${religion.name.replace(/\s+/g, '_')}`,
                label: '',
                value: parseFloat(percentage),
                height: 20,
                fillColor: religion.color,
                showPercentage: false
            })
            const barContainer = ce({
                style: 'margin-bottom: 10px;',
                children: [religionLabel, progressBar.container]
            })
            barContainer.style.marginBottom = '15px'
            religiousDemographicsSection.appendChild(barContainer)
        }
    } else {
        religiousDemographicsSection.appendChild(ce({
            style: 'opacity: 0.6;',
            children: ['No organized religions present']
        }))
    }
    
    contentContainer.appendChild(religiousDemographicsSection)
    
    showPlanetModal(planet, `${coloredName(planet)} - Demographics`, contentContainer, [
        ["Society", () => showPlanetSocietyMenu(planet)],
        ["Back", () => showPlanetMenu(planet)]
    ], 'planet_demographics', (nextPlanet) => showPlanetDemographicsMenu(nextPlanet));
}
