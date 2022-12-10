export default class BaseState {
    constructor() { }

    enter(enterParams: object) { }
    exit() { }
    update(dt: number) { }
    draw(ctx : CanvasRenderingContext2D) { }
}
