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

        Object.keys(this.sounds).forEach(sound => this.sounds[sound].volume = 0.20);
        
        this.sounds.music.loop = true;
        this.sounds.music.play();
    }
}
