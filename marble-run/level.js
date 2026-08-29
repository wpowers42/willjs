export const VIEW_WIDTH = 1000;
export const VIEW_HEIGHT = 600;
export const PIXELS_PER_METER = 100;
export const FIXED_STEP = 1 / 60;
export const MAX_TICKS = 8 / FIXED_STEP;
export const MARBLE_RADIUS = 0.19;

export const TRACKS = [
  { x1: 0.65, y1: 1.52, x2: 4.0, y2: 2.48, width: 0.16, color: "#ffbd2e" },
];

const EDITABLE_END = { x: 7.82, y: 4.26 };

export const EDITABLE_TRACK = {
  x1: 4.24,
  y1: 3.22,
  length: Math.hypot(EDITABLE_END.x - 4.24, EDITABLE_END.y - 3.22),
  defaultAngle: Math.atan2(EDITABLE_END.y - 3.22, EDITABLE_END.x - 4.24),
  minAngle: -0.18,
  maxAngle: 0.68,
  width: 0.16,
  color: "#ff7b35",
};

export function editableTrackSegment(angle) {
  return {
    x1: EDITABLE_TRACK.x1,
    y1: EDITABLE_TRACK.y1,
    x2: EDITABLE_TRACK.x1 + Math.cos(angle) * EDITABLE_TRACK.length,
    y2: EDITABLE_TRACK.y1 + Math.sin(angle) * EDITABLE_TRACK.length,
    width: EDITABLE_TRACK.width,
    color: EDITABLE_TRACK.color,
  };
}

export const CUP = {
  left: 8.12,
  right: 9.28,
  rimY: 4.68,
  bottomY: 5.38,
};

function addSegment(RAPIER, world, segment, friction) {
  const dx = segment.x2 - segment.x1;
  const dy = segment.y2 - segment.y1;
  const length = Math.hypot(dx, dy);
  const angle = Math.atan2(dy, dx);
  return world.createCollider(
    RAPIER.ColliderDesc.cuboid(length / 2 + 0.02, segment.width / 2)
      .setTranslation((segment.x1 + segment.x2) / 2, (segment.y1 + segment.y2) / 2)
      .setRotation(angle)
      .setFriction(friction)
      .setRestitution(0.05),
  );
}

export function setEditableTrackAngle(world, colliderHandle, angle) {
  const collider = world.getCollider(colliderHandle);
  if (!collider) throw new Error("The editable track is missing from the restored world.");
  const segment = editableTrackSegment(angle);
  collider.setTranslation({
    x: (segment.x1 + segment.x2) / 2,
    y: (segment.y1 + segment.y2) / 2,
  });
  collider.setRotation(angle);
}

export function createLevelWorld(RAPIER) {
  const world = new RAPIER.World({ x: 0, y: 9.81 });
  world.timestep = FIXED_STEP;

  TRACKS.forEach((track) => addSegment(RAPIER, world, track, 0.12));
  const editableTrack = addSegment(
    RAPIER,
    world,
    editableTrackSegment(EDITABLE_TRACK.defaultAngle),
    0.12,
  );

  world.createCollider(
    RAPIER.ColliderDesc.cuboid(0.08, 0.45)
      .setTranslation(0.56, 1.15)
      .setFriction(0.2),
  );

  world.createCollider(
    RAPIER.ColliderDesc.cuboid(0.08, (CUP.bottomY - CUP.rimY) / 2)
      .setTranslation(CUP.left, (CUP.bottomY + CUP.rimY) / 2)
      .setFriction(0.16),
  );
  world.createCollider(
    RAPIER.ColliderDesc.cuboid(0.08, (CUP.bottomY - CUP.rimY) / 2)
      .setTranslation(CUP.right, (CUP.bottomY + CUP.rimY) / 2)
      .setFriction(0.16),
  );
  world.createCollider(
    RAPIER.ColliderDesc.cuboid((CUP.right - CUP.left) / 2, 0.08)
      .setTranslation((CUP.left + CUP.right) / 2, CUP.bottomY)
      .setFriction(0.2),
  );

  world.createCollider(
    RAPIER.ColliderDesc.cuboid(5.2, 0.1)
      .setTranslation(5, 5.82)
      .setFriction(0.3),
  );

  const marbleBody = world.createRigidBody(
    RAPIER.RigidBodyDesc.dynamic()
      .setTranslation(1.0, 1.12)
      .setCanSleep(false)
      .setCcdEnabled(true),
  );
  world.createCollider(
    RAPIER.ColliderDesc.ball(MARBLE_RADIUS)
      .setDensity(1.25)
      .setFriction(0.1)
      .setRestitution(0.18),
    marbleBody,
  );

  return {
    world,
    marbleHandle: marbleBody.handle,
    editableTrackHandle: editableTrack.handle,
  };
}

export function evaluateMarble(marbleBody, tick) {
  const position = marbleBody.translation();
  const goalReached =
    position.x > CUP.left + MARBLE_RADIUS * 0.5 &&
    position.x < CUP.right - MARBLE_RADIUS * 0.5 &&
    position.y > CUP.rimY &&
    position.y < CUP.bottomY;
  const outOfBounds = position.x < -0.5 || position.x > 10.5 || position.y > 6.5;
  const timedOut = tick >= MAX_TICKS;

  return {
    goalReached,
    failed: !goalReached && (outOfBounds || timedOut),
  };
}
