import InputHandler from "../InputHandler.js";
import StateMachine from "../StateMachine.js";

import type { enterParams } from "../StateMachine";

export default class BaseState {

    constructor() {
    }

    enter(params: enterParams) { }
    exit() { }
    update(dt: number, inputHandler: InputHandler, stateMachine: StateMachine) { }
    draw(ctx: CanvasRenderingContext2D) { }
}
