function rng(max = 10, min = 0, rounded = true) {
    const result = min + (max-min)*Math.random()
    return rounded ? Math.round(result) : result
}

function calcMapValuesTotal(map = new Map()) {
    let total = 0;
    for (const amt of map.values()) {
        total += amt;
    }
    return total;
}

function calcDistance(x1 = 0, y1 = 0, x2 = 0, y2 = 0) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
}

function roundToPlaces(num = 0, places = 0) {
    const factor = Math.pow(10, places);
    return Math.round(num * factor) / factor;
}

// Smooth S-curve (slow → fast → slow)
function normalCurve(ratio = Math.random()) {
    if (ratio <= 0) return 0;
    if (ratio >= 1) return 1;
    if (ratio == 0.5) return 0.5;

    // Smoothstep (3x² – 2x³)
    return ratio * ratio * (3 - 2 * ratio);
}

//fast -> slow -> fast
function inverseNormalCurve(ratio = Math.random()) {
    if (ratio <= 0) return 0;
    if (ratio >= 1) return 1;
    if (ratio == 0.5) return 0.5;

    const smooth = normalCurve(ratio);
    return ratio*ratio/smooth;
}

function rndMember(arr = []) {
    if (!Array.isArray(arr) || arr.length === 0) return undefined;
    const idx = Math.floor(Math.random() * arr.length);
    return arr[idx];
}

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

function calcAngleTowardsPoint(fromX = 0, fromY = 0, toX = 0, toY = 0) {
    return Math.atan2(toY - fromY, toX - fromX);
}

function normalizeAngle(angle = Math.PI*4) {
    return Math.atan2(Math.sin(angle), Math.cos(angle)); 
}

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

function radiansToDegrees(rads = 0) {
    return rads * (180 / Math.PI);
}

//dont move to the Rectangle class, this needs to be efficient and Rect allows rotation so its less efficient
function isPointInRect(px, py, rx, ry, rw, rh) {
    return px >= rx && px <= rx + rw &&
           py >= ry && py <= ry + rh;
}

function safeRemove(arr = [], item) {
    if (!Array.isArray(arr) || arr.length === 0) return false;
    const idx = arr.indexOf(item);
    if (idx === -1) return false;
    arr.splice(idx, 1);
    return true;
}

function safeAdd(arr = [], item) {
    if (!Array.isArray(arr)) return false;
    if (arr.includes(item)) return false;
    arr.push(item);
    return true;
}

function colorArrToRgbaString(color = COLORS.White) {
    const [r,g,b,a] = color
    return `rgba(${r},${g},${b},${a})`
}

function hexToRgba(hex = '#ffffff') {
    // Remove # if present
    hex = hex.replace(/^#/, '');
    
    // Parse hex values
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    return [r, g, b, 1];
}

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

function generateUUID(prefix='') {
    // Generate a short unique ID suitable for DOM usage
    // Format: timestamp in base36 + random suffix
    const timestamp = Date.now().toString(36);
    const randomPart = Math.random().toString(36).substring(2, 7);
    return `${prefix}${timestamp}${randomPart}`;
}