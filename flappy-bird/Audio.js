export default class Audio {
    constructor() {
        this.sounds = {
            jump: document.getElementById('jumpSound'),
            explosion: document.getElementById('explosionSound'),
            hurt: document.getElementById('hurtSound'),
            score: document.getElementById('scoreSound'),
            music: document.getElementById('musicSound'),
        };
        this.sounds.music.loop = true;
        this.sounds.music.muted = true;
        this.sounds.music.volume = 0.2;
        this.sounds.music.play();
    }
}
//# sourceMappingURL=Audio.js.map