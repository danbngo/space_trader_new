/**
 * Generates a random number between min and max.
 * @param {number} max - The maximum value (inclusive if rounded).
 * @param {number} min - The minimum value (inclusive).
 * @param {boolean} rounded - Whether to round the result to an integer.
 * @returns {number} A random number between min and max.
 */
function rng(max = 10, min = 0, rounded = true) {
    const result = min + (max-min)*Math.random()
    return rounded ? Math.round(result) : result
}

/**
 * Calculates the sum of all numeric values in a Map.
 * @param {Map<any, number>} map - The map whose values to sum.
 * @returns {number} The total sum of all values.
 */
function calcMapValuesTotal(map = new Map()) {
    let total = 0;
    for (const amt of map.values()) {
        total += amt;
    }
    return total;
}

/**
 * Calculates the Euclidean distance between two points.
 * @param {number} x1 - The x-coordinate of the first point.
 * @param {number} y1 - The y-coordinate of the first point.
 * @param {number} x2 - The x-coordinate of the second point.
 * @param {number} y2 - The y-coordinate of the second point.
 * @returns {number} The distance between the two points.
 */
function calcDistance(x1 = 0, y1 = 0, x2 = 0, y2 = 0) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Rounds a number to a specified number of decimal places.
 * @param {number} num - The number to round.
 * @param {number} places - The number of decimal places.
 * @returns {number} The rounded number.
 */
function roundToPlaces(num = 0, places = 0) {
    const factor = Math.pow(10, places);
    return Math.round(num * factor) / factor;
}

/**
 * Applies a smooth S-curve (smoothstep) to a ratio value.
 * Creates an easing effect: slow → fast → slow.
 * @param {number} ratio - A value between 0 and 1.
 * @returns {number} The smoothed value between 0 and 1.
 */
function normalCurve(ratio = Math.random()) {
    if (ratio <= 0) return 0;
    if (ratio >= 1) return 1;
    if (ratio == 0.5) return 0.5;

    // Smoothstep (3x² – 2x³)
    return ratio * ratio * (3 - 2 * ratio);
}

/**
 * Applies an inverse S-curve to a ratio value.
 * Creates a reverse easing effect: fast → slow → fast.
 * @param {number} ratio - A value between 0 and 1.
 * @returns {number} The inverse smoothed value between 0 and 1.
 */
function inverseNormalCurve(ratio = Math.random()) {
    if (ratio <= 0) return 0;
    if (ratio >= 1) return 1;
    if (ratio == 0.5) return 0.5;

    const smooth = normalCurve(ratio);
    return ratio*ratio/smooth;
}

/**
 * Returns a random member from an array.
 * @template T
 * @param {ReadonlyArray<T>|T[]} arr - The array to pick from.
 * @returns {T|undefined} A random element from the array, or undefined if array is empty.
 */
function rndMember(arr = []) {
    if (!Array.isArray(arr) || arr.length === 0) return undefined;
    const idx = Math.floor(Math.random() * arr.length);
    return arr[idx];
}

/**
 * Returns multiple random members from an array.
 * @template T
 * @param {T[]} arr - The array to pick from.
 * @param {number} numMembers - The number of members to pick.
 * @param {boolean} nonRepeating - Whether to pick unique members (no duplicates).
 * @returns {T[]} An array of random elements.
 */
function rndMembers(arr = [], numMembers = 1, nonRepeating = true) {
    if (!Array.isArray(arr) || arr.length === 0) return [];
    if (numMembers <= 0) return [];
    if (numMembers >= arr.length && nonRepeating) return arr.slice();
    const result = [];
    const available = nonRepeating ? arr.slice() : arr;
    for (let i = 0; i < numMembers; i++) {
        if (available.length === 0) break;
        const idx = Math.floor(Math.random() * available.length);
        result.push(available[idx]);
        if (nonRepeating) available.splice(idx, 1);
    }
    return result;
}

/**
 * Rotates a point around an origin by a specified angle.
 * @param {number} x - The x-coordinate of the point to rotate.
 * @param {number} y - The y-coordinate of the point to rotate.
 * @param {number} originX - The x-coordinate of the rotation origin.
 * @param {number} originY - The y-coordinate of the rotation origin.
 * @param {number} angleRadians - The rotation angle in radians.
 * @returns {[number, number]} The rotated point as [x, y].
 */
