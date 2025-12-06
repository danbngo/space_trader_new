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

