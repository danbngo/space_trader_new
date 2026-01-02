/**
 * Base class for all objects in space (stars, planets, asteroids, etc.).
 * @class SpaceObject
 */
class SpaceObject {
    /**
     * Creates a space object.
     * @param {string} name - The name of the space object.
     * @param {ObjectType} objectType - The type of object (from OBJECT_TYPES).
     * @param {number[]} color - The RGBA color array for the object.
     * @param {number} radius - The radius of the object in appropriate units.
     * @param {number} x - The x-coordinate position.
     * @param {number} y - The y-coordinate position.
     */
    constructor(name = "Unnamed", objectType = OBJECT_TYPES.ABSTRACT, color = COLORS.White, radius = 0, x = 0, y = 0) {
        /** @type {string} */
        this.name = name;
        /** @type {ObjectType} */
        this.objectType = objectType;
        /** @type {number[]} */
        this.color = [...color]
        /** @type {number} */
        this.radius = radius;
        /** @type {number} */
        this.x = x;
        /** @type {number} */
        this.y = y;
        /** @type {SpaceObject|null} */
        this.parent = null;
        /** @type {SpaceObject[]} */
        this.children = [];
        /** @type {string} */
        this.uuid = generateUUID('sobj_');
    }
    
    /**
     * Adds child objects to this space object.
     * @param {SpaceObject[]} children - Array of space objects to add as children.
     */
    addChildren(children = []) {
        for (const child of children) {
            child.detachFromParent()
            child.parent = this
        }
        console.log('assigning children:',this,children)
        this.children.push(...children)
    }
    
    /**
     * Removes this object from its parent's children array.
     */
    detachFromParent() {
        if (!this.parent) return
        const newChildren = new Set(this.parent.children)
        newChildren.delete(this)
        this.parent.children = Array.from(newChildren)
        this.parent = undefined
    }
}