function rotatePoint(x = 0, y = 0, originX = 0, originY = 0, angleRadians = 2*Math.PI) {
    // translate point back to origin
    const translatedX = x - originX;
    const translatedY = y - originY;

    // apply angle
    const cosA = Math.cos(angleRadians);
    const sinA = Math.sin(angleRadians);

    const rotX = translatedX * cosA - translatedY * sinA;
    const rotY = translatedX * sinA + translatedY * cosA;

    // translate back to original position
    return [
        rotX + originX,
        rotY + originY
    ];
}

/**
 * Calculates the angle in radians from one point to another.
 * @param {number} fromX - The x-coordinate of the starting point.
 * @param {number} fromY - The y-coordinate of the starting point.
 * @param {number} toX - The x-coordinate of the target point.
 * @param {number} toY - The y-coordinate of the target point.
 * @returns {number} The angle in radians.
 */
function calcAngleTowardsPoint(fromX = 0, fromY = 0, toX = 0, toY = 0) {
    return Math.atan2(toY - fromY, toX - fromX);
}

/**
 * Normalizes an angle to the range [-π, π].
 * @param {number} angle - The angle in radians to normalize.
 * @returns {number} The normalized angle in radians.
 */
function normalizeAngle(angle = Math.PI*4) {
    return Math.atan2(Math.sin(angle), Math.cos(angle)); 
}

/**
 * Returns a random index from an array based on weighted probabilities.
 * @param {number[]} weights - Array of weights for each index.
 * @returns {number} The selected index, or -1 if no valid selection.
 */
function rndIndexWeighted(weights = [1]) {
    if (!weights || weights.length === 0) return -1;

    //console.log('rnd index weighted called w weights:',weights);

    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    if (totalWeight <= 0) return -1;

    //console.log('total weight:',totalWeight);

    let r = Math.random() * totalWeight;
    for (let i = 0; i < weights.length; i++) {
        //console.log('i,r selected:',i,r,'weights[i]:',weights[i]);
        if (r < weights[i]) return i;
        r -= weights[i];
    }

    // fallback in case of floating point errors
    return weights.length - 1;
}

/**
 * Converts radians to degrees.
 * @param {number} rads - The angle in radians.
 * @returns {number} The angle in degrees.
 */
function radiansToDegrees(rads = 0) {
    return rads * (180 / Math.PI);
}

/**
 * Checks if a point is inside a non-rotated rectangle. Optimized for performance.
 * @param {number} px - The x-coordinate of the point.
 * @param {number} py - The y-coordinate of the point.
 * @param {number} rx - The x-coordinate of the rectangle's top-left corner.
 * @param {number} ry - The y-coordinate of the rectangle's top-left corner.
 * @param {number} rw - The width of the rectangle.
 * @param {number} rh - The height of the rectangle.
 * @returns {boolean} True if the point is inside the rectangle.
 */
function isPointInRect(px, py, rx, ry, rw, rh) {
    return px >= rx && px <= rx + rw &&
           py >= ry && py <= ry + rh;
}

/**
 * Safely removes an item from an array if it exists.
 * @template T
 * @param {T[]} arr - The array to remove from.
 * @param {T} item - The item to remove.
 * @returns {boolean} True if the item was found and removed.
 */
function safeRemove(arr = [], item) {
    if (!Array.isArray(arr) || arr.length === 0) return false;
    const idx = arr.indexOf(item);
    if (idx === -1) return false;
    arr.splice(idx, 1);
    return true;
}

/**
 * Converts a number to Roman numeral.
 * @param {number} num - The number to convert (1-10).
 * @returns {string} The Roman numeral representation.
 */
function toRomanNumeral(num) {
    const romanNumerals = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X']
    return romanNumerals[Math.min(Math.max(Math.floor(num), 0), 10)] || num.toString()
}

/**
 * Safely adds an item to an array if it doesn't already exist.
 * @template T
 * @param {T[]} arr - The array to add to.
 * @param {T} item - The item to add.
 * @returns {boolean} True if the item was added (wasn't already in array).
 */
function safeAdd(arr = [], item) {
    if (!Array.isArray(arr)) return false;
    if (arr.includes(item)) return false;
    arr.push(item);
    return true;
}

/**
 * Converts a color array [r, g, b, a] to an rgba() CSS string.
 * @param {number[]} color - The color as [red, green, blue, alpha].
 * @returns {string} The CSS rgba() string.
 */
function colorArrToRgbaString(color = COLORS.White) {
    const [r,g,b,a] = color
    return `rgba(${r},${g},${b},${a})`
}

/**
 * Converts a hex color string to an RGBA array.
 * @param {string} hex - The hex color string (e.g., '#ffffff' or 'ffffff').
 * @returns {[number, number, number, number]} The color as [red, green, blue, alpha].
 */
