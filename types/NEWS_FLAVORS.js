class NewsFlavor {
    constructor(name = '', symbol = '', color = COLORS.White) {
        this.name = name
        this.symbol = symbol
        this.color = color
    }
}

const NF = Object.freeze({
    ECONOMY: new NewsFlavor('Economy', '💰', COLORS.Gold),
    LABOR: new NewsFlavor('Labor', '⛏️', COLORS.LightGreen),
    POLITICS: new NewsFlavor('Politics', '🏛️', COLORS.Blue),
    MILITARY: new NewsFlavor('Military', '⚔️', COLORS.Red),
    SCIENCE: new NewsFlavor('Science', '🔬', COLORS.Green),
    CULTURE: new NewsFlavor('Civilization', '🎭', COLORS.Purple),
    UNREST: new NewsFlavor('Unrest', '✊', COLORS.Orange),
    PEACE: new NewsFlavor('Peace', '🕊️', COLORS.LightBlue),
    WAR: new NewsFlavor('War', '💥', COLORS.DarkRed),
    CRIME: new NewsFlavor('Crime', '🦹🏻‍♂️', COLORS.DarkYellow),
    EXPLORATION: new NewsFlavor('Exploration', '🪐', COLORS.Cyan),
    HEALTH_HAZARD: new NewsFlavor('Health Hazard', '☣️', COLORS.LightGray),
    RELIGION: new NewsFlavor('Religion', '⛪', COLORS.Brown),
    OPPRESSION: new NewsFlavor('Oppression', '🔒', COLORS.Gray),
    ESPIONAGE: new NewsFlavor('Espionage', '🕵️', COLORS.DarkGray),
})

const NF_ALL = Object.values(NF)