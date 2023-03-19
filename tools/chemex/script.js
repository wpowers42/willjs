// --------------
// ELEMENTS SETUP
// --------------
const coffeeGramsElement = document.getElementById('coffee-grams');
const waterCoffeeRatioElement = document.getElementById('water-coffee-ratio');
const waterTotalElement = document.getElementById('water-total');
const waterBloomElement = document.getElementById('water-bloom');
const timerButton = document.getElementById('timer-button');
const timerBloom = document.getElementById('timer-bloom');
const timerBrew = document.getElementById('timer-brew');
const timerTotal = document.getElementById('timer-total');

// -------------------
// CONSTANTS AND VALUES
// -------------------
const BLOOM_TIME_MS = 45000;
let coffeeGrams = 40;
let waterCoffeeRatio = 16.7;

// -----------------------
// WATER CALCULATION HELPERS
// -----------------------
const calculateTotalWater = () => {
    return `${parseInt(coffeeGrams * waterCoffeeRatio)} ml`;
}

const calculateBloomWater = () => {
    const lower = parseInt(coffeeGrams * 1.5);
    const upper = parseInt(coffeeGrams * 2.0);
    return `${lower} - ${upper} ml`;
}

// -----------------
// HTML UPDATING METHOD
// -----------------
const updateHTML = () => {
    coffeeGramsElement.textContent = `${coffeeGrams}g`;
    waterCoffeeRatioElement.textContent = waterCoffeeRatio;
    waterTotalElement.textContent = calculateTotalWater();
    waterBloomElement.textContent = calculateBloomWater();
};

// ----------------------
// EVENT LISTENERS FOR COFFEE GRAMS
// ----------------------
for (const child of coffeeGramsElement.parentNode.children) {
    if (child.tagName === 'BUTTON') {
        child.addEventListener('click', () => {
            coffeeGrams += parseInt(child.getAttribute('data-value'));
            updateHTML();
        });
    }
}

// ----------------------------
// EVENT LISTENERS FOR WATER COFFEE RATIO
// ----------------------------
for (const child of waterCoffeeRatioElement.parentNode.children) {
    if (child.tagName === 'BUTTON') {
        child.addEventListener('click', () => {
            waterCoffeeRatio += parseInt(child.getAttribute('data-value')) * 0.1;
            waterCoffeeRatio = Math.round(waterCoffeeRatio * 10) / 10;
            updateHTML();
        });
    }
}

// -----------------
// BEEP SOUND FUNCTION
// -----------------
const playBeep = (volume = 1) => {
    const beepSound = document.getElementById('beep');
    beepSound.currentTime = 0;
    beepSound.volume = volume;
    beepSound.play();
};


// ----------------
// TIMER MANAGEMENT
// ----------------
let timerLabel = 'Start';
let timerStartedAt = null;
let timerStoppedAt = null;
let timerInterval = null;
let bloomBeeped = false;

// Resets the timers' states
const resetTimers = () => {
    timerStartedAt = null;
    timerStoppedAt = null;
    bloomBeeped = false;
    timerBloom.textContent = `${parseInt(BLOOM_TIME_MS / 1000)}s`;
    timerBrew.textContent = '0s';
    timerTotal.textContent = '0s';
    timerBloom.parentElement.classList.add('inactive');
    timerBrew.parentElement.classList.add('inactive');
    timerTotal.parentElement.classList.add('inactive');
}

// Updates the timers' values
const updateTimers = () => {
    const now = timerStoppedAt ? timerStoppedAt : performance.now();
    const elapsedMilliseconds = now - timerStartedAt;
    const bloom = Math.ceil(Math.max((BLOOM_TIME_MS - elapsedMilliseconds) / 1000, 0));
    const brew = Math.floor(Math.max((elapsedMilliseconds - BLOOM_TIME_MS) / 1000, 0));
    timerBloom.textContent = `${bloom}s`;
    timerBrew.textContent = `${brew}s`;
    timerTotal.textContent = `${parseInt(elapsedMilliseconds / 1000)}s`
    if (bloom > 0) {
        timerBloom.parentElement.classList.remove('inactive');
    } else {
        if (!bloomBeeped) {
            playBeep(1);
            bloomBeeped = true;
        }
        timerBloom.parentElement.classList.add('inactive');
        timerBrew.parentElement.classList.remove('inactive');
    }
}

// ----------------------
// TIMER BUTTON EVENT LISTENER
// ----------------------
const handleTimerButtonClick = () => {
    if (timerLabel === 'Start') {
        playBeep(0); // the subsequent beeps don't play without this
        timerStartedAt = performance.now();
        timerLabel = 'Stop';
        timerInterval = setInterval(updateTimers, 50);
    } else if (timerLabel === 'Stop') {
        timerStoppedAt = performance.now();
        clearInterval(timerInterval);
        timerBloom.parentElement.classList.add('inactive');
        timerBrew.parentElement.classList.add('inactive');
        timerTotal.parentElement.classList.remove('inactive');
        timerLabel = 'Reset';
    } else {
        resetTimers();
        timerLabel = 'Start';
    }
    timerButton.textContent = timerLabel;
};

timerButton.addEventListener('click', handleTimerButtonClick);
// timerButton.addEventListener('touchend', handleTimerButtonClick);

// -----------------
// INITIALIZE THE APP
// -----------------
updateHTML();
resetTimers();

