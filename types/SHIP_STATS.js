class ShipStat {
    constructor(name = '', symbol = '', color = COLORS.White, description = '') {
        /** @type {string} */
        this.name = name;
        /** @type {string} */
        this.symbol = symbol;
        /** @type {number[]} */
        this.color = color;
        /** @type {string} */
        this.description = description;
    }
}

const SHIP_STATS = {
    HULL: new ShipStat('Hull', '🛡️', COLORS.Gray, 'The structural integrity of the ship. Determines how much physical damage it can withstand before being destroyed.'),
    SHIELDS: new ShipStat('Shields', '⚡', COLORS.LightBlue, 'Energy barriers that absorb incoming damage before it reaches the hull. Shields regenerate over time when not taking damage.'),
    LASERS: new ShipStat('Lasers', '🔴', COLORS.LightRed, 'Offensive weapon power determining damage output in combat. Higher lasers increase your effectiveness in destroying enemy ships.'),
    ENGINES: new ShipStat('Engines', '🚀', COLORS.LightGreen, 'The propulsion system affecting movement speed and maneuverability. Better engines allow faster travel and tactical positioning in combat.'),
    RADARS: new ShipStat('Radars', '📡', COLORS.Yellow, 'Sensor systems that determine detection and weapon range. Higher radar increases the distance at which you can detect ships, anomalies, and engage targets.'),
    CARGO_CAPACITY: new ShipStat('Cargo Capacity', '📦', COLORS.Orange, 'The total amount of cargo the ship can hold. Determines how many goods and resources can be transported for trade.'),
    FUEL_CAPACITY: new ShipStat('Fuel Capacity', '⛽', COLORS.LightYellow, 'The amount of fuel the ship can store. Determines how far the ship can travel before needing to refuel.'),
}

const SHIP_STATS_ALL = Object.values(SHIP_STATS)