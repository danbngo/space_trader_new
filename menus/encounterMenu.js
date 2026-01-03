
/**
 * Checks if a space encounter should occur.
 * @param {number} elapsedDays - Days that have elapsed.
 * @returns {boolean} Whether an encounter was triggered.
 */
function checkForEncounter(elapsedDays = 1) {
    //console.log('checkForEncounter', { elapsedDays, location: gs.location, encounter: gs.encounter });
    //dont have encounters while docked or already in an encounter
    if (gs.location || gs.encounter) return
    // Check encounter immunity
    if (gs.year < gs.encounterImmunityUntilYear) return
    //return checkForPlanetEncounters(elapsedDays) || 
    checkForAsteroidBeltEncounters(elapsedDays)
}

function checkForAsteroidBeltEncounters(elapsedDays = 1) {
    //console.log('checkForAsteroidBeltEncounters', { elapsedDays });
    //dont have encounters while docked or already in an encounter
    if (gs.location || gs.encounter) return
    
    const asteroids = gs.system.asteroids
    const fleet = gs.fleet
    
    // Calculate cumulative proximity factor from all nearby asteroids
    let totalProximityFactor = 0
    let proximityFactors = []
    
    for (const asteroid of asteroids) {
        const proximityFactor = calcAsteroidProximityFactor(fleet, asteroid)
        totalProximityFactor += proximityFactor
        proximityFactors.push(proximityFactor)
    }
    
    // Check if encounter is triggered
    if (!calcOccurrencesPerTimespan(ASTEROIDS_ENCOUNTER_CHANCE_PER_DAY, elapsedDays * totalProximityFactor)) return false
    
    // Select a random nearby belt to determine encounter type
    const selectedAsteroidIndex = rndIndexWeighted(proximityFactors)
    const selectedAsteroid = asteroids[selectedAsteroidIndex]
    const selectedBelt = selectedAsteroid.belt
    const encounterType = rndMember(selectedBelt.encounterTypes)
    
    console.log(`🚨 ASTEROID ENCOUNTER TRIGGERED`, {selectedAsteroidIndex, selectedAsteroid, selectedBelt, encounterType, proximityFactors, totalProximityFactor});
    
    // Start the encounter
    const encounter = generateRandomEncounter(encounterType, null, selectedBelt.effectTypes)
    encounter.startEncounter()
    return true
}

