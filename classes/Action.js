class Action {
    constructor(actionType = ACTION_TYPES_ALL[0], actor = null, target = null, toX = 0, toY = 0, startX = 0, startY = 0) {
        this.actionType = actionType
        this.actor = actor
        this.target = target
        this.toX = toX !== undefined ? toX : target ? target.x : 0
        this.toY = toY !== undefined ? toY : target ? target.y : 0
        this.startX = startX !== undefined ? startX : actor ? actor.x : 0
        this.startY = startY !== undefined ? startY : actor ? actor.y : 0
    }
}