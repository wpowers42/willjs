export default class Audio {
    sounds: { [key: string]: HTMLAudioElement };

    constructor() {
        this.sounds = {
            jump: <HTMLAudioElement>document.getElementById('jumpSound'),
            explosion: <HTMLAudioElement>document.getElementById('explosionSound'),
            hurt: <HTMLAudioElement>document.getElementById('hurtSound'),
            score: <HTMLAudioElement>document.getElementById('scoreSound'),
            music: <HTMLAudioElement>document.getElementById('musicSound'),
        }

        this.sounds.music.loop = true;
        this.sounds.music.muted = true;
        this.sounds.music.volume = 0.2;
        this.sounds.music.play();
    }
}
