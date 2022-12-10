function benchmark() {
    const LOOPS = 2 ** 28;

    let multRes = [];
    let startMult = Date.now();
    for (let i = 0; i < LOOPS; i++) {
        multRes.push(Math.random() * 0.5);
    }
    let elapsedMult = Date.now() - startMult;

    let divRes = [];
    let startDiv = Date.now();
    for (let i = 0; i < LOOPS; i++) {
        divRes.push(Math.random() / 2.0);
    }
    let elapsedDiv = Date.now() - startDiv;

    let winner = elapsedMult <= elapsedDiv ? 'Mult' : 'Div';
    let delta = winner == 'Mult' ? elapsedMult / elapsedDiv - 1 : elapsedDiv / elapsedMult - 1;

    let msg = `Mult took ${elapsedMult}. Div took ${elapsedDiv}. `;
    msg += `${winner} was ${Math.round(delta * 100)} percent faster`;

    console.log(msg);
}
