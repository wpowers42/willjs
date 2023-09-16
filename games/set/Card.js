export var Color;
(function (Color) {
    Color["RED"] = "RED";
    Color["GREEN"] = "GREEN";
    Color["PURPLE"] = "PURPLE";
})(Color || (Color = {}));
export var Shape;
(function (Shape) {
    Shape["DIAMOND"] = "DIAMOND";
    Shape["SQUIGGLE"] = "SQUIGGLE";
    Shape["OVAL"] = "OVAL";
})(Shape || (Shape = {}));
export var Fill;
(function (Fill) {
    Fill["EMPTY"] = "EMPTY";
    Fill["STRIPED"] = "STRIPED";
    Fill["SOLID"] = "SOLID";
})(Fill || (Fill = {}));
export var CardNumber;
(function (CardNumber) {
    CardNumber[CardNumber["ONE"] = 1] = "ONE";
    CardNumber[CardNumber["TWO"] = 2] = "TWO";
    CardNumber[CardNumber["THREE"] = 3] = "THREE";
})(CardNumber || (CardNumber = {}));
export class Card {
    constructor(color, shape, fill, cardNumber) {
        this.color = color;
        this.shape = shape;
        this.fill = fill;
        this.cardNumber = cardNumber;
    }
}
//# sourceMappingURL=Card.js.map