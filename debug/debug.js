
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
    const totalSkillPriceModifier = planets.reduce((sum, planet) => sum + planet.c.skillPriceMultipliers.average, 0)

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
    const averageSkillPriceModifier = totalSkillPriceModifier / planets.length

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
    console.log('  Skill Price Modifier (Normalized):', (averageSkillPriceModifier / ACADEMY_AVERAGE_SKILL_PRICE_MODIFIER).toFixed(4))
    console.log('')

    console.log('-----------------------')
    console.log('FINAL SOLAR SYSTEM STATE:')
    console.log(gs.system)
}

function assessFleets() {
    console.log("======================================")
    console.log("========= DEBUGGING FLEETS ===========")
    console.log("======================================")
    console.log("")

    // Get all fleets
    const allFleets = gs.system.fleets || []
    console.log('Total Fleets in System:', allFleets.length)
    console.log("")

    if (allFleets.length === 0) {
        console.log("No fleets to analyze.")
        return
    }

    // Fleet type breakdown
    const fleetTypeCount = {}
    const fleetAICount = {}
    const fleetPlanetCount = {}
    const fleetShipCount = {}
    const fleetOfficerCount = {}
    
    for (const fleet of allFleets) {
        // Type counting
        const typeName = fleet.fleetType?.name || 'Unknown'
        fleetTypeCount[typeName] = (fleetTypeCount[typeName] || 0) + 1
        
        // AI counting
        const aiName = fleet.fleetAI?.constructor?.name || 'No AI'
        fleetAICount[aiName] = (fleetAICount[aiName] || 0) + 1
        
        // Planet affiliation
        const planetName = fleet.planet?.name || 'No Planet'
        fleetPlanetCount[planetName] = (fleetPlanetCount[planetName] || 0) + 1
        
        // Ship count per fleet type
        const shipCount = fleet.ships?.length || 0
        if (!fleetShipCount[typeName]) fleetShipCount[typeName] = []
        fleetShipCount[typeName].push(shipCount)
        
        // Officer count per fleet type
        const officerCount = fleet.officers?.length || 0
        if (!fleetOfficerCount[typeName]) fleetOfficerCount[typeName] = []
        fleetOfficerCount[typeName].push(officerCount)
    }

    console.log('-----Fleet Type Distribution:------')
    console.log(fleetTypeCount)
    console.log("")

    console.log('-----Fleet AI Distribution:------')
    console.log(fleetAICount)
    console.log("")

    console.log('-----Fleet Planet Affiliation:------')
    console.log(fleetPlanetCount)
    console.log("")

    // Average ships per fleet type
    console.log('-----Average Ships Per Fleet Type:------')
    for (const [typeName, shipCounts] of Object.entries(fleetShipCount)) {
        const avg = shipCounts.reduce((sum, count) => sum + count, 0) / shipCounts.length
        const min = Math.min(...shipCounts)
        const max = Math.max(...shipCounts)
        console.log(`  ${typeName}: ${avg.toFixed(2)} (min: ${min}, max: ${max})`)
    }
    console.log("")

    // Average officers per fleet type
    console.log('-----Average Officers Per Fleet Type:------')
    for (const [typeName, officerCounts] of Object.entries(fleetOfficerCount)) {
        const avg = officerCounts.reduce((sum, count) => sum + count, 0) / officerCounts.length
        const min = Math.min(...officerCounts)
        const max = Math.max(...officerCounts)
        console.log(`  ${typeName}: ${avg.toFixed(2)} (min: ${min}, max: ${max})`)
    }
    console.log("")

    // Cargo analysis
    console.log('-----Cargo Analysis:------')
    let totalCargoCapacity = 0
    let totalCargoUsed = 0
    let fleetsWithCargo = 0
    const cargoTypeDistribution = {}
    
    for (const fleet of allFleets) {
        const capacity = fleet.totalCargoSpace || 0
        const used = fleet.cargo?.total || 0
        totalCargoCapacity += capacity
        totalCargoUsed += used
        
        if (used > 0) {
            fleetsWithCargo++
            
            if (fleet.cargo?.counts) {
                for (const [cargoType, amount] of fleet.cargo.counts.entries()) {
                    const cargoName = cargoType?.name || 'Unknown'
                    cargoTypeDistribution[cargoName] = (cargoTypeDistribution[cargoName] || 0) + amount
                }
            }
        }
    }
    
    console.log(`  Total Cargo Capacity: ${totalCargoCapacity.toFixed(0)}`)
    console.log(`  Total Cargo Used: ${totalCargoUsed.toFixed(0)}`)
    console.log(`  Capacity Utilization: ${((totalCargoUsed / totalCargoCapacity) * 100).toFixed(2)}%`)
    console.log(`  Fleets Carrying Cargo: ${fleetsWithCargo}`)
    console.log('  Cargo Type Distribution:', cargoTypeDistribution)
    console.log("")

    // Ship type analysis
    console.log('-----Ship Type Analysis:------')
    const shipTypeCount = {}
    let totalShips = 0
    
    for (const fleet of allFleets) {
        if (fleet.ships) {
            for (const ship of fleet.ships) {
                totalShips++
                const shipTypeName = ship.fleet.fleetType?.name || 'Unknown'
                shipTypeCount[shipTypeName] = (shipTypeCount[shipTypeName] || 0) + 1
            }
        }
    }
    
    console.log(`  Total Ships: ${totalShips}`)
    console.log('  Ship Type Distribution:', shipTypeCount)
    console.log("")

    // Officer skill analysis
    console.log('-----Officer Analysis:------')
    const officerSkillDistribution = {}
    let totalOfficers = 0
    let totalOfficerSkillSum = 0
    
    for (const fleet of allFleets) {
        if (fleet.officers) {
            for (const officer of fleet.officers) {
                totalOfficers++
                
                if (officer.skills) {
                    for (const [skill, level] of officer.skills.counts.entries()) {
                        const skillName = skill?.name || 'Unknown'
                        if (!officerSkillDistribution[skillName]) {
                            officerSkillDistribution[skillName] = { count: 0, totalLevel: 0 }
                        }
                        officerSkillDistribution[skillName].count++
                        officerSkillDistribution[skillName].totalLevel += level
                        totalOfficerSkillSum += level
                    }
                }
            }
        }
    }
    
    console.log(`  Total Officers: ${totalOfficers}`)
    console.log(`  Average Officer Skill Level: ${(totalOfficerSkillSum / totalOfficers).toFixed(2)}`)
    console.log('  Skill Distribution:')
    for (const [skillName, data] of Object.entries(officerSkillDistribution)) {
        const avgLevel = data.totalLevel / data.count
        console.log(`    ${skillName}: ${data.count} officers, avg level ${avgLevel.toFixed(2)}`)
    }
    console.log("")


    // Position/Location analysis
    console.log('-----Fleet Location Analysis:------')
    const locationsNearPlanets = {}
    let fleetsInTransit = 0
    
    console.log(`  Fleets In Transit: ${fleetsInTransit}`)
    console.log(`  Fleets Near Planets (< 2 AU):`, locationsNearPlanets)
    console.log("")

    // Abandoned Fleet Death Analysis
    console.log('-----Abandoned Fleets Death Analysis:------')
    const abandonedFleets = gs.system.abandonedFleets || []
    console.log(`  Total Abandoned Fleets: ${abandonedFleets.length}`)
    
    if (abandonedFleets.length > 0) {
        const deathByFleetType = {}
        const deathByAsteroidType = {}
        let deathByAnomalyCount = 0
        let unknownDeaths = 0
        
        for (const abandoned of abandonedFleets) {
            const destroyer = abandoned.destroyedBy
            
            if (!destroyer) {
                unknownDeaths++
            } else if (destroyer instanceof Fleet) {
                const fleetTypeName = destroyer.fleetType?.name || 'Unknown Fleet'
                deathByFleetType[fleetTypeName] = (deathByFleetType[fleetTypeName] || 0) + 1
            } else if (destroyer instanceof Asteroid) {
                const asteroidTypeName = destroyer.belt?.asteroidBeltType || 'Unknown Asteroid'
                deathByAsteroidType[asteroidTypeName] = (deathByAsteroidType[asteroidTypeName] || 0) + 1
            } else if (destroyer instanceof Anomaly) {
                deathByAnomalyCount++
            } else if (typeof destroyer === 'string') {
                // Handle string descriptions like "anomaly" or other causes
                deathByAnomalyCount++
            } else {
                unknownDeaths++
            }
        }
        
        console.log('  Death Causes:')
        console.log(`    Unknown/Natural: ${unknownDeaths}`)
        
        if (Object.keys(deathByFleetType).length > 0) {
            console.log('    Destroyed by Fleet Type:')
            const sortedFleetDeaths = Object.entries(deathByFleetType).sort((a, b) => b[1] - a[1])
            for (const [fleetType, count] of sortedFleetDeaths) {
                console.log(`      ${fleetType}: ${count}`)
            }
        }
        
        if (Object.keys(deathByAsteroidType).length > 0) {
            console.log('    Destroyed by Asteroid Type:')
            const sortedAsteroidDeaths = Object.entries(deathByAsteroidType).sort((a, b) => b[1] - a[1])
            for (const [asteroidType, count] of sortedAsteroidDeaths) {
                console.log(`      ${asteroidType}: ${count}`)
            }
        }
        
        if (deathByAnomalyCount > 0) {
            console.log(`    Destroyed by Anomalies: ${deathByAnomalyCount}`)
        }
    }
    console.log("")

    console.log("======================================")
    console.log("========= END FLEET DEBUG ============")
    console.log("======================================")
}