function hexToRgba(hex = '#ffffff') {
    // Remove # if present
    hex = hex.replace(/^#/, '');
    
    // Parse hex values
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    return [r, g, b, 1];
}

/**
 * Calculates the weighted average of an array of values.
 * @param {number[]} values - The values to average.
 * @param {number[]} weights - The weights for each value.
 * @returns {number} The weighted average, or 0 if invalid inputs.
 */
function weightedAvg(values = [0], weights = [1]) {
    if (values.length === 0 || weights.length === 0 || values.length !== weights.length) {
        return 0;
    }
    let totalWeight = 0;
    let weightedSum = 0;
    for (let i = 0; i < values.length; i++) {
        weightedSum += values[i] * weights[i];
        totalWeight += weights[i];
    }
    return totalWeight === 0 ? 0 : weightedSum / totalWeight;
}

/**
 * Generates a unique identifier suitable for DOM element IDs.
 * @param {string} prefix - An optional prefix for the UUID.
 * @returns {string} A unique ID string.
 */
function generateUUID(prefix='') {
    // Generate a short unique ID suitable for DOM usage
    // Format: timestamp in base36 + random suffix
    const timestamp = Date.now().toString(36);
    const randomPart = Math.random().toString(36).substring(2, 7);
    return `${prefix}${timestamp}${randomPart}`;
}

/**
 * @template T
 * @param {T[]} arr 
 * @returns {T[]}
 */
function rndShuffle(arr = []) {
    const shuffled = arr.slice();
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

/**
 * Calculates the number of occurrences of a probabilistic event over a timespan.
 * Handles fractional ticks by applying proportional probability to the remainder.
 * @param {number} chancePerTick - The probability of the event occurring per tick (0-1).
 * @param {number} numTicks - The number of ticks (can be fractional, e.g., 10.3).
 * @returns {number} The number of times the event occurred.
 */
function calcOccurrencesPerTimespan(chancePerTick = 0.1, numTicks = 1) {
    // returns a potentially infinite (with infinitesimal chance) number representing the number of occurrences of a small probability event over a timespan
    let occurrences = 0;
    const wholeTicks = Math.floor(numTicks);
    const tickFraction = numTicks - wholeTicks;

    // Process whole ticks
    for (let i = 0; i < wholeTicks; i++) {
        if (Math.random() < chancePerTick) occurrences++;
    }
    
    // Process fractional tick with proportional probability
    if (tickFraction > 0 && Math.random() < chancePerTick * tickFraction) {
        occurrences++;
    }

    return occurrences;
}

/**
 * @deprecated Use {@link calcOccurrencesPerTimespan} instead.
 * Kept for backward compatibility with existing callers.
 */
const calcOccurencesPerTimespan = function(chancePerTick = 0.1, numTicks = 1) {
    return calcOccurrencesPerTimespan(chancePerTick, numTicks);
};

function rndRound(fraction = 0.5) {
    const lower = Math.floor(fraction);
    const remainder = fraction - lower;
    return lower + (Math.random() < remainder ? 1 : 0);
}
/**
 * Creates a standardized building info line with popover details for buy/sell prices.
 * @param {Building} building - The building to create info for.
 * @param {string} buildingName - The display name of the building (e.g., "Market", "Shipyard").
 * @param {Object} options - Optional parameters.
 * @param {boolean} options.showBuyPrice - Whether to show buy price (default: true).
 * @param {boolean} options.showSellPrice - Whether to show sell price (default: false).
 * @returns {HTMLElement} The info container element.
 */
function createBuildingPriceInfo(building = new Building(), buildingName = "Building", options = {}) {
    const {showBuyPrice = true, showSellPrice = false} = options;
    const {planet} = building;
    const {corruption, inflation, taxRate} = planet.c;
    const barterSkill = gs.fleet.totalSkills.getAmount(SKILLS.Barter);
    const rake = building.rake;
    
    // Calculate base percentages
    const baseTaxPct = roundToPlaces(100 * taxRate, 1);
    const baseInflationPct = roundToPlaces(100 * inflation, 1);
    
    // Calculate buy price components
    const buyCorruptionPct = roundToPlaces(100 * corruption, 1);
    const buyCorruptionWithBarterPct = roundToPlaces(100 * (rake - 1), 1);
    const barterReductionPct = buyCorruptionPct > 0 ? roundToPlaces(100 * (1 - rake / (1 + corruption)), 1) : 0;
    const totalBuyPct = roundToPlaces(100 * ((1 + rake) * inflation * (1 + taxRate) - 1), 1);
    
    // Calculate sell price components
    const sellCorruptionPct = roundToPlaces(100 * corruption / (1 + corruption), 1);
    const sellCorruptionWithBarterPct = roundToPlaces(100 * rake / (1 + rake), 1);
    const barterImprovementPct = sellCorruptionPct > 0 ? roundToPlaces(100 * (corruption / (1 + corruption) - rake / (1 + rake)), 1) : 0;
    const totalSellPct = roundToPlaces(100 * (rake / (1 + rake) * inflation * (1 - taxRate)) - 100, 1);
    
    // Create popover content for buy price
    const buyPricePopover = ce({
        children: [
            `${colorSpan(`Total Buy Price: ${totalBuyPct >= 0 ? '+' : ''}${totalBuyPct}%`, totalBuyPct < 50 ? COLORS.LightGreen : totalBuyPct < 100 ? COLORS.Yellow : COLORS.LightRed)}<br/>`,
            `100% (base)<br/>`,
            baseTaxPct > 0 ? `${colorSpan(`+${baseTaxPct}%`, COLORS.Orange)} (taxes)<br/>` : '',
            baseInflationPct > 0 ? `${colorSpan(`+${baseInflationPct}%`, COLORS.Yellow)} (inflation)<br/>` : '',
            buyCorruptionPct > 0 ? `${colorSpan(`+${buyCorruptionPct}%`, COLORS.LightRed)} (merchant greed)<br/>` : '',
            barterSkill > 0 && barterReductionPct > 0 ? `${colorSpan(`-${barterReductionPct}%`, COLORS.LightGreen)} (barter)<br/>` : '',
        ]
    });
    
    // Create popover content for sell price
    const sellPricePopover = ce({
        children: [
            `${colorSpan(`Total Sell Price: ${totalSellPct}%`, totalSellPct > -50 ? COLORS.LightGreen : totalSellPct > -75 ? COLORS.Yellow : COLORS.LightRed)}<br/>`,
            `100% (base)<br/>`,
            baseTaxPct > 0 ? `${colorSpan(`-${baseTaxPct}%`, COLORS.Orange)} (taxes)<br/>` : '',
            baseInflationPct > 0 ? `${colorSpan(`+${baseInflationPct}%`, COLORS.Yellow)} (inflation)<br/>` : '',
            sellCorruptionPct > 0 ? `${colorSpan(`-${sellCorruptionPct}%`, COLORS.LightRed)} (merchant greed)<br/>` : '',
            barterSkill > 0 && barterImprovementPct > 0 ? `${colorSpan(`+${barterImprovementPct}%`, COLORS.LightGreen)} (barter)<br/>` : '',
        ]
    });
    
    // Create the main info line
    const parts = [`${buildingName} Credits: ${building.credits}`];
    
    if (showBuyPrice) {
        const buyText = `Buy Price: ${colorSpan(`${totalBuyPct >= 0 ? '+' : ''}${totalBuyPct}%`, totalBuyPct < 50 ? COLORS.LightGreen : totalBuyPct < 100 ? COLORS.Yellow : COLORS.LightRed)}`;
        parts.push(createPopoverSpan(buyText, buyPricePopover));
    }
    
    if (showSellPrice) {
        const sellText = `Sell Price: ${colorSpan(`${totalSellPct}%`, totalSellPct > -50 ? COLORS.LightGreen : totalSellPct > -75 ? COLORS.Yellow : COLORS.LightRed)}`;
        parts.push(createPopoverSpan(sellText, sellPricePopover));
    }
    
    return ce({innerHTML: parts.join(' | ')});
}

/**
 * Creates market-specific price info with cargo demand details.
 * @param {Market} market - The market building.
 * @param {string} marketName - Display name (e.g., "Market" or "Black Market").
 * @param {CargoType} cargoType - The specific cargo type to show pricing for.
 * @returns {HTMLElement} The info container element.
 */
function createMarketCargoPriceInfo(market = new Market(), marketName = "Market", cargoType = CARGO_TYPES_ALL[0]) {
    const {planet, blackMarket} = market;
    const {corruption, inflation, taxRate} = planet.c;
    const barterSkill = gs.fleet.totalSkills.getAmount(SKILLS.Barter);
    const rake = market.rake;
    
    // Get demand multiplier for this cargo type
    const demandMultiplier = planet.c.cargoPriceMultipliers.getAmount(cargoType);
    const demandPct = roundToPlaces(100 * (demandMultiplier - 1), 1);
    
    // Calculate base percentages (taxes don't apply to black market)
    const baseTaxPct = blackMarket ? 0 : roundToPlaces(100 * taxRate, 1);
    const baseInflationPct = roundToPlaces(100 * inflation, 1);
    
    // Calculate buy price components
    const buyCorruptionPct = roundToPlaces(100 * corruption, 1);
    const buyCorruptionWithBarterPct = roundToPlaces(100 * (rake - 1), 1);
    const barterReductionPct = buyCorruptionPct > 0 ? roundToPlaces(100 * (1 - rake / (1 + corruption)), 1) : 0;
    const totalBuyPct = roundToPlaces(100 * ((1 + rake) * inflation * demandMultiplier * (1 + (blackMarket ? 0 : taxRate)) - 1), 1);
    
    // Calculate sell price components
    const sellCorruptionPct = roundToPlaces(100 * corruption / (1 + corruption), 1);
    const sellCorruptionWithBarterPct = roundToPlaces(100 * rake / (1 + rake), 1);
    const barterImprovementPct = sellCorruptionPct > 0 ? roundToPlaces(100 * (corruption / (1 + corruption) - rake / (1 + rake)), 1) : 0;
    const totalSellPct = roundToPlaces(100 * (rake / (1 + rake) * inflation * demandMultiplier * (1 - (blackMarket ? 0 : taxRate))) - 100, 1);
    
    // Create popover content for buy price
    const buyPricePopover = ce({
        children: [
            `${colorSpan(`Total Buy Price: ${totalBuyPct >= 0 ? '+' : ''}${totalBuyPct}%`, totalBuyPct < 50 ? COLORS.LightGreen : totalBuyPct < 100 ? COLORS.Yellow : COLORS.LightRed)}<br/>`,
            `100% (base)<br/>`,
            demandPct !== 0 ? `${colorSpan(`${demandPct >= 0 ? '+' : ''}${demandPct}%`, demandPct > 0 ? COLORS.Orange : COLORS.LightGreen)} (demand)<br/>` : '',
            baseTaxPct > 0 ? `${colorSpan(`+${baseTaxPct}%`, COLORS.Orange)} (taxes)<br/>` : '',
            baseInflationPct > 0 ? `${colorSpan(`+${baseInflationPct}%`, COLORS.Yellow)} (inflation)<br/>` : '',
            buyCorruptionPct > 0 ? `${colorSpan(`+${buyCorruptionPct}%`, COLORS.LightRed)} (merchant greed)<br/>` : '',
            barterSkill > 0 && barterReductionPct > 0 ? `${colorSpan(`-${barterReductionPct}%`, COLORS.LightGreen)} (barter)<br/>` : '',
        ]
    });
    
    // Create popover content for sell price
    const sellPricePopover = ce({
        children: [
            `${colorSpan(`Total Sell Price: ${totalSellPct}%`, totalSellPct > -50 ? COLORS.LightGreen : totalSellPct > -75 ? COLORS.Yellow : COLORS.LightRed)}<br/>`,
            `100% (base)<br/>`,
            demandPct !== 0 ? `${colorSpan(`${demandPct >= 0 ? '+' : ''}${demandPct}%`, demandPct > 0 ? COLORS.Orange : COLORS.LightGreen)} (demand)<br/>` : '',
            baseTaxPct > 0 ? `${colorSpan(`-${baseTaxPct}%`, COLORS.Orange)} (taxes)<br/>` : '',
            baseInflationPct > 0 ? `${colorSpan(`+${baseInflationPct}%`, COLORS.Yellow)} (inflation)<br/>` : '',
            sellCorruptionPct > 0 ? `${colorSpan(`-${sellCorruptionPct}%`, COLORS.LightRed)} (merchant greed)<br/>` : '',
            barterSkill > 0 && barterImprovementPct > 0 ? `${colorSpan(`+${barterImprovementPct}%`, COLORS.LightGreen)} (barter)<br/>` : '',
        ]
    });
    
    // Create the main info line
    const buyText = `Buy Price: ${colorSpan(`${totalBuyPct >= 0 ? '+' : ''}${totalBuyPct}%`, totalBuyPct < 50 ? COLORS.LightGreen : totalBuyPct < 100 ? COLORS.Yellow : COLORS.LightRed)}`;
    const sellText = `Sell Price: ${colorSpan(`${totalSellPct}%`, totalSellPct > -50 ? COLORS.LightGreen : totalSellPct > -75 ? COLORS.Yellow : COLORS.LightRed)}`;
    
    const parts = [
        `${marketName} Credits: ${market.credits}`,
        createPopoverSpan(buyText, buyPricePopover),
        createPopoverSpan(sellText, sellPricePopover)
    ];
    
    return ce({innerHTML: parts.join(' | ')});
}
