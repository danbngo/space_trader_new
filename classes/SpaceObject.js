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
        const newChildren = new Set(this.parent.children)
        newChildren.delete(this)
        this.parent.children = Array.from(newChildren)
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
        let baseName = this.name+'ian'
        if (baseName.endsWith('yian')) baseName = baseName.replace('yian', 'ian') //mercury
        //venus already handled
        if (baseName == 'Earthian') baseName = 'Terran' //earth
        if (baseName.endsWith('upiterian')) baseName = baseName.replace('upiterian', 'ovian') //jupiter
        //saturn already handled
        if (baseName.endsWith('nusian')) baseName = baseName.replace('nusian', 'nian') //uranus
        //neptune covered by vowel cases below
        if (baseName.endsWith('aian')) baseName = baseName.replace('aian', 'ian')
        if (baseName.endsWith('eian')) baseName = baseName.replace('eian', 'ian')
        if (baseName.endsWith('iian')) baseName = baseName.replace('iian', 'ian')
        if (baseName.endsWith('oian')) baseName = baseName.replace('oian', 'ian')
        if (baseName.endsWith('uian')) baseName = baseName.replace('uian', 'ian')
        if (baseName.endsWith('sian')) baseName = baseName.replace('sian', 'tian') //mars
        return baseName
    }
}

/**
 * @extends {OrbitingObject}
 * @param {ASTEROID_BELT_TYPES} beltType - The type of the asteroid belt.
 * @param {number[]} color - The color of the asteroid belt.
 * @param {number} radius - The radius of the asteroid belt.
 * @property {Orbit} orbit - The orbit of the asteroid belt.
 */
class AsteroidBelt extends OrbitingObject {
    constructor(name = "Unnamed", beltType, color = COLORS.White, radius = 0, x = 0, y = 0, orbit = null, encounterTypes = [], effectTypes = []) {
        super(name, color, radius, x, y, orbit);
        this.beltType = beltType
        this.encounterTypes = encounterTypes
        this.effectTypes = effectTypes
    }
}

class Asteroid extends OrbitingObject {}