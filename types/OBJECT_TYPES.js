class ObjectType {
    constructor(name = '', color = '#ffffff', symbol = '●') {
        this.name = name
        this.color = color
        this.symbol = symbol
    }
}

const OBJECT_TYPES = Object.freeze({
    PLANET: new ObjectType('Planet', '#4a9eff', '●'),
    DWARF_PLANET: new ObjectType('Dwarf Planet', '#8b7355', '◐'),
    MOON: new ObjectType('Moon', '#c0c0c0', '○'),
    SPACE_STATION: new ObjectType('Space Station', '#00ff00', '⊕'),
    ASTEROID_BELT: new ObjectType('Asteroid Belt', '#8b8b8b', '∴'),
    ASTEROID: new ObjectType('Asteroid', '#6b5b4a', '◆'),
    STAR: new ObjectType('Star', '#ffff00', '★'),
    ANOMALY: new ObjectType('Anomaly', '#ff00ff', '?'),
    FLEET: new ObjectType('Fleet', '#ff4500', '▸'),
    ABSTRACT: new ObjectType('Abstract', '#ffffff', '·'),
})