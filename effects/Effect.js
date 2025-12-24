class Effect {
    constructor(effectType = EFFECT_TYPES_ALL[0], x = 0, y = 0, toX = null, toY = null) {
        this.effectType = effectType;
        this.x = x;
        this.y = y;
        this.toX = toX;
        this.toY = toY;
        this.path = toX !== null && toY !== null ? new Path(x, y, toX, toY) : null;
        this.angle = this.path ? this.path.angle : rng(Math.PI * 2, 0, false);
        this.radius = rng(effectType.maxSize, effectType.minSize, true);
        this.remainingTurns = rng(effectType.maxDuration, effectType.minDuration, true);
        this.uuid = generateUUID('effect_');
    }

    containsPoint(x = 0, y = 0) {
        // Handle different effect shapes
        if (this.effectType.shape === SHAPES.FilledOval) {
            // For ovals, create an ellipse with minor axis = radius/2
            const ellipse = new Ellipse(this.x, this.y, this.radius, this.radius * 0.5, this.angle)
            return ellipse.containsPoint(x, y)
        } 
        else if (this.effectType.shape === SHAPES.Line) {
            // For lines, use Line class for accurate collision detection
            if (!this.path) return false
            const line = new Line(this.x, this.y, this.toX, this.toY, this.radius)
            return line.containsPoint(x, y)
        }
        else {
            // Default circular check for other shapes
            const dist = calcDistance(this.x, this.y, x, y)
            return dist <= this.radius
        }
    }

    applyEffectOnEnter(ship = new Ship()) {
        // Override in subclass
    }

    applyEffectOnStart(ship = new Ship()) {
        // Override in subclass
    }

    onTurnEnd() {
        this.remainingTurns -= 1
        this.radius = Math.max(0, this.radius*rng(0.9, 0.7, false))
    }
}