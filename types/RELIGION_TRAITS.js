/**
 * @fileoverview Defines religion traits that affect how religions behave and interact.
 * @module types/RELIGION_TRAITS
 */

/**
 * @class ReligionTrait
 * @classdesc Represents a trait that modifies religion behavior.
 * @property {string} name - The name of the trait.
 * @property {string} description - A description of the trait's effects.
 * @property {number[]} color - The color associated with the trait.
 * @constructor
 */
class ReligionTrait {
    constructor(name = '', description = '', color = COLORS.White) {
        this.name = name;
        this.description = description;
        this.color = color;
    }
}

const RELIGION_TRAITS = {
    ZEALOUS: new ReligionTrait(
        'Zealous',
        'Sends missionary fleets to convert non-believers. Increases religious fervor and conflicts.',
        COLORS.Red
    ),
    PACIFIST: new ReligionTrait(
        'Pacifist',
        'Abhors violence and promotes peace. Reduces military presence but increases culture.',
        COLORS.LightGreen
    ),
    MERCANTILE: new ReligionTrait(
        'Mercantile',
        'Emphasizes commerce and trade. Increases economy and merchant activity.',
        COLORS.Yellow
    ),
    ASCETIC: new ReligionTrait(
        'Ascetic',
        'Rejects material wealth. Reduces corruption and crime, but also reduces economy.',
        COLORS.Gray
    ),
    MYSTICAL: new ReligionTrait(
        'Mystical',
        'Embraces esoteric knowledge and hidden truths. Increases culture and education.',
        COLORS.Purple
    ),
    MILITANT: new ReligionTrait(
        'Militant',
        'Maintains armed holy orders. Increases army and sends crusader fleets against heretics.',
        COLORS.DarkRed
    ),
    SCHOLARLY: new ReligionTrait(
        'Scholarly',
        'Values education and knowledge preservation. Increases education and technology.',
        COLORS.Blue
    ),
    EXPANSIONIST: new ReligionTrait(
        'Expansionist',
        'Seeks to spread faith to new worlds. Increases colonist and missionary activity.',
        COLORS.Orange
    ),
    TRADITIONAL: new ReligionTrait(
        'Traditional',
        'Resists change and upholds ancient customs. Reduces crime but also reduces technology.',
        COLORS.Brown
    ),
    SYNCRETIC: new ReligionTrait(
        'Syncretic',
        'Absorbs elements from other faiths. Reduces religious conflicts and improves relations.',
        COLORS.LightGreen
    ),
    HIERARCHICAL: new ReligionTrait(
        'Hierarchical',
        'Maintains strict religious authority. Increases security and reduces crime.',
        COLORS.DarkBlue
    ),
    PROPHETIC: new ReligionTrait(
        'Prophetic',
        'Claims direct divine revelation. Increases prestige and charismatic leadership.',
        COLORS.LightOrange
    ),
    RITUALISTIC: new ReligionTrait(
        'Ritualistic',
        'Emphasizes ceremonial practices. Increases culture and tourism.',
        COLORS.Magenta
    ),
    INQUISITORIAL: new ReligionTrait(
        'Inquisitorial',
        'Hunts heretics and enforces orthodoxy. Sends inquisitor fleets and increases security.',
        COLORS.DarkGray
    ),
    CHARITABLE: new ReligionTrait(
        'Charitable',
        'Provides aid to the needy. Increases population happiness and reduces crime.',
        COLORS.Pink
    ),
    MATERIALIST: new ReligionTrait(
        'Materialist',
        'Focuses on the material world and scientific understanding. Increases technology and education.',
        COLORS.Gray
    ),
    RATIONALIST: new ReligionTrait(
        'Rationalist',
        'Values reason and logic over faith. Promotes critical thinking and scientific inquiry.',
        COLORS.LightGray
    ),
}

const RELIGION_TRAITS_ALL = Object.values(RELIGION_TRAITS)
