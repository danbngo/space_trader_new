class Effect {
    constructor(effectType = EFFECT_TYPES_ALL[0], x = 0, y = 0, toX = 0, toY = 0) {
        this.effectType = effectType;
        this.x = x;
        this.y = y;
        this.toX = toX;
        this.toY = toY;
        this.path = new Path(x, y, toX, toY);
        this.radius = rng(effectType.maxSize, effectType.minSize, true);
        this.remainingTurns = rng(effectType.maxDuration, effectType.minDuration, true);
    }
    get angle() {
        return this.path.angle
    }
}