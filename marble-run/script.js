import RAPIER from "./vendor/rapier2d/rapier.es.js";
import {
  CUP,
  EDITABLE_TRACK,
  FIXED_STEP,
  MARBLE_RADIUS,
  MAX_TICKS,
  PIXELS_PER_METER,
  TRACKS,
  VIEW_HEIGHT,
  VIEW_WIDTH,
  createLevelWorld,
  editableTrackSegment,
  evaluateMarble,
  setEditableTrackAngle,
} from "./level.js";

const canvas = document.querySelector("#game");
const context = canvas.getContext("2d");
const playButton = document.querySelector("#play-button");
const resetButton = document.querySelector("#reset-button");

let world;
let marbleHandle;
let marbleBody;
let editableTrackHandle;
let editableTrackAngle = EDITABLE_TRACK.defaultAngle;
let isDraggingTrack = false;
let futurePath = [];
let actualPath = [];
let futurePathDirty = false;
let currentTick = 0;
let gameState = { goalReached: false, failed: false };
let runStarted = false;
let isPlaying = false;
let accumulator = 0;
let previousTime = performance.now();

function toPixels(meters) {
  return meters * PIXELS_PER_METER;
}

function getMarbleBody() {
  const body = world.getRigidBody(marbleHandle);
  if (!body) throw new Error("The marble is missing from the world.");
  return body;
}

function bodyPosition(body) {
  const position = body.translation();
  return { x: position.x, y: position.y };
}

function buildFuturePath() {
  const futureWorld = RAPIER.World.restoreSnapshot(world.takeSnapshot());
  const futureMarble = futureWorld.getRigidBody(marbleHandle);
  if (!futureMarble) throw new Error("The future marble is missing.");

  const positions = [bodyPosition(futureMarble)];
  let futureTick = 0;
  let futureState = { goalReached: false, failed: false };
  while (!futureState.goalReached && !futureState.failed && futureTick < MAX_TICKS) {
    futureWorld.timestep = FIXED_STEP;
    futureWorld.step();
    futureTick += 1;
    futureState = evaluateMarble(futureMarble, futureTick);
    positions.push(bodyPosition(futureMarble));
  }
  futurePath = positions;
  futurePathDirty = false;
}

function advanceOneTick() {
  world.timestep = FIXED_STEP;
  world.step();
  currentTick += 1;
  gameState = evaluateMarble(marbleBody, currentTick);
  actualPath.push(bodyPosition(marbleBody));

  if (gameState.goalReached || gameState.failed || currentTick >= MAX_TICKS) {
    isPlaying = false;
    accumulator = 0;
    updateInterface();
  }
}

function startPlayback() {
  if (runStarted || isDraggingTrack) return;
  runStarted = true;
  isPlaying = true;
  accumulator = 0;
  updateInterface();
}

function initializeRun(trackAngle) {
  const level = createLevelWorld(RAPIER);
  world = level.world;
  marbleHandle = level.marbleHandle;
  marbleBody = getMarbleBody();
  editableTrackHandle = level.editableTrackHandle;
  editableTrackAngle = trackAngle;
  setEditableTrackAngle(world, editableTrackHandle, editableTrackAngle);
  currentTick = 0;
  gameState = { goalReached: false, failed: false };
  runStarted = false;
  isPlaying = false;
  isDraggingTrack = false;
  futurePathDirty = false;
  accumulator = 0;
  actualPath = [bodyPosition(marbleBody)];
  buildFuturePath();
  updateInterface();
}

function resetRun() {
  initializeRun(EDITABLE_TRACK.defaultAngle);
}

