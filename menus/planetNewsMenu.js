/**
 * Displays news timeline for a specific planet with navigation buttons.
 * @param {Planet} planet - The planet to show news for.
 * @param {boolean} activeOnly - Whether to show only active news or include history.
 */
function showPlanetNewsMenu(planet = null, activeOnly = true) {
    if (!planet) {
        console.error('showPlanetNewsMenu requires a planet');
        return;
    }
    
    const newsSource = activeOnly ? gs.system.news : [...gs.system.news, ...gs.system.history];
    
    const relevantNews = newsSource.filter(news => 
        !news.planet || news.planet === planet || news.targetPlanet === planet
    );
    
    const title = `${coloredName(planet)} - News`;
    
    let content;
    if (relevantNews.length === 0) {
        content = ce({children: [`No ${activeOnly ? 'recent' : 'historical'} news about ${coloredName(planet)}.`]});
    } else {
        // Sort by year (most recent first)
        relevantNews.sort((a, b) => b.startYear - a.startYear);
        
        /**@type {Array<[number, string, number]>} */
        const newsLines = [];
        for (const news of relevantNews) {
            if (news.started && news.startYear && news.startDescription) {
                newsLines.push([news.startYear, news.startDescription, news.newsType ? news.newsType.displayPriority : 0]);
            }
            if (news.ended && news.endedYear && news.endDescription) {
                newsLines.push([news.endedYear, news.endDescription, news.newsType ? news.newsType.displayPriority : 0]);
            }
        }
        
        // Sort by year descending, then by displayPriority ascending
        newsLines.sort((a, b) => b[0] - a[0] || a[2] - b[2]);
        
        const newsContent = newsLines.map(line => line[1]).join('<br/>');
        content = ce({children: [newsContent]});
    }
    
    /** @type {ButtonData[]} */
    const buttons = [];
    
    // Toggle between active and historical news
    const toggleLabel = activeOnly ? "Show Historical" : "Show Active Only";
    buttons.push([toggleLabel, () => showPlanetNewsMenu(planet, !activeOnly)]);
    
    // Add other planet info buttons
    buttons.push(["Climate", () => showPlanetClimateMenu(planet)]);
    if (planet.civilization) {
        buttons.push(["Society", () => showPlanetSocietyMenu(planet)]);
        buttons.push(["Demographics", () => showPlanetDemographicsMenu(planet)]);
    }
    buttons.push(["Back", () => showPlanetMenu(planet)]);
    
    // Use showPlanetModal to get navigation arrows
    showPlanetModal(planet, title, content, buttons, 'planet_news', (nextPlanet) => showPlanetNewsMenu(nextPlanet, activeOnly));
}
