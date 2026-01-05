class CivilizationRating {
    constructor(name = '', symbol = '', color = COLORS.White, description = '') {
        /** @type {string} */
        this.name = name
        /** @type {string} */
        this.symbol = symbol
        /** @type {number[]} */
        this.color = color
        /** @type {string} */
        this.description = description
        this.id = name.toLowerCase()
    }
}

const CIVILIZATION_RATINGS = {
    TERRITORY: new CivilizationRating('Territory', '🗺️', COLORS.Yellow, 'The territorial reach of the civilization in Astronomical Units (AUs).'),
    POPULATION: new CivilizationRating('Population', '👥', COLORS.White, 'Population factor affecting fleet sizes and officer availability.'),
    PRESTIGE: new CivilizationRating('Prestige', '⭐', COLORS.Yellow, 'Effects how planets interact with each other.'),
    SECURITY: new CivilizationRating('Security', '🛡️', COLORS.Blue, 'Rating affecting police and bounty hunter presence.'),
    INDUSTRY: new CivilizationRating('Industry', '🏭', COLORS.LightGray, 'Rating affecting merchants, miners, and ship availability.'),
    ECONOMY: new CivilizationRating('Economy', '💰', COLORS.Gold, 'Rating affecting merchants, smugglers, and market cargo availability.'),
    CULTURE: new CivilizationRating('Culture', '🎭', COLORS.Purple, 'Cultural development. More tourists and entertainment.'),
    TECHNOLOGY: new CivilizationRating('Technology', '🔬', COLORS.LightCyan, 'Quality rating of ships produced by this civilization.'),
    EDUCATION: new CivilizationRating('Education', '📚', COLORS.LightBlue, 'Quality rating of officers from this civilization. Affects academy training.'),
    CORRUPTION: new CivilizationRating('Corruption', '💸', COLORS.DarkGray, 'Higher rakes and transaction fees. Lower black market prices.'),
    CRIME: new CivilizationRating('Crime', '🔫', COLORS.Red, 'More crime events and black market activity.'),
    ARMY: new CivilizationRating('Army', '⚔️', COLORS.Red, 'More guild officers and army patrols.'),
    NAVY: new CivilizationRating('Navy', '🚀', COLORS.LightBlue, 'More shipyard ships and larger naval patrols.'),
    WEALTH: new CivilizationRating('Wealth', '💎', COLORS.Gold, 'Overall wealth of the civilization. Higher credits in stores.'),
    RESERVES: new CivilizationRating('Reserves', '📦', COLORS.Brown, 'Higher reserves means more goods in markets, but lower prices.'),
    //INFLATION: new CivilizationRating('Inflation', '📈', COLORS.Orange, 'Higher costs for everything but also higher sales prices in market.'),
    TAXES: new CivilizationRating('Taxes', '🏛️', COLORS.Green, 'Tax rate applied to most transactions (0 to MAX_TAX_RATE).'),
}

const CIVILIZATION_RATINGS_ALL = Object.freeze(Object.values(CIVILIZATION_RATINGS))