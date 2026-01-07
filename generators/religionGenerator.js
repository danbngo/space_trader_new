/**
 * Available symbols for religions. Will be assigned to religions as they are generated.
 */
const RELIGION_SYMBOLS = [
    '✦', '☨', '✡', '☪', '☸', '☯', '✚', '⛤', '⛧', '☥',
    '♰', '☩', '♱', '✟', '⚛', '☬', '🕉', '⛏', '⚕', '☀',
    '🌙', '⭐', '✶', '✴', '✵', '✷', '✸', '❂', '✹', '❋',
    '✺', '✻', '✼', '❃', '❊', '❉', '🔱', '⚜', '☄', '💫'
];

/**
 * Tracks which symbols have been used for religions.
 */
let usedReligionSymbols = [];

/**
 * Gets an unused religion symbol from the available list.
 * @returns {string} An unused symbol, or a random one if all are used.
 */
function getUnusedReligionSymbol() {
    const available = RELIGION_SYMBOLS.filter(s => !usedReligionSymbols.includes(s));
    if (available.length === 0) {
        // All symbols used, just return a random one
        return rndMember(RELIGION_SYMBOLS);
    }
    const symbol = rndMember(available);
    usedReligionSymbols.push(symbol);
    return symbol;
}

/**
 * Generates a procedural name for a religion.
 * @returns {string} The generated religion name.
 */
function generateReligionName() {
    const oneWordNames = [
        'Voidism', 'Cosmism', 'Nexism', 'Lumism', 'Stellarism',
        'Unitarians', 'Singularians', 'Cyclists', 'Harmonics', 'Transcendents',
        'Eternalists', 'Geometrists', 'Quantumists', 'Architects', 'Reasonists'
    ];
    
    const mashupPrefixes = ['Cos', 'Void', 'Star', 'Lum', 'Nex', 'Uni', 'Quan', 'Eter', 'Cel', 'Arch'];
    const mashupSuffixes = ['ism', 'ites', 'ians', 'ists', 'os', 'ix', 'ar', 'on'];
    
    const roll = Math.random();
    
    if (roll < 0.5) {
        // 50% single word
        return rndMember(oneWordNames);
    } else {
        // 50% mashup word
        return rndMember(mashupPrefixes) + rndMember(mashupSuffixes);
    }
}

/**
 * Generates a religion with random traits and color.
 * @returns {Religion} The generated religion.
 */
function generateReligion() {
    const name = generateReligionName();
    
    // Generate 1-3 random traits
    const numTraits = rng(3, 1);
    const availableTraits = [...RELIGION_TRAITS_ALL];
    const traits = [];
    
    for (let i = 0; i < numTraits && availableTraits.length > 0; i++) {
        const traitIndex = rng(availableTraits.length - 1, 0);
        traits.push(availableTraits[traitIndex]);
        availableTraits.splice(traitIndex, 1); // Remove to avoid duplicates
    }
    
    // Generate a color (prefer brighter colors for religions)
    const colorChoices = [
        COLORS.White, COLORS.Yellow, COLORS.LightMagenta, COLORS.Magenta,
        COLORS.LightGreen, COLORS.LightBlue, COLORS.Orange, COLORS.Purple,
        COLORS.Pink, COLORS.LightOrange, hexToRgba('#gold'), hexToRgba('#silver')
    ];
    
    const color = rndMember(colorChoices);
    const symbol = getUnusedReligionSymbol();
    
    return new Religion(name, traits, color, symbol);
}

/**
 * Generates multiple religions for the star system.
 * @param {number} count - Number of religions to generate (default 2-4).
 * @returns {Religion[]} Array of generated religions.
 */
function generateReligions(count = rng(4, 2)) {
    // Reset used symbols for new system generation
    usedReligionSymbols = [];
    
    // Always include ATHEISM
    const religions = [RELIGION_ATHEISM];
    
    // Generate additional random religions
    for (let i = 0; i < count; i++) {
        religions.push(generateReligion());
    }
    return religions;
}
