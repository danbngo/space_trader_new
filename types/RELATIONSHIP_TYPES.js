class RelationshipType {
    constructor(name = '', color = COLORS.White) {
        this.name = name
        this.color = color
    }
}



const RELATIONSHIP_TYPES = Object.freeze({
    Ally: new RelationshipType('Ally', COLORS.LightGreen),
    Neutral: new RelationshipType('Neutral', COLORS.LightGray),
    Hostile: new RelationshipType('Hostile', COLORS.Yellow),
    War: new RelationshipType('War', COLORS.Red),
    Sovereign: new RelationshipType('Sovereign', COLORS.LightPurple),
    Subject: new RelationshipType('Subject', COLORS.DimGray),
})

