export default class BaseState {
    constructor() {

    }

    enter(baseParams?: Object) { }
    exit() { }
    update(dt: number) { }
    draw(ctx: CanvasRenderingContext2D) { }
}
