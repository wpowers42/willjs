export default class Audio {
    static PaddleHit = 1;
    static WallHit = 2;
    static Score = 3;

    paddleHit: HTMLAudioElement;
    score: HTMLAudioElement;
    wallHit: HTMLAudioElement;


    // Remove the duplicate declarations

    constructor() {
        // Add the 'this' keyword to assign the values to the class properties
        this.paddleHit = document.getElementById('paddleHitSound') as HTMLAudioElement;
        this.score = document.getElementById('scoreSound') as HTMLAudioElement;
        this.wallHit = document.getElementById('wallHitSound') as HTMLAudioElement;
    }

    play(event: number) {
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
