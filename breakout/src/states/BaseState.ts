import InputHandler from "../InputHandler";

export default class BaseState {
    constructor() {

    }

    enter(baseParams?: Object) { }
    exit() { }
    update(dt: number, inputHandler: InputHandler) { }
    draw(ctx: CanvasRenderingContext2D) { }
}
