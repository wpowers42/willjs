import InputHandler from "../InputHandler";
import StateMachine from "../StateMachine";

import type enterParams from "../StateMachine";

export default class BaseState {

    static Params = enterParams;

    stateMachine: StateMachine | undefined;

    constructor() {
    }

    enter(params?: enterParams) { }
    exit() { }
    update(dt: number, inputHandler: InputHandler, stateMachine: StateMachine) { }
    draw(ctx: CanvasRenderingContext2D) { }
}