function updateInterface() {
  const runFinished = gameState.goalReached || gameState.failed;
  playButton.textContent = isPlaying ? "Running…" : runFinished ? "✓ Finished" : "▶ Run";
  playButton.disabled = runStarted || isDraggingTrack;
  resetButton.disabled = false;
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

function drawEditableTrack() {
  const track = editableTrackSegment(editableTrackAngle);
  drawRoundedLine(track.x1, track.y1, track.x2, track.y2, toPixels(track.width), track.color);

  const handleX = toPixels(track.x2);
  const handleY = toPixels(track.y2);
  context.save();
  context.fillStyle = "#fff";
  context.strokeStyle = "#dc5926";
  context.lineWidth = 7;
  context.beginPath();
  context.arc(handleX, handleY, 18, 0, Math.PI * 2);
  context.fill();
  context.stroke();
  context.fillStyle = "#dc5926";
  context.beginPath();
  context.arc(handleX, handleY, 5, 0, Math.PI * 2);
  context.fill();
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

function drawDottedPath(path, color) {
  if (path.length < 2) return;
  context.save();
  context.strokeStyle = color;
  context.lineWidth = 3;
  context.lineCap = "round";
  context.setLineDash([2, 7]);
  context.beginPath();
  context.moveTo(toPixels(path[0].x), toPixels(path[0].y));
  for (let index = 2; index < path.length; index += 2) {
    context.lineTo(toPixels(path[index].x), toPixels(path[index].y));
  }
  const finalPosition = path[path.length - 1];
  context.lineTo(toPixels(finalPosition.x), toPixels(finalPosition.y));
  context.stroke();
  context.restore();
}

function drawPaths() {
  drawDottedPath(futurePath, "rgb(36 113 184 / 72%)");
  drawDottedPath(actualPath, "rgb(224 79 67 / 82%)");
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

  context.save();
  context.translate(x, y);
  context.rotate(marbleBody.rotation());
  context.beginPath();
  context.arc(0, 0, radius - 1, 0, Math.PI * 2);
  context.clip();
  context.strokeStyle = "rgb(255 255 255 / 72%)";
  context.lineWidth = 4;
  context.lineCap = "round";
  context.beginPath();
  context.moveTo(-radius * 0.9, -radius * 0.2);
  context.bezierCurveTo(
    -radius * 0.35,
    -radius * 0.75,
    radius * 0.3,
    radius * 0.75,
    radius * 0.9,
    radius * 0.18,
  );
  context.stroke();
  context.fillStyle = "rgb(153 25 62 / 70%)";
  context.beginPath();
  context.arc(radius * 0.48, -radius * 0.28, radius * 0.13, 0, Math.PI * 2);
  context.fill();
  context.restore();
}

function draw() {
  context.clearRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);
  drawBackground();
  drawSupports();
  TRACKS.forEach((track) => {
    drawRoundedLine(track.x1, track.y1, track.x2, track.y2, toPixels(track.width), track.color);
  });
  drawEditableTrack();
  drawStart();
  drawCup();
  drawPaths();
  drawMarble();
}

function pointerPosition(event) {
  const bounds = canvas.getBoundingClientRect();
  return {
    x: ((event.clientX - bounds.left) * VIEW_WIDTH) / bounds.width / PIXELS_PER_METER,
    y: ((event.clientY - bounds.top) * VIEW_HEIGHT) / bounds.height / PIXELS_PER_METER,
  };
}

function beginTrackDrag(event) {
  const pointer = pointerPosition(event);
  const track = editableTrackSegment(editableTrackAngle);
  if (Math.hypot(pointer.x - track.x2, pointer.y - track.y2) > 0.55) return;

  if (runStarted) initializeRun(editableTrackAngle);
  isDraggingTrack = true;
  futurePathDirty = true;
  updateInterface();
  canvas.setPointerCapture(event.pointerId);
  canvas.style.cursor = "grabbing";
  event.preventDefault();
}

function moveTrack(event) {
  if (!isDraggingTrack) return;
  const pointer = pointerPosition(event);
  const angle = Math.atan2(pointer.y - EDITABLE_TRACK.y1, pointer.x - EDITABLE_TRACK.x1);
  editableTrackAngle = Math.max(EDITABLE_TRACK.minAngle, Math.min(EDITABLE_TRACK.maxAngle, angle));
  setEditableTrackAngle(world, editableTrackHandle, editableTrackAngle);
  futurePathDirty = true;
  event.preventDefault();
}

function finishTrackDrag(event) {
  if (!isDraggingTrack) return;
  isDraggingTrack = false;
  if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
  canvas.style.cursor = "default";
  buildFuturePath();
  updateInterface();
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

  if (isDraggingTrack && futurePathDirty) buildFuturePath();
  draw();
  requestAnimationFrame(frame);
}

async function main() {
  await RAPIER.init();
  resetRun();

  playButton.addEventListener("click", startPlayback);
  resetButton.addEventListener("click", resetRun);
  canvas.addEventListener("pointerdown", beginTrackDrag);
  canvas.addEventListener("pointermove", moveTrack);
  canvas.addEventListener("pointerup", finishTrackDrag);
  canvas.addEventListener("pointercancel", finishTrackDrag);

  playButton.disabled = false;
  resetButton.disabled = false;
  requestAnimationFrame(frame);
}

main().catch((error) => {
  console.error(error);
  playButton.textContent = "Unavailable";
});
