
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
 * @param {SpaceObject | Ship | Fleet | CargoType | ShipModuleType | GovernmentType} obj - The SpaceObject whose name is to be colored.
 * @returns {string} - The colored name as an HTML string.
 */
function coloredName(obj = new SpaceObject()) {
    let name = obj.name ? obj.name : ''
    if (obj instanceof Ship) name = obj.shipType.name
    if (obj instanceof Effect) name = obj.effectType.name
    if (obj instanceof Fleet) return obj.planet ? `${coloredIanName(obj.planet)} ${obj.name}` : obj.name

    return `${colorSpan(name, obj.color ? obj.color : '', true)}`
}

function coloredIanName(obj = new Planet()) {
    return `${colorSpan(obj.ianName, obj.color, true)}`
}

function describeDate(year = 0, minutesEnabled = false) {
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
        
    function getOrdinal(n) {
        if (n % 10 === 1 && n % 100 !== 11) return `${n}st`;
        if (n % 10 === 2 && n % 100 !== 12) return `${n}nd`;
        if (n % 10 === 3 && n % 100 !== 13) return `${n}rd`;
        return `${n}th`;
    }
    
    // Format time
    let hours = date.getUTCHours();
    const minutes = date.getUTCMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 === 0 ? 12 : hours % 12;
    const hourStr = hours.toString().padStart(2, "0");
    
    return `${hourStr}${minutesEnabled ? ':'+minutes : ''}${ampm} ${months[date.getUTCMonth()]} ${getOrdinal(date.getUTCDate())} ${wholeYear}`;
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

function describePopulation(populationRating = 0) {
    return `${statColorSpan(describeLargeNumber(Math.pow(1000,1+populationRating)), populationRating, true)}<br/>`
}

function describeTerritory(territoryRating = 0) {
    return `${statColorSpan(roundToPlaces(territoryRating,2), territoryRating, true)} AU<br/>`
}

function describeRating(rating = 0, invertColor = false) {
    return `${statColorSpan(roundToPlaces(rating,2), invertColor ? 1/rating : rating, true)}x`
}