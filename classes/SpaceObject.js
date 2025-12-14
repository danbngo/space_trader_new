// SpaceObject class
class SpaceObject {
    constructor(name = "Unnamed", color = '#ccc', radius = 0, x = 0, y = 0) {
        this.name = name;
        this.color = color
        this.radius = radius;
        this.x = x;
        this.y = y;
        this.parent = null;
        this.children = [];
    }
    addChildren(children = []) {
        for (const child of children) {
            child.detachFromParent()
            child.parent = this
        }
        console.log('assigning children:',this,children)
        this.children.push(...children)
    }
    detachFromParent() {
        if (!this.parent) return
        const newChildren = new Set(parent.children)
        newChildren.delete(this)
        parent.children = Array.from(newChildren)
        this.parent = undefined
    }
}

class BackgroundStar extends SpaceObject {
    constructor(r = 0, g = 0, b = 0, x = 0, y = 0, size = 1, twinkleDurationYear = 1) {
        super("Unnamed", 'rgba(255,0,0,0.5)', 0, x, y);
        this.twinkleDurationYear = twinkleDurationYear;
        this.twinkleProgress = 0;
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = 255;
        this.size = size;
        this.twinkleProgressOffset = Math.random()
        this.reset()
    }
    twinkle(year = 0) {
        const inner = (year / this.twinkleDurationYear) % 1
        this.twinkleProgress = (inner + this.twinkleProgressOffset) % 1
        this.a = Math.round(255*Math.abs(1-this.twinkleProgress*2))
    }
    reset() {
        this.twinkleProgress = Math.random()
    }
}


class OrbitingObject extends SpaceObject {
    constructor(name = "Unnamed", color = '#ccc', radius = 0, x = 0, y = 0, orbit = null) {
        super(name, color, radius, x, y);
        this.orbit = orbit;
    }
    calcAbsPositionAtYear(year = 0) {
        if (!this.orbit) return [this.x, this.y]
        let [ox, oy] = this.orbit.calcRelativePosition(year);
        if (this.parent) {
            const [px, py] = this.parent.calcAbsPositionAtYear(year)
            ox += px
            oy += py
        }
        return [ox, oy]
    }
}

// Star class extends SpaceObject
class Star extends OrbitingObject {
    constructor(name = "Unnamed", color = '#ccc', radius = 0, x = 0, y = 0, orbit = null) {
        super(name, color, radius, x, y, orbit);
    }
}

// Planet class extends SpaceObject
class Planet extends OrbitingObject {
    constructor(name = "Unnamed", color = '#ccc', radius = 0, x = 0, y = 0, orbit = null, settlement = new Settlement(), culture = new Culture()) {
        super(name, color, radius, x, y, orbit);
        this.settlement = settlement
        this.culture = culture
    }
}