/*
function checkForPlanetEncounters(elapsedDays = 1) {
    //console.log('checkForPlanetEncounters', { elapsedDays });
    //dont have encounters while docked or already in an encounter
    if (gs.location || gs.encounter) return
    
    const planets = [...gs.system.planets]
    const fleet = gs.fleet

    const sortedPlanetsByProximity = planets.sort((a, b) => {
        const distA = calcDistance(fleet.x, fleet.y, a.x, a.y)
        const distB = calcDistance(fleet.x, fleet.y, b.x, b.y)
        return distA - distB
    })
    
    // Check for magnetosphere and ring hazards first
    for (const planet of sortedPlanetsByProximity) {
        const distance = calcDistance(fleet.x, fleet.y, planet.x, planet.y)
        
        // Check for ring encounters (very close to planet)
        const hasRings = planet.features && (planet.features.includes(PLANET_FEATURE_TYPES.RING_SYSTEM) || planet.features.includes(PLANET_FEATURE_TYPES.FAINT_RINGS))
        if (hasRings && distance < planet.radius/EARTH_RADII_PER_AU * 2.5) {
            // Chance to encounter asteroids in the rings
            const ringDensity = planet.features.includes(PLANET_FEATURE_TYPES.RING_SYSTEM) ? 2.0 : 0.5
            if (calcOccurrencesPerTimespan(ASTEROIDS_ENCOUNTER_CHANCE_PER_DAY * ringDensity, elapsedDays)) {
                console.log(`🚨 RING ENCOUNTER TRIGGERED near ${planet.name}`);
                const encounterType = rndMember([ENCOUNTER_TYPES.ASTEROIDS_CALM, ENCOUNTER_TYPES.ASTEROIDS_STORM])
                const encounter = generateEncounter(encounterType, planet, [EFFECT_TYPES.DEBRIS_CLOUD])
                encounter.startEncounter()
                return true
            }
        }
        
        // Check for magnetosphere encounters
        if (planet.magnetosphereRadius > 0 && distance < planet.magnetosphereRadius) {
            const magnetosphereStrength = planet.climate.magnetosphere.value
            // Stronger magnetospheres = higher chance of magnetoid encounters
            const magnetosphereChance = ASTEROIDS_ENCOUNTER_CHANCE_PER_DAY * 0.3 * magnetosphereStrength
            if (calcOccurrencesPerTimespan(magnetosphereChance, elapsedDays)) {
                console.log(`🚨 MAGNETOSPHERE ENCOUNTER TRIGGERED near ${planet.name} (strength: ${magnetosphereStrength})`);
                const encounterType = magnetosphereStrength > 1.2 ? ENCOUNTER_TYPES.MAGNETOIDS_STORM : ENCOUNTER_TYPES.MAGNETOIDS_CALM
                const encounter = generateEncounter(encounterType, planet, [EFFECT_TYPES.ION_CLOUD, EFFECT_TYPES.PLASMA_TRAIL])
                encounter.startEncounter()
                return true
            }
        }
    }
    
    // Check for sun encounters (plasmoids very close to sun, magnetoids in corona)
    const sun = gs.system.stars[0]
    if (sun) {
        const distanceToSun = calcDistance(fleet.x, fleet.y, sun.x, sun.y)
        
        // Plasmoids only within sun's actual radius (extremely dangerous)
        if (distanceToSun < sun.radius * 0.01) { // Sun radius is huge, so scale it down
            const plasmoidChance = ASTEROIDS_ENCOUNTER_CHANCE_PER_DAY * 2.0
            if (calcOccurrencesPerTimespan(plasmoidChance, elapsedDays)) {
                console.log(`🚨 PLASMOID ENCOUNTER TRIGGERED near sun (distance: ${distanceToSun})`);
                const encounterType = Math.random() > 0.5 ? ENCOUNTER_TYPES.PLASMOIDS_STORM : ENCOUNTER_TYPES.PLASMOIDS_CALM
                const encounter = generateEncounter(encounterType, null, [EFFECT_TYPES.ION_CLOUD, EFFECT_TYPES.PLASMA_TRAIL])
                encounter.startEncounter()
                return true
            }
        }
        // Magnetoids in corona range (still dangerous but less so)
        else if (distanceToSun < 0.1) { // Within corona orbit (0.1 AU)
            const magnetoidChance = ASTEROIDS_ENCOUNTER_CHANCE_PER_DAY * 0.5
            if (calcOccurrencesPerTimespan(magnetoidChance, elapsedDays)) {
                console.log(`🚨 MAGNETOID ENCOUNTER TRIGGERED in corona (distance: ${distanceToSun})`);
                const encounterType = Math.random() > 0.5 ? ENCOUNTER_TYPES.MAGNETOIDS_STORM : ENCOUNTER_TYPES.MAGNETOIDS_CALM
                const encounter = generateEncounter(encounterType, null, [EFFECT_TYPES.ION_CLOUD, EFFECT_TYPES.PLASMA_TRAIL])
                encounter.startEncounter()
                return true
            }
        }
    }
    
    // Now check for civilization encounters
    for (const planet of sortedPlanetsByProximity) {
        if (!planet.civilization) continue
        
        const distance = calcDistance(fleet.x, fleet.y, planet.x, planet.y)
        const territory = planet.c.territory
        
        // Calculate proximity factor using 1/(1+d/t) formula
        // At planet (d=0): factor = 1.0
        // At edge (d=territory): factor = 0.5
        // Beyond edge: factor approaches 0 but never reaches it
        const proximityFactor = 1 / (1 + distance / territory)
        
        // Base encounter chance influenced by civilization properties
        const {army, navy, security, culture, economy, industry, crime} = planet.civilization
        
        // Build weighted encounter type array based on civilization
        const encounterWeights = []
        
        // Police (influenced by government and security)
        encounterWeights.push({type: ENCOUNTER_TYPES.POLICE, weight: (navy + security) * 2})
        
        // Pirates (influenced by crime, reduced by security)
        encounterWeights.push({type: ENCOUNTER_TYPES.PIRATES, weight: crime * 3 / security})
        
        // Smugglers (influenced by crime and commercial)
        encounterWeights.push({type: ENCOUNTER_TYPES.SMUGGLERS, weight: ((crime + economy) * 1.5) / security})
        
        // Merchants (influenced by commercial)
        encounterWeights.push({type: ENCOUNTER_TYPES.MERCHANTS, weight: economy * 3})
        
        // Miners (influenced by industrial)
        encounterWeights.push({type: ENCOUNTER_TYPES.MINERS, weight: industry * 2})
        
        // Tourists (influenced by commercial and government)
        encounterWeights.push({type: ENCOUNTER_TYPES.TOURISTS, weight: (economy + culture)})
        
        // Calculate total weight
        const totalWeight = encounterWeights.reduce((sum, e) => sum + e.weight, 0)
        if (totalWeight <= 0) continue
        
        // Adjust base chance by civilization activity level
        const activityLevel = totalWeight / encounterWeights.length
        if (!calcOccurrencesPerTimespan(PLANET_ENCOUNTER_CHANCE_PER_DAY, elapsedDays * activityLevel * proximityFactor)) continue
        
        // Select encounter type using weighted random
        const roll = Math.random() * totalWeight
        let cumulative = 0
        let selectedType = encounterWeights[0].type
        
        for (const {type, weight} of encounterWeights) {
            cumulative += weight
            if (roll <= cumulative) {
                selectedType = type
                break
            }
        }
        
        console.log(`🚨 PLANET ENCOUNTER TRIGGERED: ${coloredName(planet)} (${selectedType.name})`);
        
        // Start the encounter with the selected type
        const effectTypes = rollEncounterEffectTypes()
        const encounter = generateEncounter(selectedType, planet, effectTypes)
        encounter.startEncounter()
        return true
    }
    
    return false
}
*/

function rollEncounterEffectTypes() {
    //check for proximity to individual asteroids and give the player different effects based on their belts
    const nearbyEffectTypes = []
    const fleet = gs.fleet
    
    for (const asteroid of gs.system.asteroids) {
        if (!asteroid.belt) continue
        // Calculate proximity factor using 1/(1+d/r) formula
        const proximityFactor = calcAsteroidProximityFactor(fleet, asteroid)
        if (proximityFactor < Math.random()) continue
        // Add effect types from the asteroid's belt
        for (const et of asteroid.belt.effectTypes) {
            nearbyEffectTypes.push(et)
        }
    }
    return nearbyEffectTypes
}

function calcAsteroidProximityFactor(fleet = new Fleet(), asteroid = new Asteroid(), threshold = 0.01) {
        const distance = calcDistance(fleet.x, fleet.y, asteroid.x, asteroid.y)
        const asteroidRadius = 0.01*(asteroid.radius || 1) // Apply a modifier, asteroid "radii" are based on screen pixels
        // Calculate proximity factor using 1/(1+d/r) formula
        const proximityFactor = 1 / (1 + distance / asteroidRadius)
        return threshold && proximityFactor < threshold ? 0 : proximityFactor
}