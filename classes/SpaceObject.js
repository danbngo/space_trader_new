// SpaceObject class
class SpaceObject {
    constructor(name = "Unnamed", color = 'white', radius = 0, x = 0, y = 0) {
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

class BackgroundStar extends SpaceObject {}


class OrbitingObject extends SpaceObject {
    constructor(name = "Unnamed", color = 'white', radius = 0, x = 0, y = 0, orbit = null) {
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
    constructor(name = "Unnamed", color = 'white', radius = 0, x = 0, y = 0, orbit = null) {
        super(name, color, radius, x, y, orbit);
    }
}

// Planet class extends SpaceObject
class Planet extends OrbitingObject {
    constructor(name = "Unnamed", color = 'white', radius = 0, x = 0, y = 0, orbit = null, settlement = new Settlement(), culture = new Culture()) {
        super(name, color, radius, x, y, orbit);
        this.settlement = settlement
        this.culture = culture
    }
}

