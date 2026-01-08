/**
 * Checks for random events (news, encounters, debt collections) during time passage.
 * @param {number} elapsedYears - The amount of game time that has passed in years.
 */
function checkForEvents(elapsedYears = 1) {
    //console.log('checkForEvents', { elapsedYears });
    const elapsedDays = elapsedYears*365
    if (gs.checkGameOver()) return
    checkForNews()
    checkForAnomalies(elapsedDays)
    checkForFleetSpawning(elapsedDays)
    checkForAbandonedFleetDecay(elapsedDays)
    tickNPCFleets(elapsedYears)
    tickPlanets(elapsedYears)
    if (checkForEncounter(elapsedDays)) return
    if (checkDebtCollections(elapsedDays)) return
    if (isNaN(gs.credits)) {
        throw new Error('GameState credits is NaN!')
    }
}
/**
 * Checks if a news event should occur and generates it.
 * @param {number} elapsedDays - Days that have elapsed.
 * @returns {boolean} Whether news was generated.
 */
function checkForNews(elapsedDays = 1) {
    //console.log('checkForNews', { elapsedDays });
    if (!calcOccurrencesPerTimespan(NEWS_CHANCE_PER_DAY, elapsedDays)) return false
    const newsEvent = generateNews()
    if (!newsEvent) return
    newsEvent.start()
    gs.system.news.push(newsEvent)
}



function tickPlanets(elapsedYears = 1) {
    //for planets and dwarf planets, apply some gradual bonuses over time based on GovernmentType civBonuses
    const allPlanets = [...gs.system.planets, ...gs.system.dwarfPlanets]
    for (const planet of allPlanets) {
        if (!planet.civilization || !planet.civilization.governmentType) continue
        const govBonuses = planet.civilization.governmentType.civBonuses
        for (const [key, value] of Object.entries(govBonuses)) {
            if (planet.c[key] !== undefined) {
                // @ts-ignore
                planet.c[key] *= (1 + value * CIVILIZATION_BONUS_RATE_PER_YEAR * elapsedYears) // very small gradual bonus
            }
        }
    }
}
