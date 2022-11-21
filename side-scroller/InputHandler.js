const ARROW_INPUTS = ['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'];
const ENTER_INPUTS = ['Enter'];
const TOUCH_INPUTS = ['SwipeUp','SwipeDown'];

class InputHandler {
    constructor() {
        this.keys = [];
        this.startPageY = undefined;
        this.touchThreshold = 30;

        window.addEventListener('keydown', e => {
            // arrow functions inherit 'this' from their parent
            if (ARROW_INPUTS.indexOf(e.key) > -1 &&
                this.keys.indexOf(e.key) === -1) {
                this.keys.push(e.key);
            } else if (ENTER_INPUTS.indexOf(e.key) > -1 && gameOver) {
                restartGame();
            }
        });
        window.addEventListener('keyup', e => {
            // arrow functions inherit 'this' from their parent
            if (ARROW_INPUTS.indexOf(e.key) >= 0 &&
                this.keys.indexOf(e.key) >= 0) {
                this.keys.splice(this.keys.indexOf(e.key), 1);
            }
        });
        window.addEventListener('touchstart', e => {
            this.startPageY = e.touches[0].pageY;
        });
        window.addEventListener('touchmove', e => {
            let pageY = e.touches[0].pageY;
            if (this.startPageY - pageY > this.touchThreshold &&
                this.keys.indexOf('SwipeUp') === -1) {
                this.keys.push('SwipeUp');
            } else if (pageY - this.startPageY > this.touchThreshold &&
                this.keys.indexOf('SwipeDown') === -1) {
                this.keys.push('SwipeDown');
                gameOver && restartGame(); // onyl restart game if gameOver
            }
            console.log(this.keys);
        });
        window.addEventListener('touchend', e => {
            this.keys = this.keys.filter(key => TOUCH_INPUTS.indexOf(key) === -1);
            this.startPageY = undefined;
            console.log(this.keys);
        });
    }
}
