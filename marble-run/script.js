(() => {
  "use strict";

  const { Bodies, Body, Composite, Engine, Sleeping } = Matter;

  const canvas = document.querySelector("#game");
  const context = canvas.getContext("2d");
  const addMarbleButton = document.querySelector("#add-marble-button");
  const addTenMarblesButton = document.querySelector("#add-ten-marbles-button");
  const resetButton = document.querySelector("#reset-button");
  const status = document.querySelector("#status");

  const WIDTH = canvas.width;
  const HEIGHT = canvas.height;
  const TRACK_WIDTH = 20;
  const MARBLE_RADIUS = 17;
  const HANDLE_RADIUS = 30;
  const SNAP_DISTANCE = 58;
  const FLOOR_Y = 565;
  const funnelConnector = { x: 170, y: 215 };
  const defaultTrack = {
    start: { ...funnelConnector },
    end: { x: 760, y: 390 },
  };
  const marbleColors = ["#e63f5d", "#3f8efc", "#ffbd2e", "#5bbb63", "#9a5de8", "#ff7a3d"];

  // Sandbox piles must react immediately when a supporting marble is moved.
  const engine = Engine.create({ enableSleeping: false });
  engine.gravity.y = 1;

  const track = {
    start: { ...defaultTrack.start },
    end: { ...defaultTrack.end },
    body: null,
  };

  let marbles = [];
  let drag = null;
  let lastTime = performance.now();
  let nextMarbleColor = 0;

  function segmentBody(start, end, width, options) {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    return Bodies.rectangle(
      (start.x + end.x) / 2,
      (start.y + end.y) / 2,
      Math.hypot(dx, dy),
      width,
      { ...options, angle: Math.atan2(dy, dx) },
    );
  }

  function addFixedWorld() {
    const fixed = { isStatic: true, friction: 0.15, restitution: 0.12 };
    const boundaries = [
      Bodies.rectangle(WIDTH / 2, FLOOR_Y + 25, WIDTH + 80, 50, fixed),
      Bodies.rectangle(-25, HEIGHT / 2, 50, HEIGHT + 100, fixed),
      Bodies.rectangle(WIDTH + 25, HEIGHT / 2, 50, HEIGHT + 100, fixed),
    ];

    const funnelWalls = [
      segmentBody({ x: 82, y: 55 }, { x: 139, y: 135 }, 16, fixed),
      segmentBody({ x: 258, y: 55 }, { x: 201, y: 135 }, 16, fixed),
      segmentBody({ x: 139, y: 131 }, { x: 139, y: 160 }, 16, fixed),
      segmentBody({ x: 201, y: 131 }, { x: 201, y: 160 }, 16, fixed),
    ];

    Composite.add(engine.world, [...boundaries, ...funnelWalls]);
  }

  function rebuildTrackBody() {
    if (track.body) {
      Composite.remove(engine.world, track.body);
    }

    const dx = track.end.x - track.start.x;
    const dy = track.end.y - track.start.y;
    const length = Math.max(10, Math.hypot(dx, dy));

    track.body = Bodies.rectangle(
      (track.start.x + track.end.x) / 2,
      (track.start.y + track.end.y) / 2,
      length + TRACK_WIDTH,
      TRACK_WIDTH,
      {
        isStatic: true,
        angle: Math.atan2(dy, dx),
        friction: 0.08,
        restitution: 0.08,
      },
    );
    Composite.add(engine.world, track.body);
  }

  function updateStatus() {
    if (marbles.length === 0) {
      status.textContent = "Add a marble and watch it roll!";
    } else if (marbles.length === 1) {
      status.textContent = "1 marble rolling — you can drag it!";
    } else {
      status.textContent = `${marbles.length} marbles rolling!`;
    }
  }

  function addMarble() {
    const spawnY = marbles.reduce(
      (highest, marble) => Math.min(highest, marble.body.position.y - MARBLE_RADIUS * 2 - 4),
      20,
    );
    const body = Bodies.circle(
      170 + (Math.random() - 0.5) * 35,
      spawnY,
      MARBLE_RADIUS,
      {
        restitution: 0.3,
        friction: 0.015,
        frictionAir: 0.001,
        density: 0.0025,
      },
    );
    const marble = {
      body,
      color: marbleColors[nextMarbleColor % marbleColors.length],
    };
    nextMarbleColor += 1;
    marbles.push(marble);
    Composite.add(engine.world, body);
    updateStatus();
  }

  function resetSandbox() {
    marbles.forEach((marble) => Composite.remove(engine.world, marble.body));
    marbles = [];
    drag = null;
    canvas.classList.remove("dragging");
    track.start = { ...defaultTrack.start };
    track.end = { ...defaultTrack.end };
    rebuildTrackBody();
    nextMarbleColor = 0;
    updateStatus();
  }

  function update(delta) {
    Engine.update(engine, Math.min(delta, 32));
  }

  function drawBackground() {
    const sky = context.createLinearGradient(0, 0, 0, HEIGHT);
    sky.addColorStop(0, "#70caf2");
    sky.addColorStop(0.72, "#dff6ff");
    sky.addColorStop(0.721, "#8ed36c");
    sky.addColorStop(1, "#67b954");
    context.fillStyle = sky;
    context.fillRect(0, 0, WIDTH, HEIGHT);

    context.fillStyle = "rgba(255, 255, 255, 0.72)";
    [[85, 80, 70], [760, 90, 85], [470, 55, 50]].forEach(([x, y, size]) => {
      context.beginPath();
      context.arc(x, y, size * 0.35, 0, Math.PI * 2);
      context.arc(x + size * 0.35, y - 8, size * 0.42, 0, Math.PI * 2);
      context.arc(x + size * 0.72, y, size * 0.3, 0, Math.PI * 2);
      context.fill();
    });

    context.fillStyle = "rgba(44, 116, 45, 0.28)";
    context.fillRect(0, FLOOR_Y - 5, WIDTH, 8);
  }

  function funnelPath() {
    context.beginPath();
    context.moveTo(82, 55);
    context.lineTo(139, 135);
    context.lineTo(139, 160);
    context.moveTo(258, 55);
    context.lineTo(201, 135);
    context.lineTo(201, 160);
  }

  function drawFunnel() {
    context.save();
    context.lineCap = "round";
    context.lineJoin = "round";
    context.strokeStyle = "#49316d";
    context.lineWidth = 24;
    funnelPath();
    context.stroke();
    context.strokeStyle = "#7651ad";
    context.lineWidth = 14;
    funnelPath();
    context.stroke();

    context.fillStyle = "#49316d";
    context.font = "900 22px ui-rounded, system-ui, sans-serif";
    context.textAlign = "center";
    context.fillText("MARBLES", 170, 105);
    context.restore();
  }

  function drawConnector() {
    context.save();
    context.setLineDash([8, 8]);
    context.strokeStyle = "rgba(255, 207, 51, 0.9)";
    context.lineWidth = 5;
    context.beginPath();
    context.arc(funnelConnector.x, funnelConnector.y, SNAP_DISTANCE, 0, Math.PI * 2);
    context.stroke();
    context.restore();
  }

  function drawTrack() {
    context.save();
    context.lineCap = "round";
    context.strokeStyle = "#8d3d17";
    context.lineWidth = TRACK_WIDTH + 12;
    context.beginPath();
    context.moveTo(track.start.x, track.start.y);
    context.lineTo(track.end.x, track.end.y);
    context.stroke();

    context.strokeStyle = "#f57c35";
    context.lineWidth = TRACK_WIDTH;
    context.stroke();

    context.strokeStyle = "rgba(255, 255, 255, 0.42)";
    context.lineWidth = 5;
    context.stroke();
    context.restore();
  }

  function drawHandle(point) {
    context.save();
    context.shadowColor = "rgba(74, 48, 0, 0.32)";
    context.shadowBlur = 8;
    context.shadowOffsetY = 4;
    context.fillStyle = "#ffcf33";
    context.strokeStyle = "#765500";
    context.lineWidth = 6;
    context.beginPath();
    context.arc(point.x, point.y, HANDLE_RADIUS, 0, Math.PI * 2);
    context.fill();
    context.stroke();
    context.fillStyle = "#fff4a8";
    context.beginPath();
    context.arc(point.x - 7, point.y - 8, 8, 0, Math.PI * 2);
    context.fill();
    context.restore();
  }

  function drawMarble(marble) {
    const { body, color } = marble;
    const { x, y } = body.position;
    context.save();
    context.translate(x, y);
    context.rotate(body.angle);
    context.fillStyle = color;
    context.strokeStyle = "#5c2a3c";
    context.lineWidth = 4;
    context.beginPath();
    context.arc(0, 0, MARBLE_RADIUS, 0, Math.PI * 2);
    context.fill();
    context.stroke();
    context.strokeStyle = "rgba(255, 255, 255, 0.78)";
    context.lineWidth = 5;
    context.beginPath();
    context.arc(-3, -3, MARBLE_RADIUS - 7, Math.PI * 1.05, Math.PI * 1.75);
    context.stroke();
    context.restore();
  }

  function draw() {
    drawBackground();
    drawFunnel();
    drawConnector();
    drawTrack();
    marbles.forEach(drawMarble);
    drawHandle(track.start);
    drawHandle(track.end);
  }

  function canvasPoint(event) {
    const bounds = canvas.getBoundingClientRect();
    return {
      x: (event.clientX - bounds.left) * (WIDTH / bounds.width),
      y: (event.clientY - bounds.top) * (HEIGHT / bounds.height),
    };
  }

  function distance(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y);
  }

  function distanceToTrack(point) {
    const dx = track.end.x - track.start.x;
    const dy = track.end.y - track.start.y;
    const lengthSquared = dx * dx + dy * dy;
    if (lengthSquared === 0) return distance(point, track.start);

    const amount = Math.max(
      0,
      Math.min(1, ((point.x - track.start.x) * dx + (point.y - track.start.y) * dy) / lengthSquared),
    );
    const closest = {
      x: track.start.x + amount * dx,
      y: track.start.y + amount * dy,
    };
    return distance(point, closest);
  }

  function clampPoint(point) {
    return {
      x: Math.max(MARBLE_RADIUS, Math.min(WIDTH - MARBLE_RADIUS, point.x)),
      y: Math.max(MARBLE_RADIUS, Math.min(FLOOR_Y - MARBLE_RADIUS, point.y)),
    };
  }

  function snapPoint(point) {
    return distance(point, funnelConnector) <= SNAP_DISTANCE ? { ...funnelConnector } : point;
  }

  function marbleAt(point) {
    return [...marbles]
      .reverse()
      .find((marble) => distance(point, marble.body.position) <= MARBLE_RADIUS * 1.8);
  }

  canvas.addEventListener("pointerdown", (event) => {
    const point = canvasPoint(event);
    const marble = marbleAt(point);

    if (marble) {
      Sleeping.set(marble.body, false);
      Body.setStatic(marble.body, true);
      Body.setPosition(marble.body, clampPoint(point));
      drag = { type: "marble", marble };
    } else if (distance(point, track.start) <= HANDLE_RADIUS * 1.6) {
      drag = { type: "start" };
    } else if (distance(point, track.end) <= HANDLE_RADIUS * 1.6) {
      drag = { type: "end" };
    } else if (distanceToTrack(point) <= 34) {
      drag = {
        type: "track",
        pointer: point,
        start: { ...track.start },
        end: { ...track.end },
      };
    }

    if (drag) {
      canvas.setPointerCapture(event.pointerId);
      canvas.classList.add("dragging");
    }
  });

  canvas.addEventListener("pointermove", (event) => {
    if (!drag) return;

    const point = canvasPoint(event);
    if (drag.type === "marble") {
      Body.setPosition(drag.marble.body, clampPoint(point));
      Body.setVelocity(drag.marble.body, { x: 0, y: 0 });
    } else if (drag.type === "start" || drag.type === "end") {
      track[drag.type] = clampPoint(point);
      rebuildTrackBody();
    } else {
      const dx = point.x - drag.pointer.x;
      const dy = point.y - drag.pointer.y;
      const desiredStart = { x: drag.start.x + dx, y: drag.start.y + dy };
      const clampedStart = clampPoint(desiredStart);
      const adjustedDx = clampedStart.x - drag.start.x;
      const adjustedDy = clampedStart.y - drag.start.y;
      track.start = clampedStart;
      track.end = clampPoint({ x: drag.end.x + adjustedDx, y: drag.end.y + adjustedDy });
      rebuildTrackBody();
    }
  });

  function finishDrag(event) {
    if (!drag) return;

    if (drag.type === "marble") {
      Body.setStatic(drag.marble.body, false);
      Body.setVelocity(drag.marble.body, { x: 0, y: 0 });
      Sleeping.set(drag.marble.body, false);
    } else if (drag.type === "start" || drag.type === "end") {
      track[drag.type] = snapPoint(track[drag.type]);
      rebuildTrackBody();
    } else {
      const snappedStart = snapPoint(track.start);
      const snappedEnd = snapPoint(track.end);
      if (snappedStart !== track.start) {
        const dx = snappedStart.x - track.start.x;
        const dy = snappedStart.y - track.start.y;
        track.start = snappedStart;
        track.end = clampPoint({ x: track.end.x + dx, y: track.end.y + dy });
      } else if (snappedEnd !== track.end) {
        const dx = snappedEnd.x - track.end.x;
        const dy = snappedEnd.y - track.end.y;
        track.end = snappedEnd;
        track.start = clampPoint({ x: track.start.x + dx, y: track.start.y + dy });
      }
      rebuildTrackBody();
    }

    drag = null;
    canvas.classList.remove("dragging");
    if (canvas.hasPointerCapture(event.pointerId)) {
      canvas.releasePointerCapture(event.pointerId);
    }
  }

  canvas.addEventListener("pointerup", finishDrag);
  canvas.addEventListener("pointercancel", finishDrag);
  addMarbleButton.addEventListener("click", addMarble);
  addTenMarblesButton.addEventListener("click", () => {
    for (let index = 0; index < 10; index += 1) {
      addMarble();
    }
  });
  resetButton.addEventListener("click", resetSandbox);

  function frame(now) {
    update(now - lastTime);
    draw();
    lastTime = now;
    requestAnimationFrame(frame);
  }

  addFixedWorld();
  rebuildTrackBody();
  requestAnimationFrame(frame);
})();
