class BuildingType {
    constructor(name = '', color = COLORS.White, illegal = false) {
        this.name = name
        this.color = color;
        this.illegal = illegal
    }
}

const BUILDING_TYPES = {
    SHIPYARD: new BuildingType('Shipyard', COLORS.LightGray, false),
    MARKET: new BuildingType('Market', COLORS.LightBlue, false),
    BANK: new BuildingType('Bank', COLORS.Yellow, false),
    BLACK_MARKET: new BuildingType('Black Market', COLORS.Red, true),
    GUILD: new BuildingType('Guild', COLORS.Purple, false),
    ACADEMY: new BuildingType('Academy', COLORS.Green, false),
    COURTHOUSE: new BuildingType('Court House', COLORS.Brown, false),
}
const BUILDING_TYPES_ALL = Object.values(BUILDING_TYPES)