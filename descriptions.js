function describeShip(ship = new Ship()) {
    return `${ship.name} | Hull ${ship.hull[0]}/${ship.hull[1]} | ` +
    `Shields ${ship.shields[0]}/${ship.shields[1]} | ` +
    `Lasers ${ship.lasers} | Thrusters ${ship.thrusters} | `;
}


function describeShips(ships = [new Ship()]) {
    if (ships.length == 0) return "(None)"
    return ships.map(s=>`<li>${describeShip(s)}</li>`).join('')
}

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

function coloredName(obj = new SpaceObject()) {
    let name = obj.name
    if (obj instanceof Ship) name = name.substring(name.lastIndexOf(" ") + 1);

    return `${colorSpan(name, obj.color)}`
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
    
    