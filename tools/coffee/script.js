const coffeeValueBox = document.querySelector(".coffee-input-value");
const ratioSelection = document.getElementsByName("ratio");
const waterOutput = document.querySelector(".water-output-value");
const timer = document.getElementById("timer");
const startStopButton = document.getElementById("start-stop-button");
const resetButton = document.getElementById("reset-button");
const presetButtons = document.querySelectorAll(".preset-button");
const incrementButton = document.querySelector(".increment-button");
const decrementButton = document.querySelector(".decrement-button");

let coffeeValue = 0;
let ratioValue = 0;

// Helper function to format time as M:SS
function formatTime(time) {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
}

// Calculate water output
function calculateWaterOutput() {
    const water = coffeeValue * ratioValue;
    waterOutput.innerText = water;
}


// Handle ratio selection change
for (let i = 0; i < ratioSelection.length; i++) {
    ratioSelection[i].addEventListener("change", () => {
        ratioValue = Number(ratioSelection[i].value);
        calculateWaterOutput();
    });
}

// Handle preset button click
presetButtons.forEach(button => {
    button.addEventListener("click", () => {
        presetButtons.forEach(button => button.classList.remove("selected"));
        button.classList.add("selected");
        coffeeValue = Number(button.value);
        coffeeValueBox.textContent = coffeeValue;
        calculateWaterOutput();
    });
});

// Handle increment button click
incrementButton.addEventListener("click", () => {
    coffeeValue++;
    if (coffeeValue > 100) {
        coffeeValue = 100;
    }
    coffeeValueBox.textContent = coffeeValue;
    calculateWaterOutput();
});

// Handle decrement button click
decrementButton.addEventListener("click", () => {
    coffeeValue--;
    if (coffeeValue < 1) {
        coffeeValue = 1;
    }
    coffeeValueBox.textContent = coffeeValue;
    calculateWaterOutput();
});


// Play beep sound when timer hits 45 seconds
function playBeep() {
    const audio = new Audio("beep.mp3");
    audio.play();
}

// Handle start/stop button click
let timerId = null;
let startTime = 0;
startStopButton.addEventListener("click", () => {
    if (startStopButton.innerText === "Start") {
        startStopButton.innerText = "Stop";
        if (timerId === null) {
            startTime = Date.now();
            timerId = setInterval(() => {
                const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
                if (elapsedSeconds <= 599) {
                    timer.innerText = formatTime(elapsedSeconds);
                    if (elapsedSeconds === 45) {
                        playBeep();
                    }
                } else {
                    clearInterval(timerId);
                    timerId = null;
                    startStopButton.innerText = "Start";
                }
            }, 1000);
        }
    } else {
        startStopButton.innerText = "Start";
        clearInterval(timerId);
        timerId = null;
    }
});

// Handle reset button click
resetButton.addEventListener("click", () => {
    startStopButton.innerText = "Start";
    clearInterval(timerId);
    timerId = null;
    timer.innerText = "0:00";
});


// Initialize UI
presetButtons[0].click();
ratioSelection[1].click();
ratioSelection[2].click();
calculateWaterOutput();
