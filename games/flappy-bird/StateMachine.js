import BaseState from "./states/BaseState.js";
export default class StateMachine {
    constructor(states) {
        this.empty = new BaseState();
        this.states = {};
        this.current = this.empty;
        this.states = states || {};
    }
    change(stateName, enterParams) {
        this.current.exit();
        this.current = this.states[stateName]();
        this.current.enter(enterParams);
    }
    update(dt) {
        this.current.update(dt);
    }
    draw(ctx) {
        this.current.draw(ctx);
    }
}
//# sourceMappingURL=StateMachine.js.map