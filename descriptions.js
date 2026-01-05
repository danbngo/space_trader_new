
function describeTimespan(years = 0) {
    if (years <= 0) return "0 hours";
    
    // Convert
    const months = years * 12;
    const weeks = years * 52.1429; // average weeks per year
    const days = years * 365.25;
    const hours = days * 24;
    
    const format = (value, unit) =>
        `${parseFloat(value.toFixed(2))} ${unit}${value === 1 ? "" : "s"}`;
    
    // Choose only the LARGEST meaningful unit
    if (years >= 1) return format(years, "year");
    if (months >= 1) return format(months, "month");
    if (weeks >= 1) return format(weeks, "week");
    if (days >= 1) return format(days, "day");
    return format(hours, "hour");
}

/**
 * @function coloredName
 * @description Returns the name of a SpaceObject (Planet, Ship, Effect, etc.) wrapped in a colored span based on its color property.
 * @param {SpaceObject | Ship | Fleet | CargoType | ShipModuleType | GovernmentType | RelationshipType | PlanetType | ObjectType } obj - The SpaceObject whose name is to be colored.
 * @returns {string} - The colored name as an HTML string.
 */
function coloredName(obj = new SpaceObject()) {
    let name = obj.name ? obj.name : ''
    if (obj instanceof Ship) name = obj.shipType.name
    if (obj instanceof Effect) name = obj.effectType.name
    if (obj instanceof Fleet) return obj.planet ? `${coloredIanName(obj.planet)} ${obj.name}` : obj.name

    // @ts-ignore
    const symbol = obj instanceof Planet ? '' : `${obj.symbol ? obj.symbol+' ' : ''}`

    return `${colorSpan(symbol+name, obj.color ? obj.color : '')}`
}

function coloredIanName(obj = new Planet()) {
    return `${colorSpan(obj.ianName, obj.color)}`
}

function describeDate(year = 0, minutesEnabled = false, hoursEnabled = false) {
    const wholeYear = Math.floor(year);
    const fraction = year - wholeYear;

    // Leap year check
    const isLeap =
        (wholeYear % 4 === 0 && wholeYear % 100 !== 0) ||
        (wholeYear % 400 === 0);
    const daysInYear = isLeap ? 366 : 365;

    // Total ms in the year
    const msInYear = daysInYear * 24 * 60 * 60 * 1000;
    const offsetMs = fraction * msInYear;

    // Start at Jan 1st 00:00 UTC
    const date = new Date(Date.UTC(wholeYear, 0, 1, 0, 0, 0, 0) + offsetMs);

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        
    /*function getOrdinal(n) {
        if (n % 10 === 1 && n % 100 !== 11) return `${n}st`;
        if (n % 10 === 2 && n % 100 !== 12) return `${n}nd`;
        if (n % 10 === 3 && n % 100 !== 13) return `${n}rd`;
        return `${n}th`;
    }*/
    
    // Format time
    let hours = date.getUTCHours();
    const minutes = date.getUTCMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 === 0 ? 12 : hours % 12;
    const hourStr = hours.toString().padStart(2, "0");
    
    // Build time prefix with consistent width (8 chars: "HH:MM AM " or empty)
    const timePrefix = hoursEnabled 
        ? `${hourStr}${minutesEnabled ? ':' + minutes : ':00'} ${ampm} `
        : '';
    
    // Pad day ordinal to consistent width (4 chars: " 1st", "31st")
    const day = date.getUTCDate();
    //const ordinal = getOrdinal(day).padStart(4, ' ');
    const ordinal = day.toString().padStart(2, '0');
    
    return `${timePrefix}${months[date.getUTCMonth()]} ${ordinal} ${wholeYear}`;
}
 
//can display K, M, B, Tr
function describeLargeNumber(num = 0) {
    if (num >= 1e12) return (num / 1e12).toFixed(2).replace(/\.00$/, '') + ' Tr'
    if (num >= 1e9) return (num / 1e9).toFixed(2).replace(/\.00$/, '') + ' B'
    if (num >= 1e6) return (num / 1e6).toFixed(2).replace(/\.00$/, '') + ' M'
    if (num >= 1e3) return (num / 1e3).toFixed(2).replace(/\.00$/, '') + ' K'
    return num.toString()
}

function describeNumChange(delta = 0) {
    if (delta > 0) return `+${delta}`
    if (delta < 0) return `-${Math.abs(delta)}`
    return `+0`
}
const dnc = describeNumChange

function describePopulation(populationRating = 0, planet = null) {
    const multiplier = planet?.objectType?.powerMultiplier ?? 1
    const popCountB = Math.pow(10,populationRating)-1
    const popCount = popCountB * 1*1000*1000*1000 * multiplier //in billions
    return `${statColorSpan(describeLargeNumber(popCount), populationRating)}`
}

function describeTerritory(territoryRating = 0) {
    return `${statColorSpan(roundToPlaces(territoryRating,2), territoryRating)} AU`
}

