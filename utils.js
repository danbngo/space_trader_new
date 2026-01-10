/**
 * Forces an element and all its children to stay on one line by setting appropriate CSS.
 * @param {HTMLElement} element - The element to force onto one line.
 * @returns {HTMLElement} The same element (for chaining).
 */
function forceOneLine(element) {
    element.style.whiteSpace = 'nowrap';
    element.style.display = 'inline-block';
    return element;
}

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
 * Inverts (mirrors) polygon vertices horizontally by negating their x coordinates.
 * @param {Array<{x: number, y: number}>} vertices - Array of vertex objects with x and y properties.
 * @returns {Array<{x: number, y: number}>} New array of inverted vertices.
 */
function invertPolygons(vertices) {
    return vertices.map(v => ({x: -v.x, y: v.y}));
}

/**
 * Darkens an RGBA color array by reducing the RGB components.
 * @param {number[]} color - The RGBA color array [r, g, b, a] with values 0-255.
 * @param {number} factor - The darkening factor (0.0 to 1.0, default 0.3).
 * @returns {number[]} A new darkened RGBA color array.
 */
function darkenColor(color, factor = 0.3) {
    return [
        Math.floor(color[0] * factor),
        Math.floor(color[1] * factor),
        Math.floor(color[2] * factor),
        color[3] // Keep alpha unchanged
    ];
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
 * Uses exponential probability: P(event in time t) = 1 - (1-p)^t
 * This correctly handles both small and large probabilities over fractional time periods.
 * @param {number} chancePerTick - The probability of the event occurring per tick (0-1).
 * @param {number} numTicks - The number of ticks (can be fractional, e.g., 10.3).
 * @returns {number} The number of times the event occurred.
 */
function calcOccurrencesPerTimespan(chancePerTick = 0.1, numTicks = 1) {
    if (chancePerTick <= 0 || numTicks <= 0) return 0;
    if (chancePerTick >= 1) return Math.ceil(numTicks); // Guaranteed event
    
    let occurrences = 0;
    
    // Use exponential probability formula: P(event) = 1 - (1-p)^t
    // This correctly models the probability of an event happening over time
    const probabilityOfNotHappening = Math.pow(1 - chancePerTick, numTicks);
    const probabilityOfHappening = 1 - probabilityOfNotHappening;
    
    // Roll once for the event happening at least once
    if (Math.random() < probabilityOfHappening) {
        occurrences++;
        
        // For additional occurrences, continue rolling with the base probability
        // This handles cases where multiple events could occur
        let remainingTicks = numTicks - 1;
        while (remainingTicks > 0) {
            const nextProbability = 1 - Math.pow(1 - chancePerTick, Math.min(remainingTicks, 1));
            if (Math.random() < nextProbability) {
                occurrences++;
                remainingTicks -= 1;
            } else {
                break;
            }
        }
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
 * @param {boolean} [options.showBuyPrice] - Whether to show buy price (default: true).
 * @param {boolean} [options.showSellPrice] - Whether to show sell price (default: false).
 * @returns {HTMLElement} The info container element.
 */
function createBuildingPriceInfo(building, buildingName = "Building", options = {showBuyPrice: true, showSellPrice: false}) {
    const {showBuyPrice = true, showSellPrice = false} = options;
    const {planet} = building;
    const {corruption, inflationRate, taxRate} = planet.c;
    const rake = building.rake;
    
    // Build buy price calculation
    const buyCalc = new Calculation();
    buyCalc.addFactor('merchant greed', 1 + rake);
    buyCalc.addFactor('inflation', 1 + inflationRate);
    buyCalc.addFactor('taxes', 1 + taxRate);
    const totalBuyMultiplier = buyCalc.getTotalMultiplier();
    
    // Build sell price calculation
    const sellCalc = new Calculation();
    sellCalc.addFactor('merchant greed', 1 - rake / (1 + rake));
    sellCalc.addFactor('inflation', 1 + inflationRate);
    sellCalc.addFactor('taxes', 1 - taxRate);
    const totalSellMultiplier = sellCalc.getTotalMultiplier();
    
    // Create the main info line
    const container = ce({style: {display: 'flex', flexWrap: 'nowrap', alignItems: 'center', gap: '8px'}});
    
    // Add building credits text
    container.appendChild(ce({innerHTML: `${buildingName} Credits: ${building.credits}`}));
    
    if (showBuyPrice) {
        container.appendChild(ce({innerHTML: ' | '}));
        const totalBuyPct = roundToPlaces(100 * (totalBuyMultiplier - 1), 1);
        const buyText = `Buy Price: ${statColorSpan(`${totalBuyPct >= 0 ? '+' : ''}${totalBuyPct}%`, 1 / totalBuyMultiplier)}`;
        const buySpan = ce({innerHTML: buyText});
        createPopoverElement(buySpan, buyCalc.createPopover(100, 'base price'));
        container.appendChild(buySpan);
    }
    
    if (showSellPrice) {
        container.appendChild(ce({innerHTML: ' | '}));
        const totalSellPct = roundToPlaces(100 * (totalSellMultiplier - 1), 1);
        const sellText = `Sell Price: ${statColorSpan(`${totalSellPct >= 0 ? '+' : ''}${totalSellPct}%`, totalSellMultiplier)}`;
        const sellSpan = ce({innerHTML: sellText});
        createPopoverElement(sellSpan, sellCalc.createPopover(100, 'base price'));
        container.appendChild(sellSpan);
    }
    
    return container;
}

/**
 * Creates market-specific price info with cargo demand details.
 * @param {Market} market - The market building.
 * @param {string} marketName - Display name (e.g., "Market" or "Black Market").
 * @param {CargoType} cargoType - The specific cargo type to show pricing for.
 * @returns {HTMLElement} The info container element.
 */
function createMarketCargoPriceInfo(market = new Market(), marketName = "Market", cargoType = CARGO_TYPES_ALL[0]) {
    const {planet} = market;
    const {corruption, inflationRate, taxRate} = planet.c;
    const rake = market.rake;
    
    // Get demand multiplier for this cargo type
    const demandMultiplier = planet.c.cargoPriceMultipliers.getAmount(cargoType);
    
    // Build buy price calculation
    const buyCalc = new Calculation();
    buyCalc.addFactor('merchant greed', 1 + rake);
    buyCalc.addFactor('inflation', 1 + inflationRate);
    buyCalc.addFactor('demand', demandMultiplier);
    if (!cargoType.illegal) buyCalc.addFactor('taxes', 1 + taxRate);
    const totalBuyMultiplier = buyCalc.getTotalMultiplier();
    
    // Build sell price calculation
    const sellCalc = new Calculation();
    sellCalc.addFactor('merchant greed', 1 - rake / (1 + rake));
    sellCalc.addFactor('inflation', 1 + inflationRate);
    sellCalc.addFactor('demand', demandMultiplier);
    if (!cargoType.illegal) sellCalc.addFactor('taxes', 1 - taxRate);
    const totalSellMultiplier = sellCalc.getTotalMultiplier();
    
    // Create the main info line
    const container = ce({style: {display: 'flex', flexWrap: 'nowrap', alignItems: 'center', gap: '8px'}});
    
    // Add market credits text
    container.appendChild(ce({innerHTML: `${marketName} Credits: ${market.credits}`}));
    
    // Add buy price with popover
    container.appendChild(ce({innerHTML: ' | '}));
    const totalBuyPct = roundToPlaces(100 * (totalBuyMultiplier - 1), 1);
    const buyText = `Buy Price: ${statColorSpan(`${totalBuyPct >= 0 ? '+' : ''}${totalBuyPct}%`, 1 / totalBuyMultiplier)}`;
    const buySpan = ce({innerHTML: buyText});
    createPopoverElement(buySpan, buyCalc.createPopover(100, 'base price'));
    container.appendChild(buySpan);
    
    // Add sell price with popover
    container.appendChild(ce({innerHTML: ' | '}));
    const totalSellPct = roundToPlaces(100 * (totalSellMultiplier - 1), 1);
    const sellText = `Sell Price: ${statColorSpan(`${totalSellPct >= 0 ? '+' : ''}${totalSellPct}%`, totalSellMultiplier)}`;
    const sellSpan = ce({innerHTML: sellText});
    createPopoverElement(sellSpan, sellCalc.createPopover(100, 'base price'));
    container.appendChild(sellSpan);
    
    return container;
}

/**
 * Generates a randomized asteroid shape as an array of vertices.
 * Creates an octagon-like shape with triangle chunks cut out for a rough, rocky appearance.
 * @param {number} baseRadius - The approximate radius of the asteroid (default: 1.0)
 * @param {number} irregularity - How irregular the shape is (0-1, default: 0.3)
 * @param {number} chunkiness - How many chunks are cut out (0-1, default: 0.4)
 * @returns {Array<[number, number]>} Array of [x, y] vertex coordinates normalized to baseRadius
 */
function asteroidShapeGenerator(baseRadius = 1.0, irregularity = 0.3, chunkiness = 0.4) {
    // Start with 8-12 points around a circle (octagon-ish base)
    const numPoints = rng(12, 8);
    const angleStep = (Math.PI * 2) / numPoints;
    /** @type {Array<[number, number]>} */
    const vertices = [];
    
    for (let i = 0; i < numPoints; i++) {
        const angle = angleStep * i;
        // Add irregularity to radius (each point varies)
        const radiusVariation = 1.0 + (Math.random() - 0.5) * irregularity;
        const r = baseRadius * radiusVariation;
        
        // Randomly decide if this should be a "chunk" (indentation)
        const isChunk = Math.random() < chunkiness;
        const chunkDepth = isChunk ? 0.6 + Math.random() * 0.3 : 1.0; // 60-90% depth for chunks
        
        const x = Math.cos(angle) * r * chunkDepth;
        const y = Math.sin(angle) * r * chunkDepth;
        
        vertices.push([x, y]);
    }
    
    return vertices;
}
