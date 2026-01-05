/**
 * Displays a timeline of news events for a planet or the entire system.
 * @param {Planet|null} planet - The planet to show news for, or null for all news.
 * @param {Function|null} backFunction - Custom back button handler.
 */
function showNewsTimelineMenu(planet = null, backFunction = null, activeOnly = true) {
    const newsSource = activeOnly ? gs.system.news : [...gs.system.news, ...gs.system.history]

    const relevantNews = planet 
        ? newsSource.filter(news => (!news.planet || news.planet === planet || news.targetPlanet === planet))
        : newsSource

    if (!planet) relevantNews.push(...gs.system.simpleNews)
    
    const title = planet ? `${coloredName(planet)} - News` : 'Galactic News'
    const defaultBack = planet ? () => showPlanetMenu(planet) : () => showStarMap()
    const backBtn = backFunction || defaultBack
    
    if (relevantNews.length === 0) {
        const msg = planet ? `No recent news about ${coloredName(planet)}.` : 'No recent news.'
        showModal(title, msg, [["Back", backBtn]])
        return
    }
    
    // Sort by year (most recent first)
    relevantNews.sort((a, b) => b.startYear - a.startYear)

    /**@type {Array<[number, string, number]>} */
    const newsLines = []
    for (const news of relevantNews) {
        if (news.started && news.startYear && news.startDescription) newsLines.push([news.startYear, news.startDescription, news.newsType ? news.newsType.displayPriority : 0])
        if (news.ended && news.endedYear && news.endDescription) newsLines.push([news.endedYear, news.endDescription, news.newsType ? news.newsType.displayPriority : 0])
    }

    newsLines.sort((a, b) => b[0] - a[0] || a[2] - b[2]) //sort by year descending, then by displayPriority ascending
    const msg = newsLines.map(line => line[1]).join('<br/>')
    
    const buttons = []
    const toggleLabel = activeOnly ? "Show Historical" : "Show Active Only"
    buttons.push([toggleLabel, () => showNewsTimelineMenu(planet, backFunction, !activeOnly)])
    
    // Add planet submenu buttons if planet is specified
    if (planet) {
        buttons.push(["Climate", () => showPlanetClimateMenu(planet)])
        buttons.push(["Society", () => showPlanetSocietyMenu(planet), !planet.civilization])
        buttons.push(["Demographics", () => showPlanetDemographicsMenu(planet), !planet.civilization])
        buttons.push(["Back", () => showPlanetMenu(planet)])
    } else {
        buttons.push(["Back", backBtn])
    }
   
    showModal(title, msg, buttons)
}

