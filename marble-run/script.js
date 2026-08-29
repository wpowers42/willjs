import RAPIER from "./vendor/rapier2d/rapier.es.js";
import {
  CUP,
  FIXED_STEP,
  MARBLE_RADIUS,
  MAX_TICKS,
  PIXELS_PER_METER,
  TRACKS,
  VIEW_HEIGHT,
  VIEW_WIDTH,
  createLevelWorld,
  evaluateMarble,
} from "./level.js";

const canvas = document.querySelector("#game");
const context = canvas.getContext("2d");
const status = document.querySelector("#status");
const playButton = document.querySelector("#play-button");
const resetButton = document.querySelector("#reset-button");
const timelineInput = document.querySelector("#timeline");
const timeOutput = document.querySelector("#time-output");

let world;
let marbleHandle;
let marbleBody;
let timeline = [];
let currentTick = 0;
let gameState = { goalReached: false, failed: false };
let isPlaying = false;
let accumulator = 0;
let previousTime = performance.now();

function toPixels(meters) {
  return meters * PIXELS_PER_METER;
}

function getMarbleBody() {
  const body = world.getRigidBody(marbleHandle);
  if (!body) throw new Error("The marble is missing from the restored world.");
  return body;
}

function recordSnapshot() {
  timeline[currentTick] = {
    physics: world.takeSnapshot(),
    gameState: { ...gameState },
  };
  timeline.length = currentTick + 1;
}

function restoreTick(tick, resetClock = true) {
  const snapshot = timeline[tick];
  if (!snapshot) return;

  world = RAPIER.World.restoreSnapshot(snapshot.physics);
  marbleBody = getMarbleBody();
  gameState = { ...snapshot.gameState };
  currentTick = tick;
  if (resetClock) accumulator = 0;
  updateInterface();
}

function pause() {
  isPlaying = false;
  accumulator = 0;
  updateInterface();
}

function advanceOneTick() {
  if (currentTick < timeline.length - 1) {
    restoreTick(currentTick + 1, false);
  } else {
    world.timestep = FIXED_STEP;
    world.step();
    currentTick += 1;
    gameState = evaluateMarble(marbleBody, currentTick);
    recordSnapshot();
  }

  if (gameState.goalReached || gameState.failed || currentTick >= MAX_TICKS) {
    pause();
  }
}

function togglePlayback() {
  if (isPlaying) {
    pause();
    return;
  }

  const atRecordedEnd = currentTick === timeline.length - 1;
  if (atRecordedEnd && (gameState.goalReached || gameState.failed)) return;

  isPlaying = true;
  accumulator = 0;
  updateInterface();
}

function resetTimeline() {
  const level = createLevelWorld(RAPIER);
  world = level.world;
  marbleHandle = level.marbleHandle;
  marbleBody = getMarbleBody();
  timeline = [];
  currentTick = 0;
  gameState = { goalReached: false, failed: false };
  isPlaying = false;
  accumulator = 0;
  recordSnapshot();
  updateInterface();
}

function statusMessage() {
  const currentSeconds = (currentTick * FIXED_STEP).toFixed(2);

  if (isPlaying) {
    return currentTick < timeline.length - 1 ? "Replaying the recorded future…" : "Recording the future…";
  }
  if (gameState.goalReached) return "Goal reached! Scrub backward to watch it again.";
  if (gameState.failed) return "Time ran out. Scrub backward to inspect the run.";
  if (currentTick === 0) return "Press Play to create the future.";
  if (currentTick < timeline.length - 1) return `Viewing the future at ${currentSeconds}s.`;
  return `Paused at ${currentSeconds}s. Drag the timeline to inspect the run.`;
}

function updateInterface() {
  const lastTick = Math.max(0, timeline.length - 1);
  timelineInput.max = String(lastTick);
  timelineInput.value = String(currentTick);
  timelineInput.disabled = isPlaying || lastTick === 0;
  timeOutput.value = `${(currentTick * FIXED_STEP).toFixed(2)}s / ${(lastTick * FIXED_STEP).toFixed(2)}s`;

  playButton.textContent = isPlaying ? "Ⅱ Pause" : "▶ Play";
  playButton.disabled =
    currentTick === lastTick && (gameState.goalReached || gameState.failed);
  resetButton.disabled = false;
  status.textContent = statusMessage();
}

function drawRoundedLine(x1, y1, x2, y2, width, color) {
  context.save();
  context.strokeStyle = color;
  context.lineWidth = width;
  context.lineCap = "round";
  context.lineJoin = "round";
  context.shadowColor = "rgb(28 75 104 / 18%)";
  context.shadowBlur = 8;
  context.shadowOffsetY = 5;
  context.beginPath();
  context.moveTo(toPixels(x1), toPixels(y1));
  context.lineTo(toPixels(x2), toPixels(y2));
  context.stroke();
  context.restore();
}

function drawBackground() {
  const gradient = context.createLinearGradient(0, 0, 0, VIEW_HEIGHT);
  gradient.addColorStop(0, "#caefff");
  gradient.addColorStop(0.72, "#e7f8ff");
  gradient.addColorStop(0.721, "#a9dc86");
  gradient.addColorStop(1, "#73be60");
  context.fillStyle = gradient;
  context.fillRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);

  context.fillStyle = "rgb(255 255 255 / 45%)";
  context.beginPath();
  context.arc(120, 92, 54, 0, Math.PI * 2);
  context.arc(174, 96, 70, 0, Math.PI * 2);
  context.arc(230, 98, 48, 0, Math.PI * 2);
  context.fill();
}

