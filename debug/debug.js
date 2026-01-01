let DEBUG_MODE_ENABLED = true

function assessPlanets() {
    console.log("Debugging Planets:")
    console.log('Total Planets:', gs.system.planets.length, gs.system.planets)

    const governmentTypes = gs.system.planets.map(p=>p.c.governmentType)
    console.log('GovernmentType Types:', governmentTypes)
    const relationshipCounts = {}
    for (const p of gs.system.planets) {
        for (const [otherPlanet, relationship] of p.c.relationships) {
            relationshipCounts[relationship.name] = relationshipCounts[relationship.name] ? relationshipCounts[relationship.name] + 1 : 1
        }
    }
    for (const relType of RELATIONSHIP_TYPES_ALL) {
        if (!relationshipCounts[relType.name]) relationshipCounts[relType.name] = 0
    }
    console.log('Relationship Counts:', relationshipCounts)

    console.log('news:', gs.system.news)
    console.log('active news:',gs.system.news.filter(n=>(n.started && !n.ended)))
    console.log('simpleNews:', gs.system.simpleNews)

    //list how many times specific news events occurred
    const totalNews = gs.system.news.length
    const activeNews = gs.system.news.filter(n=>(n.started && !n.ended)).length
    const completedNews = gs.system.news.filter(n=>(n.ended && !n.cancelled && !n.failed)).length
    const cancelledNews = gs.system.news.filter(n=>(n.ended && n.cancelled)).length
    const failedNews = gs.system.news.filter(n=>(n.ended && n.failed)).length
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

    for (const n of gs.system.news) {
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
    for (const nt of META_NT_ALL) {
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
    console.log('-----News Totals Per Type:------', newsTotalsPerType)
    console.log('Total News Events Ever:', totalNews)
    console.log('Total News Events (Failed Only):', gs.system.news.filter(n=>n.ended && n.failed).length)
    console.log('Total News Events (Cancelled Only):', gs.system.news.filter(n=>n.ended && n.cancelled).length)
    console.log('Total News Events (Succeeded Only):', gs.system.news.filter(n=>n.ended && !n.failed && !n.cancelled).length)
    console.log('Total News Events (Still Active):', activeNews)
    console.log('Total News Types as % of total:')
    console.log(newsTotalPercentsPerType)
    console.log('Active News Events:', activeNews)
    console.log('Active News Totals Per Type:------', activeNewsTotalsPerType)
    console.log('Active News Types as % of active total:')
    console.log(activeNewsTotalPercentsPerType)
    console.log('Succeeded News Totals Per Type:------', succeededNewsTotalsPerType)
    console.log('Succeeded News Types as % of total:')
    console.log(succeededNewsTotalPercentsPerType)
    console.log('Failed News Totals Per Type:------', failedNewsTotalsPerType)
    console.log('Failed News Types as % of total:')
    console.log(failedNewsTotalPercentsPerType)
    console.log('Cancelled News Totals Per Type:------', cancelledNewsTotalsPerType)
    console.log('Cancelled News Types as % of total:')
    console.log(cancelledNewsTotalPercentsPerType)

    console.log('-----Average Planet Stats:------')

    const totalPopulation = gs.system.planets.reduce((sum,planet)=>sum+planet.c.population,0)
    const totalTerritory = gs.system.planets.reduce((sum,planet)=>sum+planet.c.territory,0)
    const totalArmy = gs.system.planets.reduce((sum,planet)=>sum+planet.c.army,0)
    const totalNavy = gs.system.planets.reduce((sum,planet)=>sum+planet.c.navy,0)
    const totalCorruption = gs.system.planets.reduce((sum,planet)=>sum+planet.c.corruption,0)
    const totalCrime = gs.system.planets.reduce((sum,planet)=>sum+planet.c.crime,0)
    const totalSecurity = gs.system.planets.reduce((sum,planet)=>sum+planet.c.security,0)
    const totalEconomic = gs.system.planets.reduce((sum,planet)=>sum+planet.c.economy,0)
    const totalIndustrial = gs.system.planets.reduce((sum,planet)=>sum+planet.c.industry,0)
    const totalCulture = gs.system.planets.reduce((sum,planet)=>sum+planet.c.culture,0)
    const totalPrestige = gs.system.planets.reduce((sum,planet)=>sum+planet.c.prestige,0)
    const totalTechnology = gs.system.planets.reduce((sum,planet)=>sum+planet.c.technology,0)
    const totalEducation = gs.system.planets.reduce((sum,planet)=>sum+planet.c.education,0)
    const totalWealth = gs.system.planets.reduce((sum,planet)=>sum+planet.c.wealth,0)
    const totalInflation = gs.system.planets.reduce((sum,planet)=>sum+planet.c.inflation,0)
    const totalReserves = gs.system.planets.reduce((sum,planet)=>sum+planet.c.reserves,0)
    const totalCargoPriceModifier = gs.system.planets.reduce((sum,planet)=>sum+planet.c.cargoPriceMultipliers.average,0)
    const totalSkillPriceModifier = gs.system.planets.reduce((sum,planet)=>sum+planet.c.skillPriceMultipliers.average,0)

    const averageInflation = totalInflation / gs.system.planets.length
    const averageTechnology = totalTechnology / gs.system.planets.length
    const averageCorruption = totalCorruption / gs.system.planets.length
    const averageCrime = totalCrime / gs.system.planets.length
    const averageWealth = totalWealth / gs.system.planets.length
    const averageEducation = totalEducation / gs.system.planets.length
    const averagePopulation = totalPopulation / gs.system.planets.length
    const averageTerritory = totalTerritory / gs.system.planets.length
    const averageSecurity = totalSecurity / gs.system.planets.length
    const averageEconomic = totalEconomic / gs.system.planets.length
    const averageIndustrial = totalIndustrial / gs.system.planets.length
    const averageCulture = totalCulture / gs.system.planets.length
    const averagePrestige = totalPrestige / gs.system.planets.length
    const averageMilitary = (totalArmy + totalNavy) / gs.system.planets.length
    const averageReserves = totalReserves / gs.system.planets.length
    
    const averageCargoPriceModifier = totalCargoPriceModifier / gs.system.planets.length
    const averageSkillPriceModifier = totalSkillPriceModifier / gs.system.planets.length

    console.log('Average planet')
    console.log('Population:', averagePopulation.toFixed(2))
    console.log('Territory:', averageTerritory.toFixed(2))
    console.log('Military Rating:', averageMilitary.toFixed(2))
    console.log('Security Rating:', averageSecurity.toFixed(2))
    console.log('Economic Rating:', averageEconomic.toFixed(2))
    console.log('Industrial Rating:', averageIndustrial.toFixed(2))
    console.log('Culture Rating:', averageCulture.toFixed(2))
    console.log('Prestige Rating:', averagePrestige.toFixed(2))
    console.log('Technology Rating:', averageTechnology.toFixed(4))
    console.log('Education Rating:', averageEducation.toFixed(4))
    console.log('Corruption Rating:', averageCorruption.toFixed(4))
    console.log('Crime Rating:', averageCrime.toFixed(4))
    console.log('Wealth Rating:', averageWealth.toFixed(4))
    console.log('Inflation Rating:', averageInflation.toFixed(4))
    console.log('Reserves Rating:', averageReserves.toFixed(4))
    console.log('Cargo Price Modifier (Normalized):', (averageCargoPriceModifier/MARKET_AVERAGE_CARGO_PRICE_MODIFIER).toFixed(4))
    console.log('Skill Price Modifier (Normalized):', (averageSkillPriceModifier/ACADEMY_AVERAGE_SKILL_PRICE_MODIFIER).toFixed(4))
}
