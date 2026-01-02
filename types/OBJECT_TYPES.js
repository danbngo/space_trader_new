class ObjectType {
    constructor(name = '') {
        this.name = name
    }
}

const OBJECT_TYPES = Object.freeze({
    PLANET: new ObjectType('Planet'),
    DWARF_PLANET: new ObjectType('Dwarf Planet'),
    MOON: new ObjectType('Moon'),
    SPACE_STATION: new ObjectType('Space Station'),
    ASTEROID_BELT: new ObjectType('Asteroid Belt'),
    ASTEROID: new ObjectType('Asteroid'),
    STAR: new ObjectType('Star'),
    ANOMALY: new ObjectType('Anomaly'),
    FLEET: new ObjectType('Fleet'),
    ABSTRACT: new ObjectType('Abstract'),
})