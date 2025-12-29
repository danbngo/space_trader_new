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