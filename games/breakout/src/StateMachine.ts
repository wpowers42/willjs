import InputHandler from "./InputHandler";
import BaseState from "./states/BaseState.js";

export type enterParams = {
    [key: string]: any;
}

export default class StateMachine {
    private empty = new BaseState();
    private states: { [key: string]: () => any } = {};
    private current = this.empty;

    constructor(states: { [key: string]: () => any }) {
        this.states = states || {};
    }

    change(stateName: string, enterParams?: enterParams) {
        this.current.exit();
        this.current = this.states[stateName]();
        this.current.enter(enterParams);
    }

    update(dt: number, inputHandler: InputHandler) {
        this.current.update(dt, inputHandler, this);
    }

    draw(ctx: CanvasRenderingContext2D) {
        this.current.draw(ctx);
    }
}

