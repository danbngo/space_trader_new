
function showNewsTimelineMenu(planet = null, backFunction = null) {
    // If no planet specified, show all news
    const relevantNews = planet 
        ? (gs.system.news || []).filter(news => news.planet === planet || news.targetPlanet === planet)
        : (gs.system.news || [])
    
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

    /**@type {Array<[number, string]>} */
    const newsLines = []
    for (const news of relevantNews) {
        if (news.started) newsLines.push([news.startYear, news.startDescription])
        if (news.ended) newsLines.push([news.endYear, news.endDescription])
    }

    newsLines.sort((a, b) => b[0] - a[0]) //sort by year descending
    const msg = newsLines.map(line => line[1]).join('<br/>')
    
    showModal(title, msg, [["Back", backBtn]])
}

