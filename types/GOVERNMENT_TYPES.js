class GovernmentType {
    constructor(name = '', color = COLORS.White) {
        this.name = name
        this.color = color
    }
}

const GOVERNMENT_TYPES = {
    DEMOCRACY: new GovernmentType('Democracy', COLORS.LightBlue), //the boring, stable default
    COMMUNISM: new GovernmentType('Communism', COLORS.Red), //fleets and stores carry no CR, no merchants
    CORPORATISM: new GovernmentType('Corporatism', COLORS.Yellow), //all store fees doubled
    ARISTOCRACY: new GovernmentType('Aristocracy', COLORS.Purple),
    THEOCRACY: new GovernmentType('Theocracy', COLORS.White),
    POLICE_STATE: new GovernmentType('Police State', COLORS.Brown), //no pirates or smugglers
    PUPPET_STATE: new GovernmentType('Puppet State', COLORS.LightGray),
    ANARCHY: new GovernmentType('Anarchy', COLORS.Green), //no police or war fleets
}
const GOVERNMENT_TYPES_ALL = Object.values(GOVERNMENT_TYPES)