export default class Audio {

    constructor() {
        this.sounds = {
            jump: document.getElementById('jumpSound'),
            explosion: document.getElementById('explosionSound'),
            hurt: document.getElementById('hurtSound'),
            score: document.getElementById('scoreSound'),
            music: document.getElementById('musicSound'),
        }

        Object.keys(this.sounds).forEach(sound => this.sounds[sound].volume = 0.20);

        this.sounds.music.loop = true;
        this.sounds.music.play();
    }

    play(sound) {
        this.sounds[sound].play();
    }
}