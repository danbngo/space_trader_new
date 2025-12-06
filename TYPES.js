class CargoType {
    constructor(id = '', name = '', value = 1, illegal = false) {
        this.id = id
        this.name = name
        this.value = value
        this.illegal = illegal
    }
}

const CARGO_TYPES = {
    METAL: new CargoType('metal', 'Metal', 100, false),
    ICE: new CargoType('ice', 'Ice', 200, false),
    ISOTOPES: new CargoType('isotopes', 'Isotopes', 400, false),
    NANITES: new CargoType('nanites', 'Nanites', 200, false),
    BIOGEL: new CargoType('biogel', 'Bio-gel', 400, false),
    HOLOCUBES: new CargoType('holocubes', 'Holocubes', 800, false),
    WEAPONS: new CargoType('weapons', 'Weapons', 400, true),
    CLONES: new CargoType('clones', 'Clones', 800, true),
    DRUGS: new CargoType('drugs', 'Drugs', 1600, true),
}
const CARGO_TYPES_ALL = Object.values(CARGO_TYPES)