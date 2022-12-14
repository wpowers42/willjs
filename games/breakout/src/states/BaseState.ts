import InputHandler from "../InputHandler";
import StateMachine from "../StateMachine";

export default class BaseState {
    stateMachine: StateMachine;

    constructor() { }

    enter(params?: Object) { }
    exit() { }
    update(dt: number, inputHandler: InputHandler, stateMachine: StateMachine) { }
    draw(ctx: CanvasRenderingContext2D) { }
}
