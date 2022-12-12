// constants.ts

import { Util } from "./Util.js";

export namespace Constants {
    export const canvasWidth = 1280;
    export const canvasHeight = 720;
    export const virtualWidth = 432;
    export const virtualHeight = 243;
    export const paddleSpeed = 0.20;
    export const FPS = 120;
    export const debug = true;

    export const fonts: { [key: string]: string } = {
        small: '8px Copperplate',
        medium: '16px Copperplate',
        large: '32px Copperplate',
    }

    export const textures: { [key: string]: HTMLImageElement } = {
        arrows: <HTMLImageElement>document.getElementById('arrows-image'),
        background: <HTMLImageElement>document.getElementById('background-image'),
        blocks: <HTMLImageElement>document.getElementById('blocks-image'),
        hearts: <HTMLImageElement>document.getElementById('hearts-image'),
        particle: <HTMLImageElement>document.getElementById('particle-image'),
        main: <HTMLImageElement>document.getElementById('main-image'),
    }

    // define the sounds
    export const sounds = {
        brickHit1: <HTMLAudioElement>document.getElementById('brick-hit-1-sound'),
        brickHit2: <HTMLAudioElement>document.getElementById('brick-hit-2-sound'),
        confirm: <HTMLAudioElement>document.getElementById('confirm-sound'),
        highScore: <HTMLAudioElement>document.getElementById('high-score-sound'),
        hurt: <HTMLAudioElement>document.getElementById('hurt-sound'),
        music: <HTMLAudioElement>document.getElementById('music-sound'),
        noSelect: <HTMLAudioElement>document.getElementById('no-select-sound'),
        paddleHit: <HTMLAudioElement>document.getElementById('paddle-hit-sound'),
        pause: <HTMLAudioElement>document.getElementById('pause-sound'),
        recover: <HTMLAudioElement>document.getElementById('recover-sound'),
        score: <HTMLAudioElement>document.getElementById('score-sound'),
        select: <HTMLAudioElement>document.getElementById('select-sound'),
        victory: <HTMLAudioElement>document.getElementById('victory-sound'),
        wallHit: <HTMLAudioElement>document.getElementById('wall-hit-sound'),
    }

    Object.keys(sounds).forEach(sound => sounds[sound].volume = 0.20);

    export const frames = {
        paddles: <Util.Quad[]>Util.generateQuadsPaddles(textures.main),
        balls: <Util.Quad[]>Util.generateQuadsBalls(textures.main),
        bricks: <Util.Quad[]>Util.generateQuadsBricks(textures.main),
        hearts: <Util.Quad[]>Util.generateQuads(textures.hearts, 10, 9),
        arrows: <Util.Quad[]>Util.generateQuads(textures.arrows, 24, 24),
    }
}
