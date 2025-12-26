class Government {
    constructor(name = '', color = COLORS.White) {
        this.name = name
        this.color = color
    }
}

const GOVERNMENT_TYPES = {
    DEMOCRACY: new Government('Democracy', COLORS.LightBlue), //the boring, stable default
    COMMUNISM: new Government('Communism', COLORS.Red), //fleets and stores carry no CR, no merchants
    CORPORATISM: new Government('Corporatism', COLORS.Yellow), //all store fees doubled
    ARISTOCRACY: new Government('Aristocracy', COLORS.Purple),
    THEOCRACY: new Government('Theocracy', COLORS.White),
    POLICE_STATE: new Government('Police State', COLORS.Brown), //no pirates or smugglers
    PUPPET_STATE: new Government('Puppet State', COLORS.LightGray),
    ANARCHY: new Government('Anarchy', COLORS.Green), //no police or war fleets
}
const GOVERNMENT_TYPES_ALL = Object.values(GOVERNMENT_TYPES)