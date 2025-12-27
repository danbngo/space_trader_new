function assessPlanets() {
    console.log("Debugging Planets:")
    console.log('Total Planets:', gs.system.planets.length, gs.system.planets)

    const governmentTypes = gs.system.planets.map(p=>p.culture.governmentType)
    console.log('GovernmentType Types:', governmentTypes)
    const relationshipCounts = {}
    for (const p of gs.system.planets) {
        for (const [otherPlanet, relationship] of p.culture.relationships) {
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
    console.log('Total News Events:', totalNews)
    const newsTotalsPerType = {}
    const newsTotalPercentsPerType = {}
    for (const n of gs.system.news) {
        const count = newsTotalsPerType[n.newsType.name] || 0
        newsTotalsPerType[n.newsType.name] = count + 1
    }
    for (const nt of NEWS_TYPES_ALL) {
        if (!newsTotalsPerType[nt.name]) newsTotalsPerType[nt.name] = 0
    }
    for (const nt of META_NEWS_TYPES_ALL) {
        if (!newsTotalsPerType[nt.name]) newsTotalsPerType[nt.name] = 0
    }
    for (const [newsTypeName, count] of Object.entries(newsTotalsPerType)) {
        const percent = (count / totalNews) * 100
        newsTotalPercentsPerType[newsTypeName] = percent.toFixed(2) + '%'
    }
    console.log('-----News Totals Per Type:------', newsTotalsPerType)
    console.log('Total News Types as % of total:')
    console.log(newsTotalPercentsPerType)

    console.log('-----Average Planet Stats:------')

    const totalPopulation = gs.system.planets.reduce((sum,planet)=>sum+planet.culture.population,0)
    const totalTerritory = gs.system.planets.reduce((sum,planet)=>sum+planet.culture.territory,0)
    const totalMilitary = gs.system.planets.reduce((sum,planet)=>sum+planet.culture.military,0)
    const totalSecurity = gs.system.planets.reduce((sum,planet)=>sum+planet.culture.security,0)
    const totalCommercial = gs.system.planets.reduce((sum,planet)=>sum+planet.culture.commerce,0)
    const totalIndustrial = gs.system.planets.reduce((sum,planet)=>sum+planet.culture.industry,0)
    const totalCrime = gs.system.planets.reduce((sum,planet)=>sum+planet.culture.crime,0)
    const totalPrestige = gs.system.planets.reduce((sum,planet)=>sum+planet.culture.prestige,0)
    const totalMarketInflation = gs.system.planets.reduce((sum,planet)=>sum+planet.settlement.market.inflation,0)
    const totalBlackMarketInflation = gs.system.planets.reduce((sum,planet)=>sum+planet.settlement.blackMarket.inflation,0)
    const totalBankCredits = gs.system.planets.reduce((sum,planet)=>sum+planet.settlement.bank.baseCredits,0)
    const totalMarketCargoAmounts = gs.system.planets.reduce((sum,planet)=>sum+planet.settlement.market.baseCargo.total,0)
    const totalBlackMarketCargoAmounts = gs.system.planets.reduce((sum,planet)=>sum+planet.settlement.blackMarket.baseCargo.total,0)
    const totalGuildNumOfficers = gs.system.planets.reduce((sum,planet)=>sum+planet.settlement.guild.baseNumOfficers,0)
    const totalShipyardNumShips = gs.system.planets.reduce((sum,planet)=>sum+planet.settlement.shipyard.baseNumShips,0)
    const totalShipyardNumModules = gs.system.planets.reduce((sum,planet)=>sum+planet.settlement.shipyard.baseNumModules,0)
    const totalShipQuality = gs.system.planets.reduce((sum,planet)=>sum+planet.culture.shipQuality,0)
    const totalOfficerQuality = gs.system.planets.reduce((sum,planet)=>sum+planet.culture.officerQuality,0)
    const totalCargoPriceModifier = gs.system.planets.reduce((sum,planet)=>sum+planet.culture.cargoPriceModifiers.average,0)

    const averagePopulation = totalPopulation / gs.system.planets.length
    const averageTerritory = totalTerritory / gs.system.planets.length
    const averageMilitary = totalMilitary / gs.system.planets.length
    const averageSecurity = totalSecurity / gs.system.planets.length
    const averageCommercial = totalCommercial / gs.system.planets.length
    const averageIndustrial = totalIndustrial / gs.system.planets.length
    const averageCrime = totalCrime / gs.system.planets.length
    const averagePrestige = totalPrestige / gs.system.planets.length
    const averageMarketInflation = totalMarketInflation / gs.system.planets.length
    const averageBlackMarketInflation = totalBlackMarketInflation / gs.system.planets.length
    const averageMarketCargoAmounts = totalMarketCargoAmounts / gs.system.planets.length
    const averageBlackMarketCargoAmounts = totalBlackMarketCargoAmounts / gs.system.planets.length
    const averageBankCredits = totalBankCredits / gs.system.planets.length
    const averageGuildNumOfficers = totalGuildNumOfficers / gs.system.planets.length
    const averageShipyardNumShips = totalShipyardNumShips / gs.system.planets.length
    const averageShipyardNumModules = totalShipyardNumModules / gs.system.planets.length
    const averageShipQuality = totalShipQuality / gs.system.planets.length
    const averageOfficerQuality = totalOfficerQuality / gs.system.planets.length
    const averageCargoPriceModifier = totalCargoPriceModifier / gs.system.planets.length

    console.log('Average planet')
    console.log('Population:', averagePopulation.toFixed(2))
    console.log('Territory:', averageTerritory.toFixed(2))
    console.log('Military Rating:', averageMilitary.toFixed(2))
    console.log('Security Rating:', averageSecurity.toFixed(2))
    console.log('Commercial Rating:', averageCommercial.toFixed(2))
    console.log('Industrial Rating:', averageIndustrial.toFixed(2))
    console.log('Crime Rating:', averageCrime.toFixed(2))
    console.log('Prestige Rating:', averagePrestige.toFixed(2))
    console.log('Market Inflation Rate:', averageMarketInflation.toFixed(4))
    console.log('Black Market Inflation Rate:', averageBlackMarketInflation.toFixed(4))
    console.log('Market Cargo Amounts:', averageMarketCargoAmounts.toFixed(2))
    console.log('Market Cargo Amounts (Normalized):', (averageMarketCargoAmounts/MARKET_AVERAGE_CARGO_PER_TYPE/CARGO_TYPES_ALL.length).toFixed(2))
    console.log('Black Market Cargo Amounts:', averageBlackMarketCargoAmounts.toFixed(2))
    console.log('Black Market Cargo Amounts (Normalized):', (averageBlackMarketCargoAmounts/MARKET_AVERAGE_CARGO_PER_TYPE/CARGO_TYPES_ALL.length).toFixed(2))
    console.log('Bank Credits:', averageBankCredits.toFixed(2))
    console.log('Bank Credits (Normalized):', (averageBankCredits/BANK_AVERAGE_CREDITS).toFixed(2))
    console.log('Guild Number of Officers:', averageGuildNumOfficers.toFixed(2))
    console.log('Guild Number of Officers (Normalized):', (averageGuildNumOfficers/GUILD_AVERAGE_NUM_OFFICERS).toFixed(2))
    console.log('Shipyard Number of Ships:', averageShipyardNumShips.toFixed(2))
    console.log('Shipyard Number of Ships (Normalized):', (averageShipyardNumShips/SHIPYARD_AVERAGE_NUM_SHIPS).toFixed(2))
    console.log('Shipyard Number of Modules:', averageShipyardNumModules.toFixed(2))
    console.log('Shipyard Number of Modules (Normalized):', (averageShipyardNumModules/SHIPYARD_AVERAGE_NUM_MODULES).toFixed(2))
    console.log('Ship Quality:', averageShipQuality.toFixed(2))
    console.log('Officer Quality:', averageOfficerQuality.toFixed(2))
    console.log('Cargo Price Modifier:', averageCargoPriceModifier.toFixed(4))
    console.log('Cargo Price Modifier (Normalized):', (averageCargoPriceModifier/MARKET_AVERAGE_CARGO_PRICE_MODIFIER).toFixed(4))
}