function drawSupports() {
  const supports = [
    { x: 1.15, top: 1.66, color: "#4bbd6f" },
    { x: 3.42, top: 2.31, color: "#7654bf" },
    { x: 4.9, top: 3.42, color: "#397ee8" },
    { x: 7.08, top: 4.05, color: "#e9425a" },
  ];

  supports.forEach((support) => {
    context.fillStyle = "rgb(113 77 174 / 54%)";
    context.fillRect(toPixels(support.x - 0.1), toPixels(support.top), 20, toPixels(5.72 - support.top));
    context.fillStyle = support.color;
    context.beginPath();
    context.ellipse(toPixels(support.x), 572, 34, 11, 0, 0, Math.PI * 2);
    context.fill();
  });
}

function drawStart() {
  context.save();
  context.fillStyle = "#ed3d59";
  context.beginPath();
  context.moveTo(56, 72);
  context.lineTo(152, 72);
  context.lineTo(132, 126);
  context.lineTo(78, 126);
  context.closePath();
  context.fill();
  context.strokeStyle = "#c62947";
  context.lineWidth = 10;
  context.lineCap = "round";
  context.beginPath();
  context.moveTo(52, 72);
  context.lineTo(156, 72);
  context.stroke();
  context.fillStyle = "#fff";
  context.font = "900 18px ui-rounded, sans-serif";
  context.textAlign = "center";
  context.fillText("START", 105, 55);
  context.restore();
}

function drawCup() {
  const left = toPixels(CUP.left);
  const right = toPixels(CUP.right);
  const rim = toPixels(CUP.rimY);
  const bottom = toPixels(CUP.bottomY);

  context.save();
  context.fillStyle = "rgb(240 76 53 / 82%)";
  context.strokeStyle = "#ce382b";
  context.lineWidth = 14;
  context.lineCap = "round";
  context.lineJoin = "round";
  context.beginPath();
  context.moveTo(left, rim);
  context.lineTo(left, bottom);
  context.lineTo(right, bottom);
  context.lineTo(right, rim);
  context.stroke();
  context.fillRect(left + 4, bottom - 14, right - left - 8, 14);
  context.fillStyle = "#173554";
  context.font = "900 19px ui-rounded, sans-serif";
  context.textAlign = "center";
  context.fillText("GOAL", (left + right) / 2, rim - 24);
  context.restore();
}

function drawMarble() {
  const position = marbleBody.translation();
  const x = toPixels(position.x);
  const y = toPixels(position.y);
  const radius = toPixels(MARBLE_RADIUS);
  const gradient = context.createRadialGradient(x - radius * 0.35, y - radius * 0.4, 2, x, y, radius);
  gradient.addColorStop(0, "#ffffff");
  gradient.addColorStop(0.2, "#ff8a9d");
  gradient.addColorStop(1, "#e22f50");

  context.save();
  context.shadowColor = "rgb(23 53 84 / 34%)";
  context.shadowBlur = 7;
  context.shadowOffsetY = 5;
  context.fillStyle = gradient;
  context.beginPath();
  context.arc(x, y, radius, 0, Math.PI * 2);
  context.fill();
  context.restore();
}

function drawPausedBadge() {
  if (isPlaying || currentTick === 0) return;
  context.save();
  context.fillStyle = "rgb(23 53 84 / 78%)";
  context.beginPath();
  context.roundRect(28, 518, 138, 50, 18);
  context.fill();
  context.fillStyle = "#fff";
  context.font = "900 20px ui-rounded, sans-serif";
  context.textAlign = "center";
  context.fillText("Ⅱ PAUSED", 97, 550);
  context.restore();
}

function draw() {
  context.clearRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);
  drawBackground();
  drawSupports();
  TRACKS.forEach((track) => {
    drawRoundedLine(track.x1, track.y1, track.x2, track.y2, toPixels(track.width), track.color);
  });
  drawStart();
  drawCup();
  drawMarble();
  drawPausedBadge();
}

function frame(now) {
  const elapsed = Math.min((now - previousTime) / 1000, 0.1);
  previousTime = now;

  if (isPlaying) {
    accumulator += elapsed;
    while (accumulator >= FIXED_STEP && isPlaying) {
      advanceOneTick();
      accumulator -= FIXED_STEP;
    }
    updateInterface();
  }

  draw();
  requestAnimationFrame(frame);
}

async function main() {
  await RAPIER.init();
  resetTimeline();

  playButton.addEventListener("click", togglePlayback);
  resetButton.addEventListener("click", resetTimeline);
  timelineInput.addEventListener("input", () => {
    const requestedTick = Number(timelineInput.value);
    pause();
    restoreTick(requestedTick);
  });

  playButton.disabled = false;
  resetButton.disabled = false;
  requestAnimationFrame(frame);
}

main().catch((error) => {
  console.error(error);
  status.textContent = "The timeline could not start.";
});