function describeArmy(armyRating = 0, planet = null) {
    const multiplier = planet?.objectType?.powerMultiplier ?? 1
    const soldiers = Math.round(Math.pow(10, armyRating) * 100000 * multiplier)
    return `${statColorSpan(describeLargeNumber(soldiers), armyRating)} soldiers`
}

function describeNavy(navyRating = 0, planet = null) {
    const multiplier = planet?.objectType?.powerMultiplier ?? 1
    const ships = Math.round(Math.pow(10, navyRating) * 50 * multiplier)
    return `${statColorSpan(describeLargeNumber(ships), navyRating)} ships`
}

function describeIndustry(industryRating = 0, planet = null) {
    const multiplier = planet?.objectType?.powerMultiplier ?? 1
    const factories = Math.round(Math.pow(10, industryRating) * 1000 * multiplier)
    return `${statColorSpan(describeLargeNumber(factories), industryRating)} facilities`
}

function describeEconomy(economyRating = 0, planet = null) {
    const multiplier = planet?.objectType?.powerMultiplier ?? 1
    const gdp = Math.round(Math.pow(10, economyRating) * 1000000000 * multiplier) // billions
    return `${statColorSpan(describeLargeNumber(gdp), economyRating)}CR GDP`
}

function describeSecurity(securityRating = 0, planet = null) {
    const multiplier = planet?.objectType?.powerMultiplier ?? 1
    const officers = Math.round(Math.pow(10, securityRating) * 10000 * multiplier)
    return `${statColorSpan(describeLargeNumber(officers), securityRating)} officers`
}

function describeCulture(cultureRating = 0, planet = null) {
    const multiplier = planet?.objectType?.powerMultiplier ?? 1
    const sites = Math.round(Math.pow(10, cultureRating) * 500 * multiplier)
    return `${statColorSpan(describeLargeNumber(sites), cultureRating)} cultural sites`
}

function describeTechnology(technologyRating = 0) {
    const level = Math.round(technologyRating * 10)
    const tier = level < 5 ? 'Primitive' : level < 10 ? 'Developing' : level < 15 ? 'Advanced' : level < 20 ? 'Cutting-Edge' : 'Revolutionary'
    return `${statColorSpan(`Tech ${level} (${tier})`, technologyRating)}`
}

function describeEducation(educationRating = 0) {
    const literacyRate = Math.min(99.9, 50 + (educationRating * 25))
    return `${statColorSpan(`${roundToPlaces(literacyRate, 1)}% literacy`, educationRating)}`
}

function describeWealth(wealthRating = 0) {
    const avgIncome = Math.round(Math.pow(10, wealthRating) * 10000)
    return `${statColorSpan(describeLargeNumber(avgIncome), wealthRating)}CR per capita`
}

function describeReserves(reservesRating = 0) {
    const stockpile = Math.round(Math.pow(10, reservesRating) * 1000000)
    return `${statColorSpan(describeLargeNumber(stockpile), reservesRating)} tons stockpiled`
}

function describeCrime(crimeRating = 0) {
    const incarcerationRate = roundToPlaces(crimeRating / 2000 * 100, 1) // 8x = 50%
    return `${statColorSpan(`${incarcerationRate}% incarceration rate`, crimeRating)}`
}

function describeCorruption(corruptionRating = 0) {
    const corruptionIndex = Math.round(corruptionRating * 100)
    return `${statColorSpan(`${corruptionIndex} corruption index`, corruptionRating)}`
}

function describeInflation(inflationRating = 0) {
    const inflationRate = roundToPlaces(inflationRating * 10, 1)
    const direction = inflationRating > 1 ? 'inflation' : inflationRating < 1 ? 'deflation' : 'stable'
    return `${statColorSpan(`${inflationRate}% ${direction}`, inflationRating)}`
}

function describeTaxes(taxesRating = 0) {
    const taxRate = roundToPlaces(taxesRating * AVERAGE_TAX_RATE / 2 * 100, 1)
    return `${statColorSpan(`${taxRate}% tax rate`, taxesRating)}`
}

function describeFees(corruptionRating = 0) {
    const baseFee = roundToPlaces(100*corruptionRating, 2)
    const barterSkill = gs.fleet.totalSkills.getAmount(SKILLS.Barter)
    const rake = corruptionRating / (1 + barterSkill / 50)
    const postBarterFee = roundToPlaces(100*rake, 2)
    return  `Fee: ${statColorSpan(baseFee, corruptionRating)} | After Barter: ${statColorSpan(postBarterFee, rake)}`
}


function describePrestige(prestigeRating = 0) {
    const prestigeLevel = prestigeRating < 0.5 ? 'Pariah' : prestigeRating < 0.8 ? 'Ignored' : prestigeRating < 1.2 ? 'Recognized' : prestigeRating < 1.5 ? 'Respected' : prestigeRating < 2 ? 'Influential' : 'Dominant'
    return `${statColorSpan(prestigeLevel, prestigeRating)}`
}

function describeRating(rating = 0, invertColor = false) {
    return `${statColorSpan(roundToPlaces(rating,2), invertColor ? 1/rating : rating)}x`
}