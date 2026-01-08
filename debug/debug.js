
function assessPlanets() {
    console.log("======================================")
    console.log("========= DEBUGGING PLANETS ==========")
    console.log("======================================")
    console.log('Total Regular Planets:', gs.system.planets.length)
    console.log('Total Dwarf Planets:', gs.system.dwarfPlanets.length)
    console.log("")

    // First iteration: Main Planets (with news analysis)
    assessPlanetGroup(gs.system.planets, "REGULAR PLANETS", true)

    // Second iteration: Dwarf Planets (without news analysis)
    assessPlanetGroup(gs.system.dwarfPlanets, "DWARF PLANETS", false)
}

function assessPlanetGroup(planets, groupName, includeNews = true) {
    console.log("")
    console.log("======================================")
    console.log(`========= ${groupName} ==========`)
    console.log("======================================")
    console.log("")

    if (planets.length === 0) {
        console.log(`No ${groupName.toLowerCase()} to analyze.`)
        return
    }

    // Government types
    const governmentTypes = planets.map(p => p.c.governmentType)
    console.log('Government Types:', governmentTypes.map(gt => gt.name))

    // Relationship counts
    const relationshipCounts = {}
    for (const p of planets) {
        for (const [otherPlanet, relationship] of p.c.relationships) {
            relationshipCounts[relationship.name] = relationshipCounts[relationship.name] ? relationshipCounts[relationship.name] + 1 : 1
        }
    }
    for (const relType of RELATIONSHIP_TYPES_ALL) {
        if (!relationshipCounts[relType.name]) relationshipCounts[relType.name] = 0
    }
    console.log('Relationship Counts:', relationshipCounts)
    console.log("")

    // News analysis (only for main planets)
    if (includeNews) {
        const newsPlusHistory = [...gs.system.news, ...gs.system.history]
        console.log('-----News Analysis:------')
        console.log('Total News + History:', newsPlusHistory.length)
        console.log('Active News:', newsPlusHistory.filter(n => (n.started && !n.ended)).length)
        console.log('Simple News:', gs.system.simpleNews.length)

        const totalNews = newsPlusHistory.length
        const activeNews = newsPlusHistory.filter(n => (n.started && !n.ended)).length
        const completedNews = newsPlusHistory.filter(n => (n.ended && !n.cancelled && !n.failed)).length
        const cancelledNews = newsPlusHistory.filter(n => (n.ended && n.cancelled)).length
        const failedNews = newsPlusHistory.filter(n => (n.ended && n.failed)).length
        
        const newsTotalsPerType = {}
        const newsTotalPercentsPerType = {}
        const activeNewsTotalsPerType = {}
        const activeNewsTotalPercentsPerType = {}
        const failedNewsTotalsPerType = {}
        const cancelledNewsTotalsPerType = {}
        const succeededNewsTotalsPerType = {}
        const succeededNewsTotalPercentsPerType = {}
        const failedNewsTotalPercentsPerType = {}
        const cancelledNewsTotalPercentsPerType = {}

        for (const n of newsPlusHistory) {
            const count = newsTotalsPerType[n.newsType.name] || 0
            newsTotalsPerType[n.newsType.name] = count + 1
            if (n.started && !n.ended) {
                const activeCount = activeNewsTotalsPerType[n.newsType.name] || 0
                activeNewsTotalsPerType[n.newsType.name] = activeCount + 1
            }
            if (n.ended) {
                if (n.failed) {
                    const failedCount = failedNewsTotalsPerType[n.newsType.name] || 0
                    failedNewsTotalsPerType[n.newsType.name] = failedCount + 1
                } else if (n.cancelled) {
                    const cancelledCount = cancelledNewsTotalsPerType[n.newsType.name] || 0
                    cancelledNewsTotalsPerType[n.newsType.name] = cancelledCount + 1
                } else {
                    const succeededCount = succeededNewsTotalsPerType[n.newsType.name] || 0
                    succeededNewsTotalsPerType[n.newsType.name] = succeededCount + 1
                }
            }
        }
        
        for (const nt of NT_ALL) {
            if (!newsTotalsPerType[nt.name]) newsTotalsPerType[nt.name] = 0
            if (!activeNewsTotalsPerType[nt.name]) activeNewsTotalsPerType[nt.name] = 0
            if (!succeededNewsTotalsPerType[nt.name]) succeededNewsTotalsPerType[nt.name] = 0
            if (!failedNewsTotalsPerType[nt.name]) failedNewsTotalsPerType[nt.name] = 0
            if (!cancelledNewsTotalsPerType[nt.name]) cancelledNewsTotalsPerType[nt.name] = 0
        }
        
        for (const [newsTypeName, count] of Object.entries(newsTotalsPerType)) {
            const percent = (count / totalNews) * 100
            newsTotalPercentsPerType[newsTypeName] = percent.toFixed(2) + '%'
        }
        for (const [newsTypeName, count] of Object.entries(activeNewsTotalsPerType)) {
            const percent = (count / activeNews) * 100
            activeNewsTotalPercentsPerType[newsTypeName] = percent.toFixed(2) + '%'
        }
        for (const [newsTypeName, count] of Object.entries(succeededNewsTotalsPerType)) {
            const percent = (count / completedNews) * 100
            succeededNewsTotalPercentsPerType[newsTypeName] = percent.toFixed(2) + '%'
        }
        for (const [newsTypeName, count] of Object.entries(failedNewsTotalsPerType)) {
            const percent = (count / failedNews) * 100
            failedNewsTotalPercentsPerType[newsTypeName] = percent.toFixed(2) + '%'
        }
        for (const [newsTypeName, count] of Object.entries(cancelledNewsTotalsPerType)) {
            const percent = (count / cancelledNews) * 100
            cancelledNewsTotalPercentsPerType[newsTypeName] = percent.toFixed(2) + '%'
        }

        const newsTypesThatNeverHappened = Object.keys(newsTotalsPerType).filter(ntName => newsTotalsPerType[ntName] === 0)
        //console.log('!!!News types that never happened:', newsTypesThatNeverHappened.join(" | "))
        console.log('')

        console.log('Total News Events Ever:', totalNews)
        console.log('Total News Events (Succeeded Only):', completedNews)
        console.log('Total News Events (Failed Only):', failedNews)
        console.log('Total News Events (Cancelled Only):', cancelledNews)
        console.log('Total News Events (Still Active):', activeNews)
        console.log('')
        console.log('News Totals Per Type:', newsTotalsPerType)
        console.log('Total News Types as % of total:', newsTotalPercentsPerType)
        console.log('')
        console.log('Active News Totals Per Type:', activeNewsTotalsPerType)
        console.log('Active News Types as % of active total:', activeNewsTotalPercentsPerType)
        console.log('')
        console.log('Succeeded News Totals Per Type:', succeededNewsTotalsPerType)
        console.log('Succeeded News Types as % of total:', succeededNewsTotalPercentsPerType)
        console.log('')
        console.log('Failed News Totals Per Type:', failedNewsTotalsPerType)
        console.log('Failed News Types as % of total:', failedNewsTotalPercentsPerType)
        console.log('')
        console.log('Cancelled News Totals Per Type:', cancelledNewsTotalsPerType)
        console.log('Cancelled News Types as % of total:', cancelledNewsTotalPercentsPerType)
        console.log('')
    }

    // Planet stats (for all planet types)
    console.log('-----Average Planet Stats:------')
    console.log('')

    const totalPopulation = planets.reduce((sum, planet) => sum + planet.c.population, 0)
    const totalTerritory = planets.reduce((sum, planet) => sum + planet.c.territory, 0)
    const totalArmy = planets.reduce((sum, planet) => sum + planet.c.army, 0)
    const totalNavy = planets.reduce((sum, planet) => sum + planet.c.navy, 0)
    const totalCorruption = planets.reduce((sum, planet) => sum + planet.c.corruption, 0)
    const totalCrime = planets.reduce((sum, planet) => sum + planet.c.crime, 0)
    const totalSecurity = planets.reduce((sum, planet) => sum + planet.c.security, 0)
    const totalEconomic = planets.reduce((sum, planet) => sum + planet.c.economy, 0)
    const totalIndustrial = planets.reduce((sum, planet) => sum + planet.c.industry, 0)
    const totalCulture = planets.reduce((sum, planet) => sum + planet.c.culture, 0)
    const totalPrestige = planets.reduce((sum, planet) => sum + planet.c.prestige, 0)
    const totalTechnology = planets.reduce((sum, planet) => sum + planet.c.technology, 0)
    const totalEducation = planets.reduce((sum, planet) => sum + planet.c.education, 0)
    const totalWealth = planets.reduce((sum, planet) => sum + planet.c.wealth, 0)
    const totalInflation = planets.reduce((sum, planet) => sum + planet.c.inflation, 0)
    const totalReserves = planets.reduce((sum, planet) => sum + planet.c.reserves, 0)
    const totalCargoPriceModifier = planets.reduce((sum, planet) => sum + planet.c.cargoPriceMultipliers.average, 0)

    const averageInflation = totalInflation / planets.length
    const averageTechnology = totalTechnology / planets.length
    const averageCorruption = totalCorruption / planets.length
    const averageCrime = totalCrime / planets.length
    const averageWealth = totalWealth / planets.length
    const averageEducation = totalEducation / planets.length
    const averagePopulation = totalPopulation / planets.length
    const averageTerritory = totalTerritory / planets.length
    const averageSecurity = totalSecurity / planets.length
    const averageEconomic = totalEconomic / planets.length
    const averageIndustrial = totalIndustrial / planets.length
    const averageCulture = totalCulture / planets.length
    const averagePrestige = totalPrestige / planets.length
    const averageMilitary = (totalArmy + totalNavy) / planets.length
    const averageReserves = totalReserves / planets.length

    const averageCargoPriceModifier = totalCargoPriceModifier / planets.length

    console.log('Average Planet Statistics:')
    console.log('  Population:', averagePopulation.toFixed(2))
    console.log('  Territory:', averageTerritory.toFixed(2))
    console.log('  Military Rating:', averageMilitary.toFixed(2))
    console.log('  Security Rating:', averageSecurity.toFixed(2))
    console.log('  Economic Rating:', averageEconomic.toFixed(2))
    console.log('  Industrial Rating:', averageIndustrial.toFixed(2))
    console.log('  Culture Rating:', averageCulture.toFixed(2))
    console.log('  Prestige Rating:', averagePrestige.toFixed(2))
    console.log('  Technology Rating:', averageTechnology.toFixed(4))
    console.log('  Education Rating:', averageEducation.toFixed(4))
    console.log('  Corruption Rating:', averageCorruption.toFixed(4))
    console.log('  Crime Rating:', averageCrime.toFixed(4))
    console.log('  Wealth Rating:', averageWealth.toFixed(4))
    console.log('  Inflation Rating:', averageInflation.toFixed(4))
    console.log('  Reserves Rating:', averageReserves.toFixed(4))
    console.log('  Cargo Price Modifier (Normalized):', (averageCargoPriceModifier / MARKET_AVERAGE_CARGO_PRICE_MODIFIER).toFixed(4))
    console.log('')

    console.log('-----------------------')
    console.log('FINAL SOLAR SYSTEM STATE:')
    console.log(gs.system)
}

