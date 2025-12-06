function describeShip(ship = new Ship()) {
    return `${ship.name} | Hull ${ship.hull[0]}/${ship.hull[1]} | ` +
            `Shields ${ship.shields[0]}/${ship.shields[1]} | ` +
            `Lasers ${ship.lasers} | Thrusters ${ship.thrusters} | `;
}


function describeShips(ships = [new Ship()]) {
    if (ships.length == 0) return "(None)"
    return ships.map(s=>`<li>${describeShip(s)}</li>`).join('')
}

function describeTime(years = 0) {
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

function coloredName(obj = new SpaceObject(), includeSuffixes = true) {
    return `${colorSpan(obj.name, obj.graphics.color)}${
        includeSuffixes && obj == gameState.fleet.location ? ` (Docked)`
        : includeSuffixes && obj == gameState.fleet.route?.destination ? ` (Destination)`
        : ''
    }`
}