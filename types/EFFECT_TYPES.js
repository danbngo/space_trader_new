/**
 * @class EffectType
 * @description Represents a type of effect that can be applied in the game.
 * @property {string} name - The name of the effect type.
 * @property {number[]} color - The color of the effect type as an RGBA tuple.
 * @property {SHAPES} shape - The shape of the effect type (from SHAPES enum).
 * @property {number} minSize - The minimum size of the effect.
 * @property {number} maxSize - The maximum size of the effect.
 * @property {number} minDuration - The minimum duration of the effect in turns.
 * @property {number} maxDuration - The maximum duration of the effect in turns.
 * @property {string} description - A brief description of the effect type.
 */

class EffectType {
    constructor(name = '', color = COLORS.White, shape, minSize = 1, maxSize = 1, minDuration = 1, maxDuration = 1, description = '') {
        this.name = name
        this.color = color
        this.shape = shape
        this.minSize = minSize
        this.maxSize = maxSize
        this.minDuration = minDuration
        this.maxDuration = maxDuration
        this.description = description
    }
}

const EFFECT_TYPES = Object.freeze({
    DEBRIS_CLOUD: new EffectType('Debris Cloud', [92,64,64,0.25], SHAPES.FilledOval, 20, 30, 3, 5, 'Reduces laser accuracy (incoming and outgoing) and damages hull over time.'),
    ICE_CLOUD: new EffectType('Ice Cloud', [64,64,92,0.25], SHAPES.FilledOval, 20, 30, 3, 5, 'Slows ships that enter it.'),
    ION_CLOUD: new EffectType('Ion Cloud', [92,92,64,0.25], SHAPES.FilledOval, 20, 30, 3, 5, 'Damages shields over time and prevents using ship modules.'),
    PLASMA_TRAIL: new EffectType('Plasma Trail', [255,165,0,0.25], SHAPES.FilledRectangle, 2, 2, 3, 5, 'Does damage to ships that touch it.'),
})
const EFFECT_TYPES_ALL = Object.values(EFFECT_TYPES)

