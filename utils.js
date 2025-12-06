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
