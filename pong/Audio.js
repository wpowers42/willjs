export default class Audio {
    static PaddleHit = 1;
    static WallHit = 2;
    static Score = 3;

    constructor() {
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
