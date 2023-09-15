class Audio {
    // Remove the duplicate declarations
    constructor() {
        // Add the 'this' keyword to assign the values to the class properties
        this.paddleHit = document.getElementById('paddleHitSound');
        this.score = document.getElementById('scoreSound');
        this.wallHit = document.getElementById('wallHitSound');
    }
    play(event) {
        switch (event) {
            case Audio.PaddleHit:
                this.paddleHit.play();
                break;
            case Audio.WallHit:
                this.wallHit.play();
                break;
            case Audio.Score:
                this.score.play();
                break;
        }
    }
}
Audio.PaddleHit = 1;
Audio.WallHit = 2;
Audio.Score = 3;
export default Audio;
//# sourceMappingURL=Audio.js.map