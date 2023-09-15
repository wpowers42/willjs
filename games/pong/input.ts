export type keyPresses = { [key: string]: number };

export default class InputHandler {
    keyPresses: keyPresses;

    constructor() {
        this.keyPresses = {
            'Enter': 0,
            'w': 0,
            's': 0,
            'ArrowUp': 0,
            'ArrowDown': 0,
        };

        window.addEventListener('keydown', e => {
            this.keyPresses[e.key] = 1;
        });
        window.addEventListener('keyup', e => {
            this.keyPresses[e.key] = 0;
        });
    }

}
