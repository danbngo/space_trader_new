class NewsFlavor {
    constructor(name = '', symbol = '', color = COLORS.White, weight = 1) {
        this.name = name
        this.symbol = symbol
        this.color = color
        this.weight = weight;
    }
}

//aka NEWS_FLAVOR
const NF = Object.freeze({
    ECONOMY: new NewsFlavor('Economy', '💰', COLORS.Gold, 1),
    LABOR: new NewsFlavor('Labor', '⛏️', COLORS.LightGreen, 1),
    POLITICS: new NewsFlavor('Politics', '🏛️', COLORS.Blue, 3),
    GEOPOLITICS: new NewsFlavor('Geopolitics', '🌍', COLORS.DarkBlue, 10),
    MILITARY: new NewsFlavor('Military', '⚔️', COLORS.Red, 2),
    SCIENCE: new NewsFlavor('Science', '🔬', COLORS.Green, 1),
    CULTURE: new NewsFlavor('Civilization', '🎭', COLORS.Purple, 1),
    UNREST: new NewsFlavor('Unrest', '✊', COLORS.LightRed, 3),
    PEACE: new NewsFlavor('Peace', '🕊️', COLORS.LightBlue, 3),
    WAR: new NewsFlavor('War', '💥', COLORS.DarkRed, 50),
    CRIME: new NewsFlavor('Crime', '🦹🏻‍♂️', COLORS.DarkYellow, 2),
    EXPLORATION: new NewsFlavor('Exploration', '🪐', COLORS.DarkGreen, 1),
    HEALTH_HAZARD: new NewsFlavor('Health Hazard', '☣️', COLORS.LightGray, 2),
    DISASTER: new NewsFlavor('Disaster', '🌪️', COLORS.Orange, 4),
    RELIGION: new NewsFlavor('Religion', '⛪', COLORS.Brown, 2),
    OPPRESSION: new NewsFlavor('Oppression', '🔒', COLORS.Gray, 3),
    ESPIONAGE: new NewsFlavor('Espionage', '🕵️', COLORS.DarkGray, 2),
})

const NF_ALL = Object.values(NF)