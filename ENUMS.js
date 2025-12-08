
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
    Dot: 'Dot', //always rendered as 1px by 1px
    FilledCircle: 'FilledCircle',
    EmptyCircle: 'EmptyCircle',
    Triangle: 'Triangle', //these tend to be rotated. starts pointing right, in line with radian chart
    Text: 'Text', //renders some text in monospace
    Line: 'Line'
})
