export enum Color {
    RED = 'RED',
    GREEN = 'GREEN',
    PURPLE = 'PURPLE'
}

export enum Shape {
    DIAMOND = 'DIAMOND',
    SQUIGGLE = 'SQUIGGLE',
    OVAL = 'OVAL'
}

export enum Fill {
    EMPTY = 'EMPTY',
    STRIPED = 'STRIPED',
    SOLID = 'SOLID'
}

export enum CardNumber {
    ONE = 1,
    TWO = 2,
    THREE = 3
}

export class Card {
    constructor(
        public color: Color,
        public shape: Shape,
        public fill: Fill,
        public cardNumber: CardNumber
    ) { }
}
