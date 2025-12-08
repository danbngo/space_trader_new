function rng(max = 10, min = 0, rounded = true) {
    const result = min + (max-min)*Math.random()
    return rounded ? Math.round(result) : result
}

function calcMapValuesTotal(map = new Map()) {
    let total = 0;
    for (const amount of map.values()) {
        total += amount;
    }
    return total;
}

function calcDistance(x1 = 0, y1 = 0, x2 = 0, y2 = 0) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
}

function round(num = 0, places = 0) {
    const factor = Math.pow(10, places);
    return Math.round(num * factor) / factor;
}

// Smooth S-curve (slow → fast → slow)
function applyNormalCurve(ratio = 0) {
    if (ratio <= 0) return 0;
    if (ratio >= 1) return 1;

    // Smoothstep (3x² – 2x³)
    return ratio * ratio * (3 - 2 * ratio);
}

function rndMember(arr = []) {
    if (!Array.isArray(arr) || arr.length === 0) return undefined;
    const idx = Math.floor(Math.random() * arr.length);
    return arr[idx];
}

function rotatePoint(x = 0, y = 0, originX = 0, originY = 0, angleRadians = 2*Math.PI) {
    // translate point back to origin
    const translatedX = x - originX;
    const translatedY = y - originY;

    // apply rotation
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

function rndIndexWeighted(weights = [1]) {
    if (!weights || weights.length === 0) return -1;

    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    if (totalWeight <= 0) return -1;

    let r = Math.random() * totalWeight;
    for (let i = 0; i < weights.length; i++) {
        if (r < weights[i]) return i;
        r -= weights[i];
    }

    // fallback in case of floating point errors
    return weights.length - 1;
}

function radiansToDegrees(rads = 0) {
    return rads * (180 / Math.PI);
}

function calcCirclesIntersecting(x1 = 0, y1 = 0, r1 = 1, x2 = 0, y2 = 0, r2 = 1) {
    const dx = x1 - x2;
    const dy = y1 - y2;
    const distSq = dx*dx + dy*dy;
    const rad = r1 + r2;
    return distSq <= rad * rad;
}

function calcSpeedAlongAngle(speedX = 0, speedY = 0, angle = Math.PI*2) {
    const ux = Math.cos(angle);  // unit vector in that angle
    const uy = Math.sin(angle);
    return speedX * ux + speedY * uy;    // dot product = speed along angle
}