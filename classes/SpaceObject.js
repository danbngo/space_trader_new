// SpaceObject class
class SpaceObject {
    constructor(name = "Unnamed", color = COLORS.White, radius = 0, x = 0, y = 0) {
        this.name = name;
        this.color = [...color]
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
    constructor(x = 0, y = 0, color = COLORS.LightGray, radius = 1, twinkleDurationYear = 1) {
        super("Unnamed", color, radius, x, y);
        this.twinkleDurationYear = twinkleDurationYear;
        this.twinkleProgress = 0;
        this.twinkleProgressOffset = Math.random()
        this.reset()
    }
    twinkle(year = 0) {
        const inner = (year / this.twinkleDurationYear) % 1
        this.twinkleProgress = (inner + this.twinkleProgressOffset) % 1
        this.color[3] = Math.round(255*Math.abs(1-this.twinkleProgress*2))
    }
    reset() {
        this.twinkleProgress = Math.random()
    }
}


class OrbitingObject extends SpaceObject {
    constructor(name = "Unnamed", color = COLORS.White, radius = 0, x = 0, y = 0, orbit = null) {
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
    constructor(name = "Unnamed", color = COLORS.White, radius = 0, x = 0, y = 0, orbit = null) {
        super(name, color, radius, x, y, orbit);
    }
}

// Planet class extends SpaceObject
class Planet extends OrbitingObject {
    constructor(name = "Unnamed", color = COLORS.White, radius = 0, x = 0, y = 0, orbit = null, planetType = PLANET_TYPES_ALL[0], settlement = new Settlement(), culture = new Culture()) {
        super(name, color, radius, x, y, orbit);
        this.planetType = planetType
        this.settlement = settlement
        this.culture = culture
    }

    get ianName() {
        let name = this.name+'ian'
        if (name == 'Earthian') return 'Terran'
        if (name.endsWith('aaian')) name = name.replace('aaian', 'aan')
        if (name.endsWith('eaian')) name = name.replace('eaian', 'ean')
        if (name.endsWith('iaian')) name = name.replace('iaian', 'ian')
        if (name.endsWith('oian')) name = name.replace('oian', 'oan')
        if (name.endsWith('uian')) name = name.replace('uian', 'uan')
        if (name.endsWith('yian')) name = name.replace('yian', 'yan')
        if (name.endsWith('sian')) name = name.replace('sian', 'tian')
        return name
    }
}

class AsteroidBelt extends OrbitingObject {}

class Asteroid extends OrbitingObject {}