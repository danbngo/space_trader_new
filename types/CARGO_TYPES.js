class CargoType {
    constructor(name = '', color = COLORS.White, value = 1, illegal = false) {
        this.name = name
        this.color = color;
        this.value = value
        this.illegal = illegal
    }
}

const CARGO_TYPES = {
    METAL: new CargoType('Metal', COLORS.LightGray, 100, false), //industry
    WATER: new CargoType('Water', COLORS.LightBlue, 200, false), //raw survival, famine, etc.
    ISOTOPES: new CargoType('Isotopes', COLORS.LightYellow, 400, false), //science, technological development
    NANITES: new CargoType('Nanites', COLORS.Gray, 200, false), //construction
    MEDICINE: new CargoType('Medicine', COLORS.Blue, 400, false), //plagues, wars, etc.
    HOLOCUBES: new CargoType('Holocubes', COLORS.Yellow, 800, false), //entertainment
    WEAPONS: new CargoType('Weapons', COLORS.Red, 400, true), //civil war, conflict
    DRUGS: new CargoType('Drugs', COLORS.Orange, 1600, true), //crime
    ANTIMATTER: new CargoType('Antimatter', COLORS.Purple, 800, true), //military
}
const CARGO_TYPES_ALL = Object.values(CARGO_TYPES)
