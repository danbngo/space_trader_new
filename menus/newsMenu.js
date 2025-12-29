/**
 * Displays a timeline of news events for a planet or the entire system.
 * @param {Planet|null} planet - The planet to show news for, or null for all news.
 * @param {Function|null} backFunction - Custom back button handler.
 */
function showNewsTimelineMenu(planet = null, backFunction = null, activeOnly = true) {
    // If no planet specified, show all news
        console.log('0a')

    const relevantNews = planet 
        ? gs.system.news.filter(news => (!news.planet || news.planet === planet || news.targetPlanet === planet))
        : gs.system.news

        console.log('0b')

    // Filter by activeOnly if requested
    const filteredNews = activeOnly 
        ? relevantNews.filter(news => !news.ended)
        : relevantNews

    if (!planet) filteredNews.push(...gs.system.simpleNews)

        console.log('1')
    
    const title = planet ? `${coloredName(planet)} - News` : 'Galactic News'
    const defaultBack = planet ? () => showPlanetMenu(planet) : () => showStarMap()
    const backBtn = backFunction || defaultBack
    
    if (filteredNews.length === 0) {
        const msg = planet ? `No recent news about ${coloredName(planet)}.` : 'No recent news.'
        showModal(title, msg, [["Back", backBtn]])
        return
    }
    
        console.log('2')
    // Sort by year (most recent first)
    filteredNews.sort((a, b) => b.startYear - a.startYear)

        console.log('3')
    /**@type {Array<[number, string, number]>} */
    const newsLines = []
    for (const news of filteredNews) {
        if (news.started && news.startYear && news.startDescription) newsLines.push([news.startYear, news.startDescription, news.newsType ? news.newsType.displayPriority : 0])
        if (news.ended && news.endedYear && news.endDescription) newsLines.push([news.endedYear, news.endDescription, news.newsType ? news.newsType.displayPriority : 0])
    }

    console.log('4')

    newsLines.sort((a, b) => b[0] - a[0] || a[2] - b[2]) //sort by year descending, then by displayPriority ascending
    const msg = newsLines.map(line => line[1]).join('<br/>')

    console.log('5')
    
    const buttons = []
    const toggleLabel = activeOnly ? "Show Historical" : "Show Active Only"
    buttons.push([toggleLabel, () => showNewsTimelineMenu(planet, backFunction, !activeOnly)])
    buttons.push(["Back", backBtn])
   
    showModal(title, msg, buttons)
}

