class CargoType {
    constructor(name = '', value = 1, illegal = false) {
        this.name = name
        this.value = value
        this.illegal = illegal
    }
}

const CARGO_TYPES = {
    METAL: new CargoType('Metal', 100, false),
    ICE: new CargoType('Ice', 200, false),
    ISOTOPES: new CargoType('Isotopes', 400, false),
    NANITES: new CargoType('Nanites', 200, false),
    BIOGEL: new CargoType('Bio-gel', 400, false),
    HOLOCUBES: new CargoType('Holocubes', 800, false),
    WEAPONS: new CargoType('Weapons', 400, true),
    CLONES: new CargoType('Clones', 800, true),
    DRUGS: new CargoType('Drugs', 1600, true),
}
const CARGO_TYPES_ALL = Object.values(CARGO_TYPES)
