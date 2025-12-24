class StatusEffect {
    constructor(name = '', description = '', color = COLORS.WHITE) {
        this.name = name
        this.description = description
        this.color = color
    }
}

const STATUS_EFFECTS = Object.freeze({
    DUSTY: new StatusEffect('Dusty', 'reduces chance to hit and also to be hit by lasers specifically, take some hull damage over time', COLORS.Brown),
    FROZEN: new StatusEffect('Frozen', 'reduces movement range and cannot ram', COLORS.LightBlue),
    IONIZED: new StatusEffect('Ionized', 'prevents use of ship modules and take some shield damage over time', COLORS.Yellow),
    OVERHEATED: new StatusEffect('Overheated', 'take some damage over time (first shield then hull if no shields left) and cannot recharge shields', COLORS.Orange),
    CLOAKED: new StatusEffect('Cloaked', 'cannot be seen or targeted until decloaked', COLORS.Gray),
})

const STATUS_EFFECTS_ALL = Object.values(STATUS_EFFECTS)