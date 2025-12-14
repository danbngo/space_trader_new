
const ENCOUNTER_RESULTS = Object.freeze({
    Victory: 'Victory',
    Defeat: 'Defeat',
    Surrendered: 'Surrendered',
    Escaped: 'Escaped'
})


const COMBAT_STRATEGIES = Object.freeze({
    AttackNearest: 'Attack Nearest',
})

const SHAPES = Object.freeze({
    FilledCircle: 'FilledCircle',
    EmptyCircle: 'EmptyCircle',
    Triangle: 'Triangle', //these tend to be rotated. starts pointing right, in line with radian chart
    Text: 'Text', //renders some text in monospace
    Line: 'Line'
})

const SKILLS = Object.freeze({
    Navigation: 'Navigation', //avoid bad encounters if desired
    Diplomacy: 'Diplomacy', //lowers prices in markets, shipyards etc.
    Engineering: 'Engineering', //your ships gain hull% during travel
    //Science: 'Science', //hmmm
    //Doctor: 'Doctor', //your officers gain health during travel - add this later w/ more officer-specific content
    //Leadership: 'Leadership' //lets you have more officers - would like a better system for this
})

const SKILLS_ALL = Object.values(SKILLS)