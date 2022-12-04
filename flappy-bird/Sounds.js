export default class Sounds {
    constructor() {
        this.sounds = {
            jump: document.getElementById('jumpSound'),
            explosion: document.getElementById('explosionSound'),
            hurt: document.getElementById('hurtSound'),
            score: document.getElementById('scoreSound'),
            music: document.getElementById('musicSound'),
        };
        this.sounds.music.loop = true;
        this.sounds.music.volume = 0.2;
        this.sounds.music.play();
    }
}
//# sourceMappingURL=Sounds.js.map