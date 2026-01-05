class ObjectType {
    constructor(name = '', color = '#ffffff', symbol = '●', powerMultiplier = 0) {
        this.name = name
        this.color = color
        this.symbol = symbol
        this.powerMultiplier = powerMultiplier
    }
}

const OBJECT_TYPES = Object.freeze({
    PLANET: new ObjectType('Planet', '#4a9eff', '●', 1),
    DWARF_PLANET: new ObjectType('Dwarf Planet', '#8b7355', '◐', 0.2),
    MOON: new ObjectType('Moon', '#c0c0c0', '○', 0.1),
    SPACE_STATION: new ObjectType('Space Station', '#00ff00', '⊕', 0.05), //no news participation
    ASTEROID_BELT: new ObjectType('Asteroid Belt', '#8b8b8b', '∴'),
    ASTEROID: new ObjectType('Asteroid', '#6b5b4a', '◆'),
    STAR: new ObjectType('Star', '#ffff00', '★'),
    ANOMALY: new ObjectType('Anomaly', '#ff00ff', '?'),
    RUINS: new ObjectType('Ruins', '#8b8533', '□'),
    FLEET: new ObjectType('Fleet', '#ff4500', '▸'),
    ABSTRACT: new ObjectType('Abstract', '#ffffff', '·'),
})