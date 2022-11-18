const events = class5f3dea1f0f16134ac236cd1e;


const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 500);

const renderer = new THREE.WebGLRenderer({alpha: true});

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const geometry = new THREE.BoxGeometry(1, 1, 1);
const edges = new THREE.EdgesGeometry(geometry);

camera.position.set(-45, 10, 73);


const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.target.set( -12.5, 1, 45 );
controls.maxZoom = 1.0;
controls.maxDistance = 60.0;
controls.enablePan = false;
controls.enableKeys = false;
controls.maxPolarAngle = Math.PI / 2; 

const colorMap = {
      "BuildableBlockPurple": 0x9478DA,
      "BuildableBlockBlue": 0x71BCD5,
      "BuildableBlockYellow": 0xE9D47D,
      "BuildableBlockRed": 0xD15D58,
      "SandboxGround": 0xF5D3AB,
      "Water": 0xA0D3E3
}

renderer.setClearColor( colorMap.Water, 1);

const sandboxCoordinates = {
    p1: (-45, 1, 17),
    p2: (20, 1, 17),
    p3: (20, 1, 73),
    p4: (-45, 1, 73)
    
}


// centerX = -12.5
// centerZ = 45


const g = new THREE.BufferGeometry();
// create a simple square shape. We duplicate the top left and bottom right
// vertices because each vertex needs to appear once per triangle.
const v = new Float32Array( [
	-45.5,  0.48,  17.5,
    20.5,  0.48,  17.5,
    -45.5,  0.48,  73.5,

    20.5,  0.48,  17.5,
    20.5,  0.48,  73.5,
	-45.5,  0.48,  73.5
] );

// itemSize = 3 because there are 3 values (components) per vertex
g.setAttribute( 'position', new THREE.BufferAttribute( v, 3 ) );
const m = new THREE.MeshBasicMaterial( { color: colorMap.SandboxGround, side: THREE.DoubleSide } );
const me = new THREE.Mesh( g, m );

scene.add(me);


let eventIndex = 0;
let cubes = [];

function handleCube() {
    if (eventIndex >= events.length) {
        return;
    }

    let event = events[eventIndex];
    let x = event.x;
    let y = event.y;
    let z = event.z;
    let color = colorMap[event.block_type];

    if (event.event_type == 'block_destroy') {
        let blockToRemove = cubes.filter(cube => cube.position == (x, y, z))[0];
        scene.remove(blockToRemove);
    } else {
        let material = new THREE.MeshBasicMaterial({ color: color });
        let cubeToAdd = new THREE.Mesh(geometry, material);
        let lineToAdd = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x000000 }));
        [cubeToAdd, lineToAdd].forEach(object => {
            scene.add(object);
            object.position.set(x, y, z);
        });
    }


    eventIndex++;
}

let drawAll = false;

if (drawAll) {
    for (let i = 0; i < events.length; i++) {
        handleCube();
    }
}

let currentTime = 0;
let accumulator = 0;
let timeBetweenCubes = 50;

function animate(timestamp) {

    let deltatime = timestamp - currentTime;
    currentTime = timestamp;
    accumulator += deltatime;

    if (accumulator >= timeBetweenCubes) {
        handleCube();
        accumulator -= timeBetweenCubes;
    }

    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}
animate(currentTime);
